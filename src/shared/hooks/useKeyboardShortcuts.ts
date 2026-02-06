import { useEffect, useRef } from 'preact/hooks';

/**
 * Represents a keyboard shortcut registration with modifier keys and an action.
 */
export interface KeyboardShortcut {
  /** The key to listen for (e.g. 'k', 'Enter', 'Escape'). Case-insensitive. */
  key: string;
  /** When true, requires Ctrl on Windows/Linux or Cmd on Mac. */
  ctrl?: boolean;
  /** When true, requires the Shift modifier. */
  shift?: boolean;
  /** When true, requires the Alt (Option on Mac) modifier. */
  alt?: boolean;
  /** Human-readable description shown in the shortcuts help overlay. */
  description: string;
  /** Category for grouping in the help overlay (e.g. 'Navigation', 'Editing'). */
  category?: string;
  /** The function to invoke when the shortcut is triggered. */
  action: () => void;
  /**
   * When true the shortcut is only active while a specific scope is mounted.
   * Global shortcuts (scope = undefined) are always active.
   */
  scope?: string;
  /** When true, calls preventDefault() on the keyboard event. Defaults to true. */
  preventDefault?: boolean;
}

/**
 * Detects whether the current platform is macOS so we can swap Ctrl/Cmd.
 */
function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  // navigator.platform is deprecated but still widely supported; use
  // userAgentData when available.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uaData = (navigator as any).userAgentData;
  if (uaData?.platform) {
    return uaData.platform === 'macOS';
  }
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? '');
}

/**
 * Returns true when the correct "primary modifier" is held.
 * On macOS this is the Meta (Cmd) key; everywhere else it is Ctrl.
 */
function hasPrimaryModifier(event: KeyboardEvent, isMac: boolean): boolean {
  return isMac ? event.metaKey : event.ctrlKey;
}

/**
 * Keys that browsers assign their own default behaviour to when combined with
 * the primary modifier.  We intentionally do NOT prevent these defaults unless
 * the consumer explicitly provides `preventDefault: true`.
 */
const BROWSER_RESERVED_KEYS = new Set([
  'c', // copy
  'v', // paste
  'x', // cut
  'a', // select all
  'z', // undo
  'y', // redo (Windows)
  'f', // find
  'p', // print
  'r', // reload
  't', // new tab
  'w', // close tab
  'n', // new window
  'l', // focus address bar
]);

/**
 * Determines whether we should call `preventDefault()` on the event.
 */
function shouldPreventDefault(shortcut: KeyboardShortcut): boolean {
  // Respect the explicit flag when provided.
  if (shortcut.preventDefault !== undefined) {
    return shortcut.preventDefault;
  }

  // If the shortcut uses the primary modifier and is a browser-reserved combo,
  // do NOT prevent the default to avoid hijacking standard behaviour.
  if (shortcut.ctrl && BROWSER_RESERVED_KEYS.has(shortcut.key.toLowerCase())) {
    return false;
  }

  // For everything else, prevent by default so the browser doesn't also act.
  return true;
}

/**
 * Custom Preact hook that registers keyboard shortcuts on the document.
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts([
 *   {
 *     key: 'k',
 *     ctrl: true,
 *     description: 'Open command palette',
 *     category: 'General',
 *     action: () => setCommandPaletteOpen(true),
 *   },
 *   {
 *     key: 'Escape',
 *     description: 'Close dialog',
 *     scope: 'dialog',
 *     action: () => setDialogOpen(false),
 *   },
 * ]);
 * ```
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]): void {
  // Keep shortcuts in a ref so the event handler always sees the latest list
  // without needing to re-register on every render.
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const isMac = useRef(isMacPlatform());

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Ignore events originating from input elements to avoid interfering
      // with normal typing — unless the shortcut uses the primary modifier.
      const target = event.target as HTMLElement | null;
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      for (const shortcut of shortcutsRef.current) {
        // Skip input-originating events for non-modifier shortcuts so regular
        // typing is never intercepted.
        if (isInput && !shortcut.ctrl && !shortcut.alt) {
          continue;
        }

        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        if (!keyMatch) {
          continue;
        }

        const ctrlMatch = shortcut.ctrl
          ? hasPrimaryModifier(event, isMac.current)
          : !event.ctrlKey && !event.metaKey;

        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (ctrlMatch && shiftMatch && altMatch) {
          if (shouldPreventDefault(shortcut)) {
            event.preventDefault();
            event.stopPropagation();
          }

          shortcut.action();
          return; // Only fire the first matching shortcut.
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);
}

/**
 * Helper that returns a human-readable label for the primary modifier on the
 * current platform.  Useful when building UI strings outside of the help
 * overlay.
 */
export function getPrimaryModifierLabel(): string {
  return isMacPlatform() ? '\u2318' : 'Ctrl';
}
