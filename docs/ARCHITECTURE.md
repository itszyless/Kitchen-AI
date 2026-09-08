# Cook architecture

Cook is an Expo / React Native application, not a web app wrapped for iOS. The web target is a convenient Windows preview. Expo Router owns navigation; its headless tabs provide the custom scan action. Native folders are generated later using Expo Continuous Native Generation.

## Boundaries

- src/app: route composition and screen state.
- src/components: reusable visual controls and recipe cards.
- src/theme: light/dark palette and design tokens.
- src/domain: types, quantity matching, exclusions, substitutions, shopping merging.
- src/data: original sample recipes and canonical ingredient catalog.
- src/state: Zustand with versioned AsyncStorage persistence. Guest progress survives closing the app.
- src/services: Supabase client, unavailable AI/product adapters, no-op analytics and inactive entitlements.
- supabase/migrations: relational backend, privileges, RLS and private photo bucket.
- tests: domain and input validation regression tests.

## Current behavior

All pantry, preferences, saves, shopping and cooking counts are local. No account or network is needed for these actions. Photos are remote Unsplash illustrations, cached by expo-image; offline image availability is not guaranteed. The recipe collection and nutrition values are sample data. There are no ratings or popularity figures invented as real engagement.

No AI photo is captured or sent. The sample review uses named canonical ingredients and requires an explicit pantry insertion. Barcode camera capture is implemented, but live product lookup deliberately returns a connection-required message. Private products are not automatically mapped to a trusted recipe ingredient.

## Cloud integration next

After approved Supabase setup: create profile, fetch backend recipe IDs, implement repository operations and an idempotent transactional guest-import endpoint. Keep guest progress until the server confirms import. Maintain an outbox for retryable pantry edits with operation IDs and conflict/version checks. The current local store is not a cloud-sync implementation.

OAuth requires native redirect configuration and account-provider setup. The client factory uses SecureStore on native and memory-only auth on web. Add app-state refresh management and test redirect handling before enabling sign-in. Never put service-role or AI-provider keys in EXPO_PUBLIC variables.

## Security and moderation

Database policies restrict private tables to their owner. Catalog writes are server-only. Community clients may submit drafts/pending recipes; only a trusted moderation service may publish. Published recipes must be returned to draft before authors edit ingredients. Reports are private; quotas and abuse rate limits still need the server layer.

Scan-image storage is private and path-scoped to the authenticated user. A 24-hour metadata expiry is recorded, but an actual object cleanup job must be deployed and tested before uploads are enabled. Account deletion must remove Storage objects as well as the auth user; foreign-key cascades alone do not delete files.

## Release blockers

Live RLS integration testing, auth and guest import, cloud synchronization, OFF onboarding and license review, product matching/import, AI provider evaluation, image lifecycle jobs, moderation workflow, verified recipe nutrition and food-safety review, privacy/terms pages, account deletion/export, real iPhone/Android testing, final branding and store signing.
