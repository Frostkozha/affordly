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

// Two steps, because the optimizer runs in the browser:
//  1. The client sends the message. For a budget or plan-change question the reply carries
//     `needsSolve` (the inputs the user is asking about) and no final text.
//  2. The client solves those inputs and sends the same message again with `asked` and `result`.
//     The reply is then written from that solver result only.
export interface AssistantRequest {
  accountId: string;
  message: string;
  inputs: Inputs;
  pantry: PantryItem[];
  asked?: Inputs; // step 2: the inputs that were solved
  result?: SolveResult; // step 2: what the solver returned for `asked`
}

export type AssistantIntent = 'budget' | 'plan-change' | 'recipe' | 'off-topic' | 'medical';

export interface AssistantResponse {
  intent: AssistantIntent;
  text: string;
  refused: boolean; // true when the request cannot be met as asked
  recipeIds: string[]; // recipe cards to show, with photos
  needsSolve?: Inputs; // step 1 only: solve these and call again
  proposedInputs?: Inputs; // "apply this" button
  result?: SolveResult; // solver output the text is based on
  source: 'model' | 'template'; // template = fallback or verifier blocked the model text
  note?: string; // why a template was used instead of model text
}

// ---------- creators ----------
// POST /api/creators  body: CreatorApplication -> { ok: true }
// Creators get a free Plus plan in exchange for a set number of videos a month.

export interface CreatorApplication {
  name: string; // 1-80 chars
  platform: 'tiktok' | 'instagram' | 'youtube' | 'other';
  handle: string; // profile handle or link, 1-120 chars; this is how we contact them
  followers: 'under-1k' | '1k-10k' | '10k-100k' | 'over-100k';
  note: string; // 0-500 chars
}
