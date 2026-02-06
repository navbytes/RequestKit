/**
 * Code generators for producing executable code snippets from captured network requests.
 * Supports cURL, JavaScript fetch, XMLHttpRequest, and Python requests library output.
 */

export interface RequestForCodeGen {
  url: string;
  method: string;
  requestHeaders: Record<string, string>;
  body?: string;
}

export type CodeLanguage = 'curl' | 'fetch' | 'xhr' | 'python';

/**
 * Escape a string for safe inclusion in a single-quoted shell argument.
 * Replaces every single quote with the sequence '\'' (end quote, escaped quote, start quote).
 */
function shellEscape(value: string): string {
  return value.replace(/'/g, "'\\''");
}

/**
 * Escape a string for safe inclusion in a JavaScript string literal (double-quoted).
 */
function jsStringEscape(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Escape a string for safe inclusion in a Python string literal (single-quoted).
 */
function pythonStringEscape(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Generate a cURL command from a captured network request.
 *
 * Produces a properly escaped shell command with headers and an optional body.
 */
export function generateCURL(request: RequestForCodeGen): string {
  const parts: string[] = ['curl'];

  // Method — only emit -X when it is not GET (cURL defaults to GET,
  // or to POST when --data is present, but being explicit for non-GET
  // methods keeps the output unambiguous).
  const method = request.method.toUpperCase();
  if (method !== 'GET') {
    parts.push(`-X '${shellEscape(method)}'`);
  }

  // URL
  parts.push(`'${shellEscape(request.url)}'`);

  // Headers
  const headers = Object.entries(request.requestHeaders);
  for (const [name, value] of headers) {
    parts.push(`-H '${shellEscape(name)}: ${shellEscape(value)}'`);
  }

  // Body
  if (request.body !== undefined && request.body !== '') {
    parts.push(`--data '${shellEscape(request.body)}'`);
  }

  return parts.join(' \\\n  ');
}

/**
 * Generate JavaScript fetch() code from a captured network request.
 *
 * Produces a self-contained async snippet that can be pasted into a browser console
 * or a Node 18+ environment.
 */
export function generateFetch(request: RequestForCodeGen): string {
  const method = request.method.toUpperCase();
  const headers = Object.entries(request.requestHeaders);
  const hasBody = request.body !== undefined && request.body !== '';

  const lines: string[] = [];

  lines.push(`fetch("${jsStringEscape(request.url)}", {`);
  lines.push(`  method: "${jsStringEscape(method)}",`);

  if (headers.length > 0) {
    lines.push('  headers: {');
    for (const [name, value] of headers) {
      lines.push(`    "${jsStringEscape(name)}": "${jsStringEscape(value)}",`);
    }
    lines.push('  },');
  }

  if (hasBody) {
    lines.push(`  body: "${jsStringEscape(request.body!)}",`);
  }

  lines.push('})');
  lines.push('  .then((response) => response.json())');
  lines.push('  .then((data) => console.log(data))');
  lines.push('  .catch((error) => console.error(error));');

  return lines.join('\n');
}

/**
 * Generate XMLHttpRequest code from a captured network request.
 *
 * Produces a traditional XHR snippet using the open / setRequestHeader / send pattern.
 */
export function generateXHR(request: RequestForCodeGen): string {
  const method = request.method.toUpperCase();
  const headers = Object.entries(request.requestHeaders);
  const hasBody = request.body !== undefined && request.body !== '';

  const lines: string[] = [];

  lines.push('const xhr = new XMLHttpRequest();');
  lines.push(
    `xhr.open("${jsStringEscape(method)}", "${jsStringEscape(request.url)}");`
  );
  lines.push('');

  for (const [name, value] of headers) {
    lines.push(
      `xhr.setRequestHeader("${jsStringEscape(name)}", "${jsStringEscape(value)}");`
    );
  }

  if (headers.length > 0) {
    lines.push('');
  }

  lines.push('xhr.onreadystatechange = function () {');
  lines.push('  if (xhr.readyState === XMLHttpRequest.DONE) {');
  lines.push('    console.log(xhr.status, xhr.responseText);');
  lines.push('  }');
  lines.push('};');
  lines.push('');

  if (hasBody) {
    lines.push(`xhr.send("${jsStringEscape(request.body!)}");`);
  } else {
    lines.push('xhr.send();');
  }

  return lines.join('\n');
}

/**
 * Generate Python code using the `requests` library from a captured network request.
 *
 * Produces a complete, runnable Python 3 snippet.
 */
export function generatePython(request: RequestForCodeGen): string {
  const method = request.method.toLowerCase();
  const headers = Object.entries(request.requestHeaders);
  const hasBody = request.body !== undefined && request.body !== '';

  const lines: string[] = [];

  lines.push('import requests');
  lines.push('');

  lines.push(`url = '${pythonStringEscape(request.url)}'`);

  if (headers.length > 0) {
    lines.push('headers = {');
    for (const [name, value] of headers) {
      lines.push(
        `    '${pythonStringEscape(name)}': '${pythonStringEscape(value)}',`
      );
    }
    lines.push('}');
  }

  if (hasBody) {
    lines.push(`data = '${pythonStringEscape(request.body!)}'`);
  }

  lines.push('');

  // Build the requests.<method>() call
  const args: string[] = ['url'];
  if (headers.length > 0) {
    args.push('headers=headers');
  }
  if (hasBody) {
    args.push('data=data');
  }

  lines.push(
    `response = requests.${pythonStringEscape(method)}(${args.join(', ')})`
  );
  lines.push('print(response.status_code)');
  lines.push('print(response.text)');

  return lines.join('\n');
}

/**
 * Unified code generation entry point.
 *
 * Delegates to the language-specific generator based on the `language` parameter.
 */
export function generateCode(
  request: RequestForCodeGen,
  language: CodeLanguage
): string {
  switch (language) {
    case 'curl':
      return generateCURL(request);
    case 'fetch':
      return generateFetch(request);
    case 'xhr':
      return generateXHR(request);
    case 'python':
      return generatePython(request);
  }
}

/**
 * Copy the provided text to the system clipboard.
 *
 * Returns `true` on success and `false` when the Clipboard API is unavailable or
 * the write operation fails.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
