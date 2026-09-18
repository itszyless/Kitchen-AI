# September 2026 UI refresh validation

- TypeScript and ESLint pass; all 113 unit tests pass.
- Web export and iOS JavaScript/asset export complete successfully. An export is not a signed device build.
- Browser checks at desktop and 390 × 844: compact Home header, streak opening/closing, Monday-first day row, Recipes/Profile navigation, profile gradient, Plus details, searchable country picker, and password visibility.
- A direct guest visit to Edit profile redirects to sign-in. No new runtime errors appeared after the tab registration fix.
- Regression tests cover week/year boundaries, future dates, missed-day streak reset, notification opt-out and cancellation limited to Kitchen AI alerts.

## Intentional differences from the references

- The supplied Kitchen AI icons and SF Pro remain the visual identity.
- Plus is labeled as a free beta preview. No simulated purchase or paid entitlement is presented.
- The verified badge indicates confirmed email, not identity verification.
- Profile visibility defaults to hidden and currently controls a local preview. No public-profile data endpoint was added.
- Community discovery uses attributed TheMealDB recipes and existing dietary exclusions. User-created recipe lists use the signed-in author's records; creation and moderation are still deferred.

## Device checks still required

Native Liquid Glass and Reduce Transparency, iPhone keyboard positioning, real notification permission/delivery/cancellation, and authenticated username editing need physical-device validation. Android uses standard surfaces and a resize keyboard configuration. Expo Go cannot verify store billing or the production OAuth callback.
