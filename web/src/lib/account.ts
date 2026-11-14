import type { AccountResponse, AccountState } from '@affordly/engine';
const stateKey = 'affordly.state.v1';
const accountKey = 'affordly.account.v1';
const apiBase = import.meta.env.VITE_API_BASE?.replace(/\/$/, '');
let identity: {
  id: string;
  restoreCode: string;
} | null = null;
let serverIdentity = false;
let savedToServer = false;
let pendingSync = false;
export function isSavedToServer() {
  return Boolean(identity && savedToServer);
}
function saveStatus(saved: boolean) {
  savedToServer = saved;
  window.dispatchEvent(new Event('affordly:save'));
}
let localState: AccountState;
let pendingLoad: Promise<AccountState> | null = null;
let pendingSave: Promise<void> = Promise.resolve();
export const emptyState: AccountState = {
  inputs: null,
  pantry: [],
  week: 1,
  history: [],
  plus: false,
  currentPlan: null,
};
localState = {
  ...emptyState
};

export function getAccount() {
  return identity;
}
async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${apiBase}/api/account${path}`, {
      method,
      signal: controller.signal,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok)
      throw new Error('Account service unavailable');
    return await response.json() as T;
  } finally {
    clearTimeout(timer);
  }
}
function persistLocal() {
  try {
    localStorage.setItem(stateKey, JSON.stringify({
      ...identity,
      state: localState,
      pendingSync
    }));
    if (serverIdentity)
      localStorage.setItem(accountKey, JSON.stringify(identity));
  } catch {
    // Storage can be blocked; the in-memory account remains usable.
  }
}
function accept(account: AccountResponse) {
  pendingSync = false;
  identity = {
    id: account.id,
    restoreCode: account.restoreCode
  };
  serverIdentity = true;
  localState = {
    ...emptyState,
    ...account.state
  };
  persistLocal();
}
async function initialize(): Promise<AccountState> {
  try {
    const saved = localStorage.getItem(stateKey);
    if (saved) {
      const data = JSON.parse(saved);
      pendingSync = data.pendingSync === true;
      if (data.state)
        localState = {
          ...emptyState,
          ...data.state
        };
      if (data.id && data.restoreCode)
        identity = {
          id: data.id,
          restoreCode: data.restoreCode
        };
    }
    const savedAccount = localStorage.getItem(accountKey);
    if (savedAccount) {
      const data = JSON.parse(savedAccount);
      if (data.id && data.restoreCode) {
        identity = {
          id: data.id,
          restoreCode: data.restoreCode
        };
        serverIdentity = true;
      }
    }
  } catch {
    // Fall back to this session if storage is unavailable or corrupt.
  }
  if (apiBase) {
    try {
      if (serverIdentity && identity) {
        const saved = localState;
        const keepLocal = pendingSync;
        accept(await request<AccountResponse>('/' + encodeURIComponent(identity.id)));
        if (keepLocal) {
          localState = saved;
          pendingSync = true;
          persistLocal();
        }
      } else {
        const account = await request<AccountResponse>('', 'POST');
        // Preserve a week already saved on this device when creating its server account.
        const saved = localState;
        accept(account);
        localState = saved;
        pendingSync = true;
        persistLocal();
      }
    } catch {
      // Network failures never discard the locally saved week.
    }
  }
  identity ??= {
    id: crypto.randomUUID(),
    restoreCode: crypto.randomUUID().slice(0, 8).toUpperCase(),
  };
  return localState;
}

export function loadState(): Promise<AccountState> {
  pendingLoad ??= initialize();
  return pendingLoad;
}
export function cacheState(state: AccountState) {
  localState = state;
  pendingSync = true;
  saveStatus(false);
  persistLocal();
}
export function saveState(state: AccountState): Promise<void> {
  cacheState(state);
  if (!apiBase) return Promise.resolve();
  // Keep writes in order when the network is slower than the store debounce.
  pendingSave = pendingSave.then(async () => {
    try {
      if (!serverIdentity) {
        const account = await request<AccountResponse>('', 'POST');
        identity = { id: account.id, restoreCode: account.restoreCode };
        serverIdentity = true;
        persistLocal();
      }
      await request(`/${encodeURIComponent(identity!.id)}`, 'PUT', state);
      if (localState === state) {
        pendingSync = false;
        saveStatus(true);
        persistLocal();
      }
    } catch {
      saveStatus(false);
      // The local save already succeeded, even while the server is down.
    }
  });
  return pendingSave;
}
export async function restore(code: string): Promise<boolean> {
  if (!apiBase)
    return false;
  try {
    await pendingSave;
    accept(await request<AccountResponse>('/restore', 'POST', {
      code: code.trim()
    }));
    pendingLoad = Promise.resolve(localState);
    return true;
  } catch {
    return false;
  }
}
