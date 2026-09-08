# Cook

Good food. Less figuring out.

Cook is a native cooking-assistant project for iPhone and Android, built on Windows with Expo. This is a working development milestone, not a production release.

## What works now

- Guest onboarding with explicit allergy confirmation, diet, time, skill, household and region preferences.
- Home recommendations, Discover search/filters and saved recipes.
- Persistent pantry entries, quantity controls, expiry entry, deletion with undo.
- Clearly labeled sample scan review with editable quantities, corrected matches and confirmation.
- Barcode camera capture and validated private-product entry. Live lookup is not connected.
- Recipe detail, serving scaling, quantity-based pantry matching and structured substitution suggestions.
- Merged shopping list, guided steps, beginner help, timer and meal completion.
- Light, dark and system themes; safe-area-aware navigation and large controls.

## Stack

Expo 57, React Native 0.86.3, React 19.2.3, TypeScript 6 strict, Expo Router, Zustand, AsyncStorage, Zod, Supabase JS, Lucide, Expo Camera/Image/Haptics/KeepAwake/SecureStore. Node 22.13+; this machine uses 22.14.

## Run on Windows

Open this folder in VS Code. In its terminal:

```powershell
npm ci
npm start
```

Open Expo Go on an iPhone on the same network and scan the terminal QR with the iPhone Camera. Update Expo Go to the version supporting SDK 57. No iOS emulator is needed on Windows. Fast Refresh applies when source files are saved.

This machine needed its Windows trusted certificate roots made available to Node. The provided script does that only for its process, without disabling certificate validation or changing system settings:

```powershell
.\scripts\Start-Cook.ps1
```

For a browser preview run npm run web. The web target is a single-page preview; the mobile app still uses native React Native components. If the iPhone cannot connect, verify both devices are on the same non-isolated network. Network/firewall permission changes must be made by the owner. No tunnel or public hosting is enabled.

## Verify

```powershell
npm run check
npm run test:db
npx expo-doctor
npm run export
npx expo export --platform ios --output-dir dist-ios
```

The database test uses embedded Postgres with auth/storage stand-ins. It validates SQL and policies, not live Supabase authentication. A successful iOS export validates the JavaScript/Hermes bundle, not native signing, camera permission behavior, or installation on an iPhone.

## Supabase connection

No hosted project has been created or modified. Copy .env.example to .env and enter only the project URL and public publishable key after the owner completes setup. No secrets belong in EXPO_PUBLIC variables.

The migration in supabase/migrations prepares profiles/preferences, allergies, ingredient aliases, source-aware products/barcodes, private products, pantry, recipes/steps/ingredients, saves, shopping, reports and scan metadata, with privileges and RLS. The seed supplies the small original ingredient catalog. A live recipe repository, auth screen, idempotent guest import and cloud sync are still required; setting environment variables alone does not enable them.

Before applying migration: confirm a new Free-tier project with the owner, inspect the migration, apply to that project only, run live RLS tests with two users, and configure auth callbacks. Never paste service-role keys into the app or commit .env.

## Expo Go and future native builds

Camera barcode capture, local UI, storage, haptics and guided cooking are intended for Expo Go. Test them on the real phone. Custom native modules, some authentication integrations, background notification behavior, and store distribution need a development/release build.

Use Expo Continuous Native Generation. On the future Mac, install the compatible Xcode version, run npx expo prebuild --platform ios, then npx expo run:ios. Native project folders are generated and ignored. Configure permanent bundle identifiers, entitlements, signing and Apple/Google accounts only with owner approval. EAS setup can be added later; no paid enrollment or remote build has been initiated.

## Assets and privacy

The Cook C/leaf icon is an explicitly replaceable placeholder. The editable source is assets/images/cook-placeholder.svg. Header branding is centralized in src/theme/tokens.ts and native asset references in app.json. The owner's real desktop logo can replace the placeholder later.

Recipe photos are illustrative remote Unsplash images, not photos of these exact recipes. Sample nutrition is clearly labeled and unverified. Local kitchen data remains on the device. No analytics collection, monetization, AI upload or retailer link is enabled.

See [architecture](docs/ARCHITECTURE.md), [research and sources](docs/RESEARCH.md), and [remaining work](docs/NEXT.md).
