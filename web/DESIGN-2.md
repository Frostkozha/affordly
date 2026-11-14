# Affordly design spec, part 2: enhance, do not replace

Extends `DESIGN.md` (still the base: receipt look, ink on warm paper, dashed rules, mono numbers, green = fits/primary action, rust = gap/refusal). Where this file and `DESIGN.md` disagree, this file wins. All new tokens already exist in `src/tokens.css` (section "v2 additions"). No external images, fonts, libraries or video files. Icons and illustrations are inline SVG, 1.5 px stroke, `currentColor`.

Voice: honest, calm, precise, a little blunt. No exclamation marks, no emoji (the glyphs ✕ and ♥ are drawn as inline SVG, not text emoji), no confetti, no shame.

## 0. Rules that apply everywhere

1. **Money never lies for a frame.** In the app (landing, plan, basket, gap card, week 2) money values are never counted up. Overrides `DESIGN.md` "Motion": the 600 ms count-up on gap numbers and Waste avoided is removed. Reveals use opacity, translate and `clip-path` only, and the digits inside are always final. The only count-up is inside Reels (section 5), where the animated node is `aria-hidden="true"`, the real final value is in a sibling `<span class="sr-only">`, and the last frame is the exact value (counter works in integer cents and snaps to the target on the last frame).
2. **Reduced motion** (`prefers-reduced-motion: reduce`): tokens collapse durations to 0 ms. Every animation in this file has a static final state; reveal wrappers must render final content in the DOM from the first paint (animations only mask it). JS-driven motion (drag physics, reel clock, count-up) must also read `useReducedMotion()` and take the fallback stated per feature.
3. **One shadow level on a screen**, `--elev-1`; `--elev-2` only on a hovered/pressed-lifted primary element and sticky bars; `--elev-3` only drawer, modal, toast.
4. **Color use is unchanged**: green only for fits, savings, primary action, LIKE; rust only for gap, refusal, error, NOPE. Everything else ink on paper.
5. Tap targets 44 px minimum (`--tap`). Inputs 16 px font. Focus ring: `:focus-visible` 3 px `--focus`; buttons use `--btn-focus-ring` (paper gap + ink ring so it shows on green and ink fills).
6. Copy below is exact. `$` values are placeholders filled from data via `fmtMoney`.

## 1. Landing (`/`) changes

### 1.1 Remove
Delete the Judge guide block: remove `JudgeGuide.tsx`, `JudgeGuide.css`, the imports in `Landing.tsx`, and every mention of "Judge guide", "2 minutes" and judge instructions. Nothing replaces it one-for-one.

### 1.2 New order and copy
1. Eyebrow `Affordly` (unchanged).
2. H1 `Plan the week you can actually afford.` (unchanged).
3. Sub (unchanged): `Other planners price your recipes. Affordly prices your receipt: the whole packages a store really sells, leftovers included.`
4. Buttons: primary `Plan my week`, secondary `Try with sample` (unchanged behaviour; both `.btn--lg`).
5. **Trust badge** (`PriceBadge.tsx`, replaces the free-floating price line): pill, `--sunk` background, 1 px `--rule` border, `--fs-xs`, `--ink-2`, small 14 px inline-SVG store pin at left. Text exactly `Prices: Kroger On the Rhine, Cincinnati, OH, updated Nov 14, 2026` built from `catalog.store.name`, location and `pricedAt` (never hardcoded; if `priceSource==='demo'` text is `Demo prices, not live store data` and the pin is outlined in `--ink-3`). Wraps to two lines at 375.
6. **Hero receipt** (`HeroReceipt.tsx`), numbers from the live sample solve (`solvePlan(defaultInputs, [])`, the same call `Landing` already makes).
7. **Proof row** (`ProofRow.tsx`), three items, each icon + text: `Real store prices`, `Whole packages`, `Says no when it doesn't fit`. Icons (20 px): tag, box, a line-through circle. Separated by dashed vertical rules at 1200, stacked rows with dashed horizontal rules at 375. No cards.
8. **How it works** (`HowItWorks.tsx`), h2 `How it works`, three numbered steps (mono numerals in a 32 px ring):
   - `1  Set your limit.` Body: `Budget, calories, protein, cooking time, what you avoid.`
   - `2  See the receipt.` Body: `We pick the meals, then price the whole packages the store sells.`
   - `3  Fix it or carry it.` Body: `If it does not fit, you get verified options. Leftovers carry into next week.`
9. **Discover teaser** (`DiscoverTeaser.tsx`): `.card`, eyebrow `Discover`, h2 `Swipe the meals. Shape next week.`, body `Like a meal and Affordly plans more of it. Skip one and it stays off your list.`, three overlapping tilted meal thumbnails (the 3 cheapest-per-serving recipes from the catalog; tilt -4, 0, +4 deg, 64 px at 375 / 96 px at 1200, 2 px `--card` border, `--elev-1`), button secondary `Open Discover` to `#/discover`.
10. Footer (unchanged) plus link `Creators: get Plus free` to `#/creators`.

### 1.3 Hero receipt
Content, top to bottom, inside one paper strip (`.card`, `--card`, `.tear-bottom` torn lower edge, max width 380 px):
- Header row: mono `AFFORDLY` left, mono `SAMPLE WEEK` right, `--fs-xs`, `--ink-3`.
- Perforation divider (`<Perforation/>`, 7.10).
- Up to 5 basket lines, largest `cost` first: name (left, `--fs-sm`), `2 x 1 lb tray` (`--ink-3` meta), cost right (`.money`). Line item names come from the catalog.
- Row `+ N more items` (`--ink-3`) when the basket has more than 5, N real.
- Dashed rule.
- `Recipe price` `$X` (plan.gramCost), `Receipt price` `$Y` (plan.basketCost). Equal rows, `.money`, `--fs-lg`.
- Gap row full width on `--over-tint`: `Checkout Gap` `+$G`, `.money` `--over-deep`, 24 px.
- Caption under card: `Same week, same food. The $G gap is packages you cannot half-buy.`
- Barcode strip at the bottom (existing `||||` strip may stay; make it an SVG of 28 vertical bars, widths 1 or 2 px, `currentColor`, `aria-hidden`).

