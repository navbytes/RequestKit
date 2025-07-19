// Standalone content script without external imports
// This version includes all necessary code inline to avoid module import issues

// Inline logger implementation - standalone to avoid import issues
interface StandaloneLogger {
  info: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  debug: (message: string, ...args: unknown[]) => void;
}

const createStandaloneLogger = (prefix: string): StandaloneLogger => ({
  info: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.log(`[${prefix}] ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(`[${prefix}] ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.warn(`[${prefix}] ${message}`, ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.debug(`[${prefix}] ${message}`, ...args);
  },
});

const logger = createStandaloneLogger('RequestKit Content');

// Extend interfaces for type safety
interface WindowWithRequestKit extends Window {
  requestKitDomChangeTimeout?: ReturnType<typeof setTimeout>;
}

interface ChromeWithRuntime {
  runtime: {
    onMessage: {
      addListener: (
        callback: (
          message: unknown,
          sender: unknown,
          sendResponse: (response?: unknown) => void
        ) => void
      ) => void;
    };
    sendMessage: (message: unknown) => void;
  };
}

logger.info('RequestKit content script loaded');

// Message listener
(chrome as ChromeWithRuntime).runtime.onMessage.addListener(
  (
    message: unknown,
    _sender: unknown,
    sendResponse: (response?: unknown) => void
  ) => {
    logger.info('Content script received message:', message);

    const msg = message as { type: string; script?: string; selector?: string };
    switch (msg.type) {
      case 'GET_PAGE_INFO':
        sendResponse(getPageInfo());
        break;
      case 'INJECT_SCRIPT':
        injectScript(msg.script || '');
        sendResponse({ success: true });
        break;
      case 'HIGHLIGHT_ELEMENTS':
        highlightElements(msg.selector || '');
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

// Inject script into page
function injectScript(script: string) {
  try {
    const scriptElement = document.createElement('script');
    scriptElement.textContent = script;
    scriptElement.setAttribute('data-requestkit', 'injected');
    (document.head || document.documentElement).appendChild(scriptElement);
    scriptElement.remove();
    logger.info('Script injected successfully');
  } catch (error) {
    logger.error('Failed to inject script:', error);
  }
}

// Highlight elements on page
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

// Get network requests (placeholder)
function getNetworkRequests() {
  return {
    requests: [],
    timestamp: new Date().toISOString(),
  };
}

// URL change detection
let currentUrl = window.location.href;

function checkUrlChange() {
  const newUrl = window.location.href;
  if (newUrl !== currentUrl) {
    currentUrl = newUrl;
    (chrome as ChromeWithRuntime).runtime.sendMessage({
      type: 'URL_CHANGED',
      url: newUrl,
      pageInfo: getPageInfo(),
    });
  }
}

// Monitor URL changes
setInterval(checkUrlChange, 1000);
window.addEventListener('popstate', checkUrlChange);
window.addEventListener('pushstate', checkUrlChange);
window.addEventListener('replacestate', checkUrlChange);

// Override history methods to detect programmatic navigation
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function (
  data: unknown,
  unused: string,
  url?: string | URL | null
) {
  originalPushState.call(history, data, unused, url);
  setTimeout(checkUrlChange, 0);
};

history.replaceState = function (
  data: unknown,
  unused: string,
  url?: string | URL | null
) {
  originalReplaceState.call(history, data, unused, url);
  setTimeout(checkUrlChange, 0);
};

// DOM change observer
const domObserver = new MutationObserver(mutations => {
  let hasChanges = false;
  mutations.forEach(mutation => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      const hasElementNodes = Array.from(mutation.addedNodes).some(
        node => node.nodeType === Node.ELEMENT_NODE
      );
      if (hasElementNodes) {
        hasChanges = true;
      }
    }
  });

  if (hasChanges) {
    const windowWithRequestKit = window as WindowWithRequestKit;
    clearTimeout(windowWithRequestKit.requestKitDomChangeTimeout);
    windowWithRequestKit.requestKitDomChangeTimeout = setTimeout(() => {
      (chrome as ChromeWithRuntime).runtime.sendMessage({
        type: 'DOM_CHANGED',
        url: window.location.href,
        timestamp: new Date().toISOString(),
      });
    }, 500);
  }
});

// Start observing DOM changes
function startDomObserver() {
  if (document.body) {
    domObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.body) {
        domObserver.observe(document.body, {
          childList: true,
          subtree: true,
        });
      }
    });
  }
}

startDomObserver();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  domObserver.disconnect();
  clearTimeout((window as WindowWithRequestKit).requestKitDomChangeTimeout);
});

// Notify extension that content script is ready
(chrome as ChromeWithRuntime).runtime.sendMessage({
  type: 'CONTENT_SCRIPT_READY',
  url: window.location.href,
  pageInfo: getPageInfo(),
});

logger.info('RequestKit content script initialized');
