import { useEffect, useMemo, useRef } from 'preact/hooks';

import type { KeyboardShortcut } from '@/shared/hooks/useKeyboardShortcuts';

/** Props for the KeyboardShortcutsHelp overlay component. */
interface KeyboardShortcutsHelpProps {
  /** The full list of registered shortcuts to display. */
  shortcuts: KeyboardShortcut[];
  /** Whether the overlay is currently visible. */
  visible: boolean;
  /** Callback to close the overlay. */
  onClose: () => void;
}

/**
 * Detects macOS so key labels render platform-appropriate symbols.
 */
function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uaData = (navigator as any).userAgentData;
  if (uaData?.platform) {
    return uaData.platform === 'macOS';
  }
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? '');
}

/** Maps special key names to user-friendly labels. */
const KEY_DISPLAY_MAP: Record<string, string> = {
  escape: 'Esc',
  enter: '\u23CE',
  arrowup: '\u2191',
  arrowdown: '\u2193',
  arrowleft: '\u2190',
  arrowright: '\u2192',
  backspace: '\u232B',
  delete: 'Del',
  tab: 'Tab',
  ' ': 'Space',
};

/**
 * Builds the formatted key combination string for a shortcut.
 */
function formatKeyCombination(
  shortcut: KeyboardShortcut,
  isMac: boolean
): string[] {
  const parts: string[] = [];

  if (shortcut.ctrl) {
    parts.push(isMac ? '\u2318' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push(isMac ? '\u21E7' : 'Shift');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '\u2325' : 'Alt');
  }

  const lower = shortcut.key.toLowerCase();
  const display = KEY_DISPLAY_MAP[lower] ?? shortcut.key.toUpperCase();
  parts.push(display);

  return parts;
}

/**
 * Groups shortcuts by their `category` field. Shortcuts without an explicit
 * category are placed under "General".
 */
function groupByCategory(
  shortcuts: KeyboardShortcut[]
): Map<string, KeyboardShortcut[]> {
  const groups = new Map<string, KeyboardShortcut[]>();

  for (const shortcut of shortcuts) {
    const category = shortcut.category ?? 'General';
    const existing = groups.get(category);
    if (existing) {
      existing.push(shortcut);
    } else {
      groups.set(category, [shortcut]);
    }
  }

  return groups;
}

/**
 * Renders an individual key badge (e.g. "Ctrl", "K").
 */
function KeyBadge({ label }: Readonly<{ label: string }>) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[1.75rem] h-7 px-1.5 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-500 text-xs font-mono font-semibold text-gray-700 dark:text-gray-200 shadow-sm">
      {label}
    </kbd>
  );
}

/**
 * A modal-like overlay that lists all registered keyboard shortcuts grouped by
 * category.  Dismissible by pressing Escape or clicking the backdrop.
 *
 * @example
 * ```tsx
 * const [helpOpen, setHelpOpen] = useState(false);
 *
 * <KeyboardShortcutsHelp
 *   shortcuts={shortcuts}
 *   visible={helpOpen}
 *   onClose={() => setHelpOpen(false)}
 * />
 * ```
 */
export function KeyboardShortcutsHelp({
  shortcuts,
  visible,
  onClose,
}: Readonly<KeyboardShortcutsHelpProps>) {
  const isMac = useMemo(() => isMacPlatform(), []);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key.
  useEffect(() => {
    if (!visible) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [visible, onClose]);

  // Focus the panel when it opens for accessibility.
  useEffect(() => {
    if (visible && panelRef.current) {
      panelRef.current.focus();
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  const grouped = groupByCategory(shortcuts);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={e => {
        // Close when clicking the backdrop, not the panel itself.
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-label="Keyboard shortcuts"
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden outline-none border border-gray-200 dark:border-gray-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Keyboard Shortcuts
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Close shortcuts help"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-6 py-4 flex-1">
          {Array.from(grouped.entries()).map(([category, items], groupIdx) => (
            <div key={category} className={groupIdx > 0 ? 'mt-6' : ''}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                {category}
              </h3>
              <ul className="space-y-2">
                {items.map((shortcut, idx) => {
                  const parts = formatKeyCombination(shortcut, isMac);
                  return (
                    <li
                      key={`${category}-${idx}`}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {shortcut.description}
                      </span>
                      <span className="flex items-center gap-1 ml-4 shrink-0">
                        {parts.map((part, pIdx) => (
                          <span key={pIdx} className="flex items-center gap-1">
                            {pIdx > 0 && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                +
                              </span>
                            )}
                            <KeyBadge label={part} />
                          </span>
                        ))}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {shortcuts.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No keyboard shortcuts registered.
            </p>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Press <KeyBadge label="Esc" /> to close
          </p>
        </div>
      </div>
    </div>
  );
}