**Receipt printing reveal** (once per page load, never on re-render):
- The strip gets class `.print-in`: `clip-path: inset(0 0 100% 0)` to `inset(0)` over `--dur-print` (1400 ms), `--ease-in-out`. A 2 px `--ink` "print head" line (`.print-head`, absolutely positioned, full width) travels with the clip edge via a parallel `translateY` animation over the same duration and fades out in the last 120 ms.
- Text is real from frame 0, just masked. Lines inside additionally rise 6 px with `--stagger` offsets (cap 8) so it feels line-by-line. The totals block is last in DOM order, so it is the last revealed.
- Delay: starts when the solve resolves (not before) plus 200 ms. Fires once: guard with a `useRef`.
- Reduced motion: no clip, no print head; strip appears fully rendered.
- Loading: `<ReceiptSkeleton/>` (7.4) in the same 380 px strip. Error or solve fail: hide the strip silently, keep the rest (as before). Empty: n/a.

### 1.4 Layouts
**375 px** (gutter 16): eyebrow, H1 36 px, sub, buttons stacked full width 56 px high, trust badge, hero receipt (full width minus gutters, first viewport shows header plus first 3 lines), proof row stacked (3 rows, 48 px each), how it works (steps stacked, dashed rule between), Discover teaser card, footer. Section gap `--s-7`.
**1200 px** (max 1120): top block two columns 7/5. Left: eyebrow, H1 60 px, sub, buttons inline, trust badge. Right: hero receipt, rotated 0.6 deg (max), `--elev-2` allowed here only (it is the hero). Below: proof row full width, three equal columns. Then how it works: three columns with a dashed connector line between the rings. Then teaser card full width: text left, thumbnails right. Footer full width. Section gap `--s-8`.

## 2. Navigation

### 2.1 Routes
`#/` Landing, `#/plan#inputs|plan|basket` (unchanged), `#/discover` (tab Swipe, default), `#/discover/reels` (tab Reels), `#/week2`, `#/account`, `#/creators`. `AppShell.tsx` parses `hash.startsWith('#/discover')` and `'#/creators'` like it does for week2 and account.

### 2.2 Bars
- **Mobile bottom bar** (`BottomBar.tsx`): 5 equal columns, in order `Plan`, `Basket`, `Discover`, `Week 2`, `Account`. Same styling as today (56 px + safe area, active = ink text + 3 px top bar). 375/5 = 75 px per tab, labels `--fs-xs`, never truncated, each with a 20 px inline-SVG icon above the label (plan = receipt lines, basket = bag, discover = stacked cards, week 2 = calendar corner, account = circle). `Basket` and `Plan` both route to `#/plan#...`. Update `grid-template-columns: repeat(5, 1fr)`. Discover shows a 6 px `--ink` dot on its icon until first visited (localStorage `affordly.discoverSeen`, try/catch).
- **Desktop top bar** (`TopBar.tsx`): `Plan`, `Basket`, `Discover`, `Week 2`, `Account`, then button `Ask Affordly`. Same underline style. Between 768 and 1050 gap `--s-3` (existing rule).
- Active matching: `Discover` is active for any `#/discover*`.
- **Discover has its own sub-tabs** (`DiscoverTabs.tsx`, reuses the `.sub-tabs` look): `Swipe` and `Reels`, links to `#/discover` and `#/discover/reels`, `aria-current` on the active one. Page h1 `Discover`.

### 2.3 Page transitions
`AppShell` wraps routed content in `<div className="page-enter" key={routeKey}>` where `routeKey` is the route path without the hash fragment (so `#plan` to `#basket` also re-keys: use the full hash for sub-tabs). Effect: 240 ms fade plus 8 px rise (`a-fade` + a small translate in `.page-enter`; the fade is already in tokens, add `transform` from `translateY(8px)` in the component CSS). No exit animation. Scroll to top on change (already done). Reduced motion: none.

### 2.4 Ask button never covers content
- Mobile `.ask-float` stays 48 px, bottom right, above the bottom bar. `main` keeps its reserved bottom padding (already in `AppShell.css`).
- It is **hidden** on `#/discover*` (the deck and the reels own the bottom area); on those routes the mobile top bar shows a text button `Ask` (`.btn--quiet .btn--sm`) at right.
- It is hidden while any element with `.sticky-cta` is on screen (the Inputs "Plan my week" bar) so the float simply hides. Use `body:has(.sticky-cta) .ask-float { display: none; }`.
- It is hidden when a dialog or the drawer is open.
- Desktop: no float; `Ask Affordly` lives in the top bar only.

## 3. Discover, tab A: Swipe (`#/discover`)

### 3.1 Purpose and copy
Purpose: let the user steer next week without filling a form. Eye draws to: the top card.
- H1 `Discover`. Sub-tabs as 2.2.
- One-line explainer under the tabs (`--ink-2`, `--fs-sm`): `Likes shape next week's plan. Skipped meals stay off it.`
- Progress: mono `12 of 25` right-aligned above the deck, plus a 3 px progress rule (`--ink` on `--sunk`, `scaleX`, `--dur-base`).
- Taste summary (`TasteSummary.tsx`), compact one-line bar under the deck: `Your taste: 5 liked, 7 skipped` with a quiet button `Reset`. `Reset` opens an inline confirm in place (no modal): `Clear all likes and skips?` with `Clear` (danger, sm) and `Keep` (quiet, sm). After reset, toast `Taste cleared.` and the deck restarts at card 1.

