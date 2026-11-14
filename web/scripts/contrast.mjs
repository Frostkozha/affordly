// WCAG contrast table for both themes. Run: node web/scripts/contrast.mjs
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/tokens.css', import.meta.url), 'utf8');

function vars(block) {
  const out = {};
  for (const [, name, value] of block.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)) out[name] = value;
  return out;
}

const plain = [...css.matchAll(/^:root \{([\s\S]*?)^\}/gm)].map(m => m[1]).join('\n');
const darkAttr = css.match(/:root\[data-theme="dark"\] \{([\s\S]*?)^\}/m)[1];
const darkMedia = css.match(/:root:not\(\[data-theme="light"\]\) \{([\s\S]*?)^ {2}\}/m)[1];
const light = vars(plain);
const dark = { ...light, ...vars(darkAttr) };
const sameDark = JSON.stringify(vars(darkAttr)) === JSON.stringify(vars(darkMedia));
console.log('dark attribute block equals media block:', sameDark);

const lum = hex => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const rings = ['#ff6b5e', '#ffc23d', '#4cc3ff', '#c08bff'];
// [label, foreground, background, minimum]. A leading "$" means a token name.
const pairs = [
  ['ink on paper', '$ink', '$paper', 4.5],
  ['ink on card', '$ink', '$card', 4.5],
  ['ink on sunk', '$ink', '$sunk', 4.5],
  ['ink-2 on paper', '$ink-2', '$paper', 4.5],
  ['ink-2 on card', '$ink-2', '$card', 4.5],
  ['ink-3 on paper', '$ink-3', '$paper', 4.5],
  ['ink-3 on card', '$ink-3', '$card', 4.5],
  ['ink-3 on sunk', '$ink-3', '$sunk', 4.5],
  ['paper on ink (chip, toast)', '$paper', '$ink', 4.5],
  ['primary button: save-ink on save', '$save-ink', '$save', 4.5],
  ['primary hover: save-ink on save-deep', '$save-ink', '$save-deep', 4.5],
  ['primary active: save-ink on active', '$save-ink', '$btn-primary-bg-active', 4.5],
  ['danger button: over-ink on over', '$over-ink', '$over', 4.5],
  ['danger hover: over-ink on over-deep', '$over-ink', '$over-deep', 4.5],
  ['danger active: over-ink on active', '$over-ink', '$btn-danger-bg-active', 4.5],
  ['secondary button: ink on sunk (hover)', '$ink', '$sunk', 4.5],
  ['save on paper (money)', '$save', '$paper', 4.5],
  ['save on card', '$save', '$card', 4.5],
  ['over on paper (errors)', '$over', '$paper', 4.5],
  ['over on card', '$over', '$card', 4.5],
  ['save-deep on save-tint (badge)', '$save-deep', '$save-tint', 4.5],
  ['over-deep on over-tint (badge)', '$over-deep', '$over-tint', 4.5],
  ['over-deep on paper (field error)', '$over-deep', '$paper', 4.5],
  ['over-ink on over (chart label, check)', '$over-ink', '$over', 4.5],
  ['save-ink on save (eaten check glyph)', '$save-ink', '$save', 3],
  ['link ink on paper', '$ink', '$paper', 4.5],
  ['focus ring on paper (UI)', '$focus', '$paper', 3],
  ['focus ring on card (UI)', '$focus', '$card', 3],
  ['ink-3 control border on paper (UI)', '$ink-3', '$paper', 3],
  ['ink-3 control border on card (UI)', '$ink-3', '$card', 3],
  ['over on card (chart column, UI)', '$over', '$card', 3],
  ['save on card (chart outline, UI)', '$save', '$card', 3],
  ['on-photo text on ring-surface', '#ffffff', '$ring-surface', 4.5],
  ...rings.map((c, i) => [`ring ${i} (${c}) on ring-surface`, c, '$ring-surface', 3]),
];

const get = (theme, v) => (v.startsWith('$') ? theme['--' + v.slice(1)] : v);
let failures = 0;
for (const [name, theme] of [['LIGHT', light], ['DARK', dark]]) {
  console.log(`\n${name}`);
  for (const [label, fg, bg, min] of pairs) {
    const r = ratio(get(theme, fg), get(theme, bg));
    const ok = r >= min;
    if (!ok) failures += 1;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${r.toFixed(2).padStart(6)}  (min ${min})  ${label}`);
  }
}
console.log(`\nfailures: ${failures}`);
