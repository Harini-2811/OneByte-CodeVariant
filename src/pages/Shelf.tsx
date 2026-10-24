import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/categories';
import { PATHS } from '../data/paths';
import { evaluate, itemLabel } from '../engine/engine';
import { useSession } from '../state/session';
import { Counter, dl, Icon, ICONS, Lines } from '../components/ui';
import { CAT_ICONS } from './shared';

type Filter = 'all' | 'decided' | 'open';

export default function Shelf() {
  const { items, remove, clear, toast } = useSession();
  const [filter, setFilter] = useState<Filter>('all');
  const [picked, setPicked] = useState<string[]>([]);
  const confirm = useRef<HTMLDialogElement>(null);

  const rows = useMemo(() => items.map((x) => ({ x, r: evaluate(x.answers) })).reverse(), [items]);
  const kept = rows.filter(({ x }) => x.chosen && ['repair', 'reuse', 'repurpose'].includes(x.chosen));
  const co2 = rows.reduce((s, { x, r }) => s + (x.chosen ? r.tradeoffs[x.chosen].co2Saved : 0), 0);
  const money = kept.reduce((s, { x, r }) => s + r.tradeoffs[x.chosen!].moneySaved, 0);
  const shown = rows.filter(({ x }) => filter === 'all' || (filter === 'decided' ? !!x.chosen : !x.chosen));
  const compare = rows.filter(({ x }) => picked.includes(x.id));

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 3 ? p : [...p, id]));
  const exportJson = () => {
    const data = rows.map(({ x, r }) => ({ name: itemLabel(x.answers), category: x.answers.category, recommended: r.top, scores: r.scores, chosen: x.chosen ?? null, answers: x.answers, createdAt: new Date(x.createdAt).toISOString() }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'fix-it-first-shelf.json'; link.click();
    URL.revokeObjectURL(url);
    toast('Downloaded your shelf as JSON.');
  };

  const stats: [string, number, string?][] = [
    ['Items diagnosed', items.length],
    ['Decisions saved', rows.filter(({ x }) => x.chosen).length],
    ['Kept in use', kept.length],
    ['kg CO₂e avoided, roughly', Math.round(co2)],
    ['Kept vs buying new', money, '₹'],
  ];

  return (
    <section className="wrap" style={{ paddingTop: 48, paddingBottom: 96 }}>
      <div className="between" style={{ alignItems: 'flex-end' }}>
        <div>
          <h1 className="h-xl"><Lines lines={['My shelf']} /></h1>
          <p className="fu muted" style={{ ...dl(0.7), marginTop: 12 }}>Everything you've diagnosed in this session. Stored only in this browser, until you close the tab.</p>
        </div>
        {items.length > 0 && (
          <div className="row fu" style={{ ...dl(0.8), gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-line btn-sm" onClick={exportJson}><Icon d={ICONS.download} size={16} />Export</button>
            <button type="button" className="btn btn-line btn-sm" onClick={() => confirm.current?.showModal()}><Icon d={ICONS.trash} size={16} />Clear shelf</button>
          </div>
        )}
      </div>

      <div className="fu" style={{ ...dl(0.85), marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', borderTop: '2px solid var(--text)' }}>
        {stats.map(([k, v, pre]) => (
          <div key={k} style={{ padding: '20px 20px 20px 0', borderBottom: '1px solid var(--border)' }}>
            <div className="disp" style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>{pre}<Counter value={v} delay={0.9} /></div>
            <div className="muted" style={{ marginTop: 6, fontSize: 15 }}>{k}</div>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="fu" style={{ ...dl(1), marginTop: 40, border: '2px dashed var(--border)', borderRadius: 22, padding: '56px 32px', textAlign: 'center' }}>
          <h2 className="h-md">Your shelf is empty.</h2>
          <p className="muted" style={{ margin: '8px auto 22px', maxWidth: 440 }}>Diagnose your first item and it will appear here with its verdict and plan.</p>
          <Link to="/diagnose?new=1" className="btn btn-tag sheen">Start a diagnosis</Link>
        </div>
      ) : (
        <>
          <div className="between fu" style={{ ...dl(1), marginTop: 32, alignItems: 'center' }}>
            <div className="row" role="group" aria-label="Filter" style={{ gap: 6 }}>
              {([['all', 'All'], ['decided', 'Decided'], ['open', 'Not decided']] as [Filter, string][]).map(([f, l]) => (
                <button key={f} type="button" className="chip round" aria-pressed={filter === f} onClick={() => setFilter(f)} style={{ minHeight: 40, padding: '4px 14px', fontSize: 14 }}>{l}</button>
              ))}
            </div>
            <span className="muted" style={{ fontSize: 15 }}>Tick up to 3 items to compare them.</span>
          </div>

          {compare.length >= 2 && (
            <div className="card scroll-x fu" style={{ marginTop: 20, padding: '8px 18px' }}>
              <table className="tbl" style={{ minWidth: 640 }}>
                <caption className="sr">Comparison of selected items</caption>
                <thead><tr><th scope="col">Item</th><th scope="col">Best path</th><th scope="col">Score</th><th scope="col">Cost</th><th scope="col">Runner-up</th><th scope="col">Your decision</th></tr></thead>
                <tbody>
                  {compare.map(({ x, r }) => (
                    <tr key={x.id}>
                      <th scope="row">{itemLabel(x.answers)}</th>
                      <td style={{ color: PATHS[r.top].color, fontWeight: 700 }}>{PATHS[r.top].name}</td>
                      <td className="disp" style={{ fontWeight: 800 }}>{r.scores[r.top]}</td>
                      <td>{r.tradeoffs[r.top].cost}</td>
                      <td>{PATHS[r.ranking[1]].name} ({r.scores[r.ranking[1]]})</td>
                      <td>{x.chosen ? PATHS[x.chosen].name : 'Not yet'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="grid-auto" style={{ ['--min' as string]: '270px', marginTop: 36, gap: '44px 24px' }}>
            {shown.map(({ x, r }, i) => {
              const p = x.chosen ?? r.top;
              const sel = picked.includes(x.id);
              return (
                <div key={x.id} className="fu" style={{ ...dl(1.05 + Math.min(i, 8) * 0.06), borderBottom: '10px solid var(--rod2)', borderRadius: '0 0 4px 4px', padding: '0 12px' }}>
                  <article className="card lift" style={{ position: 'relative', padding: '20px 18px 16px', borderRadius: '14px 14px 4px 4px', marginBottom: -2, outline: sel ? '3px solid var(--marker)' : 'none' }}>
                    <div className="between" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                      <Icon d={CAT_ICONS[x.answers.category]} size={28} width={1.8} />
                      <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 13, fontWeight: 700, background: x.chosen ? PATHS[x.chosen].color : 'var(--surface2)', color: x.chosen ? 'var(--bg)' : 'var(--text)' }}>
                        {x.chosen ? 'Decided: ' + PATHS[x.chosen].name : 'Not decided'}
                      </span>
                    </div>
                    <h2 className="disp" style={{ marginTop: 14, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>{itemLabel(x.answers)}</h2>
                    <p className="muted" style={{ fontSize: 15 }}>{CATEGORIES[x.answers.category].name}. Suggested {PATHS[r.top].name.toLowerCase()} ({r.scores[r.top]}){r.hazard ? ', safety issue' : ''}.</p>
                    <div className="row" style={{ marginTop: 14, gap: 8, flexWrap: 'wrap' }}>
                      <Link to={x.chosen ? `/item/${x.id}/plan/${p}` : `/item/${x.id}`} className="btn btn-ink btn-sm">{x.chosen ? 'Open plan' : 'See options'}</Link>
                      <label className="chip" style={{ minHeight: 40, padding: '4px 12px', fontSize: 14, cursor: 'pointer' }}>
                        <input type="checkbox" checked={sel} onChange={() => toggle(x.id)} disabled={!sel && picked.length >= 3} style={{ accentColor: 'var(--text)', width: 16, height: 16 }} />Compare
                      </label>
                      <button type="button" className="btn btn-ghost btn-sm" aria-label={`Remove ${itemLabel(x.answers)}`} onClick={() => { remove(x.id); setPicked((q) => q.filter((y) => y !== x.id)); }}><Icon d={ICONS.trash} size={16} /></button>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
          {shown.length === 0 && <p className="muted" style={{ marginTop: 24 }}>Nothing matches this filter yet.</p>}
        </>
      )}

      <dialog ref={confirm} className="sheet" aria-labelledby="clr" style={{ width: 'min(480px, calc(100vw - 32px))' }}>
        <div className="sheet-in">
          <h2 id="clr" className="h-md">Clear your shelf?</h2>
          <p className="muted" style={{ marginTop: 8 }}>This removes all {items.length} items and their plans from this browser. It can't be undone.</p>
          <div className="row" style={{ marginTop: 22, justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-line" onClick={() => confirm.current?.close()}>Keep them</button>
            <button type="button" className="btn btn-ink" onClick={() => { clear(); setPicked([]); confirm.current?.close(); toast('Shelf cleared.'); }}>Clear shelf</button>
          </div>
        </div>
      </dialog>
    </section>
  );
}
