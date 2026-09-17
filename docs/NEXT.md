# Next work

## Current state

Kitchen AI is an actively developed beta with a public GitHub repository, a configured Supabase project, email authentication, recipe discovery, product search and a server-side AI integration. Version 0.3.0 adds the new identity and onboarding changes. Google OAuth is enabled on the development backend as of September 17, 2026; complete device sign-in validation remains pending. Apple sign-in and paid subscriptions are deferred.

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

## Proposed next phase (not implemented)

The owner requested an explanation before further app changes. Keep these ideas deferred until work resumes:

- Move native testing to an Expo development build, starting with Android; validate Google redirects and prepare Apple sign-in before iOS release.
- Add local timer notifications with contextual permission requests, cancellation/rescheduling and real-device background tests. Optional reminders should be independently controllable.
- Request native store reviews after meaningful cooking use, with a cooldown. No onboarding review request, fabricated ratings, incentives or sentiment screening.
- Evaluate store subscriptions through Apple In-App Purchase and Google Play Billing, potentially managed with RevenueCat. Proposed starting price: USD 7.99/month, with an eligible three-day trial. Prices and offers must come from the stores and display renewal terms and annual totals clearly.
- Validate annual pricing against AI costs before selecting an annual discount. An 80% saving relative to twelve USD 7.99 payments implies roughly USD 19.18/year, not an independently chosen annual price.
- Consider a genuine 40% introductory offer with explicit duration and renewal pricing. A Kitchen AI branded wheel/reveal is a visual concept only; do not present predetermined outcomes as random or use false scarcity. Restore purchases must always restore purchases.
- Enforce Plus access and usage limits server-side. Handle store verification, expiration, renewal, refunds and billing grace periods. Cancellation normally retains access through the paid period. An owner entitlement should be assigned securely by user ID, never a client-side toggle.
- Candidate Plus value: higher bounded AI allowances, richer substitutions, meal planning and cross-device sync. Only advertise delivered features; retain useful guest/free functionality.
- Before large-scale launch, complete cloud sync, account deletion, privacy/asset licensing, monitoring, rate limits, cost controls, database tuning, backup/recovery and load testing. User counts alone do not establish capacity.
