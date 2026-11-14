import { readFile, writeFile } from 'node:fs/promises';

async function main() {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--zip', '--location', '--probe'].includes(args[i]) || !args[i + 1] || options[args[i]]) throw new Error('Usage: --zip 45202 | --location <8-digit id>, optionally --probe "chicken breast"');
    options[args[i]] = args[i + 1];
  }
  const zip = options['--zip'];
  const location = options['--location'];
  const probe = options['--probe'];
  if ((zip && location) || (!zip && !location && !probe) || (zip && !/^\d{5}$/.test(zip)) || (location && !/^\d{8}$/.test(location))) throw new Error('Supply a 5-digit --zip or an 8-digit --location (or --probe alone).');
  const { KROGER_CLIENT_ID: id, KROGER_CLIENT_SECRET: secret } = process.env;
  if (!id || !secret) throw new Error('Set KROGER_CLIENT_ID and KROGER_CLIENT_SECRET in the environment.');
  const base = process.env.KROGER_BASE || 'https://api-ce.kroger.com';
  const auth = await fetch(`${base}/v1/connect/oauth2/token`, {
    method: 'POST', headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials&scope=product.compact',
  });
  if (!auth.ok) throw new Error(`Store authentication failed (${auth.status}).`);
  const { access_token: token } = await auth.json();
  if (typeof token !== 'string') throw new Error('Invalid authentication response.');
  async function get(path, params) {
    const response = await fetch(`${base}/v1/${path}${params ? `?${new URLSearchParams(params)}` : ''}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error(`Store request failed (${response.status}).`);
    return (await response.json()).data;
  }
  let store;
  if (zip || location) {
    store = location ? await get(`locations/${location}`) : (await get('locations', { 'filter.zipCode.near': zip, 'filter.limit': '1' }))[0];
    if (!store?.locationId) throw new Error('No store found.');
    if (!probe) console.log(`${store.name} (${store.locationId})`);
  }
  async function search(term) {
    const params = { 'filter.term': term, 'filter.limit': '5' };
    if (store) params['filter.locationId'] = store.locationId;
    return get('products', params);
  }
  if (probe) { console.log(JSON.stringify(await search(probe), null, 2)); return; }
  const catalog = JSON.parse(await readFile(new URL('../data/catalog.json', import.meta.url), 'utf8'));
  const matches = [], unmatched = [];
  for (const product of catalog.products) {
    const found = await search(product.kroger?.description ?? product.name);
    console.log(`\n${product.id}`);
    for (const item of found) console.log(JSON.stringify({ productId: item.productId, description: item.description, size: item.items?.[0]?.size ?? null, price: item.items?.[0]?.price?.regular ?? null }));
    const picked = found.find(item => Number.isFinite(item.items?.[0]?.price?.regular));
    if (picked) matches.push({ productId: product.id, krogerProductId: picked.productId, description: picked.description, size: picked.items?.[0]?.size ?? null, price: picked.items[0].price.regular });
    else unmatched.push(product.id);
  }
  await writeFile(new URL('../data/kroger-snapshot.json', import.meta.url), JSON.stringify({ store: { name: store.name, locationId: store.locationId, ...(zip ? { zip } : {}) }, pricedAt: new Date().toISOString(), matches, unmatched }, null, 2) + '\n');
}
main().catch(error => {
  // Fetch errors can contain URLs; report only our controlled messages.
  console.error(error instanceof TypeError ? 'Network or response error.' : error.code ? 'Could not read or write snapshot data.' : error.message);
  process.exitCode = 1;
});
