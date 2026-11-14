# Affordly design spec

Product: money first. "Plan the week you can actually afford." Voice: honest, calm, precise, a little blunt. No exclamation marks, no emoji, no "oops".
Design idea: **the receipt**. The UI is warm paper, ink-black text, dashed rules, monospace tabular numbers. Two colors carry meaning: green `--save` (money kept, fits, primary action) and rust `--over` (gap, does not fit, refusal). Everything else is ink on paper. Never use green or rust as decoration.
All tokens live in `src/tokens.css`. Do not hardcode colors, sizes, or fonts. No external fonts, CDNs, icon fonts. Icons: inline SVG, 1.5 px stroke, `currentColor`, always with a text label or `aria-label`.

## 1. Global rules

### Navigation
- Routes: `/` Landing, `/plan` (Inputs + Plan + Basket, see below), `/week2`, `/account`. Paywall is a section on `/week2` and a modal opened from locked actions. Assistant is a drawer on every route except Landing.
- Mobile (<768): fixed bottom bar, height 56 px + safe-area inset, 4 tabs, each min 44x44: `Plan`, `Basket`, `Week 2`, `Account`. Active tab: ink text, 3 px `--ink` top bar; inactive `--ink-2`. Assistant is a floating button above the bar, bottom right, 48 px circle `--ink` bg, label "Ask" (text, not icon only).
- Desktop (>=768): sticky top bar, 64 px, `--paper` bg, 1 px `--rule` bottom. Left: wordmark "Affordly" (display font, 700). Center/right: links `Plan`, `Basket`, `Week 2`, `Account`, then button "Ask Affordly". Content max width `--page-max`, centered, side padding `--gutter`.
- `/plan` is one page with a sticky sub-tab row at mobile (`Inputs | Plan | Basket`), and at desktop a two-column layout (see 3 and 4). Tab state in URL hash.

### Money formatting
- US dollars, `$` prefix, always 2 decimals: `$72.40`. Thousands: `$1,204.00`. No rounding to whole dollars anywhere. Negative: `-$3.20` (hyphen-minus, never parentheses). Gap shown with explicit plus: `+$9.15`.
- Grams: integer with `g`, `1,450 g`. Kcal: `2,200 kcal`. Protein: `150 g protein`. Minutes: `30 min`.
- Monospace tabular (`.money`, `.num`) for every money, gram, kcal number; right-align in tables.
- Format via one helper `fmtMoney(n)` using `Intl.NumberFormat('en-US',{style:'currency',currency:'USD'})`. Round half up at cent level; never format a sum of rounded parts (sum first, then format).
- Every computed price has its source on demand: tap a number to show "packages x price" in a popover (optional, v1.1).

### Layout and spacing
- 4 px base scale (`--s-*`). Section gap `--s-7` mobile, `--s-8` desktop. Cards: `.card`, radius `--r-lg`. Max one shadow level on screen (`--shadow-1`); `--shadow-2` only for drawer and modal.
- Dashed rules (`1px dashed --rule`) separate receipt-style rows. Avoid nested cards.

### Motion
- 160 ms ease for hover/press. Gap numbers count up over 600 ms once on first reveal (ease-out). Drawer slides 220 ms. All disabled under `prefers-reduced-motion` (tokens.css already collapses durations; also skip the count-up and render final values).

### Accessibility
- Contrast AA verified in token comments; never put `--ink-3` on `--sunk` for body text smaller than 13 px.
- Tap targets >= 44x44 (`--tap`) including chips, swap controls, tabs, table row actions. Inputs 16 px font to prevent iOS zoom.
- Focus: 3 px `--focus` outline, 2 px offset, never removed. Skip link "Skip to content" first on page. Drawer and modal trap focus, close on Esc, return focus to the trigger.
- Color is never the only signal: over budget always has the words "over" or "does not fit" plus a badge; savings always have a sign or word.
- Semantic landmarks: `header nav`, `main`, `footer`. One `h1` per route. Tables use real `<table>` with `<th scope>`. Live regions: `aria-live="polite"` on plan total and Checkout Gap card (they change on price edit); `role="alert"` on error and "Does not fit".
- Images have alt text = recipe name; thumbnails `loading="lazy"`, fixed aspect ratio to avoid shift.
- Meal tap target is a `<button>` opening a dialog, not a div.

