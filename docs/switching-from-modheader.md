# Switching from ModHeader

RequestKit imports ModHeader profiles in one click — no account, no rule
caps, no ads, and everything ModHeader paywalled (unlimited rules,
profiles, dynamic values) is free.

## Import your ModHeader setup

1. In ModHeader, open the profile menu and choose **Export profile** to
   download your profiles as a JSON file.
2. In RequestKit, open **Options → Import/Export**.
3. Choose the exported file under **Import Data**. RequestKit detects the
   ModHeader format automatically and converts each profile into header
   rules.
4. Pick **merge** to keep your existing RequestKit rules, or **replace**
   to start fresh.

### What the importer converts

| ModHeader                  | RequestKit                                                      |
| -------------------------- | --------------------------------------------------------------- |
| Profile                    | One rule per profile (or one per URL filter)                    |
| Request headers            | Request headers (`set` operation)                               |
| Response headers           | Response headers                                                |
| Append mode                | `append` operation on each header                               |
| URL filters (simple regex) | Wildcard domain patterns (`.*\.example\.com` → `*.example.com`) |
| Disabled header entries    | Skipped                                                         |

Complex URL regexes that can't be translated into wildcard patterns fall
back to matching all sites; the original regex is preserved in the rule's
description so you can recreate it as a precise pattern. Imported rules
are tagged `modheader-import` for easy review.

## Feature mapping

| You used in ModHeader        | In RequestKit                                                                                                        |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Profiles + profile switcher  | Profiles tab; switch from the popup                                                                                  |
| Dynamic values (Pro)         | Variables: `${uuid()}`, `${timestamp()}`, `${random()}`, `${base64()}`, `${date()}` and custom `${variables}` — free |
| Tab/URL filtering            | Wildcard URL patterns: protocol, domain, path, query, port                                                           |
| Export/backup (cloud)        | Plain JSON export — version-control it, share it, no cloud account                                                   |
| Checking headers in DevTools | RequestKit panel in DevTools shows matched rules and resolved variables                                              |

## What's different

- **No rule limits.** ModHeader's free tier caps you at 10 rules;
  RequestKit has no caps of any kind.
- **No account or sign-in.** Everything is stored in your browser.
- **No ads or sponsored tabs.** RequestKit makes zero network requests of
  its own — verify it in the source.
- **No content scripts.** RequestKit modifies headers through Chrome's
  native `declarativeNetRequest` engine and runs no code in your pages.
