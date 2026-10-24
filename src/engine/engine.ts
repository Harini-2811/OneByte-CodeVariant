/**
 * Fix It First decision engine.
 *
 * A transparent, rule-based scorer. Every path starts from a category baseline, and every rule that
 * fires adds or subtracts points AND records a plain-language reason. The UI shows those reasons
 * verbatim, so no score is ever a black box. The engine is pure (no DOM, no state) so it can be
 * re-run instantly for "What if?" changes and unit-tested.
 */
import { CATEGORIES, getItem } from '../data/categories';
import { PATH_ORDER } from '../data/paths';
import type { Answers, PathId, Reason, Result, Severity, Tradeoff } from '../data/types';
import { rupeeShort, rupeeRange } from './format';

const SEV_WORD = ['', 'minor', 'moderate', 'severe'];

export function emptyScores(): Record<PathId, number> {
  return { repair: 0, reuse: 0, repurpose: 0, replace: 0, recycle: 0 };
}

/** Repair cost grows with the worst severity selected. */
export function repairEstimate(a: Answers): number {
  const item = getItem(a.category, a.itemType);
  const sevs = Object.values(a.symptoms);
  const worst = sevs.length ? Math.max(...sevs) : 1;
  const hardCount = CATEGORIES[a.category].symptoms.filter((s) => s.type === 'hard' && a.symptoms[s.id]).length;
  const t = Math.min(1, (worst - 1) / 2 * 0.7 + hardCount * 0.25);
  const [lo, hi] = item.repair;
  return Math.round((lo + (hi - lo) * t) / 50) * 50 || lo;
}

