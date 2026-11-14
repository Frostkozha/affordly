import type { Inputs } from '@affordly/engine';
import { fmtMoney, fmtNum } from './fmtMoney';

export function inputDiff(old: Inputs, next: Inputs) {
  return [
    old.budget !== next.budget ?
      `Budget ${fmtMoney(old.budget)} → ${fmtMoney(next.budget)}` :
      '',
    old.proteinPerDay !== next.proteinPerDay ?
      `Protein ${fmtNum(old.proteinPerDay)} g → ${fmtNum(next.proteinPerDay)} g` :
      '',
    old.maxCookMinutes !== next.maxCookMinutes ?
      `Cooking ${old.maxCookMinutes} min → ${next.maxCookMinutes} min` :
      '',
    old.kcalPerDay !== next.kcalPerDay ?
      `Calories ${fmtNum(old.kcalPerDay)} → ${fmtNum(next.kcalPerDay)} kcal` :
      '',
    old.avoid.join() !== next.avoid.join() ?
      `Avoid: ${old.avoid.join(', ') || 'none'} → ${next.avoid.join(', ') || 'none'}` :
      '',
    old.excludedProductIds.join() !== next.excludedProductIds.join() ?
      `Excluded products: ${old.excludedProductIds.join(', ') || 'none'
      } → ${next.excludedProductIds.join(', ') || 'none'}` :
      '',
    old.workouts.length !== next.workouts.length ?
      'Training meals removed from the sample week' :
      ''
  ].filter(Boolean).join(' · ');
}
