// Mock Chrome APIs for development environment

import { loggers } from '@/shared/utils/debug';
interface MockStorageArea {
  get(keys: string | string[] | null, callback: (result: any) => void): void;
  set(items: Record<string, any>, callback?: () => void): void;
  remove(keys: string | string[], callback?: () => void): void;
  clear(callback?: () => void): void;
  onChanged: {
    addListener(callback: (changes: any, areaName: string) => void): void;
    removeListener(callback: (changes: any, areaName: string) => void): void;
  };
}

interface MockChrome {
  storage: {
    sync: MockStorageArea;
    local: MockStorageArea;
    onChanged: {
      addListener(callback: (changes: any, areaName: string) => void): void;
      removeListener(callback: (changes: any, areaName: string) => void): void;
    };
  };
  runtime: {
    onMessage: {
      addListener(
        callback: (message: any, sender: any, sendResponse: any) => void
      ): void;
      removeListener(
        callback: (message: any, sender: any, sendResponse: any) => void
      ): void;
    };
    sendMessage(message: any, callback?: (response: any) => void): void;
    getManifest(): any;
    id: string;
    onInstalled: {
      addListener(callback: (details: any) => void): void;
    };
    onStartup: {
      addListener(callback: () => void): void;
    };
  };
  tabs: {
    query(queryInfo: any, callback: (tabs: any[]) => void): void;
    get(tabId: number, callback: (tab: any) => void): void;
    create(createProperties: any, callback?: (tab: any) => void): void;
    update(
      tabId: number,
      updateProperties: any,
      callback?: (tab: any) => void
    ): void;
    remove(tabIds: number | number[], callback?: () => void): void;
    onActivated: {
      addListener(callback: (activeInfo: any) => void): void;
    };
    onUpdated: {
      addListener(
        callback: (tabId: number, changeInfo: any, tab: any) => void
      ): void;
    };
  };
  declarativeNetRequest: {
    updateDynamicRules(options: any, callback?: () => void): void;
    getDynamicRules(callback: (rules: any[]) => void): void;
    getSessionRules(callback: (rules: any[]) => void): void;
    updateSessionRules(options: any, callback?: () => void): void;
    onRuleMatchedDebug: {
      addListener(callback: (info: any) => void): void;
    };
  };
  contextMenus: {
    create(createProperties: any, callback?: () => void): void;
    update(id: string, updateProperties: any, callback?: () => void): void;
    remove(menuItemId: string, callback?: () => void): void;
    removeAll(callback?: () => void): void;
    onClicked: {
      addListener(callback: (info: any, tab: any) => void): void;
    };
  };
  notifications: {
    create(
      notificationId: string,
      options: any,
      callback?: (notificationId: string) => void
    ): void;
    clear(
      notificationId: string,
      callback?: (wasCleared: boolean) => void
    ): void;
    onClicked: {
      addListener(callback: (notificationId: string) => void): void;
    };
    onClosed: {
      addListener(
        callback: (notificationId: string, byUser: boolean) => void
      ): void;
    };
  };
  action: {
    setBadgeText(details: { text: string; tabId?: number }): void;
    setBadgeBackgroundColor(details: { color: string; tabId?: number }): void;
    setIcon(details: {
      path: string | Record<string, string>;
      tabId?: number;
    }): void;
    setTitle(details: { title: string; tabId?: number }): void;
    onClicked: {
      addListener(callback: (tab: any) => void): void;
    };
  };
  devtools: {
    panels: {
      create(
        title: string,
        iconPath: string,
        pagePath: string,
        callback: (panel: any) => void
      ): void;
    };
    inspectedWindow: {
      tabId: number;
      eval(
        expression: string,
        callback: (result: any, isException: boolean) => void
      ): void;
    };
    network: {
      onRequestFinished: {
        addListener(callback: (request: any) => void): void;
      };
    };
  };
}

// Mock storage implementation

// Get logger for this module
const logger = loggers.shared;

class MockStorage implements MockStorageArea {
  private data: Record<string, any> = {};
  private listeners: Array<(changes: any, areaName: string) => void> = [];

  get(keys: string | string[] | null, callback: (result: any) => void): void {
    setTimeout(() => {
      if (keys === null) {
        callback({ ...this.data });
      } else if (typeof keys === 'string') {
        callback({ [keys]: this.data[keys] });
      } else {
        const result: Record<string, any> = {};
        keys.forEach(key => {
          if (key in this.data) {
            result[key] = this.data[key];
          }
        });
        callback(result);
      }
    }, 10);
  }

