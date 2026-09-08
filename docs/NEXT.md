# Next work

## Immediate owner steps

1. Test Expo Go on the real iPhone. Report OS/Expo Go version if opening fails; do not change Windows security settings automatically.
2. Sign in to Supabase, then approve a new Free-tier Cook development project and its region. Owner handles passwords, verification and keys.
3. Supply GitHub authentication and choose a private repository before any push. The local commit uses an automation identity, not an invented user identity.
4. Provide the existing logo when ready.

## Next engineering milestone

Connect Supabase auth and repositories; preserve guest progress through an idempotent server-side import. Apply and validate RLS against two actual users and an unauthenticated client. Add an outbox for offline retries. Build community draft editing, image upload, moderation submission and report UI.

## Product data and AI

Complete OFF usage registration with owner-supplied contact information and confirm license treatment. Implement country-ranked token/trigram search and canonical product mapping; the local catalog is only generic ingredients. Add a server-side barcode adapter with timeouts, caching, rate limiting and attribution. Expand private product nutrition/image validation.

No AI API is connected. Evaluate a free option on an explicit test set before activation. Use server-side provider keys, quotas, consent and image deletion jobs. Always review low-confidence results before pantry insertion. Do not infer allergy safety from AI labels.

## Quality and release gates

Verify recipe instructions, allergen coverage, ingredient substitutions and nutrition before presenting data as trusted. Improve full natural-language recipe queries, unit conversion, preferences ranking, cooking timer persistence/background alerts, accessible large text and reduced motion. Real device camera and haptic tests remain open. Add privacy/terms, export/deletion, retention cleanup, abuse controls and load tests. Monetization remains disabled.

The saved screenshots demonstrate local UI, not production readiness or an installed iPhone app.
