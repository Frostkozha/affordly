import { expect, it } from 'vitest';
import { account } from './account';
import type { Env } from './http';
import { fixtureInputs } from '../../packages/engine/src/fixtures';

const url = new URL('https://example.com/api/account/' + 'a'.repeat(32));
const state = {
  inputs: fixtureInputs, pantry: [], week: 1, history: [], plus: false, currentPlan: null,
};
function database() {
  let saved: typeof state;
  const env = { DB: { prepare: () => ({
    bind(value: string) { saved = JSON.parse(value); return this; },
    run: async () => ({ meta: { changes: 1 } }),
  }) } } as unknown as Env;
  return { env, saved: () => saved };
}
const request = (inputs: unknown) => new Request(url, {
  method: 'PUT', body: JSON.stringify({ ...state, inputs }),
});

it('stores missing likes as an empty array and preserves valid likes', async () => {
  const db = database();
  expect((await account(request(fixtureInputs), db.env, url))?.status).toBe(200);
  expect(db.saved().inputs.likedRecipeIds).toEqual([]);
  const inputs = { ...fixtureInputs, likedRecipeIds: ['dinner'] };
  expect((await account(request(inputs), db.env, url))?.status).toBe(200);
  expect(db.saved().inputs.likedRecipeIds).toEqual(['dinner']);
});
it.each(['avoid', 'excludedProductIds', 'excludedRecipeIds', 'likedRecipeIds'])(
  'caps account input array %s', async key => {
    const db = database();
    await expect(account(request({ ...fixtureInputs, [key]: Array(61).fill('x') }), db.env, url))
      .rejects.toMatchObject({ status: 400 });
  },
);
it.each([null, [1], ['x'.repeat(81)]])('rejects invalid account likes %j', async likedRecipeIds => {
  const db = database();
  await expect(account(request({ ...fixtureInputs, likedRecipeIds }), db.env, url))
    .rejects.toMatchObject({ status: 400 });
});
