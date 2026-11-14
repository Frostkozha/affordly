// Shared contracts for Affordly. Frozen at 19:00 on 14 Nov: change only through the main session.
// All weights are grams (liquids too, 1 ml = 1 g; eggs etc. are stored by weight).
// All money is US dollars. Days are 0 (Monday) to 6 (Sunday).

export interface Macros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

// ---------- data ----------

export interface Product {
  id: string; // kebab-case, e.g. "chicken-breast"
  name: string; // as shown in the basket, e.g. "Chicken breast, boneless"
  category: 'protein' | 'dairy' | 'produce' | 'grain' | 'pantry' | 'frozen';
  packageGrams: number; // size of ONE package as sold
  packageLabel: string; // e.g. "1 lb tray", "dozen", "32 oz tub"
  price: number; // price of ONE package
  perishableDays: number | null; // days it keeps once bought; null = shelf stable
  per100g: Macros;
  kroger?: { productId: string; description: string; size: string };
  priceEstimated?: boolean; // true when no store item matched and the price is our estimate
}

export interface Catalog {
  store: { name: string; locationId?: string; zip?: string };
  priceSource: 'kroger' | 'demo';
  pricedAt: string; // ISO date
  products: Product[];
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Recipe {
  id: string;
  name: string;
  description: string; // one sentence
  mealTypes: MealType[];
  servings: number; // servings the full recipe makes
  cookMinutes: number; // total active + cooking time
  ingredients: { productId: string; grams: number }[]; // for the FULL recipe
  perServing: Macros; // must equal the sum of ingredients / servings (verifier checks, 5% tolerance)
  contains: string[]; // lower-case avoid tags: "fish", "meat", "poultry", "dairy", "egg", "gluten", "nuts", "soy", "pork"
  steps: string[];
  photo: string; // path under /recipes/, e.g. "/recipes/chicken-rice-bowl.jpg"
  source: { name: string; url: string; license: string };
}

// ---------- inputs ----------

export interface Workout {
  day: number; // 0..6
  start: string; // "HH:MM", 24h
  kind: 'strength' | 'cardio' | 'mixed';
  minutes: number;
}

export interface Inputs {
  budget: number; // weekly, hard limit
  kcalPerDay: number;
  proteinPerDay: number; // grams
  maxCookMinutes: number; // per recipe
  avoid: string[]; // tags matched against Recipe.contains
  workouts: Workout[]; // empty = training-aware placement off
  excludedProductIds: string[]; // set by "swap"
  excludedRecipeIds: string[]; // also holds recipes the user swiped left on in Discover
  likedRecipeIds?: string[]; // recipes the user swiped right on; the optimizer prefers them
  maxRepeats?: 2 | 3 | 4; // variety: how often one recipe may appear in a week (default 3; 4 is cheapest)
}

export interface PantryItem {
  productId: string;
  grams: number;
  daysLeft: number | null; // null = shelf stable
}

// ---------- outputs ----------

export type Slot = 'breakfast' | 'lunch' | 'dinner' | 'pre-workout' | 'post-workout';

export interface PlannedMeal {
  day: number;
  slot: Slot;
  time: string; // "HH:MM"
  recipeId: string;
  servings: number; // recipe servings eaten at this meal: 1 to 3 in half steps, sized to a third of the daily calories
}

export interface BasketLine {
  productId: string;
  gramsNeeded: number; // used by the week's recipes
  gramsFromPantry: number; // covered by leftovers, free
  packages: number; // whole packages bought
  cost: number; // packages * price
  gramCost: number; // (gramsNeeded - gramsFromPantry) priced per gram, the "recipe price"
  gramsLeft: number; // left after the week
}

export interface Plan {
  meals: PlannedMeal[];
  basket: BasketLine[];
  basketCost: number; // what the receipt says
  gramCost: number; // what a recipe calculator says
  checkoutGap: number; // basketCost - gramCost
  days: Macros[]; // length 7
  average: Macros; // per day
  pantryAfter: PantryItem[]; // leftovers that carry to next week
  perishableLeftValue: number; // dollars of perishable leftovers (waste risk)
  pantryUsedValue: number; // dollars of earlier leftovers used this week ("waste avoided")
}

export type AlternativeKind = 'min-budget' | 'max-protein' | 'more-cook-time';

export interface Alternative {
  kind: AlternativeKind;
  headline: string; // e.g. "Raise the budget to $71.40"
  inputs: Inputs; // the changed inputs that work
  plan: Plan;
}

export type SolveResult =
  | { ok: true; plan: Plan }
  | {
      ok: false;
      reason: string; // plain sentence, numbers from the solver
      alternatives: Alternative[]; // 0..3, each one verified
    };

export interface VerifyReport {
  ok: boolean;
  errors: string[]; // empty when ok
}

// ---------- engine API (implemented in this package) ----------
//
// solve(inputs, catalog, recipes, pantry): SolveResult
//   Never returns a plan that fails verify(). On no solution, runs three more solves for the alternatives.
// verify(plan, inputs, catalog, recipes, pantry): VerifyReport
//   Independent recomputation. Must not import from the optimizer.
// swapProduct(inputs, productId): Inputs            adds to excludedProductIds
// nextWeekPantry(plan, daysElapsed = 7): PantryItem[]   ages leftovers, drops spoiled ones
//
// Feasibility rules (shared by optimizer and verifier):
//   basketCost <= budget
//   average.kcal within +-10% of kcalPerDay; every day within +-20%
//   average.protein >= proteinPerDay; every day >= 85% of proteinPerDay
//   every recipe cookMinutes <= maxCookMinutes and none of inputs.avoid in recipe.contains
//   3 meals a day (breakfast, lunch, dinner); a recipe at most 3 times a week;
//   at most 6 packages of any one product (variety: no week built on 12 cans of tuna)
//   liked recipes are preferred through the objective only; they never override a hard limit
//   for every product: gramsNeeded <= gramsFromPantry + packages * packageGrams
//   with workouts: on each workout day one meal is "pre-workout" 2-3 h before start
//   (carbs >= 45% of its kcal, fat <= 30%) and the first meal after the session is
//   "post-workout" (protein >= 30 g in the meal). They replace the nearest regular slot.