### 3.2 The deck (`SwipeDeck.tsx`, `MealCard.tsx`)
Data: one card per recipe from the catalog, after filtering by the user's current `avoid` tags and `maxCookMinutes` (so every card is something the plan could use; with no inputs yet, use `defaultInputs`). Order: shuffled once per session with a seeded shuffle (seed stored in sessionStorage), already-judged recipes excluded; `12 of 25` counts judged + current over total filtered.

Card content (aspect 3:4 at 375, max 360 px wide; at 1200 the same card, max 380 px, centred):
- Photo fills the card (`object-fit: cover`, `alt` = recipe name, `draggable="false"`); bottom 55% has `--scrim-photo` and white text (`--on-photo`).
- Over the scrim: name (display font, 24 px, 700), then a meta row of three mono facts separated by `·`: `25 min`, `38 g protein`, `$2.10 per serving`. Below: tags as small pills (white 1 px border, white text): derived from `contains` inverted for good signal: `Dairy-free`, `Egg-free`, `Gluten-free`, `Nut-free`, `Soy-free`, `No pork`, `No fish`, plus `Breakfast`/`Lunch`/`Dinner` from `mealTypes`. Max 4 pills, rest dropped.
- Price per serving is computed: sum over ingredients of `grams x (product price / package grams)` divided by `recipe.servings`, formatted with `fmtMoney`. Tiny caption on the back/dialog: `By weight. The receipt price uses whole packages.` Show it as `--on-photo` 12 px under the meta row only on the top card: `By weight. The receipt rounds up to whole packages.`
- Photo failure: `--sunk` tile with the recipe initial in the display font, text colours switch to `--ink` (no scrim).
- The card is a `<button>`-free `<article tabindex="0" aria-roledescription="meal card">`; Enter opens `RecipeDialog`; a small `Details` quiet button (44 px, top right, white on a 40% ink pill) also opens it.

Stack: the next two cards sit behind (scale 0.96 and 0.92, translateY 8 px and 16 px, `--elev-1`), rendered but inert (`aria-hidden`).

### 3.3 Gestures and physics (`useSwipe.ts`)
Pointer events on the top card (`touch-action: pan-y` so vertical page scroll still works; if the first 8 px of movement are mostly vertical, release the gesture).
- While dragging: card follows `translate(dx, dy * 0.3)`; `rotate = clamp(dx / 20, -14, 14) deg` (`--swipe-rotate-max`). Transform only, set via `style.transform` in `requestAnimationFrame`, `will-change: transform`. No transition during drag.
- Stamp opacity = `clamp(|dx| / 96, 0, 1)` on the side of the drag.
- Commit when `|dx| >= 96` (`--swipe-threshold`) or release velocity `|vx| >= 0.5 px/ms` in the drag direction.
- Fling out: animate to `translate(sign * (viewportWidth + 200), dy)` with rotate continuing to 24 deg, 420 ms `--ease-in` (`--dur-slow`), then remove the card, next card scales to 1 in 240 ms `--ease-out`.
- Snap back: below the threshold, animate to 0 in 420 ms `--ease-snap` (slight overshoot allowed; this is not a money value).
- Buttons and keys use the same fling animation with a synthetic dx of +/-140 and no rotation drag.
- `aria-live="polite"` region (sr-only) announces after each decision: `Liked Chicken rice bowl.` / `Skipped Chicken rice bowl.`

### 3.4 Stamps (product voice)
Receipt wording, using `.stamp`:
- Right: `ADDED` in `--stamp-like` (green), placed top left of the card, rotated -8 deg.
- Left: `VOID` in `--stamp-nope` (rust), top right, rotated +8 deg.
Both are text in `.stamp` with a 3 px border, on a `--card` 85% pill so contrast holds over photos. At release they pop with `a-stamp` over `--dur-base` as the card leaves.

### 3.5 Controls and keyboard
Under the deck, centred, a row of three 56 px controls with 24 px gap, every one with a visible text label under it (`--fs-xs`):
- `✕` round button (`.btn-round .btn-round--over`), label `Not for me`, `aria-label="Not for me"`.
- Undo (curved arrow, 44 px `.btn-round`), label `Undo`, disabled when nothing to undo. Undo returns the last card with a 240 ms reverse fling and reverses the like/skip in taste state; unlimited depth within the session.
- `♥` round button (`.btn-round .btn-round--save`), label `More of this`.
Keys (when the deck has focus or nothing else does): `ArrowLeft` = Not for me, `ArrowRight` = More of this, `Backspace` or `z` = Undo, `Enter` = open details. Show the hint line at 1200 only: `Keys: left arrow skips, right arrow likes, Z undoes.` (`--ink-3`, `--fs-xs`).

### 3.6 Reduced-motion fallback
No drag rotation or fling. Dragging is disabled (`touch-action: auto`); the user uses the two buttons, undo and keys. A decision cross-fades: current card fades out 0 ms duration (token is 0) and the next appears; the stamp appears statically for 400 ms (JS timer) so the user sees feedback. The deck still shows stacked cards, flat.

### 3.7 End state (`DeckEnd.tsx`)
When every card is judged: the deck area becomes a receipt-style panel with the bag illustration (7.10 GroceryBag), h2 `You've seen every meal.`, line `You liked 5 and skipped 7.`, primary button `Rebuild my week` (`.btn--lg`), quiet button `Start over` (same confirm as Reset). `Rebuild my week` writes taste into inputs (`likedRecipeIds = liked`, `excludedRecipeIds = union(existing excluded, skipped)`), shows the button in busy state, re-solves, then routes to `#/plan#plan`. If the solve returns `ok:false`, route to the same place; the Does not fit screen takes over (its reason will mention the skips). Toast on success: `Week rebuilt with your taste.` Also available any time as a quiet button `Rebuild my week with this` in the Taste summary once at least 1 decision exists.
- Taste state lives in the store as `taste: { liked: string[], skipped: string[] }`, persisted with account state. Reset clears only these lists; it removes the skipped ids from `excludedRecipeIds` and the liked ids from `likedRecipeIds` but leaves ids excluded by other features (swaps).
- Free users: Discover is free. No paywall.

