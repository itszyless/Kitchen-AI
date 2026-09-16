# Next work

## Current state

Kitchen AI has a public GitHub repository, a configured Supabase project, email authentication, recipe discovery, product search and a server-side AI integration. Version 0.3.0 adds the new identity and onboarding changes. Google OAuth still needs owner configuration; Apple sign-in and paid subscriptions are deferred.

## Validation

Test camera permission, manual photo capture, barcode scanning, cooking timers, gestures and the new onboarding on real iOS and Android devices. Run realistic substitution examples against the live service and check translated explanations. Browser previews cannot verify native behavior.

## Accounts and data

Onboarding answers and acquisition sources have private per-user storage. Pantry and shopping data still need a complete cross-device sync workflow. Usernames are case-insensitively unique and support email or username/password sign-in. New social accounts complete username setup after authentication. Community publishing and moderation remain future work.

## Release gates

Review RELEASE.md. Purchase the required TheMealDB publishing license, verify font and image rights, complete privacy/terms and account deletion/export, and validate accessibility, data retention and abuse controls. Paid subscriptions remain disabled.

## Owner follow-up

Remind the owner to replace the social media icon assets until they confirm completion. The proposed post-registration paywall remains deferred.

## Recipe metadata

Recipes support overlapping categories and combined filters. Most TheMealDB imports do not include total cooking times. Expand `src/data/recipeTimes.ts` only with source-verified preparation and cooking totals; do not estimate from timed steps alone.
