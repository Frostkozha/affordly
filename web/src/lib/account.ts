import type { AccountState } from '@affordly/engine';
const key = 'affordly.state.v1';
let identity: { id: string; restoreCode: string } | null = null;
export const emptyState: AccountState = { inputs: null, pantry: [], week: 1, history: [], plus: false, currentPlan: null };
export function getAccount() { return identity; }
export async function loadState(): Promise<AccountState> {
  // Integration: GET /api/account/:id, or POST /api/account for a new guest.
  try {
    const saved = localStorage.getItem(key);
    if (saved) { const data = JSON.parse(saved); if (data.state && data.id && data.restoreCode) { identity = { id: data.id, restoreCode: data.restoreCode }; return { ...emptyState, ...data.state }; } }
  } catch { /* Storage blocked: keep a usable in-memory guest. */ }
  identity ??= { id: crypto.randomUUID(), restoreCode: crypto.randomUUID().slice(0, 8).toUpperCase() };
  return { ...emptyState };
}
export async function saveState(state: AccountState): Promise<void> {
  // Integration: PUT /api/account/:id. Restore will POST /api/account/restore.
  try { localStorage.setItem(key, JSON.stringify({ ...identity, state })); } catch { /* Saved on this device only, for this session. */ }
}
