import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { itemFor } from '../data/categories';
import { PATHS, PATH_ORDER } from '../data/paths';
import { evaluate, itemLabel } from '../engine/engine';
import { sketchFor } from '../engine/match';
import { useSession } from '../state/session';
import { Sketch } from '../components/Sketch';
import { dl, Icon, ICONS, Lines, Mat } from '../components/ui';
import { Missing } from './shared';

/** A short, honest anticipation moment: the engine really runs, the sequence just lets it land. */
export default function Analysing() {
  const { id } = useParams();
  const { get } = useSession();
  const nav = useNavigate();
  const item = get(id);
  const res = useMemo(() => (item ? evaluate(item.answers) : null), [item]);
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!item) return;
    const t = window.setTimeout(() => nav(`/item/${item.id}`, { replace: true }), reduce ? 700 : 3300);
    return () => window.clearTimeout(t);
  }, [item, nav, reduce]);

  if (!item || !res) return <Missing />;
  const it = itemFor(item.answers);
  const name = itemLabel(item.answers);

  return (
    <section className="wrap" style={{ paddingTop: 72, paddingBottom: 120 }} aria-live="polite">
      <div className="split" style={{ alignItems: 'center', maxWidth: 1080, margin: '0 auto' }}>
        <div className="fi" style={{ ...dl(0.3), flex: '1 1 440px' }}>
          <Mat style={{ padding: '28px 20px' }}>
            <Sketch kind={sketchFor(item.answers)} caption={it.id === 'other' ? name : undefined} delay={0.5} hazard={res.hazard} label={`Line drawing of a ${it.name.toLowerCase()}`} />
            <div className="scan" aria-hidden="true" />
          </Mat>
        </div>
        <div style={{ flex: '1 1 340px' }}>
          <h1 className="h-lg"><Lines lines={['Diagnosing', name.charAt(0).toLowerCase() + name.slice(1)]} delay={0.45} /></h1>
          <ul style={{ listStyle: 'none', margin: '28px 0 0', padding: 0 }}>
            {PATH_ORDER.map((p, i) => (
              <li key={p} className="fu row" style={{ ...dl(0.9 + i * 0.36), padding: '11px 0', borderBottom: '1px solid var(--border)', gap: 12 }}>
                <span style={{ width: 24, height: 24, borderRadius: 7, background: res.blocked[p] ? 'var(--neg)' : PATHS[p].color, display: 'grid', placeItems: 'center' }}>
                  <Icon d={res.blocked[p] ? ICONS.cross : ICONS.check} size={14} width={3.4} stroke="#fff" />
                </span>
                <span style={{ fontWeight: 700 }}>{res.blocked[p] ? `Ruling out ${PATHS[p].name.toLowerCase()}: not safe` : `Weighing ${PATHS[p].name.toLowerCase()}`}</span>
              </li>
            ))}
          </ul>
          <Link to={`/item/${item.id}`} replace className="ulink fu" style={{ ...dl(1.4), display: 'inline-block', marginTop: 22, color: 'var(--muted)' }}>Skip to the result</Link>
        </div>
      </div>
    </section>
  );
}
