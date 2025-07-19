/**
 * Vitest test setup file
 * Configures testing environment for Chrome extension testing
 */

import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';

// Chrome API Mock Setup
const createChromeMock = () => ({
  declarativeNetRequest: {
    updateDynamicRules: vi.fn().mockResolvedValue(undefined),
    getDynamicRules: vi.fn().mockResolvedValue([]),
    getEnabledRulesets: vi.fn().mockResolvedValue([]),
    updateEnabledRulesets: vi.fn().mockResolvedValue(undefined),
    getAvailableStaticRuleCount: vi.fn().mockResolvedValue(1000),
    getDynamicRuleCount: vi.fn().mockResolvedValue(0),
    getSessionRules: vi.fn().mockResolvedValue([]),
    updateSessionRules: vi.fn().mockResolvedValue(undefined),
    testMatchOutcome: vi.fn().mockResolvedValue({ matchedRules: [] }),
    onRuleMatchedDebug: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
  },
  runtime: {
    getURL: vi.fn(
      (path: string) => `chrome-extension://test-extension-id/${path}`
    ),
    getManifest: vi.fn().mockReturnValue({
      version: '1.0.0',
      name: 'Test Extension',
      manifest_version: 3,
    }),
    id: 'test-extension-id',
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
    onConnect: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
    sendMessage: vi.fn().mockResolvedValue(undefined),
    connect: vi.fn().mockReturnValue({
      postMessage: vi.fn(),
      disconnect: vi.fn(),
      onMessage: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
      onDisconnect: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    }),
  },
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
      getBytesInUse: vi.fn().mockResolvedValue(0),
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
        hasListener: vi.fn().mockReturnValue(false),
      },
    },
    sync: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
      getBytesInUse: vi.fn().mockResolvedValue(0),
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
        hasListener: vi.fn().mockReturnValue(false),
      },
    },
    session: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
      getBytesInUse: vi.fn().mockResolvedValue(0),
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
        hasListener: vi.fn().mockReturnValue(false),
      },
    },
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
  },
  notifications: {
    create: vi.fn().mockResolvedValue('notification-id'),
    clear: vi.fn().mockResolvedValue(true),
    getAll: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue(true),
    getPermissionLevel: vi.fn().mockResolvedValue('granted'),
    onClicked: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
    onClosed: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
  },
  tabs: {
    query: vi.fn().mockResolvedValue([]),
    get: vi.fn().mockResolvedValue({
      id: 1,
      url: 'https://example.com',
      title: 'Test Tab',
      active: true,
      windowId: 1,
    }),
    create: vi.fn().mockResolvedValue({
      id: 2,
      url: 'https://example.com',
      title: 'New Tab',
      active: true,
      windowId: 1,
    }),
    update: vi.fn().mockResolvedValue({
      id: 1,
      url: 'https://updated.com',
      title: 'Updated Tab',
      active: true,
      windowId: 1,
    }),
    remove: vi.fn().mockResolvedValue(undefined),
    reload: vi.fn().mockResolvedValue(undefined),
    sendMessage: vi.fn().mockResolvedValue(undefined),
    onActivated: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
    onUpdated: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
    onRemoved: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
  },
  windows: {
    get: vi.fn().mockResolvedValue({
      id: 1,
      focused: true,
      type: 'normal',
      state: 'normal',
    }),
    getCurrent: vi.fn().mockResolvedValue({
      id: 1,
      focused: true,
      type: 'normal',
      state: 'normal',
    }),
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({
      id: 2,
      focused: true,
      type: 'normal',
      state: 'normal',
    }),
    update: vi.fn().mockResolvedValue({
      id: 1,
      focused: true,
      type: 'normal',
      state: 'normal',
    }),
    remove: vi.fn().mockResolvedValue(undefined),
    onCreated: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
    onRemoved: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
    onFocusChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
  },
  contextMenus: {
    create: vi.fn().mockReturnValue('menu-id'),
    update: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    removeAll: vi.fn().mockResolvedValue(undefined),
    onClicked: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
  },
  permissions: {
    contains: vi.fn().mockResolvedValue(true),
    getAll: vi.fn().mockResolvedValue({
      permissions: ['storage', 'declarativeNetRequest'],
      origins: ['<all_urls>'],
    }),
    request: vi.fn().mockResolvedValue(true),
    remove: vi.fn().mockResolvedValue(true),
    onAdded: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
    onRemoved: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
  },
  action: {
    setBadgeText: vi.fn().mockResolvedValue(undefined),
    getBadgeText: vi.fn().mockResolvedValue(''),
    setBadgeBackgroundColor: vi.fn().mockResolvedValue(undefined),
    getBadgeBackgroundColor: vi.fn().mockResolvedValue([0, 0, 0, 0]),
    setTitle: vi.fn().mockResolvedValue(undefined),
    getTitle: vi.fn().mockResolvedValue('Extension Title'),
    setIcon: vi.fn().mockResolvedValue(undefined),
    setPopup: vi.fn().mockResolvedValue(undefined),
    getPopup: vi.fn().mockResolvedValue('popup.html'),
    enable: vi.fn().mockResolvedValue(undefined),
    disable: vi.fn().mockResolvedValue(undefined),
    isEnabled: vi.fn().mockResolvedValue(true),
    onClicked: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
  },
  webNavigation: {
    onBeforeNavigate: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
    onCommitted: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
    onCompleted: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
  },
  webRequest: {
    onBeforeRequest: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
    onBeforeSendHeaders: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
    onSendHeaders: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
    onHeadersReceived: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
    onResponseStarted: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
    onCompleted: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
    onErrorOccurred: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
  },
});

// Set up global Chrome API mock
const chromeMock = createChromeMock();

// Make chrome available globally
Object.defineProperty(globalThis, 'chrome', {
  value: chromeMock,
  writable: true,
  configurable: true,
});

// Also make it available as global.chrome for compatibility
Object.defineProperty(global, 'chrome', {
  value: chromeMock,
  writable: true,
  configurable: true,
});

// Set up global test utilities
(globalThis as any).vi = vi;

// Mock console methods to reduce noise in tests
const originalConsole = console;
(globalThis as any).console = {
  ...originalConsole,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();

  // Reset Chrome API mocks to their default state
  Object.assign(globalThis.chrome, createChromeMock());
});

// Clean up after each test
afterEach(() => {
  vi.restoreAllMocks();
});

// Global test configuration
export { chromeMock };