  set(items: Record<string, any>, callback?: () => void): void {
    setTimeout(() => {
      const changes: Record<string, any> = {};

      Object.entries(items).forEach(([key, newValue]) => {
        const oldValue = this.data[key];
        this.data[key] = newValue;
        changes[key] = { oldValue, newValue };
      });

      // Notify listeners
      this.listeners.forEach(listener => {
        listener(changes, 'sync');
      });

      if (callback) callback();
    }, 10);
  }

  remove(keys: string | string[], callback?: () => void): void {
    setTimeout(() => {
      const keysArray = Array.isArray(keys) ? keys : [keys];
      const changes: Record<string, any> = {};

      keysArray.forEach(key => {
        if (key in this.data) {
          changes[key] = { oldValue: this.data[key], newValue: undefined };
          delete this.data[key];
        }
      });

      // Notify listeners
      this.listeners.forEach(listener => {
        listener(changes, 'sync');
      });

      if (callback) callback();
    }, 10);
  }

  clear(callback?: () => void): void {
    setTimeout(() => {
      const changes: Record<string, any> = {};

      Object.keys(this.data).forEach(key => {
        changes[key] = { oldValue: this.data[key], newValue: undefined };
      });

      this.data = {};

      // Notify listeners
      this.listeners.forEach(listener => {
        listener(changes, 'sync');
      });

      if (callback) callback();
    }, 10);
  }

  onChanged = {
    addListener: (callback: (changes: any, areaName: string) => void) => {
      this.listeners.push(callback);
    },
    removeListener: (callback: (changes: any, areaName: string) => void) => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    },
  };
}

// Create mock Chrome object
const mockStorage = new MockStorage();
const mockLocalStorage = new MockStorage();

