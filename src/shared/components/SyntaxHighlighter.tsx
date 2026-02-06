import { useMemo } from 'preact/hooks';

import { CopyButton } from '@/shared/components/CopyButton';

interface SyntaxHighlighterProps {
  code: string;
  language: 'json' | 'xml' | 'html' | 'text';
  maxHeight?: string;
  className?: string;
}

interface HighlightedToken {
  text: string;
  color: string;
}

function highlightJSON(code: string): HighlightedToken[][] {
  let formatted: string;
  try {
    const parsed: unknown = JSON.parse(code);
    formatted = JSON.stringify(parsed, null, 2);
  } catch {
    formatted = code;
  }

  const lines = formatted.split('\n');
  return lines.map(line => {
    const tokens: HighlightedToken[] = [];
    // Match JSON tokens: keys, strings, numbers, booleans, null, and structural characters
    const regex =
      /("(?:[^"\\]|\\.)*")\s*:|("(?:[^"\\]|\\.)*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b|\bnull\b)|([{}[\],])|(\s+)|([^"{}[\],\s]+)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      if (match[1] !== undefined) {
        // Key (quoted string followed by colon)
        tokens.push({ text: match[1], color: 'text-blue-400' });
        const afterKey = match[0].slice(match[1].length);
        if (afterKey) {
          tokens.push({ text: afterKey, color: 'text-gray-400' });
        }
      } else if (match[2] !== undefined) {
        // String value
        tokens.push({ text: match[2], color: 'text-green-400' });
      } else if (match[3] !== undefined) {
        // Number
        tokens.push({ text: match[3], color: 'text-orange-400' });
      } else if (match[4] !== undefined) {
        // Boolean or null
        tokens.push({ text: match[4], color: 'text-purple-400' });
      } else if (match[5] !== undefined) {
        // Structural characters: braces, brackets, commas
        tokens.push({ text: match[5], color: 'text-gray-400' });
      } else if (match[6] !== undefined) {
        // Whitespace
        tokens.push({ text: match[6], color: '' });
      } else if (match[7] !== undefined) {
        // Other text
        tokens.push({ text: match[7], color: 'text-gray-300' });
      }
    }

    if (tokens.length === 0) {
      tokens.push({ text: line, color: 'text-gray-300' });
    }

    return tokens;
  });
}

function highlightXML(code: string): HighlightedToken[][] {
  const lines = code.split('\n');
  return lines.map(line => {
    const tokens: HighlightedToken[] = [];
    // Match XML/HTML tokens: tags, attributes, attribute values, comments, and text
    const regex =
      /(<\/?[\w-]+)|(\s+[\w-]+)(?==)|("[^"]*"|'[^']*')|(\/?>|<)|(&\w+;)|([^<>"'=]+)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      if (match[1] !== undefined) {
        // Tag names (opening/closing)
        tokens.push({ text: match[1], color: 'text-blue-400' });
      } else if (match[2] !== undefined) {
        // Attribute names
        tokens.push({ text: match[2], color: 'text-orange-400' });
      } else if (match[3] !== undefined) {
        // Attribute values (quoted strings)
        tokens.push({ text: match[3], color: 'text-green-400' });
      } else if (match[4] !== undefined) {
        // Tag delimiters (>, />, <)
        tokens.push({ text: match[4], color: 'text-blue-400' });
      } else if (match[5] !== undefined) {
        // HTML entities
        tokens.push({ text: match[5], color: 'text-purple-400' });
      } else if (match[6] !== undefined) {
        // Text content
        tokens.push({ text: match[6], color: 'text-gray-200' });
      }
    }

    if (tokens.length === 0) {
      tokens.push({ text: line, color: 'text-gray-200' });
    }

    return tokens;
  });
}

export function SyntaxHighlighter({
  code,
  language,
  maxHeight,
  className = '',
}: Readonly<SyntaxHighlighterProps>) {
  const highlightedLines = useMemo(() => {
    switch (language) {
      case 'json':
        return highlightJSON(code);
      case 'xml':
      case 'html':
        return highlightXML(code);
      case 'text':
      default:
        return code
          .split('\n')
          .map(line => [
            { text: line, color: 'text-gray-200' } satisfies HighlightedToken,
          ]);
    }
  }, [code, language]);

  const lineNumberWidth = String(highlightedLines.length).length;

  return (
    <div
      className={`relative group rounded-lg bg-gray-900 dark:bg-gray-950 border border-gray-700 dark:border-gray-800 ${className}`}
    >
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton
          text={code}
          label="Copy code"
          className="bg-gray-800 dark:bg-gray-900 border border-gray-600 dark:border-gray-700"
        />
      </div>
      <div
        className="overflow-auto"
        style={maxHeight ? { maxHeight } : undefined}
      >
        <pre className="p-4 pr-10 text-sm font-mono leading-relaxed">
          {highlightedLines.map((tokens, lineIndex) => (
            <div key={lineIndex} className="flex">
              <span
                className="inline-block text-right text-gray-600 dark:text-gray-500 select-none mr-4 flex-shrink-0"
                style={{ minWidth: `${lineNumberWidth}ch` }}
              >
                {lineIndex + 1}
              </span>
              <span className="flex-1 whitespace-pre-wrap break-all">
                {tokens.map((token, tokenIndex) => (
                  <span key={tokenIndex} className={token.color}>
                    {token.text}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