export function evaluate(a: Answers): Result {
  const cat = CATEGORIES[a.category];
  const item = getItem(a.category, a.itemType);
  const scores = emptyScores();
  const reasons: Record<PathId, Reason[]> = { repair: [], reuse: [], repurpose: [], replace: [], recycle: [] };
  const blocked: Partial<Record<PathId, string>> = {};

  for (const p of PATH_ORDER) {
    scores[p] = cat.base[p];
    reasons[p].push({ label: `Starting point for ${cat.name.toLowerCase()}`, delta: cat.base[p], kind: 'base' });
  }
  const add = (p: PathId, delta: number, label: string) => {
    if (!delta) return;
    scores[p] += delta;
    reasons[p].push({ label, delta, kind: delta > 0 ? 'plus' : 'minus' });
  };

  /* ---- age ---- */
  if (a.age === 0) { add('repair', 22, 'Less than a year old'); add('reuse', 12, 'Almost new, easy to pass on'); }
  if (a.age === 1) { add('repair', 16, 'Only 1 to 3 years old'); add('reuse', 8, 'Young enough to pass on'); }
  if (a.age === 2) add('repair', 4, 'Middle-aged, still worth fixing');
  if (a.age === 3) { add('repair', -10, 'Over 5 years old'); add('replace', 10, 'Nearing the end of its usual life'); add('recycle', 6, 'Nearing the end of its usual life'); }
  if (a.age === 4) { add('repair', -18, 'Over 8 years old'); add('replace', 14, 'Past its usual life'); add('recycle', 12, 'Past its usual life'); add('reuse', -6, 'Few people want one this old'); }

  /* ---- usage ---- */
  if (a.usage === 0) add('reuse', 6, 'Lightly used');
  if (a.usage === 2) { add('reuse', -6, 'Heavily used'); add('repair', -3, 'Heavy use means more wear elsewhere'); }

  /* ---- condition ---- */
  if (a.condition === 0) { add('reuse', 22, 'Still like new'); add('repair', 6, 'Nothing else is worn'); }
  if (a.condition === 1) { add('reuse', 16, 'Still in good shape'); add('repair', 4, 'Little else is worn'); }
  if (a.condition === 3) { add('reuse', -14, 'In poor shape overall'); add('repurpose', 8, 'Materials may still be useful'); add('recycle', 10, 'In poor shape overall'); }
  if (a.condition === 4) { add('reuse', -24, 'Broken as it is'); add('repurpose', 10, 'Materials may still be useful'); add('recycle', 16, 'Broken as it is'); add('repair', -4, 'Several things may be broken'); }

  /* ---- does it still work ---- */
  if (a.works === 0) add('reuse', 10, 'Still works fully');
  if (a.works === 2) add('reuse', -12, "Doesn't work at all right now");

  /* ---- warranty ---- */
  if (a.warranty === 'yes') add('repair', 18, 'Under warranty, repair may be free');
  if (a.warranty === 'unsure') add('repair', 4, 'May still be under warranty');

  /* ---- symptoms ---- */
  let hazard = false;
  let fixBonus = 0;
  for (const s of cat.symptoms) {
    const sev = a.symptoms[s.id] as Severity | undefined;
    if (!sev) continue;
    const sw = SEV_WORD[sev];
    if (s.type === 'fix') {
      const v = [0, 18, 14, 9][sev];
      const capped = Math.max(0, Math.min(v, 30 - fixBonus));
      fixBonus += capped;
      add('repair', capped, `${s.label} (${sw}) is usually fixable`);
    }
    if (s.type === 'hard') {
      add('repair', -[0, 6, 10, 16][sev], `${s.label} (${sw}) is costly to fix`);
      add('replace', [0, 6, 10, 14][sev], `${s.label} (${sw}) is costly to fix`);
      add('repurpose', 4, 'Parts can still be used another way');
    }
    if (s.type === 'cosmetic') {
      add('reuse', [0, 10, 7, 4][sev], `${s.label} is only cosmetic`);
      add('repurpose', 6, `${s.label} won't matter in a new use`);
    }
    if (s.type === 'unwanted') {
      add('reuse', 18, 'Works, just not for you');
      add('repair', -12, 'Nothing needs fixing');
      add('repurpose', 4, 'Could be made into something you do need');
    }
    if (s.type === 'hazard') {
      hazard = true;
      add('repair', -15, `${s.label} needs a professional, not DIY`);
      add('recycle', 25, `${s.label} needs safe disposal`);
      blocked.reuse = `${s.label}: unsafe to pass on`;
      blocked.repurpose = `${s.label}: unsafe to rework`;
    }
  }

  /* ---- skills and access ---- */
  if (a.diy === 0) add('repair', a.repairAccess === 'yes' ? -3 : -8, "You'd rather not fix it yourself");
  if (a.diy === 2 && !hazard) { add('repair', 10, "You're happy to fix it yourself"); add('repurpose', 10, "You're happy to make things"); }
  if (a.repairAccess === 'yes') add('repair', 6, `A ${cat.repairShop} is nearby`);
  if (a.repairAccess === 'no' && a.diy < 2) add('repair', -6, 'No repair shop nearby');

  /* ---- money ---- */
  const est = repairEstimate(a);
  const diyCost = Math.round(est * 0.4);
  const effectiveRepair = a.diy === 2 && !hazard ? diyCost : est;
  if (a.warranty !== 'yes') {
    if (a.budget >= effectiveRepair) add('repair', 12, `Repair (about ${rupeeShort(effectiveRepair)}) fits your budget`);
    else if (a.budget >= item.repair[0]) add('repair', 2, 'Repair might just fit your budget');
    else { add('repair', -15, `Repair (about ${rupeeShort(effectiveRepair)}) is over your budget`); add('repurpose', 8, 'Costs little or nothing'); add('reuse', 5, 'Costs nothing'); }
    if (est >= item.newPrice * 0.6) { add('repair', -14, 'Repair costs over 60% of a new one'); add('replace', 10, 'Repair costs over 60% of a new one'); }
  }
  if (a.budget < item.newPrice * 0.5) add('replace', -12, `A replacement (about ${rupeeShort(item.newPrice)}) is well over budget`);
  else if (a.budget >= item.newPrice) add('replace', 6, 'A replacement fits your budget');

  /* ---- time ---- */
  if (a.time === 'today') { add('replace', 6, 'You need it sorted today'); add('repair', a.diy === 2 ? 0 : -6, 'Shop repairs usually take days'); add('repurpose', -6, 'Making something takes time'); }
  if (a.time === 'norush') { add('repair', 4, 'No rush, so a repair can wait for parts'); add('repurpose', 6, 'Time to make something new'); }

  /* ---- priority ---- */
  if (a.priority === 'money') { add('reuse', 8, 'You want to save money'); add('repurpose', 8, 'You want to save money'); add('repair', 4, 'Usually cheaper than new'); add('replace', -12, 'Most expensive option'); }
  if (a.priority === 'time') { add('replace', 12, 'Quickest way to a working item'); add('recycle', 4, 'Quick to clear away'); add('repair', -6, 'Repairs take time'); add('repurpose', -8, 'Making something takes time'); }
  if (a.priority === 'eco') { add('repair', 10, 'Lowest-impact option'); add('reuse', 10, 'Lowest-impact option'); add('repurpose', 8, 'Low impact'); add('replace', -14, 'Highest impact: a new item is made'); add('recycle', -2, 'Recycling loses most of the value'); }
  if (a.priority === 'effort') { add('reuse', 8, 'Very little effort'); add('recycle', 8, 'Very little effort'); add('replace', 6, 'Little effort'); add('repurpose', -10, 'Takes real effort'); add('repair', -4, 'Takes some effort'); }

  /* ---- finalise ---- */
  for (const p of PATH_ORDER) {
    scores[p] = Math.max(1, Math.min(99, Math.round(scores[p])));
    if (blocked[p]) {
      scores[p] = 0;
      reasons[p].push({ label: blocked[p] as string, delta: 0, kind: 'block' });
    }
  }
  const ranking = [...PATH_ORDER].sort((x, y) => {
    if (!!blocked[x] !== !!blocked[y]) return blocked[x] ? 1 : -1;
    return scores[y] - scores[x] || PATH_ORDER.indexOf(x) - PATH_ORDER.indexOf(y);
  });
  const top = ranking[0];
  const gap = scores[top] - scores[ranking[1]];
  const confidence = gap >= 15 ? 'High confidence' : gap >= 7 ? 'Medium confidence' : 'Close call';

  return { scores, reasons, blocked, hazard, ranking, top, gap, confidence, tradeoffs: tradeoffs(a, est, hazard), repairEstimate: est };
}

