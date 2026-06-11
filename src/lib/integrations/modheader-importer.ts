/**
 * One-click import of ModHeader profile exports.
 *
 * ModHeader exports a JSON array of profile objects (a single object for
 * older versions). Each profile carries request headers, response headers,
 * and optional URL regex filters. This module detects that shape and
 * converts it into RequestKit header rules so switchers keep their setup.
 */

import type { HeaderEntry, HeaderRule } from '@/shared/types/rules';

interface ModHeaderHeader {
  enabled?: boolean;
  name?: string;
  value?: string;
  comment?: string;
}

interface ModHeaderFilter {
  enabled?: boolean;
  type?: string;
  urlRegex?: string;
}

interface ModHeaderProfile {
  title?: string;
  shortTitle?: string;
  headers?: ModHeaderHeader[];
  respHeaders?: ModHeaderHeader[];
  urlFilters?: ModHeaderFilter[];
  filters?: ModHeaderFilter[];
  appendMode?: boolean | string;
}

function isModHeaderProfile(value: unknown): value is ModHeaderProfile {
  if (typeof value !== 'object' || value === null) return false;
  const profile = value as Record<string, unknown>;
  // A profile must carry at least one header list; `title` alone is too
  // weak a signal and `version`/`timestamp` mark RequestKit's own format.
  if ('version' in profile && 'timestamp' in profile) return false;
  return Array.isArray(profile.headers) || Array.isArray(profile.respHeaders);
}

/**
 * Returns true when the parsed JSON looks like a ModHeader export
 * (an array of profiles or a single profile object).
 */
export function isModHeaderExport(data: unknown): boolean {
  if (Array.isArray(data)) {
    return data.length > 0 && data.every(isModHeaderProfile);
  }
  return isModHeaderProfile(data);
}

/**
 * Best-effort extraction of a RequestKit domain pattern from a ModHeader
 * URL regex. Returns null when the regex is too complex to translate, in
 * which case the caller falls back to matching all domains.
 */
function domainFromUrlRegex(urlRegex: string): string | null {
  let pattern = urlRegex.trim();
  if (!pattern) return null;

  // Strip common anchors and protocol prefixes.
  pattern = pattern.replace(/^\^/, '').replace(/\$$/, '');
  pattern = pattern.replace(/^https?(\\?:)?(\/\/|\\\/\\\/)?/i, '');
  // Unescape literal dots, the one regex escape ModHeader users actually use.
  pattern = pattern.replace(/\\\./g, '.');
  // Leading ".*" means "any subdomain" — RequestKit spells that "*."
  pattern = pattern.replace(/^\.\*\.?/, '*.');
  // Drop any path part; RequestKit patterns separate domain and path.
  const domain = pattern.split('/')[0] ?? '';

  // Give up if regex metacharacters remain beyond our wildcard.
  if (/[\\^$+?()[\]{}|]/.test(domain) || domain === '' || domain === '*.') {
    return null;
  }
  return domain;
}

function convertHeaders(
  headers: ModHeaderHeader[] | undefined,
  target: HeaderEntry['target'],
  operation: HeaderEntry['operation']
): HeaderEntry[] {
  return (headers ?? [])
    .filter(h => h.enabled !== false && h.name && h.name.trim() !== '')
    .map(h => ({
      name: (h.name as string).trim(),
      value: h.value ?? '',
      operation,
      target,
    }));
}

/**
 * Converts a ModHeader export (array of profiles or single profile) into
 * RequestKit header rules — one rule per profile. Profiles without any
 * usable headers are skipped.
 */
export function convertModHeaderExport(data: unknown): HeaderRule[] {
  const profiles: ModHeaderProfile[] = Array.isArray(data)
    ? data.filter(isModHeaderProfile)
    : isModHeaderProfile(data)
      ? [data]
      : [];

  const now = new Date();
  const rules: HeaderRule[] = [];

  profiles.forEach((profile, index) => {
    const operation: HeaderEntry['operation'] =
      profile.appendMode === true || profile.appendMode === 'append'
        ? 'append'
        : 'set';

    const headers = [
      ...convertHeaders(profile.headers, 'request', operation),
      ...convertHeaders(profile.respHeaders, 'response', operation),
    ];
    if (headers.length === 0) return;

    const filters = [
      ...(profile.urlFilters ?? []),
      ...(profile.filters ?? []),
    ].filter(f => f.enabled !== false && typeof f.urlRegex === 'string');

    const domains = filters
      .map(f => domainFromUrlRegex(f.urlRegex as string))
      .filter((d): d is string => d !== null);

    const untranslated = filters.length > 0 && domains.length < filters.length;
    const description = untranslated
      ? `Imported from ModHeader. Some URL filters could not be translated automatically — original filters: ${filters
          .map(f => f.urlRegex)
          .join(', ')}`
      : 'Imported from ModHeader.';

    const baseName = profile.title?.trim() || `ModHeader profile ${index + 1}`;
    const ruleDomains = domains.length > 0 ? domains : ['*'];

    ruleDomains.forEach((domain, domainIndex) => {
      rules.push({
        id: `rule_modheader_${Date.now()}_${index}_${domainIndex}`,
        name: ruleDomains.length > 1 ? `${baseName} (${domain})` : baseName,
        enabled: true,
        pattern: {
          protocol: '*',
          domain,
          path: '/*',
        },
        headers,
        priority: 1,
        createdAt: now,
        updatedAt: now,
        description,
        tags: ['modheader-import'],
      });
    });
  });

  return rules;
}