### 3.8 States
- Loading (catalog not ready): `<DeckSkeleton/>` = one grey `--sunk` card shape with three `.skeleton-line` rows and the text `Finding meals...`.
- Empty (no recipes pass the filters): bag illustration, `No meals match your rules.` + `Loosen your avoid list or cooking time.` + button `Edit inputs`.
- Error (catalog failed): `Could not load meals. Your plan still works.` + `Retry`.

### 3.9 Layouts
**375**: explainer, progress, deck 3:4 card full width minus gutters (cap height so the controls stay in the first viewport: card height = `min(width * 4/3, 100dvh - 64px top - 56px sub-tabs - 120px controls - 56px bottom bar)`), controls row, taste summary. **1200**: two columns 5/7: left = explainer, taste summary, keys hint, `Rebuild my week` button; right = deck centred with controls under it. The left column is sticky.

## 5. Discover, tab B: Reels (`#/discover/reels`)

### 5.1 Concept and label
A vertical, snap-scrolling feed of auto-playing cards drawn in the browser from the user's own plan and recipe data. No video files, no creators, no testimonials, no audio. A small label sits at the top of the feed (`.meta` pill over the first card, always visible, overlaid at top left): `Made from your plan`. With no plan: the label is `Made from a sample plan` and a `Sample week` badge (`.badge`) is shown on every number card; copy under the feed title: `Plan your own week and these cards fill with your numbers.` with button `Plan my week`.

### 5.2 Container (`ReelFeed.tsx`)
- `<section aria-label="Reels made from your plan">`, `height` = visible area (375: `100dvh - 64px top bar - 56px sub-tabs - (56px + safe-area) bottom bar`; 1200: `calc(100dvh - 64px - 56px - 32px)`), `overflow-y: auto`, `scroll-snap-type: y mandatory`, `overscroll-behavior: contain`. Each reel: `scroll-snap-align: start; scroll-snap-stop: always; height: 100%`.
- 1200: the feed is a centred column, `max-width: var(--reel-w)` (420 px), with a 1 px `--rule` frame and `--r-lg` radius; the rail sits inside the card at the right. Left and right of the column: left = `Made from your plan` explainer and the reel list (dots with names, current highlighted), right = empty. Keys `ArrowUp`/`ArrowDown` or `J`/`K` change reel; `Space` pause.
- Active reel = the one with an `IntersectionObserver` ratio >= 0.6. Only the active reel runs its clock; others render their static final frame (so the snap preview looks right).
- Reel order: a) receipt, b) all of this, c) gap, d) leftovers (only `week >= 2` and `pantryUsedValue > 0`), then up to 3 e) recipe reels (distinct recipes from the plan, in day order), then f) creators. With no plan: sample plan, a, b, c, up to 3 e, f; d omitted.

### 5.3 Reel frame (`Reel.tsx`)
- Progress bar: 3 px at the very top of the card, `--ink` fill on `--rule`, 16 px side inset, `scaleX` driven by the clock (`ease-linear`). One bar per card (not segmented).
- Background: paper (`--paper`/`--card`) for number cards, photo + scrim for recipe reels.
- Tap anywhere on the card (except rail and links) toggles pause. While paused show a 56 px pause glyph centred, fade 160 ms, and the progress bar freezes. `aria-label` on a visually-hidden toggle button inside the card: `Pause` / `Play`, `aria-pressed`.
- Loops: at progress 1 it holds 400 ms then restarts from 0 with a 240 ms fade of content.
- Clock (`useReelClock.ts`): `requestAnimationFrame` accumulating elapsed ms, pauses when `document.hidden`, when paused, or when the reel is inactive. Exposes `t` (ms), `p` (0..1), `restart()`. Each reel declares a `timeline: {at: ms, ...}`; elements use `t >= at` to set a class and CSS transitions do the motion (so durations and easings are tokens, not JS).
- Rail (`ReelRail.tsx`): right side, bottom aligned, 8 px from the edge, vertical stack, 12 px gap, each button 44 px `.btn-round` (on photo cards: `--card` fill so it reads), always with a text label under it (`--fs-xs`):
  - `♥` label `More of this` (recipe reels only; toggles liked in taste state, `aria-pressed`; filled when liked).
  - Share (arrow out of box) label `Share`: `navigator.share` if available, else copy to clipboard text and toast `Copied.` Text: for receipt cards `My week on Affordly: 21 meals for $72.40 at the register. Plan yours: https://affordly.pages.dev`; for others the same with that card's facts; never invented numbers. Share is hidden on `Sample week` reels (nothing of the user's to share).
  - Open (arrow) label `Open`: receipt/all-of-this/gap to `#/plan#basket`; leftovers to `#/week2`; cook it opens `RecipeDialog`; creators card to `#/creators`.

### 5.4 Card types
Fonts: display for headlines, mono for numbers. Safe area: keep content inside 16 px sides, 72 px top (progress + label), 96 px bottom, 64 px right (rail).

**a) This week's receipt** (7000 ms)
- Layout: eyebrow `THIS WEEK'S RECEIPT`, giant total (`--fs-money`, mono), under it two stat rows: `21 meals` and `$3.45 per meal`.
- Timeline: 0 ms eyebrow fade (`--dur-base`). 300 ms total count-up from `$0.00` over 1800 ms. 2300 ms meals count-up 0 to N over 700 ms (integer steps). 3000 ms per-meal count-up over 900 ms. Hold to 6600 ms, fade out 400 ms, loop.
- Values: total = `plan.basketCost`; meals = `plan.meals.length`; per meal = `plan.basketCost / plan.meals.length` rounded half up to cents.

