# Rebuild validation

## Actually completed

- `npm run check`: PASS.
- 15 unit/static test cases: PASS.
- Syntax validation of application, renderer and optional browser suite: PASS.
- `git diff --check`: PASS.
- Production build: PASS; all referenced local assets present.
- Original repository assets retained; source baseline remains in Git history.

## Not completed

The Cloud Browser rejected the development server's localhost URL. Its security policy also rejects local file URLs. No browser restriction was bypassed.

Consequently, screenshots, visual layout verification, browser console inspection, click-through QA, iPad/phone testing, Lighthouse scores and actual WebGL rendering **are not verified**. The responsive styles and interactions are implemented, but automated source checks do not prove that every interaction works in a browser.

`scripts/browser-test.mjs` supplies repeatable browser checks. It was syntax-checked only, not executed. Run it on an authorised local environment or hosted staging URL before launch, then inspect its screenshots.

## Scope differences from the initial concept

- Real interactive 3D is concentrated in the cake studio; the hero uses layered photographic depth, not a fabricated 3D food scan.
- No gyroscope permission is requested. Pointer/touch and keyboard controls work by design without sensor access.
- No invented customer reviews, store history, hours, street address or location pin.
- Native WebGL replaces externally loaded Three.js. Native CSS transitions replace externally loaded animation libraries. The site has zero production package dependencies.
- Hindi branding and supported Hindi search keywords are included; this is not a complete Hindi/English translation toggle.
- No payments, inventory administration, automatic order acceptance or delivery tracking.

## Release gates

1. Run the browser suite and repair any discovered issues.
2. Visually review phone, tablet and desktop layouts, image cropping, readability and 3D lighting.
3. Confirm current menu prices, actual WhatsApp account destinations, cake options, dietary handling and delivery policy with the business.
4. Set the final canonical origin and publish only the approved build.

No remote GitHub writes, website deployments or customer messages were performed.
