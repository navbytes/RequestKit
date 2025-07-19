import { render } from 'preact';

import { loggers } from '@/shared/utils/debug';

import { OptionsApp } from './components/OptionsApp';
import '@/styles/globals.css';

// Initialize options page

// Get logger for this module
const logger = loggers.shared;

const root = document.getElementById('options-root');
if (root) {
  render(<OptionsApp />, root);
}

logger.info('RequestKit options page loaded');