**b) All of this for $X** (9000 ms)
- Headline `All of this for $72.40` is static real text (X = `plan.basketCost`), visible from 0.
- Below: a receipt list that prints. Up to 7 basket lines (largest cost first): name, `2 x 1 lb tray`, cost. Line i appears at `600 + i * 650` ms (rise 6 px + fade, `--dur-slow`, `--ease-out`), the list scrolls inside a fixed 280 px mask if it overflows (top fade).
- Beside/below, a row of up to 4 small dish thumbnails (48 px, distinct meals from the plan) fade in one by one every 700 ms from 600 ms.
- At `600 + n * 650 + 400` ms the totals line (`Receipt total $72.40`, double dashed rule above) stamps in (`a-stamp`-free: use `a-rise`), then holds. Loop at 9000 ms.
- With more than 7 lines add `+ N more items` as the last printed line (real N).

**c) The Checkout Gap** (8000 ms)
- Eyebrow `THE CHECKOUT GAP`. Two horizontal bars, full width, 20 px high, `--r-sm`, labels above each. Bar scale: width proportional to value, `receipt = 100%`.
- Timeline: 300 ms recipe bar grows (`a-grow-x`, `transform-origin: left`, 700 ms, `--ease-in-out`), fill `--ink-2`. 1000 ms receipt bar grows (same), fill `--ink`. 1800 ms the gap segment (rust `--over`) grows from the end of the recipe bar to the end of the receipt bar, 600 ms. Value labels `Recipe price $X` / `Receipt price $Y` fade in only after their bar finishes (1000 ms / 1700 ms) so no number appears before its bar. At 2600 ms the gap line fades in: `+$G` (mono, `--over-deep`, 40 px) and `You pay $G for food you will not eat this week.` At 5600 ms optional line `Week 2 can carry perishable leftovers worth $P.` (P = `plan.perishableLeftValue`, shown only if > 0). Loop at 8000 ms.
- If `checkoutGap` is 0: bars equal, gap line `No gap this week.` (no rust).

**d) Leftovers saved** (7000 ms, `week >= 2` and `pantryUsedValue > 0` only)
- Eyebrow `LEFTOVERS SAVED`. Headline `Waste avoided` and a big `$X` in `--save` (X = `plan.pantryUsedValue`), static text, fades in at 300 ms (no count-up).
- List of carried items printed one by one every 600 ms from 1200 ms: product name, `340 g`, value `$1.12` (gramsFromPantry x package price / package grams, summed to X by construction; if rounding differs from X, show the last line as `Other items` so the list sums to X).
- Caption at 5000 ms: `Leftovers from week 1, used in week 2, valued at store price.`
- Not shown on sample data.

**e) Cook it** (10000 ms, one per recipe)
- Full-bleed recipe photo with Ken Burns: `a-ken-burns` over 10000 ms, `--ease-in-out`, alternate direction per reel (translate sign flips). Scrim `--scrim-photo`. Alt text = recipe name.
- Top-left: `COOK IT` pill. Under the progress: name in display 28 px white.
- Captions: steps appear one at a time in the lower third, white 20 px, `--r-md` background `rgba(27,26,23,.55)`. Timeline: 0 to 1200 ms name only. Then up to 5 steps share 1200 to 8000 ms evenly (slot = 6800 / n, min 1200 ms), each with `a-line-in` 240 ms in, previous fades out. If the recipe has more than 5 steps the 5th caption is `+ N more steps in the recipe` (real N) instead of step text; steps are never altered or shortened.
- End card (8000 to 10000 ms): `25 min` and `38 g protein` (mono, large), and two buttons side by side: `♥ More of this` (`.btn .btn--sm`, toggles like; label becomes `Liked` when on) and `Open recipe` (`.btn--primary .btn--sm`, opens `RecipeDialog`). These are real buttons, also available in the rail; the end card repeats them for discoverability.
- Reduced motion: photo static, all steps listed as a numbered list over the scrim (up to 5), no clock.

**f) Make reels like this. Get Plus free.** (8000 ms)
- Paper background, bag illustration (7.10 GroceryBag) drawn on (stroke-dashoffset from full to 0 over 1200 ms starting at 200 ms, `--ease-in-out`).
- Headline (display 32 px) `Make reels like this.` then `Get Plus free.` at 800 ms.
- Body at 1400 ms: `Post 4 real weeks a month. We cover Plus.`
- Button (primary, lg) at 2000 ms: `See the Creators programme` to `#/creators`. Under it, `--ink-3`: `Early programme. Applications reviewed by hand.`
- This card does not loop its content: after the animation it holds still.

### 5.5 Count-up spec
- Hook `useCountUp(targetCents, startMs, durMs, t)` returns an integer cents value. `value = round(target * easeOutCubic(clamp((t - startMs)/durMs, 0, 1)))`. When progress reaches 1 it returns exactly `targetCents`. Easing is the JS equivalent of `--ease-out`.
- Render with `fmtMoney(value / 100)` inside `<span aria-hidden="true" class="money">` plus `<span class="sr-only">$72.40</span>` (the real final value, present from first render).
- A reel that is not active, paused or reduced-motion renders the final value directly.
- Targets are always integer cents derived by `Math.round(n * 100)` from plan numbers; never recomputed from rounded parts.

### 5.6 Reduced motion
`useReducedMotion()` true: no auto-play and no loop. Each reel renders its complete final frame (all lines, bars full, all captions as a list). Progress bar is replaced by text `3 of 7` (mono) top right. Two buttons at the bottom of the card, 44 px: `Back` and `Next` (calls `scrollIntoView` on the neighbour with `behavior:'auto'`). Scroll snap stays. The rail stays.

### 5.7 States
- Loading (plan solving): `<ReelSkeleton/>` = receipt-line skeleton (7.4) full card, text `Pricing your basket...`.
- Empty (no plan): sample plan numbers with `Sample week` badge, as 5.1.
- Error (solve failed or `ok:false`): one card: `Does not fit` badge, the solver reason, button `Edit inputs`. The sample reels are not shown in this case (do not mislead). Photos failing: recipe reel falls back to the `--sunk` initial tile, text switches to `--ink`.

