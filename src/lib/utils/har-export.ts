import { APP_NAME, APP_VERSION } from '@/config/constants';

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface NetworkRequestForExport {
  id: string;
  url: string;
  method: string;
  status: number;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  timestamp: Date;
  domain: string;
}

export interface SanitizeOptions {
  stripCookies?: boolean;
  stripAuth?: boolean;
  customHeadersToStrip?: string[];
}

// ---------------------------------------------------------------------------
// HAR 1.2 types
// ---------------------------------------------------------------------------

export interface HARLog {
  log: {
    version: string;
    creator: HARCreator;
    entries: HAREntry[];
  };
}

interface HARCreator {
  name: string;
  version: string;
}

interface HARHeader {
  name: string;
  value: string;
}

interface HARQueryParam {
  name: string;
  value: string;
}

interface HARRequest {
  method: string;
  url: string;
  httpVersion: string;
  cookies: HARCookie[];
  headers: HARHeader[];
  queryString: HARQueryParam[];
  headersSize: number;
  bodySize: number;
}

interface HARResponse {
  status: number;
  statusText: string;
  httpVersion: string;
  cookies: HARCookie[];
  headers: HARHeader[];
  content: HARContent;
  redirectURL: string;
  headersSize: number;
  bodySize: number;
}

interface HARCookie {
  name: string;
  value: string;
}

interface HARContent {
  size: number;
  mimeType: string;
}

interface HARTimings {
  send: number;
  wait: number;
  receive: number;
}

interface HAREntry {
  startedDateTime: string;
  time: number;
  request: HARRequest;
  response: HARResponse;
  cache: Record<string, never>;
  timings: HARTimings;
  serverIPAddress: string;
  connection: string;
}

// ---------------------------------------------------------------------------
// Common HTTP status text map
// ---------------------------------------------------------------------------

const HTTP_STATUS_TEXT: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  301: 'Moved Permanently',
  302: 'Found',
  304: 'Not Modified',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  408: 'Request Timeout',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Convert a `Record<string, string>` header map into the HAR header array
 * format (`{ name, value }[]`).
 */
function toHARHeaders(headers: Record<string, string>): HARHeader[] {
  return Object.entries(headers).map(([name, value]) => ({ name, value }));
}

/**
 * Parse query-string parameters from a URL.
 */
function extractQueryParams(url: string): HARQueryParam[] {
  try {
    const { searchParams } = new URL(url);
    const params: HARQueryParam[] = [];
    searchParams.forEach((value, name) => {
      params.push({ name, value });
    });
    return params;
  } catch {
    return [];
  }
}

/**
 * Compute a rough byte-size for a set of serialised headers.
 * Each header line is formatted as `Name: Value\r\n`.
 */
function estimateHeadersSize(headers: HARHeader[]): number {
  return headers.reduce(
    (size, header) => size + header.name.length + 2 + header.value.length + 2,
    0
  );
}

/**
 * Resolve the status text for a given HTTP status code.
 */
function getStatusText(status: number): string {
  return HTTP_STATUS_TEXT[status] ?? '';
}

/**
 * Extract cookies from a header record by inspecting the `cookie` header
 * (request-side) or `set-cookie` header (response-side).
 */
function extractCookiesFromHeaders(
  headers: Record<string, string>,
  headerName: string
): HARCookie[] {
  const raw = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === headerName.toLowerCase()
  );

  if (!raw) {
    return [];
  }

  const [, value] = raw;

  // Request `Cookie` header: "name=value; name2=value2"
  if (headerName.toLowerCase() === 'cookie') {
    return value.split(';').map(pair => {
      const eqIndex = pair.indexOf('=');
      if (eqIndex === -1) {
        return { name: pair.trim(), value: '' };
      }
      return {
        name: pair.slice(0, eqIndex).trim(),
        value: pair.slice(eqIndex + 1).trim(),
      };
    });
  }

  // Response `Set-Cookie` header (simplified – single header value)
  const eqIndex = value.indexOf('=');
  if (eqIndex === -1) {
    return [{ name: value.trim(), value: '' }];
  }
  const cookieName = value.slice(0, eqIndex).trim();
  const semiIndex = value.indexOf(';', eqIndex);
  const cookieValue =
    semiIndex === -1
      ? value.slice(eqIndex + 1).trim()
      : value.slice(eqIndex + 1, semiIndex).trim();
  return [{ name: cookieName, value: cookieValue }];
}

