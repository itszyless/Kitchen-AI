<div align="center">
<img src="assets/images/app-icon.png" width="96" alt="Cook app icon" />

# Cook
### What should I cook today?

A mobile cooking companion built with React Native and Expo.

**AI-Assisted Development · Learning Project · Version 0.1.0**
</div>

## About

Cook brings recipes, pantry ingredients, shopping lists and guided cooking into one app. The goal is to make everyday cooking easier while learning how a mobile application connects its interface, data and external services.

This repository contains the first working development version. It is still being improved and is not an App Store release.

## Features

- Focused onboarding with age, food preferences and searchable allergy choices.
- Recipe discovery, saved recipes and a collection of 790 recipes with photos and instructions from TheMealDB.
- Pantry quantities, ingredient matching and shopping lists.
- Guided cooking with readable steps and timers.
- Product search by country and barcode lookup through Open Food Facts.
- A shared camera interface for ingredients, fridge photos and barcodes.
- AI-assisted photo recognition and recipe-specific substitution suggestions.
- Email authentication through Supabase.
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
- **Google Cloud:** Basic familiarity with the console and OAuth configuration. Google sign-in is not yet fully configured in this version.
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

On Windows, `scripts/Start-Cook.ps1` is available if Node needs the Windows trusted certificate roots. Run the script as a file, rather than pasting its contents into a terminal.

The SQL migrations and seed are in `supabase/`. The `kitchen-ai` function requires server-side `GROQ_API_KEY` and `GROQ_MODEL` secrets. Its handler validates the signed-in user and enforces usage limits. No hosted credentials are supplied in this repository.

## Checks

```sh
npm run check
npm run test:db
```

The first command runs TypeScript, lint and unit tests. Database tests use embedded PostgreSQL with authentication stand-ins. They do not replace tests against a deployed backend. An iOS JavaScript export also does not prove that native camera behavior or store signing works.

## Current limits

- Pantry and other kitchen state are stored on the device. Complete account-based cloud synchronization is unfinished.
- Google sign-in still needs provider configuration. Apple sign-in is deferred.
- Cook Plus is currently free. Paid billing is not connected.
- Translation coverage and physical-device testing are still being improved.
- Imported recipes have limited verified dietary metadata, so preference filtering is conservative.
- Store submission, account deletion and final privacy documentation remain release work.

## Data and publishing

TheMealDB recipes are retained for development. **A suitable license must be purchased and its terms checked before publishing the app.** This was deliberately deferred until launch, and is recorded in the [release checklist](docs/RELEASE.md).

Open Food Facts data and third-party assets retain their respective terms. See [third-party notices](THIRD_PARTY_NOTICES.md). No license for original Cook code is granted by this README.

Local environment files, credentials, generated builds and QA account files are excluded from Git.
