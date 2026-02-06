/**
 * GraphQL request parsing utilities for RequestKit DevTools.
 *
 * Provides detection, parsing, and extraction of GraphQL operation
 * metadata from intercepted network requests.
 */

export interface GraphQLOperation {
  operationName: string | null;
  operationType: 'query' | 'mutation' | 'subscription' | null;
  variables: Record<string, unknown> | null;
}

export interface GraphQLInfo extends GraphQLOperation {
  isGraphQL: boolean;
  isBatched: boolean;
  operations: GraphQLOperation[];
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

const GRAPHQL_PATH_RE = /\/graphql\b/i;

const OPERATION_TYPE_RE = /\b(query|mutation|subscription)\b\s*[\s({]/;

/**
 * Attempt to infer the operation type from the raw query string when it is
 * not explicitly provided in the JSON payload.
 */
function inferOperationType(query: string): GraphQLOperation['operationType'] {
  const match = query.match(OPERATION_TYPE_RE);
  if (match) {
    return match[1] as GraphQLOperation['operationType'];
  }
  // If no keyword is found the spec treats the document as a query.
  return 'query';
}

/**
 * Parse a single GraphQL payload object (already JSON-decoded) into a
 * {@link GraphQLOperation}.
 */
function parseSinglePayload(
  payload: Record<string, unknown>
): GraphQLOperation {
  const operationName =
    typeof payload.operationName === 'string' ? payload.operationName : null;

  const query = typeof payload.query === 'string' ? payload.query : null;

  const operationType = query ? inferOperationType(query) : null;

  const variables =
    payload.variables != null &&
    typeof payload.variables === 'object' &&
    !Array.isArray(payload.variables)
      ? (payload.variables as Record<string, unknown>)
      : null;

  return { operationName, operationType, variables };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse a GraphQL request body (JSON string) and extract operation metadata.
 *
 * Returns `null` when the body cannot be interpreted as a valid GraphQL
 * request payload.
 *
 * @param body - The raw request body string (should be JSON).
 */
export function parseGraphQLRequest(body: string): GraphQLOperation | null {
  if (!body) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return null;
  }

  // Single operation
  if (parsed != null && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const payload = parsed as Record<string, unknown>;
    // Must contain at least a `query` or `operationName` key to be considered
    // a valid GraphQL body.
    if (
      typeof payload.query !== 'string' &&
      typeof payload.operationName !== 'string'
    ) {
      return null;
    }
    return parseSinglePayload(payload);
  }

  // Batched – return metadata for the first operation.
  if (Array.isArray(parsed) && parsed.length > 0) {
    const first = parsed[0];
    if (first != null && typeof first === 'object') {
      return parseSinglePayload(first as Record<string, unknown>);
    }
  }

  return null;
}

/**
 * Detect whether a network request is likely a GraphQL request based on its
 * URL, HTTP method, and headers.
 *
 * This is a heuristic check – it does **not** inspect the request body.
 *
 * @param url     - The full request URL.
 * @param method  - The HTTP method (e.g. `"POST"`).
 * @param headers - A map of request header names to values.
 */
export function isGraphQLRequest(
  url: string,
  method: string,
  headers: Record<string, string>
): boolean {
  if (method.toUpperCase() !== 'POST') {
    return false;
  }

  if (!GRAPHQL_PATH_RE.test(url)) {
    return false;
  }

  const contentType = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === 'content-type'
  );

  if (!contentType || !contentType[1].includes('application/json')) {
    return false;
  }

  return true;
}

/**
 * Combined extraction helper: detects whether a request is GraphQL and, when
 * it is, parses the body to return full {@link GraphQLInfo} metadata.
 *
 * Returns `null` when the request does not appear to be GraphQL.
 *
 * @param url     - The full request URL.
 * @param method  - The HTTP method.
 * @param headers - A map of request header names to values.
 * @param body    - The raw request body string (optional).
 */
export function extractGraphQLInfo(
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: string
): GraphQLInfo | null {
  if (!isGraphQLRequest(url, method, headers)) {
    return null;
  }

  const baseInfo: GraphQLInfo = {
    isGraphQL: true,
    isBatched: false,
    operationName: null,
    operationType: null,
    variables: null,
    operations: [],
  };

  if (!body) {
    return baseInfo;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return baseInfo;
  }

  // Batched request (array of operations)
  if (Array.isArray(parsed)) {
    const operations: GraphQLOperation[] = parsed
      .filter(
        (item): item is Record<string, unknown> =>
          item != null && typeof item === 'object'
      )
      .map(parseSinglePayload);

    const first = operations[0] ?? {
      operationName: null,
      operationType: null,
      variables: null,
    };

    return {
      isGraphQL: true,
      isBatched: true,
      operationName: first.operationName,
      operationType: first.operationType,
      variables: first.variables,
      operations,
    };
  }

  // Single operation
  if (parsed != null && typeof parsed === 'object') {
    const operation = parseSinglePayload(parsed as Record<string, unknown>);
    return {
      isGraphQL: true,
      isBatched: false,
      ...operation,
      operations: [operation],
    };
  }

  return baseInfo;
}
