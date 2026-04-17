# CLAUDE.md — Frontend Website Rules

## Always Do First
- **Invoke the `ui-ux-pro-max` skill** before writing any frontend code, every session, no exceptions.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:3000`)
- `serve.mjs` lives in the project root. Start it in the background before taking any screenshots.
- If the server is already running, do not start a second instance.

## Screenshot Workflow
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:3000`
- Screenshots are saved automatically to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten).
- Optional label suffix: `node screenshot.mjs http://localhost:3000 label` → saves as `screenshot-N-label.png`
- `screenshot.mjs` lives in the project root. Use it as-is — it already handles all known rendering bugs.
- After screenshotting, read the PNG from `temporary screenshots/` with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

## Known Puppeteer / Headless Chrome Bugs — DO NOT DEBUG AGAIN
These are solved. Do not spend any turns re-investigating them:

1. **`--disable-gpu` is required.** Without it, headless Chromium's GPU compositor drops composited layers (Web Animations API + `position:absolute` + `overflow:hidden` stacking contexts). The `screenshot.mjs` already includes this flag.
2. **`fullPage: true` blanks at `deviceScaleFactor: 2`.** Canvas exceeds GPU texture limit at ~11k px height. Fixed: `screenshot.mjs` now sets viewport height = page height, uses `fullPage: false`, `deviceScaleFactor: 1`.
3. **`background-clip: text` is invisible with GPU compositor.** Gradient text on elements inside hero sections renders invisible unless `--disable-gpu` is set. Non-issue now.
4. **CSS `animation` on `opacity`/`transform` inside Web-Animations-API containers.** Causes the entire parent stacking context to blank out in GPU mode. Avoid stacking CSS keyframe animations on top of Web Animations API elements — or just use `--disable-gpu` (already done).

If a screenshot looks blank or wrong: **check that the server is running and take one screenshot before assuming a code bug.** Do not take more than 3 debug screenshots per issue.

## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise
- Fonts via Google Fonts CDN (Space Mono + Inter for Cold9 brand)
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive
- `html { font-size: 62.5%; }` — 1rem = 10px scaling is already set

## Brand (Cold9)
- **Fonts:** Space Mono 700 (headings), Inter 300–900 (body)
- **Primary gradient:** `linear-gradient(90deg, #06B6D4 0%, #2563EB 100%)`
- **Cyan:** `#06B6D4` — accent, sub-labels, icon colors
- **Electric blue:** `#2563EB` — gradient end, buttons
- **Dark bg:** `#111` / `#0F172A`
- **Tagline:** "Never Freeze Again™" — never altered
- Hero bg image: `cold9-field-hero-bg.png` (night baseball field, full-bleed)
- Product photo: `cold9-white-pants-c9-logo.png` (white pants, C9 patch)
- Nav: transparent with white text when over hero

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette. Always use Cold9 brand colors above.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Space Mono for headings, Inter for body. Tight tracking (`-0.04em`) on display headings, `1.7` line-height on body.
- **Gradients:** Apply the `#06B6D4 → #2563EB` gradient to major headings via `background-clip: text`.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Spacing:** Use intentional, consistent spacing tokens — not random steps.

## Hard Rules
- Do not add sections, features, or content not requested
- Do not "improve" a design without being asked
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color
- Do not re-investigate solved Puppeteer bugs (see above)