## 6. Creators (`#/creators`)

### 6.1 Page (`CreatorsPage.tsx`)
Purpose: recruit a few real creators, honestly. Eye draws to: the offer headline, then the form.
- Eyebrow `Creators`. H1 `Post real weeks. Get Plus free.`
- Lead: `If you post 4 videos a month about a real week planned with Affordly, your Plus plan is free for as long as you keep posting.`
- Rules card (`.card`, h2 `The rules`, receipt-style list with dashed rules):
  1. `4 videos a month, any platform listed below.`
  2. `Real plans only: use your own budget and your own receipt.`
  3. `Show the real receipt total, gap and what you cooked.`
  4. `No health claims. We are a planning tool, not medical advice.`
  5. `Add "Made with Affordly" in the caption or on screen.`
  6. `You keep your content. We never edit or repost it without asking.`
- Who it is for: h2 `Who this is for`, body `People who already talk about budgets, groceries, meal prep or money. Small accounts are welcome. You do not need a following, you need real weeks.`
- How it works (3 steps, same ring styling as landing): `1  Apply.` `Tell us where you post.` / `2  We review it by hand.` `We read every application. This is an early programme, so spots are limited.` / `3  Plan, post, repeat.` `We switch on Plus. You post 4 real weeks a month.`
- Line above the form, `--ink-2`: `Applications are reviewed by hand. This is an early programme, so we may be slow and we cannot take everyone.`
- Linked from: footer (`Creators: get Plus free`), Account page (a row card: `Creators` / `Get Plus free for posting real weeks.` / quiet link `Learn more`), and the last reel (f).

### 6.2 Form (`CreatorForm.tsx`)
Fields in this order, mapped to `CreatorApplication`. Labels above inputs, 16 px, 44 px min height.
| Label | Field | Control | Rule |
|---|---|---|---|
| `Your name` | `name` | text, `autocomplete="name"` | 1 to 80 chars |
| `Where you post` | `platform` | radio chips (aria-pressed single choice): `TikTok` (`tiktok`), `Instagram` (`instagram`), `YouTube` (`youtube`), `Other` (`other`) | required |
| `Handle or link` | `handle` | text, placeholder `@yourname or a profile link` | 1 to 120 chars. Hint: `This is how we contact you.` |
| `Followers` | `followers` | radio chips: `Under 1k` (`under-1k`), `1k-10k` (`1k-10k`), `10k-100k` (`10k-100k`), `Over 100k` (`over-100k`) | required |
| `Anything we should know? (optional)` | `note` | textarea 4 rows, counter `0 / 500` mono | 0 to 500 chars |
Submit button: primary lg, full width at 375, `Send application`. Busy state: `aria-busy` with spinner, label hidden, field set disabled.

Validation (on blur and on submit; `.field-error`, `aria-describedby`, `aria-invalid`; first invalid field gets focus on submit; a `role="alert"` summary is not needed):
- name empty: `Enter your name.` over 80: `Use 80 characters or fewer.`
- platform missing: `Choose where you post.`
- handle empty: `Enter your handle or a link to your profile.` over 120: `Use 120 characters or fewer.`
- followers missing: `Choose a follower range.`
- note over 500: `Keep the note to 500 characters.` (counter turns `--over-deep` at 500+).

Request: `POST /api/creators` with the `CreatorApplication` body (`note` sent as `""` when empty), 10 s timeout.

States:
- Success (`{ok:true}`): form replaced by a panel with a 28 px check drawn (stroke-dash, 420 ms): h2 `Application sent.` body `We review applications by hand. We will contact you on the handle you gave. We aim to reply within 7 days.` Buttons: secondary `Back to Discover`, quiet `Send another`. Focus moves to the h2. `role="status"`.
- Error (network or 5xx): `role="alert"` box above the button, `--over-tint`, 3 px `--over` left border: `Could not send your application. Nothing was lost: your answers are still here. Try again.` The form keeps values; button label returns to `Send application`.
- Rate limit (429): same box: `You sent several applications recently. Try again in an hour.` Button is disabled for the session after a 429 and shows `Try again later`.
- Validation errors from the server (400): show `Check the highlighted fields.` and mark the fields named in the response, falling back to the generic error.
- Loading page: none (static). Offline: the error state above.

### 6.3 Layouts
**375**: eyebrow, h1, lead, rules card, who, how it works stacked, review line, form, success replaces form. **1200**: two columns 6/6. Left: eyebrow, h1, lead, who, how it works. Right: rules card then the form card (sticky top 88 px). Footer full width.

## 7. Motion and visual upgrade for existing screens

### 7.1 Day cards
`PlanView`: wrap the 7 `DayCard`s in `.reveal-stagger`, set `style={{'--i': index}}` on each (0 to 6), 420 ms `a-rise` with `--ease-out` and `--stagger` 60 ms steps. Runs once per plan identity (key by a hash of `plan.basketCost + meals length`); a re-solve from a price edit does not replay (compare keys). Expanding a card animates `grid-template-rows: 0fr` to `1fr` over `--dur-base`. Reduced motion: none.

### 7.2 Checkout Gap card (hero)
- Frame: 2 px `--ink` top border (existing) and a torn lower edge using `.tear-bottom` with `--card` fill, so it reads as a receipt strip; `--elev-2` allowed (it is the hero of the tab).
- One-time reveal, per plan and session (`sessionStorage` key `gapRevealed:<planKey>`, try/catch): card fades in at 0 ms; the `Recipe price` figure rises in at 120 ms; the `Receipt price` figure at 360 ms (each `a-rise`, `--dur-slow`); the gap row at 700 ms uncovers left to right by `clip-path: inset(0 100% 0 0)` to `inset(0)` over `--dur-slow`, `--ease-out`; `LeftoverTop3` lines at 1000 ms staggered. Digits are final the whole time. On later views and on price edits: no animation (so a live edit never flashes).
- Gap row stays `--over-tint`; the `+$G` is `--over-deep` and unchanged in size.

