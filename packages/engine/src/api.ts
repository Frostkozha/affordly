// HTTP contract between web/ and worker/. All bodies are JSON. Base path: /api
import type { Inputs, PantryItem, Plan, SolveResult } from './types';

// ---------- guest accounts ----------
// POST /api/account                      -> AccountResponse   (creates a guest account)
// GET  /api/account/:id                  -> AccountResponse
// PUT  /api/account/:id   body: AccountState -> { ok: true }
// POST /api/account/restore  body: { code: string } -> AccountResponse
// The id is a random 128-bit token kept in the browser. It is the only credential.

export interface AccountState {
  inputs: Inputs | null;
  pantry: PantryItem[];
  week: number; // 1 = first week
  history: { week: number; basketCost: number; checkoutGap: number; pantryUsedValue: number }[];
  plus: boolean;
  currentPlan: Plan | null;
}

export interface AccountResponse {
  id: string;
  restoreCode: string; // short code to open the account on another device
  createdAt: string;
  state: AccountState;
}

// ---------- Kroger ----------
// GET /api/kroger/locations?zip=45202          -> { locations: { locationId, name, address }[] }
// GET /api/kroger/products?term=&locationId=   -> { products: { productId, description, size, price }[] }

// ---------- assistant ----------
// POST /api/assistant  body: AssistantRequest -> AssistantResponse

export interface AssistantRequest {
  accountId: string;
  message: string;
  inputs: Inputs;
  pantry: PantryItem[];
}

export type AssistantIntent = 'budget' | 'plan-change' | 'recipe' | 'off-topic' | 'medical';

export interface AssistantResponse {
  intent: AssistantIntent;
  text: string;
  refused: boolean; // true when the request cannot be met as asked
  recipeIds: string[]; // recipe cards to show, with photos
  proposedInputs?: Inputs; // "apply this" button
  result?: SolveResult; // solver output the text is based on
  source: 'model' | 'template'; // template = fallback or verifier blocked the model text
}