### Shared states
- Loading: skeleton blocks of `--sunk` with no shimmer under reduced motion; text "Pricing your basket..." (not "Loading"). Solve is sync and fast, so skeleton shows only on network (assistant, account, Kroger).
- Empty: one sentence plus one button. Error: say what failed, what still works, and a retry button. Example: "Could not reach the price service. Showing demo prices. Retry".
- Offline/worker down: app runs with demo catalog and local state; banner "Saved on this device only."

## 2. Component list (file names)

`AppShell`, `TopBar`, `BottomBar`, `SkipLink`, `PriceSourceLine`, `Button`, `Chip`, `Badge`, `Money`, `Stat`,
`Landing`, `JudgeGuide`,
`InputsForm`, `BudgetField`, `AvoidChips`, `WorkoutList`, `WorkoutRow`,
`PlanView`, `DayCard`, `MealRow`, `MealThumb`, `DayTotals`, `RecipeDialog`,
`CheckoutGapCard`, `LeftoverTop3`, `BasketTable`, `BasketLine`, `PriceEdit`, `SwapButton`, `BasketTotal`,
`DoesNotFit`, `AlternativeCard`,
`WeekTwo`, `SimulateButton`, `LeftoverList`, `WasteAvoided`,
`Paywall`, `PlanCompare`, `UnlockDemoButton`,
`AssistantDrawer`, `AssistantMessage`, `RefusalMessage`, `RecipeCard`, `ApplyPlanButton`, `AnswerSourceLabel`,
`AccountPage`, `HistoryTable`, `PlanBadge`, `EmptyState`, `ErrorState`, `Skeleton`, `fmtMoney.ts`.

## 3. Screens

### 3.1 Landing (`/`)
Purpose: in 10 seconds a judge understands the one idea and gets to a result in one tap.
Eye draws to: the headline plus a static mini "receipt vs recipe" pair directly under it.

Copy:
- Eyebrow (small caps, `--ink-3`): `Affordly`
- H1: `Plan the week you can actually afford.`
- Sub: `Other planners price your recipes. Affordly prices your receipt: the whole packages a store really sells, leftovers included.`
- Buttons: primary `Plan my week` (goes to `/plan#inputs`), secondary `Try with sample` (loads sample inputs: $80, 2200, 150 g, 30 min, no avoid, no workouts, and goes to `/plan#plan` with solved plan).
- Mini proof (static, from the sample solve, not hardcoded numbers: read from solver output at build or runtime): two figures `Recipe price $X` and `Receipt price $Y`, caption `Same week, same food. The $Z gap is packages you cannot half-buy.` Gap number in `--over`.
- Judge guide (card, `<ol>`, heading `Judge guide, 2 minutes`):
  1. `Tap "Try with sample" and look at the Checkout Gap.`
  2. `Set the budget to $40 and see what does not fit, and the options.`
  3. `Open "Week 2", tap "Simulate next week", then "Unlock demo".`
- Price source line (under buttons, `--fs-xs`): `Prices: Kroger <store.name>, updated <Mon D, YYYY>` when `priceSource==='kroger'`, else `Demo prices, not live store data`.
- Footer: `Planning tool, not medical or dietary advice.`

375 px: single column, gutter 16. Order: eyebrow, H1 (36 px), sub, buttons stacked full width (each 48 px high), mini proof card, judge guide, price line, footer. No hero image.
1200 px: two columns 7/5 inside 1120 max: left eyebrow, H1 (60 px), sub, buttons inline, price line; right the mini proof as a tall receipt-styled card (dashed rules, slight 0.6 deg rotation allowed, no more) over the judge guide below it. Footer full width.
States: loading = proof card skeleton (solve of sample must run on mount; if it throws, hide the proof card, keep the rest). Error: none visible; proof card omitted. Empty: n/a.

