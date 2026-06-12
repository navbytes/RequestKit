# RequestKit Adoption Roadmap

Goal: make RequestKit the obvious choice for developers who need to modify
request headers — by being the most trustworthy, lowest-overhead, and most
frictionless tool in the category.

Each step below is one commit; each phase ships as one pull request. This
document is updated as phases complete.

## Why now — the market opening

| Extension             | Users (approx.) | Rating                       | Model                                                                             | Weakness                                                         |
| --------------------- | --------------- | ---------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| ModHeader             | 800,000+        | ~3.1/5 (collapsed from ~4.5) | Free tier capped at 10 rules; $4/mo Pro; ad-supported tier injects affiliated ads | Monetization backlash, auto-opening ad tabs, login friction      |
| Requestly             | ~300,000        | 4.0–4.6/5                    | Freemium, $8–15/mo                                                                | Heavyweight platform; reported Chrome slowdowns and broken sites |
| Header Editor         | was ~100k       | n/a                          | Free, open source                                                                 | Dead on Chrome — removed with Manifest V2 (Chrome 138/139, 2025) |
| Simple Modify Headers | ~20,000         | ~3.9/5                       | Free, open source                                                                 | MV3 breakage reports, no profiles                                |

The category leader is monetizing against its users, and the free
alternatives broke during the MV3 transition. Users' top pain points:
monetization betrayal, silent MV3 breakage, login/cloud privacy fears,
bloat, and scary permissions.

RequestKit's lane: **free forever, no account, no ads, no telemetry, open
source, MV3-native, zero per-page overhead — headers done right, nothing
else.**

## Phase 1 — Trust & footprint (this PR)

Remove everything that makes the extension scarier or heavier than it needs
to be. Trust is the #1 conversion factor for this category.

- [x] Step 1: Add this roadmap with competitive analysis (`docs`)
- [x] Step 2: Remove the content script, injected script, and unused
      `activeTab` permission. The content script ran on every page at
      `document_start`, polled the URL every second, and observed all DOM
      mutations — yet none of its messages had a consumer anywhere in the
      codebase. Removing it eliminates per-page overhead entirely and
      shrinks the permission footprint. Also removes the stale duplicate
      `src/manifest.json`. (`feat`)
- [x] Step 3: Delete dead code — `FileInterceptionEngine` (exported, never
      instantiated) and devtools `demo-*.ts` artifacts. (`refactor`)
- [x] Step 4: Reposition the README around the trust contract (free, no
      account, no telemetry, zero overhead) with a competitor comparison
      and an honest "why this extension needs broad host permissions"
      explanation. (`docs`)

## Phase 2 — First 60 seconds (first-run & popup UX)

Most users decide within a minute whether an extension stays installed.
Current empty state offers four competing CTAs and a blank slate.

