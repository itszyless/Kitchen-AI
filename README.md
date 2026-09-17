<div align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/images/icons/darkmode_text.png" />
  <img src="assets/images/icons/lightmode_text.png" width="440" alt="Kitchen AI" />
</picture>

# Kitchen AI
### What should I cook today?

A mobile cooking companion built with React Native and Expo.

**AI-Assisted Development · Learning Project · Version 0.3.0**

**BETA · Actively developed**

Kitchen AI is in active development. Features, design and reliability are being refined through ongoing testing and feedback. This repository documents the current beta and its progress toward a public release.
</div>

## About

Kitchen AI brings recipes, pantry ingredients, shopping lists and guided cooking into one app. The goal is to make everyday cooking easier while learning how a mobile application connects its interface, data and external services.

This repository contains the first working development version. It is still being improved and is not an App Store release.

## Latest update

Version 0.3.0 introduces the Kitchen AI identity, supplied logo assets, SF Pro typography, a light default theme, refreshed onboarding, saved cooking goals, birthday selection and username setup. Google OAuth is enabled for the development backend; end-to-end device validation remains pending. Independent installations require their own provider configuration. Usernames are case-insensitively unique and support password sign-in alongside email addresses. Onboarding requires explicit answers and ends with optional account registration or guest access. Guests can browse recipes, manage their pantry and shopping list, and sign in or register later from Profile. AI scanning, substitutions and translation require an account. Email registration stays on a confirmation screen until the email is verified, then continues without re-entering credentials. Native authentication uses Expo Crypto for SHA-256 PKCE, and the date picker uses its current value/dismiss callbacks. New Google accounts complete username setup after authentication; existing accounts sign in directly.

## Set up on another computer

Install Git and Node.js 22.13 or later, then clone this public repository.

```sh
git clone https://github.com/itszyless/Kitchen-AI.git
cd Kitchen-AI
npm ci
```

Copy `.env.example` to `.env` and fill in the Supabase URL and publishable key from your project dashboard. Keep private server secrets in Supabase, not on the laptop. Run `npm start` and scan the QR code, or press `w` for the browser preview.

## Previous update

Version 0.2.0 added 60-day food history with quick repeat, quantity sheets, read-only product identity, optional source nutrition, manual photo capture, automatic barcode scanning, swipe-to-delete shopping items with Undo, animated cooking steps and daily cooking streaks. Recipes now use food categories instead of a catch-all Community filter. Allergy search and custom exclusions are available in Settings.

Substitution requests include the full ingredient list and method. German explanations use the translation service. Free and Plus result limits are two and five; all current accounts retain free Plus access. This is an application-level limit, not a production billing entitlement.

Physical-device camera and gesture verification is still needed. AI quality depends on source data and provider availability; suggestions are not guaranteed to be suitable or allergy-safe.

## Features

- Focused onboarding with age, food preferences and searchable allergy choices.
- Recipe discovery, saved recipes and a collection of 790 recipes with photos and instructions from TheMealDB. Recipes can appear in several categories; selecting multiple filters shows recipes matching all of them.
- Pantry quantities, ingredient matching and shopping lists.
- Guided cooking with readable steps and timers.
- Product search by country and barcode lookup through Open Food Facts.
- A shared camera interface for ingredients, fridge photos and barcodes.
- AI-assisted photo recognition and recipe-specific substitution suggestions.
- Email registration with a unique username, and email or username/password authentication through Supabase.
- English and German interface support, with recipe translation and an original-text option.
- Light and dark themes with a phone-first layout.

Camera behavior still needs testing on physical devices. AI and product results depend on external services and should be reviewed by the user, especially for allergies.

## Technology

| Area | Tools |
| --- | --- |
| Mobile interface | React Native, Expo SDK 57, Expo Router |
| Application code | TypeScript, React |
| State and storage | Zustand, AsyncStorage, SecureStore |
| Backend | Supabase Auth, PostgreSQL, Edge Functions |
| AI | Groq, accessed through a server-side function |
| Food data | Open Food Facts, TheMealDB |
| Quality checks | TypeScript, ESLint, Vitest, database policy tests |

## AI-Assisted Development

AI was used extensively as a development assistant. This includes generating and revising code, exploring interface ideas, debugging errors, writing tests and preparing documentation. This project is not presented as entirely hand-written work.

My role included defining the product idea, describing the intended behavior, writing and refining prompts, giving design feedback, testing flows and deciding which changes to keep. Working this way helped me understand that a convincing generated result still needs testing, careful review and iteration.

### What I learned