### 3.2 Inputs (`/plan#inputs`)
Purpose: set the budget and rules, fast. Eye draws to: budget field (largest, first).
Layout 375: single column form, sections with `h2`, sticky bottom CTA above bottom bar: `Plan my week`. 1200: form left 5 columns, live summary card right 7 columns ("Your week at a glance": budget, kcal, protein, avoid list) with the CTA under the form.
Fields (label, default, rule):
- `Weekly grocery budget` `$80`, prefix `$`, inputmode decimal, min 10 max 500, step 1. Hint: `Hard limit. The receipt total must stay under this.`
- `Calories per day` `2200`, hint `Average within 10%.` min 1200 max 4000.
- `Protein per day` `150` `g`, hint `Average at least this.` min 40 max 300.
- `Max cooking time per recipe` `30` `min`, choices as segmented control: 15, 30, 45, 60 (each 44 px).
- `Foods to avoid`: chips (aria-pressed toggles): `fish`, `meat`, `poultry`, `pork`, `dairy`, `egg`, `gluten`, `nuts`, `soy`. Hint `Tap to exclude. "meat" means beef and lamb.` None selected by default.
- `Workouts` with `Plus` badge: heading `Workouts (optional)`, sub `Plus adds pre-workout and post-workout meals around your sessions.` Button `Add workout` adds a `WorkoutRow`: day select (Mon..Sun), start time (`type=time`), kind select (`Strength`, `Cardio`, `Mixed`), minutes number (default 45), `Remove`. Without Plus: rows can be added but the plan shows `Unlock demo to place training meals` note and ignores them.
Validation inline under field, `--over` text + icon-less "Enter a budget between $10 and $500." Disable CTA only while invalid, with reason text beside it.
States: loading none (sync). Empty = defaults prefilled. Error = field level. Persist to account state on change (debounced 500 ms).

### 3.3 Plan (`/plan#plan`)
Purpose: show the week, trust it, drill in. Eye draws to: the week total strip at top: `Receipt total $Y of $B budget` with a thin bar (fill `--save` if fits).
Layout 375: week strip, then vertical list of 7 `DayCard`s (collapsed to day header + totals, tap to expand; Monday open by default). 1200: week strip left-aligned; 7 day columns would be too narrow, so use a 2-column grid of DayCards (4 rows), basket column is separate under tab `Basket` (see 3.4); sticky right column (320 px) holds mini CheckoutGapCard summary.
DayCard: header `Mon` + `<kcal> kcal · <protein> g protein` (`DayTotals`, `.num`). Rows (`MealRow`, min height 64): 56x56 thumb (rounded `--r-md`, `object-fit: cover`), name, line `<time> · <kcal> kcal · <protein> g protein`, slot label. Slot labels: `Breakfast`, `Lunch`, `Dinner`; training slots get a filled badge `Pre-workout` / `Post-workout` (`--ink` bg) plus a line `Strength at 17:30` (uses the workout). Servings > 1 show `x2`.
Tap meal -> `RecipeDialog` (full-screen sheet at 375, centered 640 px dialog at 1200): photo 16:9, name, `<cookMinutes> min · <servings eaten> serving`, per-serving macros, `Ingredients` list (name, grams), `Steps` numbered list, `Source: <name>, <license>` link (`target=_blank rel=noopener`). Close button 44 px, Esc.
States: loading skeleton 7 day cards. Empty (no inputs yet): `EmptyState` "No plan yet. Set your budget and plan the week." + `Go to inputs`. Error: render `DoesNotFit` (3.5) when `ok:false`. Photo load failure: show `--sunk` tile with recipe initial.

### 3.4 Basket and Checkout Gap (`/plan#basket`) , the hero
Purpose: prove the gap between recipe price and receipt price. Eye draws to: the two big numbers and the rust gap between them.

**CheckoutGapCard** (top of the tab, also the right sticky column on desktop, `.card`, thick 2 px `--ink` top border):
- Title `Checkout Gap`
- Two figures side by side (equal width, `.money--big`, dashed vertical rule between): left label `Recipe price` value `$X` (plan.gramCost), caption `What a recipe calculator says: grams used.`; right label `Receipt price` value `$Y` (plan.basketCost), caption `What the register charges: whole packages.`
- Gap row below, full width, `--over-tint` bg: `Checkout Gap` `+$G` (plan.checkoutGap, `--over-deep`, big) and line `You pay $G for food you will not eat this week.` If gap is 0: `No gap this week.` neutral.
- `Where the gap comes from`: top 3 `LeftoverTop3` lines by (cost - gramCost): `<product name>` `<packages> x <packageLabel>` `<gramsLeft> g left` `$<cost - gramCost> unused`. Caption: `Perishable leftovers worth $<perishableLeftValue> may spoil. Week 2 can carry them over.`
- On 375 the two figures stay side by side (each ~160 px, 36 px numerals); labels wrap.
- Budget line: `Receipt $Y of $B budget` + badge `Fits` (`--save`) or `Over by $N` (`--over`).

