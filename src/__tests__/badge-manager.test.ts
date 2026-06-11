import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BadgeManager } from '@/background/services/badge-manager';
import type { HeaderRule } from '@/shared/types/rules';

function makeRule(overrides: Partial<HeaderRule> = {}): HeaderRule {
  return {
    id: 'rule_1',
    name: 'Test rule',
    enabled: true,
    pattern: { protocol: '*', domain: '*.example.com', path: '/*' },
    headers: [
      { name: 'X-Test', value: '1', operation: 'set', target: 'request' },
    ],
    priority: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('BadgeManager.updateBadgeForTab', () => {
  beforeEach(() => {
    vi.mocked(chrome.action.setBadgeText).mockClear();
  });

  it('counts rules with wildcard domains that match the tab url', async () => {
    await BadgeManager.updateBadgeForTab(
      1,
      'https://api.example.com/v1/users',
      true,
      { rule_1: makeRule() }
    );

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '1',
      tabId: 1,
    });
  });

  it('clears the badge when no rule matches the tab url', async () => {
    await BadgeManager.updateBadgeForTab(1, 'https://other-site.org/', true, {
      rule_1: makeRule(),
    });

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '',
      tabId: 1,
    });
  });

  it('ignores disabled rules', async () => {
    await BadgeManager.updateBadgeForTab(
      1,
      'https://api.example.com/v1/users',
      true,
      { rule_1: makeRule({ enabled: false }) }
    );

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '',
      tabId: 1,
    });
  });

  it('does nothing while the extension is disabled', async () => {
    await BadgeManager.updateBadgeForTab(
      1,
      'https://api.example.com/v1/users',
      false,
      { rule_1: makeRule() }
    );

    expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
  });
});
