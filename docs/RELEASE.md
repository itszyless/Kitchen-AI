# Release checklist

This working version is for development. Complete this checklist before store submission.

- [ ] Purchase the appropriate TheMealDB license and verify recipe and image usage rights before publishing. Decision recorded on 12 September 2026: keep the current 790 recipes for development and purchase the license at launch.
- [ ] Review Open Food Facts attribution and data licensing requirements.
- [ ] Complete Google provider configuration and test authentication on real devices.
- [ ] Implement account deletion and finish privacy disclosures.
- [ ] Complete account-scoped storage and cloud synchronization.
- [ ] Test camera permissions, barcode capture and photo recognition on iPhone and Android.
- [ ] Review allergy handling, dietary metadata and translation coverage.
- [ ] Verify small and large phones in light and dark mode.
- [ ] Keep all features free until billing is deliberately implemented and tested.
- [ ] Run type, lint, unit and database policy checks.
- [ ] Review credentials, signing, dependency licenses and production configuration.

Apple sign-in and paid subscriptions are deferred. Passing development tests does not mean this checklist is complete.

## Brand asset checks

Verify SF Pro font licensing for the intended distribution platforms before release. The provided iOS light and dark app icons follow system appearance in native builds. Changing the home-screen icon from an in-app theme toggle and Android alternate launcher icons are not implemented. Expo Go retains its own initial launch UI. Usernames are display names stored in account metadata, not unique community handles.