- [x] Step 1: Focus the popup empty state on a single primary action
      ("Create rule", pre-filled with the current tab's domain), with
      templates/advanced editor demoted to text links. Also localizes the
      previously hardcoded popup button strings.
- [x] Step 2: Add a common-header preset picker to the quick rule creator
      (Authorization, X-Api-Key, X-Forwarded-For, Cache-Control, …) so the
      first rule takes seconds, not minutes.
- [x] Step 3: Make the rule name optional in the quick rule creator
      (auto-generated from header + domain), cutting required fields from
      three to two. (An active-rule-count toolbar badge was originally
      planned here, but the codebase already ships one.)
- [x] Step 4: Update roadmap progress. (`docs`)

## Phase 3 — Migration magnet

The incumbent's 800k users are protected mainly by switching cost. Remove
it.

- [x] Step 1: One-click ModHeader JSON import (auto-detected in
      Import/Export).
- [x] Step 2: "Switching from ModHeader" guide documenting the import path
      and feature mapping. (`docs`)
- [x] Step 3: Update roadmap progress. (`docs`)

## Phase 4 — Focus (declutter the options surface)

Power features are a differentiator, but ten top-level tabs read as bloat.
Keep the power, reduce the apparent complexity.

- [x] Step 1: Group experimental/diagnostic tabs (Analytics, Performance,
      Rule Testing, Conditional Rules) behind a single collapsible
      "Advanced" section, collapsed by default (auto-expands on deep links).
- [x] Step 2: Make the local-only nature of analytics explicit in the
      Analytics tab and its navigation description ("data never leaves
      your device"), removing trust-eroding copy like "track user
      behavior". (Originally scoped as a service-worker bundle trim, but
      investigation showed the background entry has no options-only
      imports — it was already lean, so the step was re-scoped to this
      trust fix.)
- [x] Step 3: Update roadmap progress. (`docs`)

## Phase 5 — Reliability visible & launch kit

The category's reputation is "silently broken" — users no longer trust
that headers are actually set. Make correctness visible, and prepare the
store listing that converts.

- [x] Step 1: Fix the per-tab badge to use the real pattern matcher — it
      used naive substring matching, so wildcard rules (e.g.
      `*.example.com`) never counted and the badge under-reported what was
      actually applied. Adds regression tests. (`fix`)
- [x] Step 2: Chrome Web Store listing kit — title, summary, description
      leading with the trust contract, screenshot plan, and category/
      keyword guidance. (`docs`)
- [x] Step 3: Update roadmap progress. (`docs`)

## Phase 6 — Cut the fake and the dead

A follow-up bloat audit. Verdicts: the DevTools panel stays (it has its
own `chrome.devtools.network` data source and is the headline "see your
headers actually working" differentiator). Conditional Rules goes: the
tab let users author conditions that the production injection path
(declarativeNetRequest) silently ignores — conditions were only ever
evaluated in the testing simulator. A feature that pretends to work is
worse than no feature.

- [x] Step 1: Remove the Conditional Rules tab and builder UI. The
      `conditions` field stays in the data model and the rule-testing
      simulator keeps evaluating it, but users can no longer author
      conditions that production ignores. (`refactor`)
- [x] Step 2: Delete dead body-modification code (`BodyModificationManager`
      component and `body-modification-engine`, zero importers).
      (`refactor`)
- [x] Step 3: Remove the "coming soon" placeholder sub-tabs from the
      Analytics view — show the working overview only. (`fix`)
- [x] Step 4: Update roadmap progress. (`docs`)

## Phase 7 — CI/CD overhaul

Research across well-run extension repos (uBlock Origin, Dark Reader,
Refined GitHub, Requestly) shows they ship with ~4–6 focused jobs; this
repo ran ~25 per PR with heavy duplication (lint 3×, tests 4×, builds 4×,
an `npm ci` per job) plus non-enforcing "theater" jobs (complexity,
type-coverage, grep-based performance/accessibility checks) that always
pass. Several actions were also pinned to Node 20 majors, which GitHub
runners stop supporting in June 2026.

- [x] Step 1: Add this phase with research findings. (`docs`)
- [x] Step 2: Consolidate the PR pipelines into one enforcing `ci.yml`
      (lint/format/type-check/audit, tests + localization gates, build +
      manifest validation + size budget + side-loadable zip artifact),
      slim `pr-checks.yml` to the semantic title check, fold SonarCloud
      into CI, and delete the theater jobs and redundant workflows. Bump
      all actions to Node-24 majors, add `concurrency` cancellation and
      least-privilege `permissions`, and drop the obsolete rollup
      workaround (the regenerated lockfile fixed the root npm bug).
      Add a weekly scheduled security audit. (`ci`)
- [x] Step 3: Modernize the release workflow — same hygiene, slimmer
      steps, and a Chrome Web Store upload step that activates when the
      four CWS secrets are configured (upload-only first; flip to
      auto-publish after one manual review cycle). (`ci`)
- [x] Step 4: Add Dependabot updates for GitHub Actions and npm so action
      majors and dependencies never rot again. (`ci`)
- [x] Step 5: Update roadmap progress. (`docs`)

## Phase 8 — Automated version bumps (release-please)

Phase 7's release workflow reacts to a version change in `manifest.json`,
but the bump itself was still manual. release-please closes that gap:
conventional commits on main accumulate into an auto-maintained release
PR that bumps `package.json` + `manifest.json` and writes the changelog;
merging it triggers the existing release pipeline (tag, GitHub Release,
store zip). Chrome Web Store submission stays a separate, manual-only
workflow — publishing to the store is a human decision.

- [x] Step 1: Add this phase to the roadmap. (`docs`)
- [x] Step 2: Add the release-please workflow and config — `node`
      release type with `manifest.json` kept in sync via an extra-files
      JSON updater; GitHub Release creation skipped (the existing
      `release.yml` owns that), and the release flow documented in the
      README. (`ci`)
- [x] Step 3: Update roadmap progress. (`docs`)

## Backlog (future phases)

- "ModHeader alternative" / "Header Editor replacement" landing pages for
  switcher SEO traffic.
- Optional narrow-permission install mode (site-specific host permissions).
- Requestly / Simple Modify Headers importers.
- Firefox and Edge ports.
- Launch: Show HN / Product Hunt / r/webdev, seeded by early GitHub users.
