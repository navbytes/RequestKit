/**
 * Component testing utilities for Preact components
 * Provides custom render functions and helpers for Chrome extension context
 */

import { render, RenderOptions, RenderResult } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { h } from 'preact';
import type { ComponentChildren, VNode } from 'preact';
import { vi, expect } from 'vitest';

import type { Profile } from '@/shared/types/profiles';
import type { HeaderRule } from '@/shared/types/rules';
import type { Variable } from '@/shared/types/variables';

// Re-export testing utilities for convenience
export { screen, waitFor, within, fireEvent } from '@testing-library/preact';
export { userEvent };

/**
 * Mock Chrome extension context provider
 */
interface MockExtensionContextProps {
  children: ComponentChildren;
  mockData?: {
    rules?: HeaderRule[];
    profiles?: Profile[];
    variables?: Variable[];
    settings?: any;
    enabled?: boolean;
    activeProfile?: string;
  };
}

function MockExtensionContext({
  children,
  mockData = {},
}: MockExtensionContextProps) {
  // Set up mock Chrome API responses based on provided data
  const chromeMock = (globalThis as any).chrome;

  if (chromeMock && chromeMock.runtime && chromeMock.runtime.sendMessage) {
    chromeMock.runtime.sendMessage.mockImplementation((message: any) => {
      switch (message.type) {
        case 'GET_RULES':
          return Promise.resolve({
            rules: mockData.rules || [],
            enabled: mockData.enabled ?? true,
          });

        case 'GET_PROFILES':
          return Promise.resolve({
            profiles: mockData.profiles || [],
            activeProfile: mockData.activeProfile || 'dev-profile',
          });

        case 'GET_VARIABLES':
          return Promise.resolve({
            variables: mockData.variables || [],
          });

        case 'GET_SETTINGS':
          return Promise.resolve({
            settings: mockData.settings || {
              ui: { compactMode: false, theme: 'auto' },
              notifications: { enabled: true },
            },
          });

        case 'TOGGLE_EXTENSION':
          return Promise.resolve({ success: true, enabled: !mockData.enabled });

        case 'TOGGLE_RULE':
          return Promise.resolve({ success: true });

        case 'DELETE_RULE':
          return Promise.resolve({ success: true });

        case 'SWITCH_PROFILE':
          return Promise.resolve({ success: true });

        default:
          return Promise.resolve({ success: true });
      }
    });
  }

  return children as VNode;
}

/**
 * Custom render function with Chrome extension context
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  mockData?: MockExtensionContextProps['mockData'];
  user?: ReturnType<typeof userEvent.setup>;
}

export function renderWithExtensionContext(
  ui: ComponentChildren,
  options: CustomRenderOptions = {}
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  const { mockData, user = userEvent.setup(), ...renderOptions } = options;

  const Wrapper = ({ children }: { children: ComponentChildren }) =>
    h(MockExtensionContext, { mockData: mockData || {}, children });

  const result = render(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });

  return {
    ...result,
    user,
  };
}

/**
 * Helper to create mock Chrome tab
 */
export function createMockTab(
  overrides: Partial<chrome.tabs.Tab> = {}
): chrome.tabs.Tab {
  return {
    id: 1,
    index: 0,
    windowId: 1,
    highlighted: false,
    active: true,
    pinned: false,
    incognito: false,
    selected: true,
    discarded: false,
    autoDiscardable: true,
    groupId: -1,
    url: 'https://example.com',
    title: 'Example Site',
    favIconUrl: 'https://example.com/favicon.ico',
    status: 'complete',
    ...overrides,
  };
}

/**
 * Helper to mock Chrome storage operations
 */
export function mockChromeStorage(initialData: Record<string, any> = {}) {
  const storage = { ...initialData };
  const chromeMock = (globalThis as any).chrome;

  if (chromeMock && chromeMock.storage) {
    chromeMock.storage.local.get.mockImplementation(
      (keys: string | string[] | null) => {
        if (keys === null) {
          return Promise.resolve(storage);
        }
        if (typeof keys === 'string') {
          return Promise.resolve({ [keys]: storage[keys] });
        }
        const result: Record<string, any> = {};
        keys.forEach(key => {
          if (key in storage) {
            result[key] = storage[key];
          }
        });
        return Promise.resolve(result);
      }
    );

    chromeMock.storage.local.set.mockImplementation(
      (items: Record<string, any>) => {
        Object.assign(storage, items);
        return Promise.resolve();
      }
    );
  }

  return storage;
}

/**
 * Helper to wait for Chrome API calls
 */
