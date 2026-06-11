import { describe, expect, it } from 'vitest';

import {
  convertModHeaderExport,
  isModHeaderExport,
} from '@/lib/integrations/modheader-importer';

const modHeaderProfile = {
  title: 'Staging auth',
  headers: [
    { enabled: true, name: 'Authorization', value: 'Bearer abc123' },
    { enabled: false, name: 'X-Disabled', value: 'skip-me' },
    { enabled: true, name: '', value: 'nameless' },
  ],
  respHeaders: [{ enabled: true, name: 'X-Debug', value: '1' }],
  urlFilters: [{ enabled: true, urlRegex: '.*\\.example\\.com' }],
  appendMode: false,
};

describe('isModHeaderExport', () => {
  it('detects an array of ModHeader profiles', () => {
    expect(isModHeaderExport([modHeaderProfile])).toBe(true);
  });

  it('detects a single ModHeader profile object', () => {
    expect(isModHeaderExport(modHeaderProfile)).toBe(true);
  });

  it('rejects RequestKit exports', () => {
    expect(
      isModHeaderExport({
        version: '1.0.0',
        timestamp: '2026-01-01T00:00:00.000Z',
        rules: [],
      })
    ).toBe(false);
  });

  it('rejects empty arrays, primitives, and unrelated objects', () => {
    expect(isModHeaderExport([])).toBe(false);
    expect(isModHeaderExport('headers')).toBe(false);
    expect(isModHeaderExport(null)).toBe(false);
    expect(isModHeaderExport({ foo: 'bar' })).toBe(false);
  });
});

describe('convertModHeaderExport', () => {
  it('converts a profile into a rule with request and response headers', () => {
    const rules = convertModHeaderExport([modHeaderProfile]);

    expect(rules).toHaveLength(1);
    const rule = rules[0];
    expect(rule?.name).toBe('Staging auth');
    expect(rule?.enabled).toBe(true);
    expect(rule?.tags).toContain('modheader-import');
    expect(rule?.headers).toEqual([
      {
        name: 'Authorization',
        value: 'Bearer abc123',
        operation: 'set',
        target: 'request',
      },
      { name: 'X-Debug', value: '1', operation: 'set', target: 'response' },
    ]);
  });

  it('translates a subdomain wildcard url regex into a domain pattern', () => {
    const rules = convertModHeaderExport([modHeaderProfile]);
    expect(rules[0]?.pattern.domain).toBe('*.example.com');
  });

  it('falls back to all domains when no filters exist', () => {
    const withoutFilters = { ...modHeaderProfile, urlFilters: [] };
    const rules = convertModHeaderExport([withoutFilters]);
    expect(rules[0]?.pattern.domain).toBe('*');
  });

  it('falls back to all domains and notes untranslatable regex filters', () => {
    const rules = convertModHeaderExport([
      {
        ...modHeaderProfile,
        urlFilters: [{ enabled: true, urlRegex: '(staging|prod)\\.api' }],
      },
    ]);
    expect(rules[0]?.pattern.domain).toBe('*');
    expect(rules[0]?.description).toContain('(staging|prod)\\.api');
  });

  it('creates one rule per translatable url filter', () => {
    const rules = convertModHeaderExport([
      {
        ...modHeaderProfile,
        urlFilters: [
          { enabled: true, urlRegex: 'api\\.example\\.com' },
          { enabled: true, urlRegex: 'staging\\.example\\.com' },
        ],
      },
    ]);
    expect(rules).toHaveLength(2);
    expect(rules.map(r => r.pattern.domain)).toEqual([
      'api.example.com',
      'staging.example.com',
    ]);
    expect(rules[0]?.name).toBe('Staging auth (api.example.com)');
  });

  it('uses append operation when appendMode is on', () => {
    const rules = convertModHeaderExport([
      { ...modHeaderProfile, appendMode: true },
    ]);
    expect(rules[0]?.headers[0]?.operation).toBe('append');
  });

  it('skips profiles with no usable headers', () => {
    const rules = convertModHeaderExport([
      { title: 'Empty', headers: [{ enabled: false, name: 'X', value: '1' }] },
    ]);
    expect(rules).toHaveLength(0);
  });

  it('names untitled profiles by position', () => {
    const rules = convertModHeaderExport([
      { headers: [{ enabled: true, name: 'X-A', value: '1' }] },
    ]);
    expect(rules[0]?.name).toBe('ModHeader profile 1');
  });
});
