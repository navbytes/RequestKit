import { render } from 'preact';

import { loggers } from '@/shared/utils/debug';

import { PopupApp } from './components/PopupApp';
import '@/styles/globals.css';
// import '@/shared/mocks/chrome-api';

// Initialize popup in development mode

// Get logger for this module
const logger = loggers.shared;

const root = document.getElementById('popup-root');
if (root) {
  render(<PopupApp />, root);
}

logger.info(
  '[import mock chrome-api] RequestKit popup loaded (development mode)'
);