export async function waitForChromeApiCall(
  apiMethod: string,
  timeout = 1000
): Promise<any[]> {
  const chromeMock = (globalThis as any).chrome;
  const method = apiMethod
    .split('.')
    .reduce((obj, key) => obj?.[key], chromeMock);

  if (!method || !vi.isMockFunction(method)) {
    throw new Error(`Chrome API method ${apiMethod} is not mocked`);
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout waiting for ${apiMethod} to be called`));
    }, timeout);

    const checkCalls = () => {
      if (method.mock.calls.length > 0) {
        clearTimeout(timeoutId);
        resolve(method.mock.calls);
      } else {
        setTimeout(checkCalls, 10);
      }
    };

    checkCalls();
  });
}

/**
 * Helper to simulate Chrome extension message passing
 */
export function simulateExtensionMessage(
  message: any,
  sender?: chrome.runtime.MessageSender,
  sendResponse?: (response: any) => void
) {
  const chromeMock = (globalThis as any).chrome;
  const listeners = chromeMock.runtime.onMessage.addListener.mock.calls;

  listeners.forEach(
    ([listener]: [
      (
        message: any,
        sender?: chrome.runtime.MessageSender,
        sendResponse?: (response: any) => void
      ) => void,
    ]) => {
      listener(message, sender, sendResponse);
    }
  );
}

/**
 * Helper to create accessibility test utilities
 */
export function createA11yHelpers() {
  return {
    /**
     * Check if element has proper ARIA attributes
     */
    checkAriaAttributes: (
      element: HTMLElement,
      expectedAttributes: Record<string, string>
    ) => {
      Object.entries(expectedAttributes).forEach(([attr, value]) => {
        expect(element).toHaveAttribute(attr, value);
      });
    },

    /**
     * Check if element is keyboard accessible
     */
    checkKeyboardAccessibility: async (
      element: HTMLElement,
      user: ReturnType<typeof userEvent.setup>
    ) => {
      element.focus();
      expect(element).toHaveFocus();

      await user.keyboard('{Enter}');
      // Additional keyboard interaction tests can be added here
    },

    /**
     * Check if element has proper semantic role
     */
    checkSemanticRole: (element: HTMLElement, expectedRole: string) => {
      expect(element).toHaveAttribute('role', expectedRole);
    },
  };
}

/**
 * Helper to test component state changes
 */
export function createStateTestHelpers() {
  return {
    /**
     * Wait for component state to change
     */
    waitForStateChange: async (
      getState: () => any,
      expectedState: any,
      timeout = 1000
    ) => {
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(
            new Error(
              `Timeout waiting for state change to ${JSON.stringify(expectedState)}`
            )
          );
        }, timeout);

        const checkState = () => {
          const currentState = getState();
          if (JSON.stringify(currentState) === JSON.stringify(expectedState)) {
            clearTimeout(timeoutId);
            resolve(currentState);
          } else {
            setTimeout(checkState, 10);
          }
        };

        checkState();
      });
    },

    /**
     * Test loading states
     */
    testLoadingState: async (
      triggerLoading: () => Promise<void>,
      getLoadingIndicator: () => HTMLElement | null
    ) => {
      const loadingPromise = triggerLoading();

      // Should show loading indicator
      expect(getLoadingIndicator()).toBeInTheDocument();

      await loadingPromise;

      // Should hide loading indicator
      expect(getLoadingIndicator()).not.toBeInTheDocument();
    },
  };
}

/**
 * Helper to test error states
 */
export function createErrorTestHelpers() {
  return {
    /**
     * Test error handling
     */
    testErrorHandling: async (
      triggerError: () => Promise<void>,
      getErrorMessage: () => HTMLElement | null,
      expectedErrorText?: string
    ) => {
      await triggerError();

      const errorElement = getErrorMessage();
      expect(errorElement).toBeInTheDocument();

      if (expectedErrorText) {
        expect(errorElement).toHaveTextContent(expectedErrorText);
      }
    },

    /**
     * Mock Chrome API to throw error
     */
    mockChromeApiError: (apiPath: string, error: Error) => {
      const chromeMock = (globalThis as any).chrome;
      const method = apiPath
        .split('.')
        .reduce((obj, key) => obj?.[key], chromeMock);

      if (method && vi.isMockFunction(method)) {
        method.mockRejectedValueOnce(error);
      }
    },
  };
}

/**
 * Helper to create common test scenarios
 */
export function createTestScenarios() {
  return {
    /**
     * Test component with empty data
     */
    emptyState: {
      rules: [],
      profiles: [],
      variables: [],
      enabled: true,
    },

    /**
     * Test component with loading state
     */
    loadingState: {
      // Omit properties entirely for loading state to be compatible with exactOptionalPropertyTypes
    },

    /**
     * Test component with error state
     */
    errorState: {
      rules: [],
      profiles: [],
      variables: [],
      enabled: false,
      error: 'Failed to load data',
    },
  };
}

/**
 * Default export with all utilities
 */
export default {
  renderWithExtensionContext,
  createMockTab,
  mockChromeStorage,
  waitForChromeApiCall,
  simulateExtensionMessage,
  createA11yHelpers,
  createStateTestHelpers,
  createErrorTestHelpers,
  createTestScenarios,
};
