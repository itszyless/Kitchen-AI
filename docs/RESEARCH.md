# Decisions and source notes

Research checked 7–8 September 2026. Recheck service terms and store requirements at release.

## Stack

Expo SDK 57 pairs with React Native 0.86 and React 19.2.3, with Node 22.13+ supported. We installed the current SDK template and used Expo installation to choose compatible native packages. [Expo SDK reference](https://docs.expo.dev/versions/v57.0.0/), [Expo Go](https://expo.dev/go), [CNG](https://docs.expo.dev/workflow/continuous-native-generation/).

Expo Router headless tabs allow a custom scan action while retaining route-based navigation. [Router UI](https://docs.expo.dev/versions/v57.0.0/sdk/router/ui/). Camera uses expo-camera; images use expo-image. [Camera](https://docs.expo.dev/versions/latest/sdk/camera/), [Image](https://docs.expo.dev/versions/v57.0.0/sdk/image/).

Supabase React Native setup informs the client boundary. Native sessions are intended for SecureStore. [Supabase guide](https://supabase.com/docs/guides/auth/quickstarts/react-native), [SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Product data

Open Food Facts is the preferred candidate for international packaged-food/barcode coverage. Its data is community-contributed and not guaranteed complete or accurate. The current docs recommend product API v3 (v3.6), with 15 product reads/min/IP and 10 search requests/min/IP. Search must be submitted, not sent on every keystroke. Full-text search has a separate evolving Search-a-licious service; it should not be assumed to exist in product v3. Maintain source IDs and unique barcodes to prevent duplicate products.

The database uses ODbL; individual contents DbCL; images CC BY-SA with possible other rights. Preserve attribution and source/license metadata. Separate OFF-derived catalog data from private user data; review share-alike obligations before combining/publishing a derived database. Commercial use does not remove those obligations. Do not upload household photos or private products back to OFF automatically.

OFF asks developers to complete its API usage form and identify the app with a contact-bearing User-Agent. That requires the owner's input; no registration, form submission, or live data ingestion has occurred. Current local search includes 16 generic ingredients, not a broad packaged-product database. Country ranking and a server search endpoint remain to be implemented. [Official API and license notes](https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/).

## Free AI candidates

Gemini offers a limited free tier, with data-use differences from paid service. Cloudflare Workers AI has a daily free allocation. Neither is activated. Free-tier availability is not evidence of production suitability, privacy compliance or reliable fridge recognition. Evaluate with a labeled ingredient dataset, permissioned images, privacy review, server-side keys, quotas and a hard stop when a free allowance is exhausted. Never auto-upgrade. [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing), [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/).

## Original design direction

Public Cal AI references show clear single actions and camera entry; YAZIO references show recipe imagery and browse categories; Duolingo describes consistent, recognizable tab design. Kitchen AI uses a monochrome palette and the owner-supplied chef mark, editorial food presentation, simple progress and explicit review. No paid Mobbin access or proprietary artwork was copied. [Cal AI](https://www.calai.app/), [YAZIO](https://www.yazio.com/en/), [Duolingo tab design](https://blog.duolingo.com/core-tabs-redesign/).

## Dependency exceptions

Targeted overrides update decode-uri-component to 0.5 and xcode's uuid to 11.1.1 to resolve audit findings. The xcode code uses uuid.v4, which remains available. iOS JavaScript bundling passes; an actual Xcode project/build must still validate this override on macOS. ESLint 10 uses current typescript-eslint and react-hooks rules because Expo's lint preset still depends on a React plugin incompatible with ESLint 10.
