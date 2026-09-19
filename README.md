# Madhukunj — Delight in Every Bite

A responsive, static food website for Madhukunj in Bajna, Mathura. Includes a native WebGL cake studio, 80 searchable menu items, a locally saved bag and reviewable WhatsApp enquiries.

## Status and important limits

- Implemented on branch `feat/madhukunj-3d-rebuild`.
- Production build, JavaScript syntax checks and 15 automated unit/static tests pass.
- **Visual/browser interaction QA has not been completed.** The authoring environment's Cloud Browser blocks localhost and file URLs. A runnable browser suite is included; do not treat its presence as a passing test result.
- Nothing has been pushed, published or sent to WhatsApp.
- This is an enquiry website, not a payment processor, confirmed booking system or live inventory.

## Run locally

Node.js 20 or later. No dependency installation is needed for the website.

```sh
npm run dev
```

Open `http://localhost:8765`. The development server serves only public website assets (not Git metadata). The local-only `/__qa?width=390` route embeds the site at a chosen viewport width for manual review.

Do not double-click `index.html`: JavaScript modules need an HTTP server.

## Check and build

```sh
npm run check
```

This runs syntax validation, all unit/static tests, and creates `dist/`. The build is ordinary static HTML, CSS, JavaScript and images, with relative paths suitable for a GitHub project site.

## GitHub / deployment

The source files can be committed directly to the existing repository. No framework migration or secret is required.

1. Review the branch and run the browser checks below.
2. Merge the approved branch into the repository's publishing branch.
3. For GitHub Pages, publish the repository root, or upload the contents of `dist/` to another static host.
4. After choosing the final origin, set `SITE_URL` when building to emit an absolute social image and canonical URL, for example:

```sh
SITE_URL=https://your-domain.example/ npm run build
```

No domain or location pin has been guessed. The original website is preserved by Git at commit `5ccbd08`.

## Browser QA (not yet executed)

On a machine permitted to run a local browser:

```sh
npm install --no-save --package-lock=false playwright@1.62.1
npx playwright install chromium
npm run dev
# In another terminal:
npm run test:browser
```

The browser suite checks search, categories, sort, empty states, pagination, product details, dialog closure/focus return, bag quantities and persistence, pickup/delivery validation, message encoding, cake configuration and rotation, printed menus, FAQ, privacy controls, WebGL fallback, disabled storage and viewport overflow at 320, 390, 768, 1024 and 1440 pixels. Screenshots go to ignored `test-results/`.

The suite blocks external navigation and does not click the WhatsApp send link. Test customer details are synthetic and never submitted.

Also manually check:

- iPad Safari and Android touch scrolling, cake drag and form inputs.
- Keyboard-only tab sequence, native dialog focus confinement, Escape and screen-reader announcements.
- Reduced-motion and pause/resume, including canvas render suspension off screen.
- Pinch zoom, 200% text scaling, font legibility and colour contrast.
- Slow image loading, all decorative image crops and native date-picker behaviour.
- Review prepared enquiries and verify the actual food/cake WhatsApp accounts before accepting real orders.

## Features

- Scarlet `#EF231A`, peach `#FBD2A4`, white; original Hindi logo.
- Responsive depth/parallax thali hero using an image in the supplied menu.
- Brand-book pav-bhaji photography, featured dishes, story, gifting, FAQ and contact sections.
- 80 priced items transcribed from both original food-menu pages.
- Category filters, English/Hindi keyword search, sorting, item details and load-more.
- Persistent device-local bag; quantity limits and stale-storage sanitisation.
- Pickup/delivery enquiries with contact validation, editable notes, subtotal and review step.
- Separate cake enquiries: flavour, requested weight, date, message and eggless request.
- Real WebGL geometry: plate, layered cake, cream piping, fruit and ganache. Mouse/touch drag, keyboard arrows, rotation buttons, reset and flavour/size changes.
- CSS fallback when WebGL is unavailable; no order capability depends on the canvas.
- Native accessible dialogs, skip link, visible focus, motion preferences and mobile navigation.
- No third-party scripts, fonts, analytics, automatic messages or credentials.
- Original printed menu viewer and phone-order fallback without JavaScript.

## Editing guide

| File | Purpose |
| --- | --- |
| `index.html` | Semantic page content, forms, contacts and modal shells |
| `styles.css` | Design tokens, layouts, motion and responsive breakpoints |
| `src/data.js` | Menu catalogue, categories and business configuration |
| `src/order.js` | Pure cart, price, date and enquiry-validation logic |
| `src/app.js` | UI wiring, rendering, persistence and progressive enhancement |
| `src/cake3d.js` | Dependency-free geometry, lighting and WebGL controls |
| `scripts/` | Development server, build and optional browser tests |
| `tests/` | Unit/static checks |
| `ASSETS.md` | Asset provenance and content decisions |
| `QA.md` | Actual validation results and outstanding release checks |

Contact values in `src/data.js` drive enquiry destinations. The static call links in `index.html` must also be updated if numbers change.

## Business facts to confirm before launch

- Food contact **+91 7037050187**, alternate **+91 7037050186** (food menu).
- Cake contact **+91 7037050185** (cake callout).
- Cake menu requests **at least two hours' notice**; custom work may need longer.
- Menu says free delivery above ₹200 in Bajna; current area/charges must be confirmed.
- Hours, street address, map pin, allergens, live availability and reviews are not verified.
- No cake prices were supplied. The studio requests a quote instead of inventing prices.
- Packaged beverages at MRP are left out of the priced cart; ask the kitchen for current options.

## Privacy

Only item IDs/quantities and the motion preference are saved in localStorage. Name, phone, address, notes and cake message remain in the current form and are not persisted by the application. Opening WhatsApp transfers the prepared message to WhatsApp; the visitor chooses whether to send it. There is no backend database or payment collection.
