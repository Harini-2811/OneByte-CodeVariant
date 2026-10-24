import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { DIY_LABELS, getItem, PRIORITY_LABELS } from '../data/categories';
import { PATHS, PATH_ORDER } from '../data/paths';
import type { Answers, PathId } from '../data/types';
import { evaluate, itemLabel } from '../engine/engine';
import { kg, rupee, rupeeShort, signed } from '../engine/format';
import { encodeAnswers, useSession } from '../state/session';
import { ScoringGuide } from '../components/ScoringGuide';
import { Counter, dl, Dots, Icon, ICONS, Lines } from '../components/ui';
import { Missing } from './shared';

export default function Results() {
  const { id } = useParams();
  const { get, setAnswers, resetAnswers, setDraft, toast } = useSession();
  const nav = useNavigate();
  const item = get(id);
  const [whyPath, setWhyPath] = useState<PathId | null>(null);
  const [view, setView] = useState<'rail' | 'table'>('rail');
  const guide = useRef<HTMLDialogElement>(null);
  const reduce = useReducedMotion();
  const res = useMemo(() => (item ? evaluate(item.answers) : null), [item]);

  if (!item || !res) return <Missing />;
  const a = item.answers;
  const it = getItem(a.category, a.itemType);
  const name = itemLabel(a);
  const top = res.top;
  const second = res.ranking[1];
  const why = whyPath ?? top;
  const changed = JSON.stringify(item.answers) !== JSON.stringify(item.original);
  const up = (patch: Partial<Answers>) => setAnswers(item.id, { ...a, ...patch });
  const keepsItem = top === 'repair' || top === 'reuse' || top === 'repurpose';
  const t = res.tradeoffs[top];

  const share = async () => {
    const url = `${location.origin}/shared?d=${encodeAnswers(a)}`;
    try {
      if (navigator.share) await navigator.share({ title: `Fix It First: ${name}`, text: `${PATHS[top].name} came out on top for my ${name.toLowerCase()}.`, url });
      else { await navigator.clipboard.writeText(url); toast('Link copied. Anyone can open this result.'); }
    } catch { /* share sheet dismissed */ }
  };
  const edit = () => { setDraft({ answers: structuredClone(a), step: 5, touched: true }); nav('/diagnose'); };

  return (
    <section className="wrap" style={{ paddingTop: 40, paddingBottom: 96 }}>
      {/* ---------- verdict ---------- */}
      <div className="between noprint-wrap" style={{ alignItems: 'flex-end' }}>
        <div style={{ minWidth: 0 }}>
          <div className="fu row noprint" style={{ ...dl(0.1), gap: 18, flexWrap: 'wrap' }}>
            <button type="button" className="ulink muted" onClick={edit}>Edit answers</button>
            <Link to="/shelf" className="ulink muted">My shelf</Link>
          </div>
          <h1 className="h-xl" style={{ marginTop: 12 }}>
            {res.hazard
              ? <Lines lines={['Unsafe to keep using.', `${PATHS[top].name} it safely.`]} style={(i) => (i === 1 ? { color: PATHS[top].color } : undefined)} />
              : <Lines lines={[`Best path for your ${name.toLowerCase()}:`, `${PATHS[top].name}, ${res.scores[top]}/100`]} style={(i) => (i === 1 ? { color: PATHS[top].color } : { fontSize: '0.62em', letterSpacing: '-0.035em', marginBottom: 4 })} />}
          </h1>
        </div>
        <div className="fu" style={{ ...dl(0.8), textAlign: 'right', maxWidth: 360 }}>
          <div style={{ fontWeight: 700 }}>{res.confidence}</div>
          <div className="muted" style={{ fontSize: 15 }}>
            {PATHS[top].name} leads {PATHS[second].name.toLowerCase()} by {res.gap} {res.gap === 1 ? 'point' : 'points'}.{res.hazard ? ' Two options are blocked for safety.' : ''}
          </div>
          <div className="row noprint" style={{ justifyContent: 'flex-end', marginTop: 12, gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-line btn-sm" onClick={share}><Icon d={ICONS.share} size={16} />Share</button>
            <button type="button" className="btn btn-line btn-sm" onClick={() => window.print()}><Icon d={ICONS.print} size={16} />Print</button>
            <button type="button" className="btn btn-line btn-sm" onClick={() => guide.current?.showModal()}><Icon d={ICONS.info} size={16} />How we score</button>
          </div>
        </div>
      </div>

      {/* ---------- impact strip ---------- */}
      <div className="fu card" style={{ ...dl(0.95), marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', overflow: 'hidden' }}>
        {[
          { k: keepsItem ? `Kept vs buying a new ${it.name.toLowerCase()}` : 'Typical new price', v: keepsItem ? t.moneySaved : it.newPrice, f: rupee, icon: ICONS.coins },
          { k: keepsItem ? 'CO₂e avoided, roughly' : 'Footprint of a new one', v: keepsItem ? t.co2Saved : it.co2, f: kg, icon: ICONS.leaf },
          { k: 'Likely cost', v: -1, s: t.cost, icon: ICONS.coins },
          { k: 'Time to sort', v: -1, s: t.time, icon: ICONS.reset },
        ].map((x, i) => (
          <div key={i} style={{ padding: '18px 22px', borderRight: '1px solid var(--border)' }}>
            <div className="muted" style={{ fontSize: 14 }}>{x.k}</div>
            <div className="disp" style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>
              {x.v >= 0 && x.f ? (x.f === rupee ? <>{'₹'}<Counter value={Math.round(x.v)} delay={1} /></> : <><Counter value={Math.round(x.v)} delay={1} /> kg</>) : x.s}
            </div>
          </div>
        ))}
      </div>

      {/* ---------- view toggle ---------- */}
      <div className="between noprint" style={{ marginTop: 34, alignItems: 'center' }}>
        <h2 className="h-sm fu" style={dl(1)}>All five options, ranked</h2>
        <div className="row fu" role="tablist" aria-label="View" style={{ ...dl(1), gap: 6 }}>
          {(['rail', 'table'] as const).map((v) => (
            <button key={v} type="button" role="tab" aria-selected={view === v} className="chip" aria-pressed={view === v} onClick={() => setView(v)} style={{ minHeight: 38, padding: '4px 14px', fontSize: 14 }}>{v === 'rail' ? 'Tags' : 'Table'}</button>
          ))}
        </div>
      </div>

      {/* ---------- the rail ---------- */}
      {view === 'rail' ? (
        <div className="rail fi" style={{ ...dl(0.9), marginTop: 18 }}>
          <div className="rail-rod" aria-hidden="true" />
          <LayoutGroup>
            <ol className="rail-list" aria-label="Options ranked best first">
              {res.ranking.map((p, pos) => {
                const bl = res.blocked[p];
                const isTop = pos === 0;
                const tr = res.tradeoffs[p];
                const ink = isTop ? '#15201C' : 'var(--text)';
                const dim = isTop ? 'rgba(21,32,28,.2)' : 'var(--border)';
                return (
                  <motion.li key={p} layout={!reduce} transition={{ type: 'spring', stiffness: 170, damping: 22 }} className="rail-item">
                    <div className="drop" style={{ width: '100%', animationDelay: `${0.9 + PATH_ORDER.indexOf(p) * 0.12}s` }}>
                      <div className="swingwrap">
                        <div className="string" style={{ height: 30 + pos * 10, transition: 'height .9s var(--ease)' }} />
                        <article className={'tagcard' + (isTop ? ' tag-yellow' : '')} aria-label={`${PATHS[p].name}: ${bl ? 'blocked' : res.scores[p] + ' out of 100'}`}
                          style={{ background: isTop ? undefined : 'var(--surface)', color: ink, borderTop: `6px solid ${PATHS[p].color}`, padding: '30px 16px 16px' }}>
                          <span className="hole" />
                          {bl && <div className="hatch" aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: 0.55 }} />}
                          <div style={{ position: 'relative' }}>
                            <div className="between" style={{ fontSize: 13, fontWeight: 700, flexWrap: 'nowrap' }}>
                              <span style={{ opacity: 0.75, color: bl ? 'var(--neg)' : undefined }}>{bl ? 'Blocked for safety' : isTop ? 'Best fit' : `Option ${pos + 1}`}</span>
                              <Icon d={PATHS[p].icon} size={18} stroke={isTop ? '#15201C' : PATHS[p].color} />
                            </div>
                            <h3 className="disp" style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: 4 }}>{PATHS[p].name}</h3>
                            <div className="row" style={{ alignItems: 'baseline', gap: 4, marginTop: 6 }}>
                              <span className="disp" style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>{bl ? '—' : <Counter value={res.scores[p]} delay={1 + pos * 0.1} />}</span>
                              {!bl && <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.7 }}>/ 100</span>}
                            </div>
                            {bl ? (
                              <p style={{ marginTop: 12, fontSize: 14 }}>{bl}</p>
                            ) : (
                              <dl style={{ margin: '14px 0 0', fontSize: 13, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '5px 10px', alignItems: 'center' }}>
                                <dt style={{ opacity: 0.75 }}>Cost</dt><dd style={{ margin: 0, fontWeight: 700, textAlign: 'right' }}>{tr.cost}</dd>
                                <dt style={{ opacity: 0.75 }}>Time</dt><dd style={{ margin: 0, fontWeight: 700, textAlign: 'right' }}>{tr.time}</dd>
                                <dt style={{ opacity: 0.75 }}>Difficulty</dt><dd style={{ margin: 0 }}><Dots n={tr.difficulty} color={ink} dim={dim} label={`Difficulty ${tr.difficulty} of 5`} /></dd>
                                <dt style={{ opacity: 0.75 }}>Effort</dt><dd style={{ margin: 0 }}><Dots n={tr.effort} color={ink} dim={dim} label={`Effort ${tr.effort} of 5`} /></dd>
                                <dt style={{ opacity: 0.75 }}>Planet</dt><dd style={{ margin: 0 }}><Dots n={tr.eco} color={isTop ? '#1E7A45' : 'var(--pos)'} dim={dim} leaf label={`Planet friendliness ${tr.eco} of 5`} /></dd>
                              </dl>
                            )}
                            <div className="row noprint" style={{ marginTop: 14, gap: 6 }}>
                              <button type="button" className="btn btn-sm" aria-pressed={why === p} onClick={() => setWhyPath(p)}
                                style={{ flex: 1, background: why === p ? (isTop ? '#15201C' : 'var(--ink)') : 'transparent', color: why === p ? (isTop ? '#F2C230' : 'var(--inkText)') : 'inherit', borderColor: 'currentColor' }}>Why?</button>
                              {!bl && <Link to={`/item/${item.id}/plan/${p}`} className="btn btn-sm sheen" style={{ flex: 1.2, background: isTop ? '#15201C' : 'var(--ink)', color: isTop ? '#F2C230' : 'var(--inkText)' }}>Choose</Link>}
                            </div>
                          </div>
                        </article>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </LayoutGroup>
        </div>
      ) : (
        <div className="card scroll-x fu" style={{ marginTop: 18, padding: '8px 18px' }}>
          <table className="tbl" style={{ minWidth: 720 }}>
            <caption className="sr">All five options compared</caption>
            <thead><tr><th scope="col">Option</th><th scope="col">Score</th><th scope="col">Cost</th><th scope="col">Time</th><th scope="col">Difficulty</th><th scope="col">Effort</th><th scope="col">Planet</th><th scope="col"><span className="sr">Actions</span></th></tr></thead>
            <tbody>
              {res.ranking.map((p) => {
                const tr = res.tradeoffs[p];
                const bl = res.blocked[p];
                return (
                  <tr key={p}>
                    <th scope="row"><span className="row" style={{ gap: 8 }}><Icon d={PATHS[p].icon} stroke={PATHS[p].color} size={18} />{PATHS[p].name}</span></th>
                    <td className="disp" style={{ fontWeight: 800, fontSize: 20 }}>{bl ? 'Blocked' : res.scores[p]}</td>
                    <td>{bl ? '—' : tr.cost}</td><td>{bl ? '—' : tr.time}</td>
                    <td><Dots n={tr.difficulty} color="var(--text)" label={`Difficulty ${tr.difficulty} of 5`} /></td>
                    <td><Dots n={tr.effort} color="var(--text)" label={`Effort ${tr.effort} of 5`} /></td>
                    <td><Dots n={tr.eco} color="var(--pos)" leaf label={`Planet friendliness ${tr.eco} of 5`} /></td>
                    <td style={{ textAlign: 'right' }}>{!bl && <Link className="ulink" to={`/item/${item.id}/plan/${p}`}>Choose</Link>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- why + what if ---------- */}
      <div className="split" style={{ marginTop: 24, gap: 24, alignItems: 'flex-start' }}>
        <div className="card fu" style={{ ...dl(1.3), flex: '1.2 1 460px', padding: '26px 28px' }} aria-live="polite">
          <div className="between" style={{ alignItems: 'baseline' }}>
            <h2 className="h-sm">Why {PATHS[why].name.toLowerCase()} scored {res.blocked[why] ? 0 : res.scores[why]}</h2>
            <button type="button" className="ulink muted noprint" style={{ fontSize: 15 }} onClick={() => guide.current?.showModal()}>How we score</button>
          </div>
          <p className="muted" style={{ fontSize: 15, margin: '4px 0 12px' }}>Every point comes from one of your answers. Tap Why? on any tag to compare.</p>
          <div key={why}>
            {res.reasons[why].map((r, i) => (
              <div key={i} className="ledger-row fu" style={dl(0.04 * i)}>
                <span style={{ color: r.kind === 'base' ? 'var(--muted)' : r.kind === 'block' ? 'var(--neg)' : 'var(--text)' }}>{r.kind === 'block' ? 'Blocked: ' + r.label : r.label}</span>
                <strong className="tnum" style={{ color: r.kind === 'base' ? 'var(--text)' : r.kind === 'block' ? 'var(--neg)' : r.delta > 0 ? 'var(--pos)' : 'var(--neg)', whiteSpace: 'nowrap' }}>{r.kind === 'base' ? r.delta : r.kind === 'block' ? 'Set to 0' : signed(r.delta)}</strong>
              </div>
            ))}
          </div>
          <div className="between" style={{ marginTop: 10, paddingTop: 10, borderTop: '2px solid var(--text)', fontWeight: 700 }}>
            <span>Score {res.blocked[why] ? '' : '(kept between 1 and 99)'}</span>
            <span className="disp" style={{ fontSize: 24 }}><Counter value={res.blocked[why] ? 0 : res.scores[why]} duration={700} /></span>
          </div>
        </div>

        <div className="fu noprint mat" style={{ ...dl(1.4), flex: '1 1 360px', borderRadius: 22, padding: '26px 28px', color: 'var(--chalk)', boxShadow: 'var(--shadow)' }}>
          <div className="between" style={{ alignItems: 'baseline' }}>
            <h2 className="h-sm" style={{ color: 'inherit' }}>What if?</h2>
            {changed && <button type="button" className="ulink" style={{ color: 'inherit', fontSize: 15 }} onClick={() => resetAnswers(item.id)}>Reset to my answers</button>}
          </div>
          <p style={{ fontSize: 15, opacity: 0.75, margin: '4px 0 18px' }}>Change an answer and watch the tags move.</p>
          <WhatIfSeg label="Fix it yourself?" value={a.diy} options={DIY_LABELS.map((l, i) => [i, l])} onChange={(v) => up({ diy: v as Answers['diy'] })} />
          <label style={{ display: 'block', margin: '16px 0' }}>
            <span className="between" style={{ fontWeight: 700, fontSize: 15 }}><span>Budget</span><span className="disp" style={{ fontSize: 18 }}>{rupee(a.budget)}</span></span>
            <input type="range" min={0} max={20000} step={250} value={a.budget} onChange={(e) => up({ budget: Number(e.target.value) })} style={{ accentColor: '#F2C230' }} aria-valuetext={rupee(a.budget)} />
          </label>
          <WhatIfSeg label="Under warranty?" value={a.warranty} options={[['yes', 'Yes'], ['no', 'No'], ['unsure', 'Not sure']]} onChange={(v) => up({ warranty: v as Answers['warranty'] })} />
          <div style={{ fontWeight: 700, fontSize: 15, margin: '14px 0 8px' }}>Top priority</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 6 }}>
            {Object.entries(PRIORITY_LABELS).map(([k, l]) => (
              <WhatIfBtn key={k} on={a.priority === k} onClick={() => up({ priority: k as Answers['priority'] })}>{l}</WhatIfBtn>
            ))}
          </div>
          <p style={{ fontSize: 13, opacity: 0.7, marginTop: 14 }}>Shop repair estimate for this {it.name.toLowerCase()}: about {rupeeShort(res.repairEstimate)} at a shop. Changes are saved to this item on your shelf.</p>
        </div>
      </div>
      <ScoringGuide ref={guide} />
    </section>
  );
}

function WhatIfBtn({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className="btn btn-sm"
      style={{ borderColor: on ? '#F2C230' : 'rgba(231,241,236,.35)', background: on ? '#F2C230' : 'rgba(0,0,0,.12)', color: on ? '#15201C' : 'inherit', minHeight: 42, padding: '0 8px' }}>{children}</button>
  );
}

function WhatIfSeg<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <fieldset style={{ border: 0, padding: 0, margin: '0 0 6px' }}>
      <legend style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{label}</legend>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`, gap: 6 }}>
        {options.map(([v, l]) => <WhatIfBtn key={String(v)} on={value === v} onClick={() => onChange(v)}>{l}</WhatIfBtn>)}
      </div>
    </fieldset>
  );
}
