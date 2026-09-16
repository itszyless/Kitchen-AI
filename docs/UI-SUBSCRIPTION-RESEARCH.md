# Kitchen AI: UI, onboarding and subscription research

Research date: 15 September 2026. Research and proposed experiments, not implemented features or revenue forecasts. Preserve the owner's light-default, monochrome, SF Pro direction. Main README and application behavior are unchanged by this research.

## Main conclusion

Kitchen AI should make a useful dinner decision feel easy before asking the user to buy more help. Visual consistency supports that experience; reliable results give the subscription a reason to exist. The strongest immediate opportunity is a coherent sequence from ingredients to a relevant recipe to cooking, with premium offered at a meaningful next step.

Do not treat a competitor's long onboarding, shadow recipe or reported conversion lift as proof that copying it will work here. Current Plus access is free, as documented in src/services/entitlements.ts. Monetization proposals below require real billing, entitlements and working premium benefits before launch.

## Evidence and its limits

| Finding | Evidence type | Implication for Kitchen AI |
|---|---|---|
| RevenueCat reports median day-35 download-to-paid conversion of 10.7% for hard-paywall apps versus 2.1% for freemium. | Cross-app observational benchmark; different products, audiences and acquisition strategies. Not a randomized test. | Test placement once activation works. Do not forecast a fivefold lift from adding a mandatory paywall. |
| Mimo's growth lead reports that a clearer trial explanation more than doubled trial opt-ins and improved trial-to-purchase conversion by 50%. | First-person retrospective case study; not independently audited experimental data. | Investigate trial anxiety and price comprehension. Do not promise the same uplift. |
| ASL Bloom reports a 15% trial-conversion uplift and 12% ARPU uplift after an onboarding redesign. | Vendor/client case study with multiple simultaneous interventions. | Connect features to an actual user motivation; the effect cannot be attributed to one layout or extra screen. |
| Attractive interfaces can be perceived as easier to use, even when actual task performance differs. | UX research synthesis. | Observe people completing a recipe task, not just whether they say the screens look good. |

