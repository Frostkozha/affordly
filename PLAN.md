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
7. **Training-aware meals (Plus):** the user enters the week's workouts (day,
   start time, type). On a training day the plan places a carbohydrate-rich
   meal 2–3 hours before the session and a protein-dense meal after it, and
   raises that day's calories. Rest days stay lighter. All of it still has to
   fit the budget.

## Changes from the first plan

| # | Fix | Why |
|---|---|---|
| 1 | Real prices from one US store and one zip code, labelled with store and date | The core value must be real, not demo data |
| 2 | Money first: the bill overrun is the pain, nutrition is a setting | Money track; "meal planner" reads as a health app |
| 3 | Paywall on week two onward (carry-over, history); week one is free | Every user reaches it, and the reason to return is the reason to pay |
| 4 | Plus costs $7.99 a month or $59.99 a year | Value-based price; makes LTV exceed CAC |
| 5 | Deck shows the path from Alex to couples and families | The brief names working adults with families and bills |
| 6 | Training-aware meals from a workout schedule the user enters | A second reason to pay and to return each week, since the schedule changes |

### Sports app integrations: roadmap, not in this build

Strava, Garmin and Apple Health sync goes on the roadmap slide. It is not built
now, for three reasons:

- **Apple Health** has no web access at all; it only works from an iPhone app,
  and mobile apps fail the web-only rule.
- **Garmin** gives API access only after a business application that takes days.
- **Strava** needs a server, a login, and approval before more than one athlete
  can connect. The jury must be able to use the product without any login.

The product takes the same information by hand: a short workout schedule. No
"Connect" button is shown, because a button that does nothing costs points.

## How it is built

- **Static site:** Vite, React, TypeScript. Everything runs in the browser.
- **Optimizer:** integer program over recipes and whole packages. Hard limits:
  budget, calories, protein, cooking time, excluded foods. Objective: basket
  cost plus a penalty for perishable leftovers and repeated meals.
- **Verifier:** separate code recomputes cost, nutrients and coverage from the
  result. A mismatch is never shown to the user.
- **"Does not fit" mode:** three extra solves — minimum budget, maximum protein
  for this budget, cooking time that unlocks a plan.
- **Training-aware meals:** each recipe gets a tag from its own nutrients
  (carbohydrate-rich and low in fat, or protein-dense). The optimizer must pick
  at least one of each per training day; a scheduler then places them around
  the workout time. The verifier checks the placement too.
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
6. Add a workout (for example Tuesday 18:00, strength): that day shows a
   carbohydrate-rich meal at about 15:30 and a protein-dense dinner after.
7. "Simulate next week": leftovers enter week two, and the paywall appears.

## Schedule (Almaty time)

| When | Work | Done when |
|---|---|---|
| 17:00–17:30 | Repo, first commit, empty page live | Public link opens |
| 17:30–20:00 | Catalog with real prices, recipes, data schema | JSON passes validation |
| 17:30–23:00 | Optimizer, Checkout Gap, verifier, tests | Numbers match hand calculation on 5 inputs |
| 20:00–01:00 | Onboarding, plan, basket, swap, "does not fit" | Main path works end to end |
| 01:00–02:30 | Paywall, carry-over, "Simulate next week" | Return loop and unlock work |
| 02:30–04:00 | Workout schedule, recipe tags, meal placement around training | A training day shows the right meals at the right times |
| 06:30–09:30 | Phone layout, full run as the jury, bug fixes | Checklist below passes |
| 09:30–10:45 | Deck PDF, README, secret scan | All three items ready |
| 10:45–11:30 | Captain submits | Sent 30 minutes early |

## Cut order if time runs out

Stripe test link → "Skip a dinner" → copy summary → calendar reminder →
training-aware meals (cut last, and only if the main path is not solid).

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
