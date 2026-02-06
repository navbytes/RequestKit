import { useState, useCallback } from 'preact/hooks';

import { Icon } from '@/shared/components/Icon';

interface CopyButtonProps {
  text: string;
  className?: string;
  label?: string;
}

export function CopyButton({
  text,
  className = '',
  label = 'Copy to clipboard',
}: Readonly<CopyButtonProps>) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Silently fail if clipboard access is denied
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center rounded-md p-1.5 transition-colors
        text-gray-500 hover:text-gray-700 hover:bg-gray-100
        dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
        ${className}`}
      aria-label={copied ? 'Copied' : label}
      title={copied ? 'Copied' : label}
    >
      <Icon
        name={copied ? 'check-simple' : 'copy'}
        size={14}
        className={copied ? 'text-success-500' : ''}
      />
    </button>
  );
}