- **React Native:** How screens, reusable components, navigation and application state fit together.
- **Expo and Expo Go:** How to run a mobile project, use a phone preview and understand the difference between a preview and a release build.
- **Supabase:** Initial experience with authentication, database tables, access policies and server-side functions.
- **Google Cloud:** Configuring OAuth clients, consent settings and the Supabase authentication provider.
- **AI prompting and vibe coding:** How to turn an idea into smaller requests, provide useful feedback and refine generated implementations.
- **Debugging:** How runtime errors, type checks and tests help reveal problems that are not obvious from the interface.
- **API integration:** Why external services need validation, error handling, usage limits and protected credentials.

These are areas of growing practical experience, rather than claims of expert knowledge. The project also showed me where I need to deepen my independent understanding of the generated code.

## Run locally

Use Node.js 22.13 or later and an Expo Go version compatible with SDK 57.

```sh
npm ci
```

Copy `.env.example` to `.env`, then enter your own Supabase project URL and public publishable key. Authentication requires a configured Supabase project. Never add an AI key or a Supabase service-role key to an `EXPO_PUBLIC_` variable.

```sh
npm start
```

Scan the displayed QR code with your phone on the same network. For a browser preview:

```sh
npm run web
```

On Windows, `scripts/Start-KitchenAI.ps1` is available if Node needs the Windows trusted certificate roots. Run the script as a file, rather than pasting its contents into a terminal.

The SQL migrations and seed are in `supabase/`. Apply all migrations, including `202609160001_unique_usernames.sql`, and deploy `username-login` for username registration and sign-in. This password-authenticated endpoint uses `verify_jwt = false`, resolves email addresses only on the server, and rate-limits attempts. It requires the standard Supabase URL, anon key and service-role environment variables provided to Edge Functions. The `kitchen-ai` function requires server-side `GROQ_API_KEY` and `GROQ_MODEL` secrets. Its handler validates the signed-in user and enforces usage limits. No hosted credentials are supplied in this repository.

## Configure Google sign-in for your own installation

1. Create your own Supabase project and apply the backend setup above.
2. In Google Cloud, configure Google Auth Platform branding and audience. Add test users if the consent screen is in testing mode.
3. Create a **Web application** OAuth client for the Supabase browser-based flow. Add `https://<your-project-ref>.supabase.co/auth/v1/callback` as an authorized redirect URI.
4. In Supabase Authentication → Sign In / Providers → Google, enable the provider and enter the Google client ID and client secret. Keep the secret in Supabase, never in the app, README or Git repository.
5. In Supabase Authentication → URL Configuration, allow `kitchen-ai://auth` for a native development/release build and the exact browser callback used locally, such as `http://localhost:8083/auth`. Use your deployed HTTPS callback for a hosted web installation.
6. Test a complete sign-in, cancellation, return to the app and sign-out. Native OAuth testing requires a development build with the app's URL scheme; Expo Go is not the supported OAuth test environment. Development-build configuration is planned and is not included yet.

The local `.env` needs only your Supabase URL and publishable key. Google client secrets, Apple signing keys, AI keys and Supabase service-role credentials must remain outside client bundles and source control. See the [Supabase Google guide](https://supabase.com/docs/guides/auth/social-login/auth-google) and [Expo authentication guide](https://docs.expo.dev/guides/authentication/).

## Checks

```sh
npm run check
npm run test:db
```

The first command runs TypeScript, lint and unit tests. Database tests use embedded PostgreSQL with authentication stand-ins. They do not replace tests against a deployed backend. An iOS JavaScript export also does not prove that native camera behavior or store signing works.

## Current limits

- Pantry and other kitchen state are stored on the device. Complete account-based cloud synchronization is unfinished.
- Google sign-in is enabled on the development backend; full device validation is pending. Independent deployments need their own credentials and redirect configuration. Apple sign-in is deferred.
- Kitchen AI Plus is currently free. Paid billing is not connected.
- Translation coverage and physical-device testing are still being improved.
- Imported recipes have limited verified dietary metadata, so preference filtering is conservative. Most imports also lack total cooking times. The “Under 20 min” filter includes only known totals below 20 minutes; verified source times are recorded in `src/data/recipeTimes.ts`. Unknown times are not guessed from the cooking instructions.
- Store submission, account deletion and final privacy documentation remain release work.

## Data and publishing

TheMealDB recipes are retained for development. **A suitable license must be purchased and its terms checked before publishing the app.** This was deliberately deferred until launch, and is recorded in the [release checklist](docs/RELEASE.md).

Open Food Facts data and third-party assets retain their respective terms. See [third-party notices](THIRD_PARTY_NOTICES.md). No license for original Kitchen AI code is granted by this README.

Local environment files, credentials, generated builds and QA account files are excluded from Git.
