/**
 * Injected script for RequestKit Chrome Extension
 * This script runs in the page context and can access page variables
 */

// This script is injected into the page context
// It can communicate with the content script via custom events

import { loggers } from '@/shared/utils/debug';

// Get logger for this module
const logger = loggers.content;

logger.info('RequestKit injected script loaded');

// Example: Listen for custom events from content script
window.addEventListener('requestkit-inject', (event: Event) => {
  logger.info(
    'RequestKit: Received inject event',
    (event as CustomEvent).detail
  );
});

// Example: Send data back to content script

function sendToContentScript(data: unknown) {
  window.dispatchEvent(
    new CustomEvent('requestkit-response', {
      detail: data,
    })
  );
}

// Export for potential use
export { sendToContentScript };
