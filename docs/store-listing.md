# Chrome Web Store Listing Kit

Copy-paste material for the Chrome Web Store listing. Listing quality is a
ranking factor and the primary conversion surface; this kit leads with the
trust contract because that is the category's open wound.

## Title (max 45 characters)

> RequestKit — Modify HTTP Headers

Alternative if search ranking for "modheader" matters more than brand:

> RequestKit: Free Header Editor

## Summary (max 132 characters)

> Inject, override, or remove request headers with wildcard patterns and
> profiles. Free forever — no account, no ads, no telemetry.

## Description

```
Modify HTTP request and response headers the way it should work: free,
private, and reliable on Manifest V3.

THE TRUST CONTRACT
• Free forever — unlimited rules, unlimited profiles, no Pro tier
• No account, no sign-in, no cloud — your rules stay in your browser
• No ads, no sponsored tabs, no telemetry — zero network calls of its own
• Open source — audit every line: github.com/navbytes/RequestKit

ZERO PAGE OVERHEAD
RequestKit modifies headers through Chrome's native declarativeNetRequest
engine. It injects no content scripts and runs no code in your pages, so
it adds nothing to page load time. Built MV3-native from day one — not a
ported legacy extension that breaks when Chrome tightens the rules.

FOR DEVELOPERS
• Wildcard URL patterns: protocol, domain, path, query, port
  (*.staging.example.com/api/*)
• Profiles: group rules by environment (dev / staging / prod) and switch
  from the toolbar
• Dynamic variables: ${uuid()}, ${timestamp()}, ${base64()}, custom
  ${variables} with rule > profile > global scoping
• One-click presets for Authorization, X-Api-Key, X-Request-Id and more
• DevTools panel: see which rules matched and how variables resolved —
  proof your headers are actually applied
• Toolbar badge shows how many rules apply to the current tab
• Plain-JSON import/export — version-control your setup

SWITCHING FROM MODHEADER?
Import your exported ModHeader profiles in one click — RequestKit detects
the format automatically and converts profiles, headers, and URL filters.

WHY THE BROAD PERMISSION?
Any extension that modifies headers needs host access for the sites you
target. Your rules decide what is matched; everything else is untouched.
RequestKit never reads page content, never phones home, and collects
nothing. Privacy policy:
github.com/navbytes/RequestKit/blob/main/PRIVACY_POLICY.md
```

## Category & language

- Category: **Developer Tools**
- Language: English (Hindi localization ships in-package via `_locales`)

## Screenshots (1280×800, take in light theme, fresh profile)

1. **Popup with rules active** — 2–3 rules listed, badge visible on the
   toolbar icon, one rule marked as matching the current tab. Caption:
   "See exactly which rules apply to this tab."
2. **First-run popup** — the single-CTA empty state. Caption: "Your first
   header in under 30 seconds."
3. **Quick rule with presets** — preset chips visible, `${uuid()}` in the
   value field. Caption: "One-click presets and dynamic variables."
4. **DevTools panel** — request list with matched rules. Caption: "Proof
   your headers are actually applied."
5. **Options → Import** — ModHeader file being imported. Caption:
   "Switching from ModHeader takes one click."

## Promo copy variants (for launch posts)

- Show HN: "RequestKit – open-source ModHeader alternative with no
  account, no ads, no rule caps"
- r/webdev: lead with the MV2 shutdown stranding Header Editor users and
  ModHeader's monetization turn; position RequestKit as the boring,
  trustworthy option.

## Listing hygiene checklist

- [ ] Privacy policy URL set (PRIVACY_POLICY.md or a hosted page)
- [ ] All five screenshots uploaded with captions
- [ ] "Single purpose" description: "Modify HTTP request/response headers
      on user-defined URL patterns"
- [ ] Permission justifications filled in (copy from the "why the broad
      permission" section above)
- [ ] Support email + GitHub issues link set
- [ ] Ask early GitHub users for honest store reviews after launch —
      listings with ~10 genuine reviews rank measurably better than
      zero-review listings
