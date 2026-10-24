import { forwardRef } from 'react';
import { Icon, ICONS } from './ui';

const FACTORS: [string, string][] = [
  ['Category', 'Every path starts from a baseline for the kind of item. Furniture favours repair and repurpose; cables lean towards replace and recycle.'],
  ['Age', 'Under 3 years pushes repair and reuse up. Over 5 years pushes repair down and replace and recycle up.'],
  ['Condition and whether it works', 'Good condition and a working item raise reuse. Poor or broken lowers reuse and raises repurpose and recycle.'],
  ['Warranty', 'Under warranty gives repair a large boost, because the repair may be free.'],
  ['Each problem and how bad it is', 'Fixable faults raise repair (less as severity rises). Costly faults lower repair and raise replace. Cosmetic issues raise reuse and repurpose. "Works, just not needed" strongly favours reuse.'],
  ['Safety', 'A hazard such as a swollen battery, exposed wire or burning smell blocks reuse and repurpose entirely, rules out DIY repair, and raises recycling.'],
  ['Your skills and nearby help', 'Confidence with DIY raises repair and repurpose. A repair shop nearby raises repair.'],
  ['Budget', 'Repair gains points when its estimated cost fits your budget, and loses them when it does not. If repair costs over 60% of a new item, replace gains.'],
  ['Time', 'Needing it today favours replacing. No rush favours repair and repurpose.'],
  ['Your top priority', 'Saving money, saving time, lowest impact or least effort each shift the weights towards the paths that serve it.'],
];

/** "How we score": the full rulebook, so nothing about the recommendation is hidden. */
export const ScoringGuide = forwardRef<HTMLDialogElement>(function ScoringGuide(_, ref) {
  const close = () => (ref && typeof ref !== 'function' ? ref.current?.close() : undefined);
  return (
    <dialog ref={ref} className="sheet" aria-labelledby="sg-title" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="sheet-in">
        <div className="between" style={{ alignItems: 'center', flexWrap: 'nowrap' }}>
          <h2 id="sg-title" className="h-md">How we score</h2>
          <button type="button" className="btn btn-line btn-sm" onClick={close} aria-label="Close">
            <Icon d={ICONS.cross} size={18} />
          </button>
        </div>
        <p className="muted" style={{ marginTop: 10 }}>
          Fix It First uses a transparent rules engine, not a black-box model. Each path starts from a category baseline. Every rule that applies adds or removes points and writes down why. Scores are capped between 1 and 99, and unsafe paths are set to 0.
        </p>
        <ol style={{ margin: '20px 0 0', padding: 0, listStyle: 'none' }}>
          {FACTORS.map(([k, v], i) => (
            <li key={k} style={{ display: 'grid', gridTemplateColumns: '36px 1fr', gap: 12, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
              <span className="disp muted" style={{ fontWeight: 700 }}>{i + 1}</span>
              <span><strong>{k}.</strong> <span className="muted">{v}</span></span>
            </li>
          ))}
        </ol>
        <p className="muted" style={{ marginTop: 16, fontSize: 15 }}>Costs, time and footprint figures are typical ranges for India, rounded on purpose. Treat them as a guide, not a quote.</p>
      </div>
    </dialog>
  );
});