function tradeoffs(a: Answers, est: number, hazard: boolean): Record<PathId, Tradeoff> {
  const item = getItem(a.category, a.itemType);
  const diy = a.diy === 2 && !hazard;
  const hard = CATEGORIES[a.category].symptoms.some((s) => s.type === 'hard' && a.symptoms[s.id]);
  const r50 = (n: number) => Math.max(50, Math.round(n / 50) * 50);
  const repairLo = r50(diy ? est * 0.25 : est * 0.75);
  const repairHi = r50(diy ? est * 0.5 : est * 1.25);
  const refurbLo = Math.round(item.newPrice * 0.55 / 100) * 100;
  const matHi = Math.max(100, Math.min(500, Math.round(item.newPrice * 0.08)));
  const t = (cost: string, costMid: number, time: string, difficulty: number, effort: number, eco: number, co2Share: number): Tradeoff => ({
    cost, costMid, time, difficulty, effort, eco,
    co2Saved: Math.round(item.co2 * co2Share * 10) / 10,
    moneySaved: Math.max(0, Math.round(item.newPrice - costMid)),
  });
  const warrantyFree = a.warranty === 'yes';
  return {
    repair: t(warrantyFree ? 'Possibly free' : rupeeRange(repairLo, repairHi), warrantyFree ? 0 : (repairLo + repairHi) / 2,
      diy ? 'An afternoon' : '2–5 days', Math.min(5, (hard ? 4 : 2) + (diy ? 0 : -1) + (hazard ? 1 : 0)), diy ? 3 : 2, 5, 0.85),
    reuse: t('Free', 0, '1–3 days', 1, 2, 5, 0.9),
    repurpose: t(rupeeRange(0, matHi), matHi / 2, 'A weekend', 3, 4, 4, 0.6),
    replace: t(rupeeShort(refurbLo) + '–' + rupeeShort(item.newPrice), item.newPrice, '1–3 days', 1, 2, 1, 0),
    recycle: t('Free', item.newPrice, 'One drop-off', 1, 1, 2, 0.12),
  };
}

export function defaultAnswers(): Answers {
  return {
    category: 'electronics', itemType: 'laptop', name: '', age: 1, usage: 1, condition: 2, works: 1,
    warranty: 'no', symptoms: {}, notes: '', diy: 1, budget: 3000, time: 'week', priority: 'money', repairAccess: 'unsure',
  };
}

export function itemLabel(a: Answers): string {
  return a.name.trim() || getItem(a.category, a.itemType).name;
}
