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
- [ ] Step 2: "Switching from ModHeader" guide documenting the import path
      and feature mapping. (`docs`)
- [ ] Step 3: Update roadmap progress. (`docs`)

## Phase 4 — Focus (declutter the options surface)

Power features are a differentiator, but ten top-level tabs read as bloat.
Keep the power, reduce the apparent complexity.

- [ ] Step 1: Group experimental/diagnostic tabs (Analytics, Performance,
      Rule Testing, Conditional Rules) behind a single "Advanced" section,
      off by default.
- [ ] Step 2: Trim the service worker bundle (move options-only code out of
      the background entry).
- [ ] Step 3: Update roadmap progress. (`docs`)

## Backlog (future phases)

- Per-tab "rules applied" indicator — make reliability visible (the
  category's reputation is "silently broken"); market the DevTools panel
  as "see your headers actually working".
- Store listing kit: screenshots, copy leading with the trust contract,
  privacy policy link, "why these permissions" section.
- "ModHeader alternative" / "Header Editor replacement" landing pages for
  switcher SEO traffic.
- Optional narrow-permission install mode (site-specific host permissions).
- Requestly / Simple Modify Headers importers.
- Firefox and Edge ports.
- Launch: Show HN / Product Hunt / r/webdev, seeded by early GitHub users.
