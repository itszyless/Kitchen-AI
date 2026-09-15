# Kitchen AI visual system

The owner selected a mostly monochrome direction, using Cal AI's restrained mobile layouts as a reference. White and charcoal carry the interface; food photography provides color. This replaces the earlier cream/green and exploratory tomato treatments.

## Composition

- Home: one photographic recommendation, open title and metadata, pantry progress, full-width recipe action; secondary inspiration below.
- Discover: horizontal filters, native filter sheet, compact image/text results.
- Onboarding: welcome, cooking goals and obstacles, age and optional gender, dietary preferences, allergies, time, skill, household, country, acquisition source and a summary. Email or Google account access follows; no paid gate.
- Pantry: compact category rows with quantities; tap to reveal adjustment/removal. Removal retains undo.
- Recipe/cooking/review: important actions remain in a safe-area footer while content scrolls.
- Profile/shopping: open rows and dividers, limited containers.

## Shared implementation

`src/theme/tokens.ts` owns the palette, typography, spacing, control dimensions, radii and motion constants. `src/components/ui.tsx` owns text, buttons, fields/search, chips, progress, section headings and screen/footers. Recipe cards have featured, rail and list variants. Expo Router retains native stack transitions; Reanimated provides button feedback, onboarding transitions and progress, respecting reduced motion.

The supplied SF Pro Display regular, medium, bold and black files are loaded with Expo Font. The supplied Kitchen AI wordmark, app icons, mockup, social icons and household dots live under assets. Light mode is the default; dark mode remains available.

## Tooling decisions and public references

- [React Native Reusables](https://reactnativereusables.com/docs/installation/manual): evaluated its owned-component approach and NativeWind/Uniwind setup. Kept Kitchen AI's existing typed RN styles rather than adding another styling pipeline to this working project.
- [NativeWind](https://www.nativewind.dev/docs/getting-started/installation) and [Uniwind](https://docs.uniwind.dev/): viable styling alternatives, not required for this redesign; neither installed.
- [Expo UI SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/ui/) and its [bottom-sheet replacement](https://docs.expo.dev/versions/v57.0.0/sdk/ui/drop-in-replacements/bottomsheet/): used for Discover's modal filters. Native iOS/Android presentation must still be checked on actual devices.
- [Gorhom Bottom Sheet](https://gorhom.dev/react-native-bottom-sheet/): evaluated; avoided overlapping sheet implementations because Expo UI is already installed.
- Existing SDK-compatible Expo Image, Haptics, Reanimated, Gesture Handler and Lucide remain the coherent stack. No DOM/Next.js components are embedded in native screens.
- [Mobbin public meal-plan collection](https://mobbin.com/collections/3897af99-2318-4ef6-839e-0dd83588e680/mobile/screens): visually inspected public layouts. No subscription, restricted scraping, or copied assets.
- User-supplied Cal AI onboarding screenshots guided focus, spacing and selection hierarchy.
- [Duolingo character design](https://blog.duolingo.com/building-character/) and [3D exploration](https://blog.duolingo.com/duolingo-art-intern-animation-case-study/): studied consistency and purposeful motion; no mascot added after the owner chose monochrome restraint.

## Verification

Run `npm run check`, `npm run test:db`, and `node scripts/check-ui.mjs` with the preview server running. The UI script uses an isolated browser profile, verifies core guest interactions and captures 12 screens at 360/390/430 widths in both themes outside the repository. It does not alter the owner's browser data.

Browser emulation does not prove native camera permissions, keyboard avoidance, VoiceOver, haptics, native sheet appearance or actual iPhone installation. Those remain device checks. AI recognition remains explicitly labeled demonstration content. Supabase cloud setup is a separate owner-assisted credential step.
