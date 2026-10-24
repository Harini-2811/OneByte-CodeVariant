import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CATEGORIES, CATEGORY_ORDER } from '../data/categories';
import { PATHS, PATH_ORDER } from '../data/paths';
import { PRESETS } from '../data/presets';
import type { PathId } from '../data/types';
import { evaluate } from '../engine/engine';
import { guess } from '../engine/match';
import { useRun } from '../hooks/useRun';
import { Sketch } from '../components/Sketch';
import { Counter, dl, Icon, ICONS, Mat } from '../components/ui';
import { CAT_ICONS } from './shared';
import { Canvas, DragCard, DropZone, Grip } from '../components/Canvas';

const SHORT: Record<PathId, string> = {
  repair: 'Fix it and keep it',
  reuse: 'Pass it on',
  repurpose: 'Make something new',
  replace: 'Buy smarter',
  recycle: 'Recover the materials',
};

const COMPARE: [string, string, string, string][] = [
  ['Compares all five options', 'n', 'n', 'p'],
  ['Explains every score', 'p', 'n', 'n'],
  ['Shows cost, time and effort', 'p', 'n', 'n'],
  ['Works for any item', 'p', 'y', 'p'],
];

function Mark({ v, ours }: { v: string; ours?: boolean }) {
  const map: Record<string, [string, string, string]> = {
    y: [ICONS.check, ours ? '#15201C' : 'var(--pos)', 'Yes'],
    n: [ICONS.cross, 'var(--muted)', 'No'],
    p: [ICONS.dash, 'var(--replace)', 'Partly'],
  };
  const [d, c, l] = map[v];
  return <Icon d={d} stroke={c} width={2.6} label={l} style={{ margin: '0 auto' }} />;
}