**BasketTable** (below). Columns at 1200: Product | Packages | Cost | Left | actions. At 375: each line a stacked row (`BasketLine`), dashed rules between:
- Line 1: product name (semibold) and cost right (`.money`).
- Line 2: `2 x 1 lb tray` (`packages x packageLabel`), `Left 340 g` (`.num`, `--over` text only if perishable and left > 50% of a package).
- Line 3: `PriceEdit` and `SwapButton`.
- `PriceEdit`: label `Price per package`, input `$` 5 chars wide, 44 px tall, value = product price. On change, re-solve; Checkout Gap card and totals update live; helper text appears `Price changed from $4.29. Reset`. This demonstrates numbers are computed.
- `SwapButton`: text button `Swap`, adds product to `excludedProductIds` and re-solves. While solving, button shows `Swapping...`. If no valid plan: `DoesNotFit`. Free users: 3 swaps free, then the swap opens the paywall modal (copy: `Unlimited swaps are in Plus.`). Counter text `2 of 3 free swaps left`.
- `BasketTotal` last row: `Receipt total` `$Y`, bold, double dashed rule above.
- Pantry-covered lines (week 2): sub-label `Covered by leftovers: <g> g` in `--save`.
States: loading skeleton 8 lines; empty `No basket until there is a plan.`; error `Could not update price. Kept $<old>.` with retry.

### 3.5 Does not fit
Purpose: be blunt, then give a way out. Eye draws to: the headline sentence.
Replaces the plan area; `role="alert"`. Layout: 375 stacked; 1200 message left (5 col), alternatives right (7 col, three cards in a row if width allows else stacked).
Copy:
- Badge `--over`: `Does not fit`
- H2: `This does not fit your budget.`
- Reason: the solver `reason` sentence verbatim in 19 px, `--ink`. Nothing softened.
- Sub: `Pick one of these verified options, or change the inputs.` Button `Edit inputs`.
`AlternativeCard` (up to 3; omit missing ones; if zero: `No nearby plan works. Try fewer restrictions.`):
- Title = `alt.headline` (`Raise the budget to $71.40`; `Keep your budget with 118 g protein`; `Allow 45 minutes per recipe`). Format numbers in `.money`/`.num`.
- Body: `Receipt $<alt.plan.basketCost> · gap $<alt.plan.checkoutGap> · <average.kcal> kcal, <average.protein> g protein per day`.
- Diff line: what changed vs yours: `Budget $60.00 -> $71.40`.
- Button primary `Use this plan` (applies alt.inputs, shows the plan, scrolls to top). Min 44 px.
States: none beyond; solving shows `Checking options...` on cards.

### 3.6 Week two (`/week2`)
Purpose: show leftovers turning into savings. Eye draws to: the `Waste avoided` counter after the skip.
Layout 375 single column; 1200 two columns: left controls and leftovers, right the next week's mini CheckoutGapCard and comparison.
Before skip:
- H1: `Week 2`
- Explanation: `Leftovers from week 1 count as free groceries in week 2.`
- Button primary `Simulate next week` with sub-label under it, `Demo time skip: advances 7 days, no real waiting.` Badge `Demo` beside the button.
- Preview list of what is in the pantry: `LeftoverList` rows `<product> · <grams> g · keeps <daysLeft> more days` (or `shelf stable`).
After skip:
- `WasteAvoided` counter: big `.money--big.money--save` `$<pantryUsedValue>` with label `Waste avoided`, caption `Leftovers from week 1 used in week 2, valued at store price.` Count-up animation (disabled under reduced motion).
- `LeftoverList` titled `Carried over from week 1` plus a separate muted list `Spoiled and dropped` if any dropped (names, `$` value, `--over-deep`).
- New basket: reuse `CheckoutGapCard` and `BasketTable` for week 2, with line label `Covered by leftovers`.
- Free (not Plus) after pressing `Simulate next week`: show the simulated result blurred? No. Show counter and leftover list, but lock the week-2 plan and basket behind `Paywall` (3.7), placed directly below the counter. So the judge sees value, then the gate.
States: loading short skeleton; empty pantry: `Nothing left over this week. Week 2 starts from zero.`; error `Could not simulate. Your week 1 plan is safe.`

