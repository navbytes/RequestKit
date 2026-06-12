# RequestKit

**Modify HTTP request headers with wildcard patterns, profiles, and dynamic
variables — free forever, no account, no ads, no telemetry.**

RequestKit is an open-source Manifest V3 Chrome extension for developers who
need to inject, override, or remove request headers: testing APIs, switching
auth tokens between environments, debugging CDNs and proxies, or simulating
clients.

## Why RequestKit

- **Free forever.** Unlimited rules, unlimited profiles. No paywall, no
  "Pro" tier, no rule caps.
- **No account, no cloud.** Your rules live in your browser's extension
  storage. Export/import them as plain JSON files — your data is a file,
  not our cloud.
- **No telemetry, no ads.** The extension makes zero network calls of its
  own. Audit the source — it's all here.
- **Zero per-page overhead.** Headers are modified by Chrome's native
  `declarativeNetRequest` engine. RequestKit injects **no content scripts**
  and runs **no code in your pages**, so it adds nothing to page load time.
- **MV3-native, not MV3-ported.** Built on Manifest V3 from day one — no
  legacy webRequest code, nothing that breaks when Chrome tightens the
  rules.

## Features

- **Header injection & removal** for requests and responses, powered by
  `declarativeNetRequest`
- **Wildcard URL patterns** — protocol, domain, subdomain, path, query, and
  port matching (`*.staging.example.com/api/*`)
- **Profiles** — group rules into environments (dev / staging / prod) and
  switch with one click from the popup
- **Dynamic variables** — `${variable}` templates in header values with
  scoped resolution (rule > profile > global > system) and built-in
  functions: `timestamp()`, `uuid()`, `random()`, `base64()`, `date()`
- **Rule templates** — predefined templates for auth, CORS, debugging, and
  security headers
- **DevTools panel** — inspect requests, see which rules matched, and watch
  variable resolution step by step: see your headers actually working
- **Rule testing** — validate patterns and preview header output before
  enabling a rule
- **Import/export** — plain JSON, easy to version-control and share
- **Localized** — English and Hindi today; translations welcome

## Installation

### From source (recommended until the store listing is live)

```bash
git clone https://github.com/navbytes/RequestKit.git
cd RequestKit
npm install
npm run build
```

Then in Chrome:

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** and select the `dist/` folder

## Permissions, honestly explained

Chrome shows a scary warning for any extension that can touch network
requests. Here is exactly what RequestKit asks for and why:

| Permission                 | Why it's needed                                                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `declarativeNetRequest`    | The Chrome API that actually modifies headers. Chrome applies your rules natively; RequestKit never sees your traffic.              |
| Host access (`<all_urls>`) | Required for header rules to apply to the sites you target. Your rules decide which URLs are matched; everything else is untouched. |
| `storage`                  | Saves your rules, profiles, and settings locally.                                                                                   |
| `contextMenus`             | The optional right-click shortcuts.                                                                                                 |
| `notifications`            | Optional rule-update/error notifications, controlled in settings.                                                                   |

What RequestKit does **not** do: run scripts in your pages, read page
content, phone home, collect analytics, or require an account.

## How it compares

|                             | RequestKit      | ModHeader                             | Requestly               | Simple Modify Headers |
| --------------------------- | --------------- | ------------------------------------- | ----------------------- | --------------------- |
| Price                       | Free, unlimited | Free tier capped (10 rules); paid Pro | Freemium; paid tiers    | Free                  |
| Account required            | Never           | For sync/Pro                          | For most features       | No                    |
| Ads / sponsored content     | None            | Ad-supported tier                     | None                    | None                  |
| Open source                 | ✅              | ❌                                    | ✅                      | ✅                    |
| Content scripts on pages    | None            | —                                     | Yes (broad feature set) | —                     |
| Profiles                    | ✅ Unlimited    | Limited free                          | ✅                      | ❌                    |
| Dynamic variables/functions | ✅              | Paid                                  | Partial                 | ❌                    |
| DevTools rule inspector     | ✅              | ❌                                    | Partial                 | ❌                    |

Coming from ModHeader? RequestKit imports your exported profiles in one
click — see [Switching from ModHeader](docs/switching-from-modheader.md).

## Quick start

1. Click the RequestKit icon and choose **Quick Rule**
2. The current site's domain is pre-filled — add a header name and value
   (e.g. `Authorization: Bearer ${auth_token}`)
3. Save. The header is injected on matching requests immediately
4. Open the **DevTools → RequestKit** panel to watch rules match in real
   time

## Development

Built with Preact + TypeScript + Tailwind on Vite.

```bash
npm install        # also installs git hooks via lefthook
npm run dev:ui     # standalone UI dev server (mocked Chrome APIs)
npm run build      # production build into dist/
npm run test       # vitest suite
npm run lint       # eslint
npm run type-check # tsc --noEmit
```

### Project layout

```
src/
├── background/   # MV3 service worker: rule conversion, profiles, badge
├── popup/        # toolbar popup (quick toggle, rules list, quick rule)
├── options/      # full options UI (rules, profiles, variables, templates)
├── devtools/     # DevTools panel: request inspector, rule matching
├── lib/          # core engines: pattern matcher, variable resolver
└── shared/       # types, utilities, UI components, i18n
manifest.json     # the extension manifest (copied to dist/ on build)
```

### Contributing

Issues and PRs are welcome. Commit messages follow
[Conventional Commits](https://www.conventionalcommits.org/) (enforced by a
git hook), and CI runs lint, type-check, tests, localization checks, and a
production build on every PR. See [ROADMAP.md](ROADMAP.md) for direction.

### Releasing

Conventional commits on `main` accumulate into a release PR maintained by
[release-please](https://github.com/googleapis/release-please) (version
bump in `package.json` + `manifest.json`, changelog entry). Merging that
PR triggers the release workflow: tag and GitHub Release with the store
zip. Chrome Web Store submission is deliberately **manual**: run the
"Publish to Chrome Web Store" workflow from the Actions tab when ready
(requires the four `CHROME_*` repository secrets).

### Localization

Locale files live in `_locales/`. `npm run validate-messages` and
`npm run check-missing-keys` keep them consistent.

## Privacy

RequestKit collects nothing. See [PRIVACY_POLICY.md](PRIVACY_POLICY.md).

## License

[MIT](LICENSE)
