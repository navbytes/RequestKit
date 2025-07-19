import { render } from 'preact';

import { loggers } from '@/shared/utils/debug';

import { PopupApp } from './components/PopupApp';
import '@/styles/globals.css';

// Initialize popup

// Get logger for this module
const logger = loggers.shared;

const root = document.getElementById('popup-root');
if (root) {
  render(<PopupApp />, root);
}

logger.info('RequestKit popup loaded');
