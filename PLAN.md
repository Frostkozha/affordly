# NutriCart — build plan

Business Cup 2.0 · Money track · deadline 15 November, 12:00 (Almaty).

## Product in one line

NutriCart plans a week of meals that fits a grocery budget, priced by the whole
packages a store actually sells, not by recipe grams.

> Other planners price your recipes. NutriCart prices your receipt.

## User and pain

- **User:** Alex, 29, works full time, lives alone, spends about $80 a week on
  groceries, cooks 30 minutes or less, wants enough protein.
- **Pain:** the grocery bill is higher than the plan. A plan "for $63" becomes
  an $80 receipt because stores sell packages, and the unused half spoils.
- **Next users (deck only):** couples and families, same engine, bigger basket.

## What the product does

1. Weekly plan for a budget, calories, protein and cooking time.
2. Shopping list in real packages.
3. **Checkout Gap:** price by recipe grams against price of the real basket.
4. **Budget Lock:** the budget is a hard limit. If it does not fit, the product
   says so and offers the three nearest plans that work.
5. One-click product swap with a full recalculation.
6. **Leftover carry-over:** what is left goes into next week's plan.

## Changes from the first plan

| # | Fix | Why |
|---|---|---|
| 1 | Real prices from one US store and one zip code, labelled with store and date | The core value must be real, not demo data |
| 2 | Money first: the bill overrun is the pain, nutrition is a setting | Money track; "meal planner" reads as a health app |
| 3 | Paywall on week two onward (carry-over, history); week one is free | Every user reaches it, and the reason to return is the reason to pay |
| 4 | Plus costs $7.99 a month or $59.99 a year | Value-based price; makes LTV exceed CAC |
| 5 | Deck shows the path from Alex to couples and families | The brief names working adults with families and bills |

## How it is built

- **Static site:** Vite, React, TypeScript. Everything runs in the browser.
- **Optimizer:** integer program over recipes and whole packages. Hard limits:
  budget, calories, protein, cooking time, excluded foods. Objective: basket
  cost plus a penalty for perishable leftovers and repeated meals.
- **Verifier:** separate code recomputes cost, nutrients and coverage from the
  result. A mismatch is never shown to the user.
- **"Does not fit" mode:** three extra solves — minimum budget, maximum protein
  for this budget, cooking time that unlocks a plan.
- **State:** localStorage (pantry, week history, Plus flag). No accounts.
- **Data:** about 40 products and 20 recipes in JSON; nutrients from USDA
  FoodData Central. Any price can be edited and everything recalculates.
- **Hosting:** GitHub Pages. No server and no secret keys.
- **Paywall:** Free and Plus side by side, "Unlock demo" button. A Stripe test
  payment link is optional.
- **No AI text layer.** The form covers all inputs.

## Jury path (two minutes, no login)

1. Landing: "Plan my week" or "Try with sample", plus a three-line judge guide.
2. Inputs: budget, calories, protein, cooking time, foods to avoid.
3. Plan and basket with the Checkout Gap card.
4. Lower the budget from $80 to $60: "does not fit" and three working options.
5. Swap chicken for eggs or tofu: totals recalculate.
6. "Simulate next week": leftovers enter week two, and the paywall appears.

## Schedule (Almaty time)

| When | Work | Done when |
|---|---|---|
| 17:00–17:30 | Repo, first commit, empty page live | Public link opens |
| 17:30–20:00 | Catalog with real prices, recipes, data schema | JSON passes validation |
| 17:30–23:00 | Optimizer, Checkout Gap, verifier, tests | Numbers match hand calculation on 5 inputs |
| 20:00–01:00 | Onboarding, plan, basket, swap, "does not fit" | Main path works end to end |
| 01:00–02:30 | Paywall, carry-over, "Simulate next week" | Return loop and unlock work |
| 06:30–09:30 | Phone layout, full run as the jury, bug fixes | Checklist below passes |
| 09:30–10:45 | Deck PDF, README, secret scan | All three items ready |
| 10:45–11:30 | Captain submits | Sent 30 minutes early |

## Cut order if time runs out

Stripe test link → "Skip a dinner" → copy summary → calendar reminder.

Never cut: optimizer with Checkout Gap, paywall, carry-over, sample entry,
live deploy, deck.

## Submission checklist

- [ ] Link opens in a private window, no login, on phone and desktop.
- [ ] Main path works with the sample and with the jury's own inputs.
- [ ] Changing budget, protein, a meal or a price changes the result.
- [ ] Paywall shows the price and can be passed with "Unlock demo".
- [ ] Leftovers carry into the next week.
- [ ] No dead buttons; estimates and hypotheses are labelled.
- [ ] English interface, with "Planning tool, not medical or dietary advice".
- [ ] Public repo with full source, README, no keys.
- [ ] Deck: PDF, English, 10 slides or fewer.
- [ ] No deploys after submission until the final ends.