### 7.3 Fits and does not fit
- **Fits** (`FitsBanner.tsx`, shown in the week strip and gap card): badge `Fits` with a 16 px check drawn once (stroke-dashoffset, 420 ms), and a line `Fits your budget. $7.60 left.` (the real difference `budget - basketCost`). Calm: no color flash, no pulse, no confetti.
- **Does not fit** (`DoesNotFit.tsx`): static. `role="alert"`, 4 px `--over` left border, `--over-tint` header, the existing blunt copy, fade-in only (`--dur-base`). No shake, no red flash, no emoji. Order stays: reason first, options second. Cards for options use `.reveal-stagger`.

### 7.4 Skeletons that look like receipt lines (`ReceiptSkeleton.tsx`, replaces `Skeleton.tsx` visuals)
A `.card` with 6 rows; each row: a `.skeleton-line` of random-looking but fixed widths (62%, 48%, 70%, 55%, 66%, 40%) on the left and a short 18% line on the right, a dashed `--rule` under every row, a `--ink-3` text line at the top: `Pricing your basket...`. Shimmer: a 1200 ms linear gradient sweep on the lines (`background-size: 200%`), disabled under reduced motion (static fill). `aria-busy="true"` on the container, `role="status"`.

### 7.5 Solving progress (`SolveStatus.tsx` upgrade)
Receipt printing line by line while `solving`: a paper strip with the header `AFFORDLY` and 6 `.skeleton-line` rows that appear one at a time in a 1800 ms loop (`steps`/stagger: row i fades in at `i * 260` ms, then all fade out in the last 200 ms and restart). Under it the text `Pricing your basket...` and, after 4 s, `Still working. This can take a moment on a slow connection.` Reduced motion: all 6 rows visible and static, text stays. Never shows numbers.

### 7.6 Button system
Defined in `tokens.css` (`.btn`, `.btn--primary`, `.btn--danger`, `.btn--quiet`, `.btn--sm|lg|block`, `.btn-round`). `Button.tsx` gains props: `variant: 'primary' | 'secondary' | 'quiet' | 'danger'` (existing `primary` boolean stays as an alias for `variant="primary"`), `size: 'sm' | 'md' | 'lg'`, `block`, `busy` (sets `aria-busy="true"` and `disabled`). Sizes: sm 44 px, md 48 px, lg 56 px (all >= `--tap`). States: hover (bg tokens), active (press 1 px down, scale 0.99, darker token), focus-visible (`--btn-focus-ring`), disabled (opacity 0.55, no pointer), loading (spinner, label hidden but kept for layout). Danger is only for destructive actions (`Clear`, `Switch back to Free`), never for "does not fit". Quiet button = underlined text.

### 7.7 Chips, inputs and steppers
- `Chip` unchanged shape; toggle transition 160 ms; pressed state also shows a 14 px check at left (not colour only).
- `Stepper.tsx`: wraps the number input. `-` and `+` 44 px buttons at both ends, input centred, mono. Budget: step 5, min 10, max 500, shows `$` prefix inside. Protein: step 5, min 40, max 300, suffix `g`. Calories keep a plain input. Press and hold repeats every 120 ms after 400 ms. `aria-label` on buttons: `Decrease budget` / `Increase budget`. Out-of-range typing shows the existing validation message and the stepper clamps on blur. Invalid state `aria-invalid` red 2 px border.
- Segmented control for cooking minutes: 44 px segments, active = ink fill with paper text, 160 ms.

### 7.8 Paywall cards
Plus card: 2 px `--ink` border, `--elev-2`, badge `Best for repeat weeks`. Free card flat. Entry `.reveal-stagger` (Plus first at 375). Hover on desktop lifts the Plus card 2 px (`transform`, 160 ms). `Unlock demo` is `.btn--primary .btn--lg .btn--block`; busy state while saving. After unlock the card collapses (grid-rows 240 ms) to the banner `Plus is on (demo).` with a drawn check. No confetti.

### 7.9 Toasts (`Toast.tsx`, `useToast.ts`)
Single toast at a time, `role="status"`, 3000 ms, rises in (`a-rise`, `--dur-base`), fades out. Position: mobile above the bottom bar (see `.toast` token: 96 px+ above bottom and never over the Ask float: when `.ask-float` is visible, shift the toast `left: 16px; transform: none; right: 72px; max-width: none`); desktop bottom centre 32 px. Variants: default ink, `toast--over` for errors. Strings: `Copied.`, `Taste cleared.`, `Week rebuilt with your taste.`, `Could not copy. Select the text and copy it by hand.`

### 7.10 Illustrations (inline SVG components in `src/components/art/`)
All use `stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"`, `aria-hidden="true"`, colour via parent (`--ink-3` by default).

**6.1 TornEdge** (`art/TornEdge.tsx`). Decorative zigzag for the bottom of a receipt strip when the CSS mask is not enough (e.g. the hero receipt).
- `<svg viewBox="0 0 200 10" preserveAspectRatio="none" width="100%" height="10">`.
- One `<path d="M0 0 L10 10 L20 0 L30 10 L40 0 L50 10 L60 0 L70 10 L80 0 L90 10 L100 0 L110 10 L120 0 L130 10 L140 0 L150 10 L160 0 L170 10 L180 0 L190 10 L200 0 V0 Z" fill="var(--card)" stroke="var(--rule)">`. Placed directly under the card with `margin-top: -1px`. Teeth height 10 px (`--tear-size`).

