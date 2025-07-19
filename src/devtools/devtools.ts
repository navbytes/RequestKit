// DevTools integration for RequestKit Chrome extension

import { loggers } from '@/shared/utils/debug';

// Get logger for this module
const logger = loggers.devtools;

logger.info('RequestKit DevTools script loaded');

// Panel window interface
interface PanelWindow extends Window {
  initializePanel?: (config: { tabId: number }) => void;
  handleNetworkRequest?: (request: chrome.devtools.network.Request) => void;
  handleNavigation?: (url: string) => void;
}

// Global reference to panel window
let panelWindow: PanelWindow | null = null;

// Create the RequestKit panel in DevTools
chrome.devtools.panels.create(
  'RequestKit',
  'assets/icons/icon-16.png',
  'src/devtools/panel.html',
  panel => {
    logger.info('RequestKit DevTools panel created');

    // Handle panel shown/hidden events
    panel.onShown.addListener(window => {
      logger.info('RequestKit panel shown');
      panelWindow = window as PanelWindow;

      // Initialize panel with current tab info
      if (panelWindow?.initializePanel) {
        panelWindow.initializePanel({
          tabId: chrome.devtools.inspectedWindow.tabId,
        });
      }
    });

    panel.onHidden.addListener(() => {
      logger.info('RequestKit panel hidden');
      panelWindow = null;
    });
  }
);

// Listen for network events
chrome.devtools.network.onRequestFinished.addListener(request => {
  logger.info('Network request finished:', request);

  // Forward network events to panel if it's open
  if (panelWindow?.handleNetworkRequest) {
    panelWindow.handleNetworkRequest(request);
  }
});

// Listen for navigation events
chrome.devtools.network.onNavigated.addListener(url => {
  logger.info('Navigation detected:', url);

  // Forward navigation events to panel if it's open
  if (panelWindow?.handleNavigation) {
    panelWindow.handleNavigation(url);
  }
});

logger.info('RequestKit DevTools initialized');
