// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReplayRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

export interface ReplayResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  duration: number; // milliseconds
  error?: string;
}

export interface ReplayOptions {
  timeout?: number; // default 30000ms
  followRedirects?: boolean; // default true
}

export interface ResponseDiff {
  statusChanged: boolean;
  headersAdded: string[];
  headersRemoved: string[];
  headersModified: Array<{ name: string; original: string; replayed: string }>;
  bodyChanged: boolean;
  durationDiff: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_TIMEOUT = 30000;

/**
 * Headers that browsers forbid setting on fetch requests.
 * These are silently stripped before sending to avoid runtime errors.
 *
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name
 */
const FORBIDDEN_HEADERS = new Set([
  'accept-charset',
  'accept-encoding',
  'access-control-request-headers',
  'access-control-request-method',
  'connection',
  'content-length',
  'cookie',
  'date',
  'dnt',
  'expect',
  'host',
  'keep-alive',
  'origin',
  'referer',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'via',
]);

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Return a copy of `headers` with all browser-forbidden header names removed.
 * Comparison is case-insensitive.
 */
function stripForbiddenHeaders(
  headers: Record<string, string>
): Record<string, string> {
  const cleaned: Record<string, string> = {};

  for (const [name, value] of Object.entries(headers)) {
    if (!FORBIDDEN_HEADERS.has(name.toLowerCase())) {
      cleaned[name] = value;
    }
  }

  return cleaned;
}

/**
 * Read all response headers into a plain `Record<string, string>`.
 */
function headersToRecord(headers: Headers): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((value, name) => {
    record[name] = value;
  });
  return record;
}

/**
 * Build an error `ReplayResponse` with the given message and duration.
 */
function errorResponse(message: string, duration: number): ReplayResponse {
  return {
    status: 0,
    statusText: '',
    headers: {},
    body: '',
    duration,
    error: message,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Construct a `ReplayRequest` from individual captured-request fields.
 *
 * This is a convenience helper that packages arguments into the shape
 * expected by {@link replayRequest}.
 */
export function buildReplayRequest(
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: string
): ReplayRequest {
  const request: ReplayRequest = {
    url,
    method: method.toUpperCase(),
    headers: { ...headers },
  };

  if (body !== undefined) {
    request.body = body;
  }

  return request;
}

/**
 * Re-send a captured network request via `fetch` and return the full
 * response.
 *
 * - Forbidden browser headers are automatically stripped before sending.
 * - The request is aborted if it exceeds the configured timeout
 *   (default 30 000 ms) using an `AbortController`.
 * - CORS and network errors are caught and surfaced via the `error` field
 *   on the returned `ReplayResponse`.
 */
export async function replayRequest(
  request: ReplayRequest,
  options?: ReplayOptions
): Promise<ReplayResponse> {
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
  const followRedirects = options?.followRedirects ?? true;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const safeHeaders = stripForbiddenHeaders(request.headers);

  // Bodies are not allowed on GET / HEAD requests.
  const methodUpper = request.method.toUpperCase();
  const includeBody =
    request.body !== undefined &&
    methodUpper !== 'GET' &&
    methodUpper !== 'HEAD';

  const start = performance.now();

  try {
    const init: RequestInit = {
      method: methodUpper,
      headers: safeHeaders,
      redirect: followRedirects ? 'follow' : 'manual',
      signal: controller.signal,
    };

    if (includeBody) {
      init.body = request.body!;
    }

    const response = await fetch(request.url, init);

    const body = await response.text();
    const duration = performance.now() - start;

    return {
      status: response.status,
      statusText: response.statusText,
      headers: headersToRecord(response.headers),
      body,
      duration,
    };
  } catch (err: unknown) {
    const duration = performance.now() - start;

    if (err instanceof DOMException && err.name === 'AbortError') {
      return errorResponse(`Request timed out after ${timeout}ms`, duration);
    }

    if (err instanceof TypeError) {
      // fetch throws TypeError for network / CORS failures
      return errorResponse(
        `Network error (possible CORS issue): ${err.message}`,
        duration
      );
    }

    const message =
      err instanceof Error ? err.message : 'An unknown error occurred';

    return errorResponse(message, duration);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Compare two `ReplayResponse` objects and return a structured diff
 * describing what changed between them.
 */
export function compareResponses(
  original: ReplayResponse,
  replayed: ReplayResponse
): ResponseDiff {
  // --- Status ---
  const statusChanged = original.status !== replayed.status;

  // --- Headers ---
  const originalKeys = new Set(
    Object.keys(original.headers).map(k => k.toLowerCase())
  );
  const replayedKeys = new Set(
    Object.keys(replayed.headers).map(k => k.toLowerCase())
  );

  const headersAdded: string[] = [];
  const headersRemoved: string[] = [];
  const headersModified: ResponseDiff['headersModified'] = [];

  // Build lookup maps keyed by lower-cased header name.
  const originalByKey = new Map<string, string>();
  for (const [name, value] of Object.entries(original.headers)) {
    originalByKey.set(name.toLowerCase(), value);
  }

  const replayedByKey = new Map<string, string>();
  for (const [name, value] of Object.entries(replayed.headers)) {
    replayedByKey.set(name.toLowerCase(), value);
  }

  for (const key of replayedKeys) {
    if (!originalKeys.has(key)) {
      headersAdded.push(key);
    }
  }

  for (const key of originalKeys) {
    if (!replayedKeys.has(key)) {
      headersRemoved.push(key);
    }
  }

  for (const key of originalKeys) {
    if (replayedKeys.has(key)) {
      const origValue = originalByKey.get(key)!;
      const replayValue = replayedByKey.get(key)!;
      if (origValue !== replayValue) {
        headersModified.push({
          name: key,
          original: origValue,
          replayed: replayValue,
        });
      }
    }
  }

  // --- Body ---
  const bodyChanged = original.body !== replayed.body;

  // --- Duration ---
  const durationDiff = replayed.duration - original.duration;

  return {
    statusChanged,
    headersAdded,
    headersRemoved,
    headersModified,
    bodyChanged,
    durationDiff,
  };
}
