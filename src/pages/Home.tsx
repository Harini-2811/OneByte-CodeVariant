import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CATEGORIES, CATEGORY_ORDER } from '../data/categories';
import { PATHS, PATH_ORDER } from '../data/paths';
import { PRESETS } from '../data/presets';
import { evaluate } from '../engine/engine';
import { guess } from '../engine/match';
import { useRun } from '../hooks/useRun';
import { Sketch } from '../components/Sketch';
import { Counter, dl, Icon, ICONS, Mat } from '../components/ui';
import { CAT_ICONS } from './shared';

const COMPARE: [string, string, string, string][] = [
  ['Weighs all five options', 'n', 'n', 'p'],
  ['Shows its reasoning', 'p', 'n', 'n'],
  ['Cost, time and effort side by side', 'p', 'n', 'n'],
  ['Repurposing as a real option', 'n', 'n', 'p'],
  ['Beyond electronics', 'p', 'y', 'p'],
  ['History without an account', 'n', 'y', 'n'],
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

  const quick = (e: FormEvent) => {
    e.preventDefault();
    const g = guess(text);
    const q = new URLSearchParams({ new: '1' });
    if (g) {
      q.set('cat', g.category); q.set('item', g.itemType);
      if (g.symptom) q.set('sym', g.symptom);
    }
    if (text.trim()) q.set('note', text.trim().slice(0, 200));
    nav('/diagnose?' + q.toString());
  };

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="wrap" style={{ paddingTop: 72, paddingBottom: 64 }}>
        <div className="split" style={{ alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 400px', paddingTop: 20 }}>
            <p className="ln muted"><span style={dl(0.5)}>A decision assistant for broken and worn-out things</span></p>
            <h1 style={{ marginTop: 18, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.92 }}>
              <span className="ln" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', color: 'var(--muted)', fontWeight: 600, letterSpacing: '-0.03em' }}>
                <span style={{ ...dl(0.65), position: 'relative' }}>Throw it out.<span className="strike" aria-hidden="true" /></span>
              </span>
              <span className="ln" style={{ marginTop: 10, fontSize: 'clamp(64px, 8.6vw, 116px)' }}><span style={dl(0.8)}>Fix it first.</span></span>
            </h1>
            <p className="fu lede" style={{ ...dl(1.05), marginTop: 28, maxWidth: 480 }}>
              Tell us what's wrong with your item. We weigh repair, reuse, repurpose, replace and recycle for your situation, then show you exactly why one comes out on top.
            </p>
            <div className="fu row" style={{ ...dl(1.2), marginTop: 32, flexWrap: 'wrap', gap: 22 }}>
              <Link to="/diagnose?new=1" className="btn btn-ink btn-lg sheen">Start a diagnosis</Link>
              <Link to="/fixes" className="ulink">Browse common fixes</Link>
            </div>
            <div className="fu" style={{ ...dl(1.45), marginTop: 44, paddingTop: 22, borderTop: '1px solid var(--border)' }}>
              <p className="muted" style={{ fontSize: 15, marginBottom: 12 }}>Or put a sample item on the bench and see a full result</p>
              <div className="chip-row">
                {PRESETS.map((p) => (
                  <button key={p.id} type="button" className="chip lift" onClick={() => run(p.answers)}>
                    <Icon d={p.icon} size={20} width={1.8} />{p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="fi" style={{ ...dl(0.9), flex: '1.3 1 520px' }}>
            <Mat>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 320px', minWidth: 0, position: 'relative' }}>
                  <Sketch kind="laptop" delay={1.2} label="Line drawing of a laptop with a loose charging port" />
                  <div className="hand fi" style={{ ...dl(2.4), position: 'absolute', right: 0, top: '50%', fontSize: 23, lineHeight: 1.15, color: 'var(--marker)', textAlign: 'right' }}>loose DC port?<br />2 years old</div>
                </div>
                <div style={{ flex: '0 0 168px', display: 'flex', justifyContent: 'center', margin: '-30px auto 0' }}>
                  <div className="swing" style={dl(1.6)}>
                    <div className="string" style={{ height: 46, background: 'var(--chalkDim)' }} />
                    <div className="tagcard tag-yellow" style={{ width: 156, padding: '30px 16px 18px' }}>
                      <span className="hole" style={{ background: 'var(--mat)', boxShadow: 'none' }} />
                      <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.75 }}>Our verdict</div>
                      <div className="disp" style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em', marginTop: 4 }}>{PATHS[laptop.top].name}</div>
                      <div className="row" style={{ marginTop: 14, gap: 4, alignItems: 'baseline' }}>
                        <span className="disp" style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em' }}><Counter value={laptop.scores[laptop.top]} delay={2} /></span>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>/ 100</span>
                      </div>
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1.5px dashed rgba(21,32,28,.35)', fontSize: 13, fontWeight: 700, lineHeight: 1.35 }}>Laptop that won't charge</div>
                    </div>
                  </div>
                </div>
              </div>
            </Mat>
          </div>
        </div>
      </section>

      {/* ---------- the method ---------- */}
      <section className="wrap" style={{ paddingBottom: 96 }}>
        <div className="fu between" style={{ ...dl(1.6), paddingBottom: 18, borderBottom: '2px solid var(--text)', alignItems: 'baseline' }}>
          <h2 className="h-md">The name is the method.</h2>
          <p className="muted" style={{ maxWidth: 540 }}>Every item starts at repair and only moves down the list when its condition, your budget or safety says so. The further down, the less of the original thing survives.</p>
        </div>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {PATH_ORDER.map((p, i) => (
            <li key={p} className="fu" style={{ ...dl(1.7 + i * 0.1), padding: '22px 20px 18px 0', borderBottom: '1px solid var(--border)' }}>
              <div className="row" style={{ gap: 10 }}>
                <span className="disp muted" style={{ fontSize: 15, fontWeight: 700 }}>{i + 1}</span>
                <span style={{ flex: 1, height: 4, borderRadius: 2, background: PATHS[p].color }} />
              </div>
              <h3 className="row" style={{ marginTop: 14, gap: 8, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
                <Icon d={PATHS[p].icon} stroke={PATHS[p].color} width={2.2} />{PATHS[p].name}
              </h3>
              <p className="muted" style={{ fontSize: 15, marginTop: 2 }}>{PATHS[p].line}</p>
              <div className="dots" style={{ justifyContent: 'flex-start', marginTop: 12 }} role="img" aria-label={`Keeps ${PATHS[p].keepsLevel} of 5: ${PATHS[p].keeps}`}>
                {Array.from({ length: 5 }, (_, j) => <i key={j} style={{ width: 14, height: 14, borderRadius: 3, background: j < PATHS[p].keepsLevel ? PATHS[p].color : 'var(--surface2)' }} />)}
              </div>
              <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>Keeps: {PATHS[p].keeps.toLowerCase()}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- how it works ---------- */}
      <section className="band section">
        <div className="wrap">
          <div className="between" style={{ marginBottom: 44, alignItems: 'flex-end' }}>
            <h2 className="h-lg" style={{ maxWidth: 640 }}>A decision you can check, not just trust.</h2>
            <p className="muted" style={{ maxWidth: 380 }}>No black box. Every point a path gains or loses comes from one of your answers, written in plain words.</p>
          </div>
          <div className="grid-auto" style={{ ['--min' as string]: '300px', gap: 20 }}>
            <article className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
              <div style={{ padding: '26px 26px 20px' }}>
                <div className="kicker">Step 1</div>
                <h3 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: '4px 0 6px' }}>Describe it</h3>
                <p className="muted" style={{ fontSize: 16 }}>Tap what fits. Five short screens, no typing required.</p>
              </div>
              <div style={{ marginTop: 'auto', padding: '22px 26px', background: 'var(--surface2)', borderTop: '1px solid var(--border)' }} aria-hidden="true">
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>What's wrong with it?</div>
                <div className="chip-row">
                  <span className="chip" aria-pressed="true" style={{ minHeight: 36, padding: '4px 12px', fontSize: 14 }}>Won't charge</span>
                  <span className="chip" style={{ minHeight: 36, padding: '4px 12px', fontSize: 14 }}>Battery drains fast</span>
                  <span className="chip" style={{ minHeight: 36, padding: '4px 12px', fontSize: 14 }}>Cracked screen</span>
                </div>
                <div className="progress" style={{ marginTop: 16, height: 6 }}><span style={{ width: '60%', background: 'var(--text)' }} /></div>
                <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>Screen 3 of 5</div>
              </div>
            </article>
            <article className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
              <div style={{ padding: '26px 26px 20px' }}>
                <div className="kicker">Step 2</div>
                <h3 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: '4px 0 6px' }}>See the working</h3>
                <p className="muted" style={{ fontSize: 16 }}>All five paths are scored, and every point is itemised.</p>
              </div>
              <div style={{ marginTop: 'auto', padding: '18px 26px', background: 'var(--surface2)', borderTop: '1px solid var(--border)', fontSize: 15 }}>
                {laptop.reasons.repair.slice(0, 5).map((r, i) => (
                  <div key={i} className="between" style={{ padding: '4px 0', flexWrap: 'nowrap' }}>
                    <span>{r.label}</span>
                    <strong style={{ color: r.kind === 'base' ? 'var(--text)' : r.delta > 0 ? 'var(--pos)' : 'var(--neg)' }}>{r.kind === 'base' ? r.delta : (r.delta > 0 ? '+' : '−') + Math.abs(r.delta)}</strong>
                  </div>
                ))}
                <div className="between" style={{ marginTop: 8, paddingTop: 8, borderTop: '2px solid var(--text)', fontWeight: 700 }}><span>Repair</span><span className="disp" style={{ fontSize: 20 }}>{laptop.scores.repair}</span></div>
              </div>
            </article>
            <article className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
              <div style={{ padding: '26px 26px 20px' }}>
                <div className="kicker">Step 3</div>
                <h3 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: '4px 0 6px' }}>Follow the plan</h3>
                <p className="muted" style={{ fontSize: 16 }}>Pick a path and get the steps, tools and places to go.</p>
              </div>
              <div style={{ marginTop: 'auto', padding: '18px 26px', background: 'var(--surface2)', borderTop: '1px solid var(--border)', fontSize: 15 }} aria-hidden="true">
                {[['Try another charger and socket', true], ['Check the port for wobble', true], ['Get a quote from a repair shop', false], ['Save the plan to my shelf', false]].map(([t, done], i) => (
                  <div key={i} className="row" style={{ padding: '6px 0', gap: 10 }}>
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
        <div className="wrap split">
          <div style={{ flex: '1 1 340px' }}>
            <h2 className="h-lg">Other tools start after you've decided.</h2>
            <p className="lede" style={{ marginTop: 22, maxWidth: 440 }}>Repair guides assume you'll repair. Recycling maps assume you'll recycle. Resale apps assume you'll replace. Fix It First is the step before all of them.</p>
          </div>
          <div className="scroll-x" style={{ flex: '1.6 1 560px' }}>
            <table className="tbl" style={{ minWidth: 560 }}>
              <thead>
                <tr>
                  <th scope="col"><span className="sr">Capability</span></th>
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
        <div className="between" style={{ marginBottom: 36, alignItems: 'flex-end' }}>
          <h2 className="h-lg" style={{ maxWidth: 640 }}>For the whole house, not just gadgets.</h2>
          <Link to="/fixes" className="ulink">See common fixes</Link>
        </div>
        <div className="pegboard" style={{ borderRadius: 24, border: '1px solid var(--border)', padding: '40px 28px 32px' }}>
          <div className="grid-auto" style={{ ['--min' as string]: '220px', gap: '34px 22px' }}>
            {CATEGORY_ORDER.map((c) => (
              <Link key={c} to={`/diagnose?new=1&cat=${c}`} className="card hang" style={{ position: 'relative', display: 'block', padding: '26px 18px 18px', borderRadius: 12 }}>
                <span className="peg" aria-hidden="true" />
                <span className="row" style={{ gap: 10 }}>
                  <Icon d={CAT_ICONS[c]} size={24} width={1.8} />
                  <span className="disp" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>{CATEGORIES[c].name}</span>
                </span>
                <span className="muted" style={{ display: 'block', marginTop: 8, fontSize: 15, lineHeight: 1.45 }}>{CATEGORIES[c].blurb}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- final call to action ---------- */}
      <section className="wrap" style={{ paddingBottom: 96 }}>
        <Mat style={{ borderRadius: 28, padding: 'clamp(40px, 6vw, 80px)' }}>
          <h2 style={{ fontSize: 'clamp(42px, 6vw, 84px)', lineHeight: 0.95, letterSpacing: '-0.045em', fontWeight: 800, color: 'var(--chalk)' }}>What broke today?</h2>
          <p style={{ marginTop: 18, fontSize: 19, maxWidth: 540, opacity: 0.85 }}>Describe it in a few words. We'll recognise the item and fill in what we can.</p>
          <form onSubmit={quick} className="row" style={{ marginTop: 32, flexWrap: 'wrap', maxWidth: 700 }}>
            <label htmlFor="quick" className="sr">What's broken?</label>
            <input id="quick" className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. kettle stopped heating" style={{ flex: '1 1 300px', minHeight: 56, background: '#fff', color: '#15201C', border: '2px solid transparent', fontSize: 17 }} />
            <button type="submit" className="btn btn-tag btn-lg sheen">Start a diagnosis</button>
          </form>
          <p style={{ marginTop: 16, fontSize: 15, opacity: 0.8 }}>No account needed. Your items stay in this browser.</p>
        </Mat>
      </section>
    </>
  );
}
