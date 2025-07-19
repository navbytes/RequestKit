#!/usr/bin/env node

/**
 * Validate locale message files for Chrome extension compatibility
 * Checks for:
 * - Valid JSON structure
 * - Required message format
 * - No invalid comment keys
 * - Consistent message keys across locales
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const localesDir = join(projectRoot, '_locales');

function validateMessageFormat(messageKey, messageData) {
  const errors = [];

  if (typeof messageData !== 'object' || messageData === null) {
    errors.push(`${messageKey}: Message must be an object`);
    return errors;
  }

  if (!messageData.message || typeof messageData.message !== 'string') {
    errors.push(`${messageKey}: Missing or invalid 'message' property`);
  }

  if (messageData.description && typeof messageData.description !== 'string') {
    errors.push(
      `${messageKey}: Invalid 'description' property (must be string)`
    );
  }

  // Check for invalid comment keys
  if (messageKey.startsWith('_comment_')) {
    errors.push(
      `${messageKey}: Comment keys starting with '_comment_' are not allowed in Chrome extensions`
    );
  }

  return errors;
}

function validateLocaleFile(localePath, locale) {
  const errors = [];

  try {
    const content = readFileSync(localePath, 'utf8');
    const messages = JSON.parse(content);

    // Validate each message
    for (const [key, value] of Object.entries(messages)) {
      const messageErrors = validateMessageFormat(key, value);
      errors.push(...messageErrors.map(err => `[${locale}] ${err}`));
    }

    return { messages, errors };
  } catch (error) {
    if (error instanceof SyntaxError) {
      errors.push(`[${locale}] Invalid JSON: ${error.message}`);
    } else {
      errors.push(`[${locale}] Error reading file: ${error.message}`);
    }
    return { messages: null, errors };
  }
}

function main() {
  console.log('🔍 Validating locale message files...\n');

  let totalErrors = 0;
  const localeData = {};

  try {
    const locales = readdirSync(localesDir);

    for (const locale of locales) {
      const localePath = join(localesDir, locale, 'messages.json');

      try {
        const { messages, errors } = validateLocaleFile(localePath, locale);

        if (errors.length > 0) {
          console.error(`❌ Errors in ${locale}:`);
          errors.forEach(error => console.error(`   ${error}`));
          console.error('');
          totalErrors += errors.length;
        } else {
          console.log(`✅ ${locale}: Valid`);
        }

        if (messages) {
          localeData[locale] = messages;
        }
      } catch (error) {
        console.error(`❌ Failed to process ${locale}: ${error.message}`);
        totalErrors++;
      }
    }

    // Check for consistency across locales
    const localeNames = Object.keys(localeData);
    if (localeNames.length > 1) {
      console.log('\n🔄 Checking consistency across locales...');

      const baseLocale = localeNames[0];
      const baseKeys = new Set(Object.keys(localeData[baseLocale]));

      for (let i = 1; i < localeNames.length; i++) {
        const locale = localeNames[i];
        const currentLocaleKeys = new Set(Object.keys(localeData[locale]));

        const missingKeys = [...baseKeys].filter(
          key => !currentLocaleKeys.has(key)
        );
        const extraKeys = [...currentLocaleKeys].filter(
          key => !baseKeys.has(key)
        );

        if (missingKeys.length > 0) {
          console.error(`❌ ${locale} missing keys: ${missingKeys.join(', ')}`);
          totalErrors += missingKeys.length;
        }

        if (extraKeys.length > 0) {
          console.error(`❌ ${locale} extra keys: ${extraKeys.join(', ')}`);
          totalErrors += extraKeys.length;
        }

        if (missingKeys.length === 0 && extraKeys.length === 0) {
          console.log(`✅ ${locale}: Consistent with ${baseLocale}`);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error accessing locales directory: ${error.message}`);
    process.exit(1);
  }

  console.log(`\n📊 Validation complete: ${totalErrors} error(s) found`);

  if (totalErrors > 0) {
    process.exit(1);
  } else {
    console.log('🎉 All locale files are valid!');
  }
}

main();
