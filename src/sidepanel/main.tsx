import { render } from 'preact';

import { loggers } from '@/shared/utils/debug';

import { SidePanelApp } from './components/SidePanelApp';
import '@/styles/globals.css';

// Initialize side panel

// Get logger for this module
const logger = loggers.shared;

const root = document.getElementById('sidepanel-root');
if (root) {
  render(<SidePanelApp />, root);
}

logger.info('RequestKit side panel loaded');