Sources: [RevenueCat benchmark analysis](https://www.revenuecat.com/blog/engineering/android-paywall-gap), [Mimo account](https://www.revenuecat.com/blog/growth/optimize-funnel-metrics-mimo), [ASL Bloom case study](https://www.revenuecat.com/blog/growth/asl-bloom-applica-case-study), [NN/g aesthetic-usability effect](https://www.nngroup.com/articles/aesthetic-usability-effect/).

These sources do not establish an optimal Kitchen AI font, corner radius, shadow, price, number of onboarding screens or trial length. Case studies are selected success stories and subscription vendors have commercial incentives. Use them to generate hypotheses, then test our own product.

## 1. Define what the user is buying

Proposed core promise: **Decide what to cook with what you already have.**

This is more concrete than selling “advanced AI.” A recurring subscription needs recurring usefulness. Candidate reasons to return are dinner decisions, ingredient substitutions, shopping preparation and household preferences. Validate which of these people repeatedly use before deciding the paid package.

| User situation | Relevant benefit to demonstrate | Potential premium moment |
|---|---|---|
| I have ingredients but no idea what to cook. | A recipe with a truthful pantry match and cooking time. | Requesting additional tailored options after a successful result. |
| I am missing an ingredient. | A suitable replacement with an explanation and reviewable quantity. | Repeated advanced adaptation, once reliability is demonstrated. |
| I cook for several people. | Correct quantities and remembered household preferences. | A future household planning workflow, if built and validated. |
| Shopping feels disorganized. | Missing ingredients collected into a usable list. | Future recurring planning conveniences; do not advertise them as shipped. |

Do not put allergy entry, correction of recognition errors, essential ingredient information or subscription management behind a purchase barrier. Do not describe AI suggestions as guaranteed allergy-safe. A polished suggestion card cannot replace reliable ingredient handling.

## 2. Onboarding should earn each question

The Cal AI references demonstrate focused screens, strong type and a visible next action. Their weight-loss promises and statistics do not transfer to a cooking app. Screens that gather information should visibly improve the result or explain a real requirement.

Proposed flow for a future experiment:

1. Welcome: owner's Kitchen AI mark, one product example, Get started and existing-account access, language control with flag.
2. Main cooking goal: a small set of meaningful choices, such as quicker dinners or using existing ingredients.
3. Diet and allergies: separate concepts, searchable options, multi-select where appropriate, explicit none and custom entry. Do not claim any finite list includes every allergy in the world.
4. Household size and time available: use the supplied dots and clear labels; preserve the distinction between a group size and an exact portion count.
5. First ingredients: scan, type or use a clearly labeled example. Allow correction before suggestions use the data.
6. First useful recipe: explain the match using actual data, with available and missing ingredients visible.
7. Save progress/account access when the user has something worth saving; evaluate required authentication constraints before changing current routing.
8. Contextual premium introduction only when the offer and its benefit actually exist.

This is a hypothesis, not an instruction to remove existing screens immediately. Keep eligibility requirements where needed. Reassess full birth date and gender collection if they do not change a cooking result; do not claim they calibrate a plan unless that logic exists. Country can be useful for units, products and language context. Attribution should be easy to skip and should not obstruct the first recipe. Keep the existing source choices and owner-provided icons.

Each screen should answer: why am I being asked, how much work is this, and what happens next? Use a truthful progress indicator, preserve answers when going back, and avoid resetting a choice after opening the language selector. Defer advanced options where practical. [Progressive disclosure, NN/g](https://www.nngroup.com/articles/progressive-disclosure/).

## 3. Trust should come from inspectable behavior

Useful trust components for Kitchen AI:

- A pantry match based on real item matching, not a decorative percentage.
- An editable recognition result before it affects a recipe.
- A substitution explanation: what changes in taste, texture or preparation, when supported.
- Clear distinction between unavailable information and a confirmed match.
- An undo action after removing pantry or shopping items.
- Specific account and storage explanations that match implementation.
- Verified user feedback with permission once available.

Avoid borrowed success percentages, invented ratings, fake scarcity, unsupported money-saving totals and generic promises that personal data is “always secure.” A helpful preview is stronger than an unsupported badge. Fake personalization also harms trust: a loader should not claim to analyze information that is merely stored.

## 4. Subscription presentation

Test a value-first offer after a relevant result against the existing free experience when billing is ready. A harder onboarding gate is a later experiment, not the default recommendation for an app still validating AI quality.

Suggested structure:

- One outcome-led headline matching the entry context.
- One real product preview, rather than a collage of unrelated features.
- Up to three concise benefits that are actually included.
- Clear selectable plans, initially testing monthly and annual rather than adding weekly, lifetime and several confusing tiers at once.
- Full billing amount and period. A monthly equivalent for an annual plan is supporting information, not the main price.
- Trial duration, subsequent charge and renewal information adjacent to the action when a trial is available.
- Visible dismissal where a free path exists, restore purchases, terms, privacy and subscription management.

Google explicitly requires clear subscription and trial terms and an accessible cancellation route. Treat these as product requirements, not small-print decoration. [Google Play subscription policy](https://support.google.com/googleplay/android-developer/answer/9900533?hl=en).

Example copy direction, with no price invented: “More dinner ideas for your kitchen.” Supporting detail might explain additional tailored suggestions, but only after the actual limits and entitlement handling are decided. Never advertise unlimited AI against a finite daily quota.

A trial timeline can explain access now and billing later. Only include “we'll remind you” if reminders are actually implemented and delivery limitations are accurately represented. Trial eligibility and localized prices must come from the billing system. Ineligible returning users need a different truthful offer.

Choose trial length around opportunities to use the product. For cooking, a week-spanning trial is worth investigating because a single session may not reveal recurring value; this is a Kitchen AI hypothesis, not an established optimal duration.

## 5. Visual reference library

These are archived third-party screenshots, not verified current offers. Prices, claims and availability may have changed. Study composition; do not copy their claims or brand assets.

- [Mealime reference](https://adapty.io/paywall-library/mealime-meal-plans-recipes/): a concrete recipe helps show what the upgrade provides. Kitchen AI can use a relevant result rather than adopt Mealime's green palette.
- [Cooklist reference](https://adapty.io/paywall-library/cooklist/): connects the offer to pantry and shopping use cases. Do not reuse its savings claims without Kitchen AI evidence.
- Owner-supplied Cal AI references: useful for single-action focus, typography hierarchy and quiet selection states. Avoid importing weight-loss graphs or making onboarding longer solely to resemble them.

## 6. Typography and spacing

Keep SF Pro for this iteration. There is no evidence here that switching to Inter would itself improve purchases. Evaluate reading and consistency before another font change.

The existing tokens already offer a coherent starting point: 34 display, 30 large title, 24 title, 18 headline, 16 body and 14 secondary; 56-high primary actions; spacing based on 4, 8, 16, 24, 32 and 48. These are observed current values, not new implementation.

Proposed refinements to test:

- Reserve the heaviest weight for brief headings; do not make every card equally loud.
- Use short descriptive labels and body copy with comfortable line spacing, around 1.35–1.5 as a starting range.
- Keep important terms and billing information readable. Do not shrink disclosure to make an offer appear cleaner.
- Design for German text expansion, enlarged text, keyboards and small screens. Fixed-height cards should not clip content.
- Normalize social icons by visible optical size, not only PNG canvas dimensions.
- Use one primary action per screen and enough space around it to distinguish it from secondary navigation.

Apple's typography guidance includes scaling meaningful icons with text size. Its full HIG pages returned JavaScript-only content to the reader in this session; search snippets were available, so detailed prescriptions above are our proposals, not attributed quotations. [Apple typography reference](https://developer.apple.com/design/human-interface-guidelines/typography).

## 7. Shadows and surface hierarchy

The existing card shadow is `0px 5px 20px rgba(24,24,24,0.07)`. It already sits in the restrained range appropriate for this direction. More shadow is not automatically more premium.

Proposed starting system, to verify on actual screens:

| Surface | Treatment | Purpose |
|---|---|---|
| Normal content rows | No shadow; spacing or subtle divider. | Keep scanning easy and avoid a page of floating boxes. |
| Selectable onboarding cards | Quiet pale fill; strong selected fill or border. | Selection should be immediately visible without relying on shadow. |
| Featured recipe card | Existing 7% soft shadow, if separation is needed. | Elevate one important item. |
| Sticky action footer | Small upper separator or restrained shadow only when content passes behind it. | Communicate layering without a heavy horizontal band. |
| Modal | Black translucent backdrop and clear sheet boundary. | Distinguish the temporary decision from the underlying screen. |
| Dark mode cards | Slightly lighter surface and restrained border first. | Black shadows provide little separation on dark backgrounds. |

Avoid shadows on every icon, nested cards with competing elevations, extreme blur, or faint gray text selected solely because it looks fashionable. For web text, WCAG AA contrast minimums are 4.5:1 for normal text and 3:1 for qualifying large text; test actual color pairs and image overlays. [W3C contrast guidance](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum).

The camera header deserves a stable contrasting backing when the image is unpredictable. Switching white/black from a single brightness estimate can flicker and still fail over mixed backgrounds. A restrained scrim or pill is a more reliable starting proposal.

## 8. Motion and loading

Current quick/normal tokens are 140/240 ms. Keep these as starting values for feedback and transitions, not universal timing rules.

- Button press: immediate feedback, minimal scale change if used.
- Selection: short color/check transition; prevent animation from delaying input.
- Onboarding: preserve direction and spatial continuity; avoid large bouncy movements on every answer.
- Language sheet: fade the backdrop separately from the sheet's movement. The entire dark frame should not travel upward.
- Recipe load: reserve final layout space, then reveal content without shifting the action under the user's finger.
- AI work: report real stages where known. Use an indeterminate state when progress cannot be measured; do not invent a precise percentage.
- Failure: preserve user input and expose retry or a useful fallback. Do not loop forever in a beautiful loader.
- Reduced motion: remove unnecessary movement; retain clear state changes. Apple's reduced-motion evaluation guidance supports this accessibility requirement. [Apple guidance](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria/).

The owner previously requested a longer branded splash. Keep that preference recorded, but distinguish launch presentation from making every content request artificially slower. Research here does not establish that waiting longer builds trust.

## 9. What to measure

Primary activation candidate: a new user obtains a relevant recipe and starts cooking. Also measure earlier milestones so failures can be located: ingredients entered, review completed, recipe opened and cooking started. Validate whether cooking start predicts return use before treating it as a permanent north-star metric.

Suggested events: onboarding_step_viewed/completed, ingredient_review_completed, recipe_opened, substitution_requested/succeeded/failed, cooking_started/completed, paywall_viewed/dismissed, plan_selected and purchase_attempted. Subscription activation, renewal, refund and cancellation state should come from verified billing events, not just a client button click.

Attach product version, experiment assignment, platform and acquisition category where appropriate. Do not send raw food photos, dates of birth, allergy free text or email addresses as routine analytics properties. Marketing-source totals need not expose a user's sensitive profile answers.

Evaluate paid conversion with an explicit denominator and window. Track revenue per eligible new user, trial-to-paid, renewal, refunds, support complaints, AI failure rate and return usage. A higher trial-start rate alone is not a win. Compare equivalent cohorts and let trials mature before declaring success.

## 10. Prioritized experiments

| Priority | Hypothesis | Main signal | Guardrail |
|---|---|---|---|
| 1 | Reliable automatic pantry checking reduces effort. | Relevant recipe reached and cooking started. | Wrong substitutions, failed requests, latency. |
| 2 | Essential preferences followed by a real result beats collecting all profile data first. | Activation per new user. | Missing dietary restrictions and return usage. |
| 3 | Showing available/missing ingredients increases confidence. | Recipe-to-cooking start. | Users misunderstanding estimated matches as guarantees. |
| 4 | Contextual premium messaging beats a generic feature list. | Paid conversion per eligible exposed user. | Refunds and subsequent usage. |
| 5 | A clear trial timeline improves purchase comprehension. | Correct explanation of charge timing; later paid conversion. | Cancellation complaints and refunds. |
| 6 | Limited surface elevation improves visual clarity. | Task success and observed scanning behavior. | Accessibility and preference differences. |

At low traffic, begin with moderated sessions across new and returning cooks. Ask people to explain a recipe choice and a trial offer in their own words. A handful of sessions can uncover problems but cannot estimate a conversion lift. For A/B tests, choose one primary outcome, a meaningful minimum effect and a sample-size plan before launch; randomize users consistently and avoid stopping as soon as a positive result appears.

## Durable decisions to carry forward

Keep light mode, SF Pro, owner-supplied branding, quiet surfaces and food-led color. Prioritize real results before stronger monetization. Make price and trial terms easy to understand. Preserve user control, accessibility and corrections. Treat conversion patterns as testable hypotheses, never guaranteed lifts. Do not publish unsupported health, savings, popularity or security claims. Recheck changing store requirements before release.

No app changes, billing activation, prices, analytics deployment or README edits were made as part of this research.
