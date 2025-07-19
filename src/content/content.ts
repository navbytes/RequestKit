// Content script for RequestKit Chrome extension

import { ChromeApiUtils } from '@/shared/utils';
import { loggers } from '@/shared/utils/debug';

// Get logger for this module
const logger = loggers.content;

// Extend Window interface for RequestKit-specific properties
interface WindowWithRequestKit extends Window {
  requestKitDomChangeTimeout?: ReturnType<typeof setTimeout>;
}

// Initialize content script
logger.info('RequestKit content script loaded');

// Listen for messages from background script
ChromeApiUtils.runtime.onMessage.addListener(
  (message: unknown, _sender, sendResponse) => {
    logger.info('Content script received message:', message);

    // Type guard to ensure message is an object with type property
    if (!message || typeof message !== 'object' || !('type' in message)) {
      sendResponse({ error: 'Invalid message format' });
      return;
    }

    const typedMessage = message as {
      type: string;
      script?: string;
      selector?: string;
    };

    switch (typedMessage.type) {
      case 'GET_PAGE_INFO':
        sendResponse(getPageInfo());
        break;

      case 'INJECT_SCRIPT':
        if (typedMessage.script) {
          injectScript(typedMessage.script);
        }
        sendResponse({ success: true });
        break;

      case 'HIGHLIGHT_ELEMENTS':
        if (typedMessage.selector) {
          highlightElements(typedMessage.selector);
        }
        sendResponse({ success: true });
        break;

      case 'GET_NETWORK_REQUESTS':
        sendResponse(getNetworkRequests());
        break;

      default:
        sendResponse({ error: 'Unknown message type' });
    }
  }
);

// Get page information
function getPageInfo() {
  return {
    url: window.location.href,
    title: document.title,
    domain: window.location.hostname,
    protocol: window.location.protocol,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };
}

// Inject script into page context
function injectScript(scriptContent: string) {
  try {
    const script = document.createElement('script');
    script.textContent = scriptContent;
    script.setAttribute('data-requestkit', 'injected');

    // Inject into page context
    (document.head || document.documentElement).appendChild(script);

    // Clean up
    script.remove();

    logger.info('Script injected successfully');
  } catch (error) {
    logger.error('Failed to inject script:', error);
  }
}

// Highlight elements matching selector
function highlightElements(selector: string) {
  try {
    // Remove existing highlights
    document.querySelectorAll('[data-requestkit-highlight]').forEach(el => {
      el.removeAttribute('data-requestkit-highlight');
      (el as HTMLElement).style.outline = '';
    });

    // Add new highlights
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.setAttribute('data-requestkit-highlight', 'true');
      (el as HTMLElement).style.outline = '2px solid #3b82f6';
    });

    logger.info(`Highlighted ${elements.length} elements`);
  } catch (error) {
    logger.error('Failed to highlight elements:', error);
  }
}

// Get network requests (simplified - real implementation would need more sophisticated tracking)
function getNetworkRequests() {
  // This is a simplified version - in a real implementation, you'd need to
  // intercept network requests using various methods
  return {
    requests: [],
    timestamp: new Date().toISOString(),
  };
}

// Monitor page changes
let lastUrl = window.location.href;

function checkForUrlChange() {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;

    // Notify background script of URL change
    ChromeApiUtils.runtime.sendMessage({
      type: 'URL_CHANGED',
      url: currentUrl,
      pageInfo: getPageInfo(),
    });
  }
}

// Check for URL changes periodically (for SPAs)
setInterval(checkForUrlChange, 1000);

// Listen for navigation events
window.addEventListener('popstate', checkForUrlChange);
window.addEventListener('pushstate', checkForUrlChange);
window.addEventListener('replacestate', checkForUrlChange);

// Override history methods to catch programmatic navigation
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function (...args) {
  originalPushState.apply(history, args);
  setTimeout(checkForUrlChange, 0);
};

history.replaceState = function (...args) {
  originalReplaceState.apply(history, args);
  setTimeout(checkForUrlChange, 0);
};

// Monitor DOM changes for dynamic content
const observer = new MutationObserver(mutations => {
  let hasSignificantChanges = false;

  mutations.forEach(mutation => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      // Check if any added nodes are significant (not just text nodes)
      const hasElementNodes = Array.from(mutation.addedNodes).some(
        node => node.nodeType === Node.ELEMENT_NODE
      );

      if (hasElementNodes) {
        hasSignificantChanges = true;
      }
    }
  });

  if (hasSignificantChanges) {
    // Debounce DOM change notifications
    const windowWithRequestKit = window as WindowWithRequestKit;
    clearTimeout(windowWithRequestKit.requestKitDomChangeTimeout);
    windowWithRequestKit.requestKitDomChangeTimeout = setTimeout(() => {
      ChromeApiUtils.runtime.sendMessage({
        type: 'DOM_CHANGED',
        url: window.location.href,
        timestamp: new Date().toISOString(),
      });
    }, 500);
  }
});

// Start observing DOM changes when body is available
function startObserving() {
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  } else {
    // If body doesn't exist yet, wait for it
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (document.body) {
          observer.observe(document.body, {
            childList: true,
            subtree: true,
          });
        }
      });
    }
  }
}

startObserving();

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  observer.disconnect();
  clearTimeout((window as WindowWithRequestKit).requestKitDomChangeTimeout);
});

// Notify background script that content script is ready
ChromeApiUtils.runtime.sendMessage({
  type: 'CONTENT_SCRIPT_READY',
  url: window.location.href,
  pageInfo: getPageInfo(),
});

logger.info('RequestKit content script initialized');