export default function Home() {
  const run = useRun();
  const nav = useNavigate();
  const [text, setText] = useState('');
  const laptop = useMemo(() => evaluate(PRESETS[0].answers), []);

  const quick = () => {
    const g = guess(text);
    const q = new URLSearchParams({ new: '1' });
    if (g) {
      q.set('cat', g.category); q.set('item', g.itemType);
      if (g.symptom) q.set('sym', g.symptom);
    }
    if (text.trim()) q.set('note', text.trim().slice(0, 200));
    nav('/diagnose?' + q.toString());
  };

  // Canvas Protocol: drop a sample card or your own note onto the bench.
  const onDrop = (card: { kind: string; preset?: unknown; cat?: unknown }, zone: string | null) => {
    if (zone !== 'bench' && zone !== 'bench2' && zone !== 'bench3') return false;
    if (card.kind === 'blank') { window.setTimeout(() => nav('/diagnose?new=1'), 380); return true; }
    if (card.kind === 'category') { window.setTimeout(() => nav(`/diagnose?new=1&cat=${card.cat as string}`), 380); return true; }
    if (card.kind === 'sample') {
      const p = PRESETS.find((x) => x.id === card.preset);
      if (!p) return false;
      window.setTimeout(() => run(p.answers), 380);
      return true;
    }
    if (card.kind === 'note' && text.trim()) { window.setTimeout(quick, 380); return true; }
    return false;
  };

  return (
    <Canvas onDrop={onDrop}>
      {/* ---------- hero ---------- */}
      <section className="wrap" style={{ paddingTop: 80, paddingBottom: 72 }}>
        <div className="split" style={{ alignItems: 'center' }}>
          <div style={{ flex: '1 1 400px' }}>
            <h1 style={{ fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.92 }}>
              <span className="ln" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', color: 'var(--muted)', fontWeight: 600, letterSpacing: '-0.03em' }}>
                <span style={{ ...dl(0.5), position: 'relative' }}>Throw it out.<span className="strike" aria-hidden="true" /></span>
              </span>
              <span className="ln" style={{ marginTop: 10, fontSize: 'clamp(64px, 8.6vw, 116px)' }}><span style={dl(0.65)}>Fix it first.</span></span>
            </h1>
            <p className="fu lede" style={{ ...dl(0.95), marginTop: 26, maxWidth: 440 }}>
              A decision assistant for repair, reuse, repurpose, replace and recycle.
            </p>
            <div className="fu" style={{ ...dl(1.1), marginTop: 30 }}>
              <span className="drag-hint">Drag a blank ticket onto the bench to start <span className="arrow"><Icon d="M5 12h14 M13 6l6 6-6 6" size={16} /></span></span>
              <div className="row" style={{ marginTop: 10, flexWrap: 'wrap', gap: 22 }}>
                <DragCard id="blank" nudge="Drag me onto the bench" data={{ kind: 'blank', label: 'Blank ticket: start a new diagnosis' }}>
                  <div className="tagcard tag-yellow" style={{ clipPath: 'none', borderRadius: 14, padding: '14px 18px', width: 250 }}>
                    <div className="between" style={{ alignItems: 'center', flexWrap: 'nowrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.75 }}>Blank ticket</span><Grip light />
                    </div>
                    <div className="disp" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 2 }}>Start a diagnosis</div>
                  </div>
                </DragCard>
                <Link to="/fixes" className="ulink">Browse common fixes</Link>
              </div>
            </div>
            <div className="fu" style={{ ...dl(1.3), marginTop: 32 }}>
              <span className="drag-hint">Or drag a sample onto the bench <span className="arrow"><Icon d="M5 12h14 M13 6l6 6-6 6" size={16} /></span></span>
              <div className="chip-row" style={{ marginTop: 10 }}>
                {PRESETS.map((p) => (
                  <DragCard key={p.id} id={`sample-${p.id}`} data={{ kind: 'sample', preset: p.id, label: `Sample: ${p.label}` }}>
                    <span className="chip" style={{ minHeight: 42, padding: '4px 12px', fontSize: 14, gap: 8 }}>
                      <Icon d={p.icon} size={18} width={1.8} />{p.label}<Grip />
                    </span>
                  </DragCard>
                ))}
              </div>
            </div>
          </div>

          <div className="fi" style={{ ...dl(0.8), flex: '1.3 1 520px' }}>
            <DropZone id="bench" variant="bare" label="Drop it on the bench" release="Release to diagnose" hint="Drop a sample here to diagnose it" accepts={['sample', 'note', 'blank', 'category']}>
            <Mat>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 320px', minWidth: 0, position: 'relative' }}>
                  <Sketch kind="laptop" delay={1.1} label="Line drawing of a laptop with a loose charging port" />
                  <div className="hand fi" style={{ ...dl(2.3), position: 'absolute', right: 0, top: '50%', fontSize: 23, lineHeight: 1.15, color: 'var(--marker)', textAlign: 'right' }}>loose DC port?<br />2 years old</div>
                </div>
                <div style={{ flex: '0 0 168px', display: 'flex', justifyContent: 'center', margin: '-30px auto 0' }}>
                  <div className="swing" style={dl(1.5)}>
                    <div className="string" style={{ height: 46, background: 'var(--chalkDim)' }} />
                    <div className="tagcard tag-yellow" style={{ width: 156, padding: '30px 16px 18px' }}>
                      <span className="hole" style={{ background: 'var(--mat)', boxShadow: 'none' }} />
                      <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.75 }}>Our verdict</div>
                      <div className="disp" style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em', marginTop: 4 }}>{PATHS[laptop.top].name}</div>
                      <div className="row" style={{ marginTop: 14, gap: 4, alignItems: 'baseline' }}>
                        <span className="disp" style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em' }}><Counter value={laptop.scores[laptop.top]} delay={1.9} /></span>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>/ 100</span>
                      </div>
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1.5px dashed rgba(21,32,28,.35)', fontSize: 13, fontWeight: 700, lineHeight: 1.35 }}>Laptop that won't charge</div>
                    </div>
                  </div>
                </div>
              </div>
            </Mat>
            </DropZone>
          </div>
        </div>
      </section>

      {/* ---------- the five paths ---------- */}
      <section className="wrap" style={{ paddingBottom: 96 }}>
        <h2 className="h-md fu" style={{ ...dl(1.5), paddingBottom: 16, borderBottom: '2px solid var(--text)' }}>Five options, ranked for your item.</h2>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {PATH_ORDER.map((p, i) => (
            <li key={p} className="fu" style={{ ...dl(1.6 + i * 0.08), padding: '20px 18px 20px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ display: 'block', height: 4, borderRadius: 2, background: PATHS[p].color }} />
              <h3 className="row" style={{ marginTop: 16, gap: 8, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
                <Icon d={PATHS[p].icon} stroke={PATHS[p].color} width={2.2} />{PATHS[p].name}
              </h3>
              <p className="muted" style={{ fontSize: 15, marginTop: 2 }}>{SHORT[p]}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- how it works ---------- */}
      <section className="band section">
        <div className="wrap">
          <h2 className="h-lg" style={{ marginBottom: 40 }}>How it works</h2>
          <div className="grid-auto" style={{ ['--min' as string]: '300px', gap: 20 }}>
            <article className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
              <div style={{ padding: '24px 26px 18px' }}>
                <div className="kicker">1</div>
                <h3 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: '2px 0 4px' }}>Describe it</h3>
                <p className="muted" style={{ fontSize: 16 }}>Five quick screens, all taps.</p>
              </div>
              <div style={{ marginTop: 'auto', padding: '20px 26px', background: 'var(--surface2)', borderTop: '1px solid var(--border)' }} aria-hidden="true">
                <div className="chip-row">
                  <span className="chip" aria-pressed="true" style={{ minHeight: 36, padding: '4px 12px', fontSize: 14 }}>Won't charge</span>
                  <span className="chip" style={{ minHeight: 36, padding: '4px 12px', fontSize: 14 }}>Battery drains fast</span>
                  <span className="chip" style={{ minHeight: 36, padding: '4px 12px', fontSize: 14 }}>Cracked screen</span>
                </div>
                <div className="progress" style={{ marginTop: 16, height: 6 }}><span style={{ width: '60%', background: 'var(--text)' }} /></div>
              </div>
            </article>
            <article className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
              <div style={{ padding: '24px 26px 18px' }}>
                <div className="kicker">2</div>
                <h3 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: '2px 0 4px' }}>See why</h3>
                <p className="muted" style={{ fontSize: 16 }}>Every point is explained.</p>
              </div>
              <div style={{ marginTop: 'auto', padding: '16px 26px', background: 'var(--surface2)', borderTop: '1px solid var(--border)', fontSize: 15 }}>
                {laptop.reasons.repair.slice(1, 4).map((r, i) => (
                  <div key={i} className="between" style={{ padding: '4px 0', flexWrap: 'nowrap' }}>
                    <span>{r.label}</span>
                    <strong style={{ color: r.delta > 0 ? 'var(--pos)' : 'var(--neg)' }}>{(r.delta > 0 ? '+' : '−') + Math.abs(r.delta)}</strong>
                  </div>
                ))}
                <div className="between" style={{ marginTop: 6, paddingTop: 8, borderTop: '2px solid var(--text)', fontWeight: 700 }}><span>Repair</span><span className="disp" style={{ fontSize: 20 }}>{laptop.scores.repair}</span></div>
              </div>
            </article>
            <article className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
              <div style={{ padding: '24px 26px 18px' }}>
                <div className="kicker">3</div>
                <h3 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: '2px 0 4px' }}>Act on it</h3>
                <p className="muted" style={{ fontSize: 16 }}>A step-by-step plan.</p>
              </div>
              <div style={{ marginTop: 'auto', padding: '16px 26px', background: 'var(--surface2)', borderTop: '1px solid var(--border)', fontSize: 15 }} aria-hidden="true">
                {[['Try another charger', true], ['Check the port', true], ['Get a repair quote', false]].map(([t, done], i) => (
                  <div key={i} className="row" style={{ padding: '5px 0', gap: 10 }}>
                    <span style={{ width: 20, height: 20, borderRadius: 5, display: 'grid', placeItems: 'center', background: done ? 'var(--pos)' : 'transparent', border: done ? 0 : '2px solid var(--muted)' }}>
                      {done && <Icon d={ICONS.check} size={13} width={3.5} stroke="var(--surface)" />}
                    </span>
                    <span style={{ textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--muted)' : 'var(--text)' }}>{t as string}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ---------- why different ---------- */}
      <section className="section">
        <div className="wrap split" style={{ alignItems: 'center' }}>
          <h2 className="h-lg" style={{ flex: '1 1 300px' }}>Why Fix It First</h2>
          <div className="scroll-x" style={{ flex: '2 1 560px' }}>
            <table className="tbl" style={{ minWidth: 560 }}>
              <thead>
                <tr>
                  <th scope="col"><span className="sr">Feature</span></th>
                  <th scope="col" style={{ textAlign: 'center' }}>Repair guides</th>
                  <th scope="col" style={{ textAlign: 'center' }}>Recycling maps</th>
                  <th scope="col" style={{ textAlign: 'center' }}>AI scanners</th>
                  <th scope="col" className="disp" style={{ textAlign: 'center', background: 'var(--marker)', color: '#15201C', fontWeight: 800, fontSize: 17, borderRadius: '12px 12px 0 0' }}>Fix It First</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((r) => (
                  <tr key={r[0]}>
                    <th scope="row" style={{ fontWeight: 700 }}>{r[0]}</th>
                    <td><Mark v={r[1]} /></td><td><Mark v={r[2]} /></td><td><Mark v={r[3]} /></td>
                    <td style={{ background: 'var(--marker)' }}><Mark v="y" ours /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ---------- categories ---------- */}
      <section className="wrap" style={{ paddingBottom: 96 }}>
        <div className="between" style={{ marginBottom: 32, alignItems: 'flex-end' }}>
          <h2 className="h-lg">For the whole house</h2>
          <span className="drag-hint"><Grip /> Drag a category onto the workbench to start with it</span>
        </div>
        <div className="pegboard" style={{ borderRadius: 24, border: '1px solid var(--border)', padding: '38px 26px 28px' }}>
          <div className="grid-auto" style={{ ['--min' as string]: '200px', gap: '30px 20px' }}>
            {CATEGORY_ORDER.map((c) => (
              <DragCard key={c} id={`cat-${c}`} data={{ kind: 'category', cat: c, label: `${CATEGORIES[c].name} category` }}>
                <div className="card row" style={{ position: 'relative', padding: '24px 18px 18px', borderRadius: 12, gap: 12 }}>
                  <span className="peg" aria-hidden="true" />
                  <Icon d={CAT_ICONS[c]} size={24} width={1.8} />
                  <span className="disp" style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.01em', flex: 1 }}>{CATEGORIES[c].name}</span>
                  <Grip />
                </div>
              </DragCard>
            ))}
            <DropZone id="bench3" label="Workbench" hint="Drop a category here to start" release="Release to start" accepts={['category']}
              icon={<Icon d={PATHS.repair.icon} size={22} />} style={{ minHeight: 0 }} />
          </div>
        </div>
      </section>

      {/* ---------- final call to action ---------- */}
      <section className="wrap" style={{ paddingBottom: 96 }}>
        <Mat style={{ borderRadius: 28, padding: 'clamp(40px, 6vw, 72px)' }}>
          <h2 style={{ fontSize: 'clamp(42px, 6vw, 80px)', lineHeight: 0.95, letterSpacing: '-0.045em', fontWeight: 800, color: 'var(--chalk)' }}>What broke today?</h2>
          <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'stretch' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label htmlFor="quick" className="sr">What's broken?</label>
              <input id="quick" className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. kettle stopped heating" style={{ minHeight: 56, background: '#fff', color: '#15201C', border: '2px solid transparent', fontSize: 17 }} />
              {text.trim() ? (
                <DragCard id="note" data={{ kind: 'note', label: `Your note: ${text.trim()}` }}>
                  <div className="tagcard tag-yellow" style={{ clipPath: 'none', borderRadius: 14, padding: '14px 16px' }}>
                    <div className="between" style={{ alignItems: 'center', flexWrap: 'nowrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.75 }}>Your note</span><Grip light />
                    </div>
                    <div className="hand" style={{ fontSize: 26, lineHeight: 1.15, marginTop: 2 }}>{text.trim().slice(0, 60)}</div>
                  </div>
                </DragCard>
              ) : (
                <p style={{ fontSize: 15, opacity: 0.8 }}>Type it above and it becomes a note you can drag onto the bench.</p>
              )}
            </div>
            <DropZone id="bench2" label="Workbench" hint="Drop your note here to start" release="Release to start the diagnosis" accepts={['note']}
              icon={<Icon d={PATHS.repair.icon} size={22} />} />
          </div>
        </Mat>
      </section>
    </Canvas>
  );
}
