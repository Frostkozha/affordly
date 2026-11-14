# Affordly

Affordly plans a week of meals inside a grocery budget and prices the receipt by the whole packages a store really sells, not by the grams a recipe uses. The gap between the two numbers is the **Checkout Gap**. Built for Business Cup 2.0, Money track (team Sigea).

**Live site (no login):** https://affordly.pages.dev

## Try it in 60 seconds

1. Open the live site and click **Try with sample**. It loads a pre-solved week: budget $95, receipt $85.05, recipe price $56.13, Checkout Gap $28.92, $9.95 left.
2. Go to the **Plan** tab. Read the **Checkout Gap** card in the side panel.
3. Click **See the whole basket** to open **Your basket**.
4. Click **Swap** on any basket line. The meals and totals recalculate without that product.
5. Click **Plan next week**, then **Simulate next week**. This is a demo time skip: it moves 7 days forward, and leftovers from week one carry into week two.
6. Go to the **Discover** tab to swipe through meal cards.
7. Click **Ask Affordly** in the top bar (shown on every page except the landing page). It answers plan and budget questions from the solver result.

Plus is a demo unlock. The page says "No payment, nothing is charged."

## How it works

- **Inputs.** Budget, calories per day, protein, carbs and fat per day, maximum cooking time, foods to avoid, and optional workouts (day, start time, type, length).
- **Solver.** The plan is a mixed-integer program solved with HiGHS, an open-source solver compiled to WebAssembly. It runs in a Web Worker in the browser (`web/src/lib/solver.worker.ts`). The model is in `packages/engine/src/optimize.ts` and `lp.ts`.
- **Hard constraints.** Exactly 21 meals (3 per day for 7 days). Weekly calories within 10% of the target. Weekly protein at or above the target. Weekly carbs and fat within 15% of their targets, when set. Basket cost at or below the budget. At most 6 packages of any one product. No more than the chosen number of repeats per recipe (2 to 4, default 3). Pantry stock is a limit on what can be used.
- **Pricing by package.** The basket cost counts whole packages from the catalog. The gram cost counts only the grams the recipes use. Checkout Gap = basket cost minus gram cost. Perishable packages count double in the objective, which discourages buying food that will spoil.
- **Training days.** Each recipe is tagged from its own nutrients (carbohydrate-rich, or protein-dense). On a training day the schedule places a carbohydrate-rich meal about 2.5 hours before the workout and a protein-dense meal after it (`packages/engine/src/schedule.ts`).
- **Verifier.** A separate function recomputes cost, nutrients, meal placement and the Checkout Gap from the plan (`packages/engine/src/verify.ts`). A plan that fails the check is not shown.
- **Does not fit.** If no plan meets the budget, the engine solves again for alternatives: minimum budget that works, maximum protein at this budget, more cooking time, and closest macros (`packages/engine/src/infeasible.ts`).
- **Assistant.** A Cloudflare Worker pipeline (`worker/src/assistant/`): classify the question, retrieve recipes, call the solver, write a short answer with Workers AI, then verify that every number in the answer appears in the solver result. Medical questions get a refusal that points to a doctor or dietitian. If the API is not configured, the browser answers with a local checked template.
- **Accounts.** No sign-in. The browser keeps a random guest id, and the state is stored on the Worker in D1. The id is the only credential.

## Architecture

```
packages/engine/   Shared TypeScript engine: types, optimizer (optimize.ts), HiGHS adapter (lp.ts),
                   verifier, does-not-fit alternatives, training schedule, pantry, API contract, tests
web/               Vite + React + TypeScript site (the jury-facing app)
  src/components/  Screens and cards: Landing, PlanView, CheckoutGapCard, BasketTable, Discover, AssistantDrawer
  src/lib/         Store, engine wrapper, Web Worker solver, assistant client, account storage
  scripts/         contrast.mjs (WCAG contrast check for both themes)
worker/            Cloudflare Worker API (wrangler.toml, schema.sql)
  src/index.ts     Router: /api/health, /api/account, /api/assistant, /api/creators, /api/kroger/*
  src/account.ts   Guest accounts in D1
  src/assistant/   Assistant pipeline (classify, route, retrieve, generate, verify, quota)
  src/creators.ts  Creator application form
  src/kroger.ts    Kroger API proxy routes (the web app does not call them; prices come from the snapshot)
data/              catalog.json (products and prices), recipes.json (40 recipes),
                   sample-plan.json (pre-solved sample), kroger-snapshot.json, SOURCES.md
scripts/           kroger-snapshot.mjs (refresh prices), validate-data.mjs (check JSON data)
docs/              sources.md (market and unit-economics research), survey.md
```

## Run locally

Requires Node.js 22.

```bash
npm install                      # install all workspaces
npm run dev                      # start the web app (Vite dev server)
npm test                         # run tests in packages/engine and worker (vitest)
npx vitest run packages worker   # the same test run, explicit paths (151 tests)
npm run build                    # production build of the web app into web/dist
npm run validate-data            # check the JSON data files
node web/scripts/contrast.mjs    # WCAG contrast table for both themes
```

Refresh the pre-solved sample after changing the catalog, recipes or defaults:

```bash
UPDATE_SAMPLE=1 npx vitest run packages/engine/src/sample.test.ts
```

Worker: `npm run dev -w worker` runs `wrangler dev`. It needs your own Cloudflare account, the D1 database, and the Kroger and Workers AI bindings. Secrets are set with `wrangler secret put` and are never stored in this repository. Without them the Kroger endpoints return 503, and the assistant falls back to the local template.

## Data and sources

- **Products and prices.** Prices come from one store: Kroger On the Rhine, Cincinnati, OH (zip 45202), snapshot taken 14 November 2026 through the Kroger Developer API certification environment. 38 of 39 products matched; romaine is an estimate (`priceEstimated: true`). Size conversions and item choices are listed in `data/SOURCES.md`.
- **Nutrition.** Per-100 g values come from USDA FoodData Central, SR Legacy dataset. Canned beans use the whole can; tuna uses drained solids. Details and FDC IDs are in `data/SOURCES.md`.
- **Recipes.** 40 recipes are adapted from USDA MyPlate Kitchen. `data/SOURCES.md` states that MyPlate is a US government work in the public domain, lists each change made, and gives the photo URLs. The photo for `lentil-chili` is not from MyPlate: it is a Wikimedia Commons photo under CC BY-SA 2.5, as credited in `data/SOURCES.md`. Oats are tagged gluten and are not certified gluten-free.
- **Fonts.** Fraunces, Geist and Geist Mono, self-hosted, SIL Open Font License 1.1.
- **Market research.** `docs/sources.md` holds the market size, benchmark and unit-economics research. It marks each figure VERIFIED or UNVERIFIED. The app does not use it.

## Limits

- **One store, one snapshot.** Prices are for one store in one zip code, taken on one day. They are not live. Other stores and dates will give different totals.
- **Planning tool, not medical or dietary advice.** Calorie and macro targets are inputs the user sets. The assistant refuses medical questions.
- **Demo features.** Plus is an unlock button with no payment. "Simulate next week" is a demo time skip, not a real wait.
- **Approximate nutrition.** Recipe nutrition is computed from catalog ingredients, not from a lab analysis. Cooking times are estimates written from the recipe steps.
- **Assistant depends on its model.** Its answers come from the solver result. If the Worker or the model is unavailable, the app still plans, prices and checks fit in the browser.