**6.2 GroceryBag** (`art/GroceryBag.tsx`). Line drawing for empty states, deck end, creators reel, 96 x 96 (props `size`, `draw` boolean for the dash-draw animation).
- `<svg viewBox="0 0 96 96">`. Paths:
  - body: `M20 34 H76 L72 84 Q72 88 68 88 H28 Q24 88 24 84 Z`
  - handles: `M36 34 V28 a12 12 0 0 1 24 0 V34`
  - baguette: `M40 34 L34 12` and `M44 34 L38 12` (two parallel lines) closed by `M34 12 L38 12`
  - leaf bunch: `M58 34 C56 24 62 18 70 16 C70 24 66 31 58 34 Z`
  - receipt tip: `M50 34 V22 H64 V34` with two short lines `M53 27 H61` and `M53 31 H61`
  - bag fold line: `M24 46 H72` with `stroke-dasharray="4 4"`.
- For `draw`: each path gets `pathLength="1"`, `stroke-dasharray: 1; stroke-dashoffset: 1` animating to 0 over 1200 ms, `--ease-in-out`, paths staggered 100 ms. Reduced motion: fully drawn.

**6.3 Perforation** (`art/Perforation.tsx`). Divider between receipt sections.
- A `div` of 100% width, 12 px high, `position: relative`. Centre line: `border-top: 2px dashed var(--rule)` at 6 px. Two notches: `::before` and `::after`, 12 px circles of `--paper` colour with 1 px `--rule` border, at `left: -6px` and `right: -6px`, vertically centred. Inline SVG not required; the component is CSS-only (`Perforation.css`). A scissors glyph is optional and omitted.

**6.4 (Skeleton receipt)** see 7.4, uses `.skeleton-line`.

## 8. State summary (every new surface)
| Surface | Loading | Empty | Error |
|---|---|---|---|
| Hero receipt | `ReceiptSkeleton` | n/a | hide strip |
| Swipe deck | `DeckSkeleton`, `Finding meals...` | `No meals match your rules.` + `Edit inputs` | `Could not load meals. Your plan still works.` + `Retry` |
| Reels | `ReelSkeleton`, `Pricing your basket...` | sample numbers, `Sample week` | `Does not fit` reel + `Edit inputs` |
| Creators form | busy button | n/a | send error / rate limit / field errors (7.10 GroceryBag) |
| Discover teaser | 3 grey thumbs | hidden if catalog empty | hidden |

## 9. New files (all under `D:\nutricart\web\src\`)
Components (`components/`): `PriceBadge.tsx`, `HeroReceipt.tsx`, `ProofRow.tsx`, `HowItWorks.tsx`, `DiscoverTeaser.tsx`, `DiscoverPage.tsx`, `DiscoverTabs.tsx`, `SwipeDeck.tsx`, `MealCard.tsx`, `DeckEnd.tsx`, `DeckSkeleton.tsx`, `TasteSummary.tsx`, `ReelFeed.tsx`, `Reel.tsx`, `ReelRail.tsx`, `ReelSkeleton.tsx`, `reels/ReceiptReel.tsx`, `reels/BasketReel.tsx`, `reels/GapReel.tsx`, `reels/LeftoversReel.tsx`, `reels/CookReel.tsx`, `reels/CreatorsReel.tsx`, `CreatorsPage.tsx`, `CreatorForm.tsx`, `FitsBanner.tsx`, `Stepper.tsx`, `Toast.tsx`, `ReceiptSkeleton.tsx`, `art/TornEdge.tsx`, `art/GroceryBag.tsx`, `art/Perforation.tsx`, `art/Icons.tsx` (nav icons, store pin, check, heart, x, undo, share, open), plus a `.css` beside each (`Discover.css`, `Reels.css`, `Creators.css`, `Landing.css` updated, `Art.css`).
Hooks and libs (`lib/`): `useReducedMotion.ts`, `useSwipe.ts`, `useReelClock.ts`, `useCountUp.ts`, `useToast.ts`, `taste.ts` (liked/skipped state, merge into inputs, reset), `recipePrice.ts` (price per serving by weight), `reelData.ts` (builds reel descriptors from a `Plan`, recipes and catalog, or from the sample plan), `creatorsApi.ts` (`POST /api/creators`, typed with `CreatorApplication`).
Edits to existing files (by the developer): `AppShell.tsx` (routes, page-enter wrapper, hide Ask on discover), `TopBar.tsx`, `BottomBar.tsx` + `AppShell.css` (5 columns), `NavLinks.tsx`, `Landing.tsx`/`Landing.css`, `Button.tsx`, `PlanView.tsx`, `CheckoutGapCard.tsx`, `DoesNotFit.tsx`, `SolveStatus.tsx`, `Skeleton.tsx`, `BudgetField.tsx`, `InputsForm.tsx`, `Paywall.tsx`, `AccountPage.tsx` (creators row), footer in `AppShell.tsx`, `lib/store.ts` (`taste`). Delete `JudgeGuide.tsx` and `JudgeGuide.css`.

## 10. Order of work (the app stays working after every step)
1. Tokens are already in place (additive); confirm the app looks unchanged.
2. `useReducedMotion`, `Toast`, `Icons`, art components, `ReceiptSkeleton` (new files only, nothing wired).
3. Button variants/sizes/busy (backward compatible: existing `primary` prop stays).
4. Landing: remove JudgeGuide, add PriceBadge, HeroReceipt, ProofRow, HowItWorks (teaser last, link target comes in step 7).
5. Page-enter wrapper, day-card stagger, Checkout Gap reveal, Fits and Does not fit, solving progress, paywall polish, Stepper in Inputs.
6. Store `taste`, `taste.ts`, `recipePrice.ts`; Discover route and Swipe deck; add the 5th tab to both bars (ship nav and route in the same commit so no dead link). Hide Ask on discover.
7. Landing Discover teaser.
8. Creators page, API client, links in footer and Account (the Reels card f links here, so this precedes Reels).
9. Reels: clock, count-up, reel descriptors, cards a to f, rail, reduced-motion mode.
10. Pass at 375 and 1200 with reduced motion on and off; check contrast and tap targets.