/**
 * Build a single HAR entry from a `NetworkRequestForExport`.
 */
function buildEntry(request: NetworkRequestForExport): HAREntry {
  const requestHeaders = toHARHeaders(request.requestHeaders);
  const responseHeaders = toHARHeaders(request.responseHeaders);

  const contentTypeEntry = Object.entries(request.responseHeaders).find(
    ([key]) => key.toLowerCase() === 'content-type'
  );
  const mimeType = contentTypeEntry ? contentTypeEntry[1] : 'text/plain';

  return {
    startedDateTime: request.timestamp.toISOString(),
    time: 0,
    request: {
      method: request.method,
      url: request.url,
      httpVersion: 'HTTP/1.1',
      cookies: extractCookiesFromHeaders(request.requestHeaders, 'cookie'),
      headers: requestHeaders,
      queryString: extractQueryParams(request.url),
      headersSize: estimateHeadersSize(requestHeaders),
      bodySize: -1,
    },
    response: {
      status: request.status,
      statusText: getStatusText(request.status),
      httpVersion: 'HTTP/1.1',
      cookies: extractCookiesFromHeaders(request.responseHeaders, 'set-cookie'),
      headers: responseHeaders,
      content: {
        size: -1,
        mimeType,
      },
      redirectURL: '',
      headersSize: estimateHeadersSize(responseHeaders),
      bodySize: -1,
    },
    cache: {},
    timings: {
      send: 0,
      wait: 0,
      receive: 0,
    },
    serverIPAddress: '',
    connection: '',
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Convert an array of captured network requests into a HAR 1.2 JSON object.
 */
export function generateHAR(requests: NetworkRequestForExport[]): HARLog {
  return {
    log: {
      version: '1.2',
      creator: {
        name: APP_NAME,
        version: APP_VERSION,
      },
      entries: requests.map(buildEntry),
    },
  };
}

/**
 * Trigger a browser download of the given network requests as a `.har` file.
 *
 * @param requests - The captured network requests to export.
 * @param filename - Optional file name (defaults to `requestkit-export-<timestamp>.har`).
 */
export function downloadHAR(
  requests: NetworkRequestForExport[],
  filename?: string
): void {
  const har = generateHAR(requests);
  const json = JSON.stringify(har, null, 2);

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const resolvedFilename = filename ?? `requestkit-export-${Date.now()}.har`;

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = resolvedFilename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();

  // Clean up
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Strip sensitive headers from an existing HAR log.
 *
 * By default the following headers are removed (case-insensitive):
 * - `Cookie`
 * - `Set-Cookie`
 * - `Authorization`
 *
 * Use `options` to customise the behaviour.
 */
export function sanitizeHAR(har: HARLog, options?: SanitizeOptions): HARLog {
  const stripCookies = options?.stripCookies ?? true;
  const stripAuth = options?.stripAuth ?? true;
  const customHeadersToStrip = options?.customHeadersToStrip ?? [];

  // Build the set of header names (lower-cased) to remove.
  const headersToStrip = new Set<string>(
    customHeadersToStrip.map(h => h.toLowerCase())
  );

  if (stripCookies) {
    headersToStrip.add('cookie');
    headersToStrip.add('set-cookie');
  }

  if (stripAuth) {
    headersToStrip.add('authorization');
  }

  const shouldStrip = (name: string): boolean =>
    headersToStrip.has(name.toLowerCase());

  const filterHeaders = (headers: HARHeader[]): HARHeader[] =>
    headers.filter(h => !shouldStrip(h.name));

  const emptyCookies: HARCookie[] = [];

  const sanitizedEntries: HAREntry[] = har.log.entries.map(entry => ({
    ...entry,
    request: {
      ...entry.request,
      headers: filterHeaders(entry.request.headers),
      cookies: stripCookies ? emptyCookies : entry.request.cookies,
    },
    response: {
      ...entry.response,
      headers: filterHeaders(entry.response.headers),
      cookies: stripCookies ? emptyCookies : entry.response.cookies,
    },
  }));

  return {
    log: {
      ...har.log,
      entries: sanitizedEntries,
    },
  };
}
