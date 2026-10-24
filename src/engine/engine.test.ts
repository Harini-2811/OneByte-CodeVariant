import { describe, expect, it } from 'vitest';
import { defaultAnswers, evaluate } from './engine';
import { PRESETS } from '../data/presets';
import { PATH_ORDER } from '../data/paths';
import type { Answers } from '../data/types';

const preset = (id: string): Answers => structuredClone(PRESETS.find((p) => p.id === id)!.answers);

describe('decision engine', () => {
  it('recommends repair for a young laptop with a charging fault', () => {
    const r = evaluate(preset('laptop'));
    expect(r.top).toBe('repair');
    expect(r.confidence).toBe('High confidence');
  });

  it('recommends repair for a wobbly chair', () => {
    expect(evaluate(preset('chair')).top).toBe('repair');
  });

  it('blocks unsafe paths and recommends recycling for a swollen battery', () => {
    const r = evaluate(preset('phone'));
    expect(r.hazard).toBe(true);
    expect(r.blocked.reuse).toBeTruthy();
    expect(r.blocked.repurpose).toBeTruthy();
    expect(r.scores.reuse).toBe(0);
    expect(r.top).toBe('recycle');
    expect(r.ranking.slice(-2).sort()).toEqual(['repurpose', 'reuse']);
  });

  it('explains every point: reasons add up to the score when it is not clamped', () => {
    for (const p of PRESETS) {
      const r = evaluate(p.answers);
      for (const path of PATH_ORDER) {
        if (r.blocked[path]) continue;
        const sum = r.reasons[path].reduce((s, x) => s + x.delta, 0);
        if (sum >= 1 && sum <= 99) expect(sum).toBe(r.scores[path]);
      }
    }
  });

  it('raises repair when the item is under warranty', () => {
    const a = preset('laptop');
    const before = evaluate(a).scores.repair;
    a.warranty = 'yes';
    expect(evaluate(a).scores.repair).toBeGreaterThan(before);
  });

  it('raises repair when the owner is confident with DIY', () => {
    const a = preset('laptop');
    const before = evaluate(a).scores.repair;
    a.diy = 2;
    expect(evaluate(a).scores.repair).toBeGreaterThan(before);
  });

  it('suggests reuse for something that works but is not needed', () => {
    const a = defaultAnswers();
    Object.assign(a, { category: 'furniture', itemType: 'table', age: 1, condition: 1, works: 0, symptoms: { unwanted: 1 } });
    expect(evaluate(a).top).toBe('reuse');
  });

  it('penalises repair when it costs more than 60% of a new item', () => {
    const a = defaultAnswers();
    Object.assign(a, { category: 'electronics', itemType: 'headphones', symptoms: { water: 3 }, budget: 10000 });
    const r = evaluate(a);
    expect(r.reasons.repair.some((x) => x.label.includes('60%'))).toBe(true);
  });

  it('scores an item the user typed in, scaled by its price', () => {
    const a = defaultAnswers();
    Object.assign(a, { category: 'other', itemType: 'other', name: 'Guitar', customCategory: 'Musical instrument', customPrice: 8000, symptoms: { 'broken-part': 1 } });
    const r = evaluate(a);
    expect(r.top).toBe('repair');
    expect(r.reasons.repair[0].label).toContain('musical instrument');
  });

  it('handles an Other item inside a known category', () => {
    const a = defaultAnswers();
    Object.assign(a, { category: 'electronics', itemType: 'other', name: 'Printer', customPrice: 12000, symptoms: { 'no-sound': 1 } });
    const r = evaluate(a);
    expect(r.scores[r.top]).toBeGreaterThan(0);
  });

  it('keeps every score within 0 to 99', () => {
    const a = preset('jacket');
    a.priority = 'time';
    a.time = 'today';
    const r = evaluate(a);
    for (const p of PATH_ORDER) {
      expect(r.scores[p]).toBeGreaterThanOrEqual(0);
      expect(r.scores[p]).toBeLessThanOrEqual(99);
    }
  });
});
