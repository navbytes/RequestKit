import { render } from 'preact';

import '@/styles/globals.css';
import { loggers } from '@/shared/utils/debug';

import { DevToolsPanel } from './components/DevToolsPanel';

// Initialize the panel

// Get logger for this module
const logger = loggers.shared;

const root = document.getElementById('devtools-root');
if (root) {
  render(<DevToolsPanel />, root);
}

logger.info('RequestKit DevTools panel loaded');