const mockChrome: MockChrome = {
  storage: {
    sync: mockStorage,
    local: mockLocalStorage,
    onChanged: {
      addListener: callback => {
        mockStorage.onChanged.addListener(callback);
        mockLocalStorage.onChanged.addListener(callback);
      },
      removeListener: callback => {
        mockStorage.onChanged.removeListener(callback);
        mockLocalStorage.onChanged.removeListener(callback);
      },
    },
  },

  runtime: {
    onMessage: {
      addListener: callback => {
        logger.info('[Mock] Runtime message listener added', callback);
      },
      removeListener: callback => {
        logger.info('[Mock] Runtime message listener removed', callback);
      },
    },
    sendMessage: (message, callback) => {
      logger.info('[Mock] Sending runtime message:', message);
      if (callback) {
        setTimeout(() => callback({ success: true }), 10);
      }
    },
    getManifest: () => ({
      name: 'RequestKit',
      version: '1.0.0',
      manifest_version: 3,
    }),
    id: 'mock-extension-id',
    onInstalled: {
      addListener: callback => {
        logger.info('[Mock] Install listener added');
        // Simulate installation
        setTimeout(() => callback({ reason: 'install' }), 100);
      },
    },
    onStartup: {
      addListener: _callback => {
        logger.info('[Mock] Startup listener added');
      },
    },
  },

  tabs: {
    query: (queryInfo, callback) => {
      logger.info('[Mock] Querying tabs:', queryInfo);
      setTimeout(() => {
        callback([
          {
            id: 1,
            url: 'https://example.com',
            title: 'Example Site',
            active: true,
            windowId: 1,
          },
        ]);
      }, 10);
    },
    get: (tabId, callback) => {
      logger.info('[Mock] Getting tab:', tabId);
      setTimeout(() => {
        callback({
          id: tabId,
          url: 'https://example.com',
          title: 'Example Site',
          active: true,
          windowId: 1,
        });
      }, 10);
    },
    create: (createProperties, callback) => {
      logger.info('[Mock] Creating tab:', createProperties);
      if (callback) {
        setTimeout(() => {
          callback({
            id: Math.floor(Math.random() * 1000),
            url: createProperties.url,
            title: 'New Tab',
            active: true,
            windowId: 1,
          });
        }, 10);
      }
    },
    update: (tabId, updateProperties, callback) => {
      logger.info('[Mock] Updating tab:', tabId, updateProperties);
      if (callback) {
        setTimeout(() => {
          callback({
            id: tabId,
            url: updateProperties.url || 'https://example.com',
            title: 'Updated Tab',
            active: true,
            windowId: 1,
          });
        }, 10);
      }
    },
    remove: (tabIds, callback) => {
      logger.info('[Mock] Removing tabs:', tabIds);
      if (callback) {
        setTimeout(callback, 10);
      }
    },
    onActivated: {
      addListener: _callback => {
        logger.info('[Mock] Tab activated listener added');
      },
    },
    onUpdated: {
      addListener: _callback => {
        logger.info('[Mock] Tab updated listener added');
      },
    },
  },

  declarativeNetRequest: {
    updateDynamicRules: (options, callback) => {
      logger.info('[Mock] Updating dynamic rules:', options);
      if (callback) {
        setTimeout(callback, 10);
      }
    },
    getDynamicRules: callback => {
      logger.info('[Mock] Getting dynamic rules');
      setTimeout(() => callback([]), 10);
    },
    getSessionRules: callback => {
      logger.info('[Mock] Getting session rules');
      setTimeout(() => callback([]), 10);
    },
    updateSessionRules: (options, callback) => {
      logger.info('[Mock] Updating session rules:', options);
      if (callback) {
        setTimeout(callback, 10);
      }
    },
    onRuleMatchedDebug: {
      addListener: _callback => {
        logger.info('[Mock] Rule matched debug listener added');
      },
    },
  },

  contextMenus: {
    create: (createProperties, callback) => {
      logger.info('[Mock] Creating context menu:', createProperties);
      if (callback) {
        setTimeout(callback, 10);
      }
    },
    update: (id, updateProperties, callback) => {
      logger.info('[Mock] Updating context menu:', id, updateProperties);
      if (callback) {
        setTimeout(callback, 10);
      }
    },
    remove: (menuItemId, callback) => {
      logger.info('[Mock] Removing context menu:', menuItemId);
      if (callback) {
        setTimeout(callback, 10);
      }
    },
    removeAll: callback => {
      logger.info('[Mock] Removing all context menus');
      if (callback) {
        setTimeout(callback, 10);
      }
    },
    onClicked: {
      addListener: _callback => {
        logger.info('[Mock] Context menu click listener added');
      },
    },
  },

  notifications: {
    create: (notificationId, options, callback) => {
      logger.info('[Mock] Creating notification:', notificationId, options);
      if (callback) {
        setTimeout(() => callback(notificationId), 10);
      }
    },
    clear: (notificationId, callback) => {
      logger.info('[Mock] Clearing notification:', notificationId);
      if (callback) {
        setTimeout(() => callback(true), 10);
      }
    },
    onClicked: {
      addListener: _callback => {
        logger.info('[Mock] Notification click listener added');
      },
    },
    onClosed: {
      addListener: _callback => {
        logger.info('[Mock] Notification closed listener added');
      },
    },
  },

  action: {
    setBadgeText: details => {
      logger.info('[Mock] Setting badge text:', details);
    },
    setBadgeBackgroundColor: details => {
      logger.info('[Mock] Setting badge background color:', details);
    },
    setIcon: details => {
      logger.info('[Mock] Setting icon:', details);
    },
    setTitle: details => {
      logger.info('[Mock] Setting title:', details);
    },
    onClicked: {
      addListener: _callback => {
        logger.info('[Mock] Action click listener added');
      },
    },
  },

  devtools: {
    panels: {
      create: (title, iconPath, pagePath, callback) => {
        logger.info(
          '[Mock] Creating devtools panel:',
          title,
          iconPath,
          pagePath
        );
        setTimeout(() => {
          callback({
            onShown: { addListener: () => {} },
            onHidden: { addListener: () => {} },
          });
        }, 10);
      },
    },
    inspectedWindow: {
      tabId: 1,
      eval: (expression, callback) => {
        logger.info('[Mock] Evaluating in inspected window:', expression);
        setTimeout(() => callback(null, false), 10);
      },
    },
    network: {
      onRequestFinished: {
        addListener: _callback => {
          logger.info('[Mock] Network request finished listener added');
        },
      },
    },
  },
};

// Initialize mock Chrome API if not in extension environment
export function initializeMockChrome(): void {
  if (typeof window !== 'undefined' && !window.chrome) {
    logger.info('[Mock] Initializing mock Chrome APIs for development');
    (window as any).chrome = mockChrome;

    // Add some default data for development
    mockStorage.set({
      settings: {
        enabled: true,
        debugMode: true,
        logLevel: 'debug',
        notifications: {
          enabled: true,
          showRuleMatches: true,
          showErrors: true,
          showUpdates: true,
        },
        ui: {
          theme: 'auto',
          compactMode: false,
          showAdvancedOptions: true,
          defaultTab: 'rules',
        },
        performance: {
          maxRules: 100,
          cacheTimeout: 300000,
          enableMetrics: true,
        },
        backup: {
          autoBackup: true,
          backupInterval: 24,
          maxBackups: 5,
        },
        security: {
          requireConfirmation: false,
          allowExternalImport: true,
          validatePatterns: true,
        },
      },
      rules: {},
      templates: {},
      stats: {},
      version: '1.0.0',
    });
  }
}

// Auto-initialize in development
if (process.env.NODE_ENV === 'development') {
  initializeMockChrome();
}

export default mockChrome;