### 3.7 Paywall
Purpose: honest demo of the business model. Eye draws to: Plus column (ink border 2 px, `Best for repeat weeks` badge).
Layout 375: two cards stacked, Plus first. 1200: side by side equal columns, 480 px each.
Copy:
- H2 `Plus keeps the savings going`
- Free card: title `Free`, price `$0`, list: `Week one plan`, `Basket`, `Checkout Gap`, `3 swaps`.
- Plus card: title `Plus`, price `$7.99/month` and `or $59.99/year` (secondary line, `Save $35.89 vs monthly` = 12 x 7.99 - 59.99 = 35.89), list: `Week two onward with leftover carry-over`, `History of every week`, `Training-aware meals`, `Unlimited swaps`.
- Plus button primary `Unlock demo`; line under it, `Demo unlock. No payment, nothing is charged.`
- Plain text (not a button, `--ink-3`, no border): `Sign-in and payment arrive in v2.`
- After unlock: card collapses to a banner `Plus is on (demo).` and the locked content appears. State persists in account state `plus:true`; Account page shows `Plus` badge and a link `Switch back to Free (demo)`.
States: unlocking is instant; if account save fails: `Unlocked on this device only.`

### 3.8 Assistant panel
Purpose: answer money questions with verified numbers, and refuse honestly. Eye draws to: the latest answer.
Layout: 375 bottom sheet to 85 vh, 1200 right drawer 420 px full height; both `--card` bg, `--shadow-2`, scrim `rgba(27,26,23,.4)` on mobile only. Header `Ask Affordly` + close 44 px. Sub `Ask about your budget, swaps, or a recipe.` Input row pinned bottom: text input `Ask something, e.g. "What is the cheapest week with 150 g protein?"` + button `Send`. Three suggested prompt chips when empty: `Cheapest week for my protein`, `Swap the most expensive item`, `A cheap dinner without dairy`.
Messages:
- User: right aligned, `--sunk` bubble.
- `AssistantMessage` (non-refused): left, plain text on `--card`, border `--rule`. Under it, `AnswerSourceLabel` tiny `--ink-3` text: `Template answer` (source `template`) or `AI answer, checked by the solver` (source `model`). Never colored.
- Recipe cards (`RecipeCard`, from `recipeIds`): row with 72 px photo, name, `<cookMinutes> min · <kcal> kcal · <protein> g protein`, tap opens `RecipeDialog`.
- `ApplyPlanButton`: when `proposedInputs` exists: button `Apply this plan`, below a diff line of changed inputs. Applying re-solves and routes to `/plan#plan`. Disabled with `Does not fit` if result is not ok.
- `RefusalMessage` (`refused: true`): `--over-tint` bg, 3 px `--over` left border, badge `Cannot do that`, text verbatim, then if `result.ok===false` a line `Lowest price that works: $<alternatives min-budget plan.basketCost>` in `.money`. For `intent: 'medical'`: add fixed line `Affordly is a planning tool, not medical advice.` For `off-topic`: text verbatim, no extra.
States: loading: three-dot indicator replaced by text `Checking the numbers...` (no animation under reduced motion); error: `Assistant is offline. Your plan still works.` + `Retry`; empty: suggested chips. `aria-live="polite"` on the message list.

### 3.9 Account (`/account`)
Purpose: reassure that there is state without a login. Eye draws to: plan badge.
Layout 375 single column cards; 1200 two columns (identity left 4, history right 8).
- H1 `Your account`
- Card `Guest account`: `Account ID` short form `first 8 chars of id` + `Copy` button (aria-live toast `Copied`); `Restore code` big monospace code with `Copy`; line `Enter this code on another device to open this account.` and field `Restore from a code` + button `Restore`. Restore error: `That code did not match an account.`
- `PlanBadge`: `Free` (neutral) or `Plus` (`--ink`), line `Plan`.
- `HistoryTable` titled `Week history`: columns `Week | Receipt | Gap | Waste avoided` (numbers right-aligned, gap `--over-deep`, waste `--save`). At 375 table scrolls within a wrapper only if needed; prefer 4 compact columns at 14 px. Empty: `No weeks yet. Plan one to start your history.` Free users: history shows only week 1 plus row `Week 2 onward is in Plus.`
- Note, plain text: `Sign-in arrives in v2.`
States: loading skeleton card; error `Could not load your account. Showing this device only.` + `Retry`.

## 4. Build notes
- Import `tokens.css` first in `main.tsx`; delete the Vite starter CSS. Use CSS modules or plain classes, no UI framework.
- Table of key breakpoints: 768 (nav switch, two-column layouts), 1200 (max width).
- One focus owner at a time: dialog over drawer over page.
- Test at 375 x 812 and 1200 x 800; no horizontal scroll at 320.
