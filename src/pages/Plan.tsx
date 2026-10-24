import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { categoryName, itemFor } from '../data/categories';
import { MATERIALS, planFor, REPURPOSE_IDEAS } from '../data/guides';
import { PATHS, PATH_ORDER } from '../data/paths';
import type { CategoryId, PathId } from '../data/types';
import { evaluate, itemLabel } from '../engine/engine';
import { kg } from '../engine/format';
import { useSession } from '../state/session';
import { dl, Dots, Icon, ICONS, Lines, Mat } from '../components/ui';
import { Missing } from './shared';
import { Canvas, DragCard, DropZone, Grip, ToolTray } from '../components/Canvas';

const MATERIAL_FOR: Record<CategoryId, string[]> = {
  electronics: ['ewaste', 'batteries'], appliances: ['ewaste', 'metal'], cables: ['ewaste'], furniture: ['wood', 'metal'],
  clothing: ['textiles'], kitchen: ['metal', 'glass'], accessories: ['textiles', 'metal', 'plastic'], other: [],
};

export default function Plan() {
  const { id, path } = useParams();
  const { get, toggleCheck, setMode, decide, toast } = useSession();
  const item = get(id);
  const res = useMemo(() => (item ? evaluate(item.answers) : null), [item]);
  if (!item || !res) return <Missing />;
  if (!path || !(PATH_ORDER as string[]).includes(path)) return <Missing title="That plan doesn't exist." text="Pick one of the five options from the results." />;

  const p = path as PathId;
  const a = item.answers;
  const it = itemFor(a);
  const name = itemLabel(a);
  const blocked = res.blocked[p];
  const mode = res.hazard ? 'pro' : item.mode;
  const plan = planFor(p, a, mode, res.hazard);
  const tr = res.tradeoffs[p];
  const keyOf = (i: number) => `${p}:${p === 'repair' ? mode : ''}:${i}`;
  const done = plan.steps.filter((_, i) => item.checks[keyOf(i)]).length;
  const pct = Math.round((done / plan.steps.length) * 100);
  const decided = item.chosen === p;
  const ideas = REPURPOSE_IDEAS.filter((x) => x.category === a.category);
  const matIds = a.category === 'other' ? (a.powered ? ['ewaste', 'batteries'] : ['metal', 'plastic', 'wood']) : MATERIAL_FOR[a.category];
  const mats = MATERIALS.filter((m) => matIds.includes(m.id));

  const todoIdx = plan.steps.map((_, i) => i).filter((i) => !item.checks[keyOf(i)]);
  const doneIdx = plan.steps.map((_, i) => i).filter((i) => !!item.checks[keyOf(i)]);

  const onDrop = (card: { kind: string; index?: unknown }, zone: string | null) => {
    if (card.kind === 'step' && typeof card.index === 'number') {
      const on = !!item.checks[keyOf(card.index)];
      if ((zone === 'done' && !on) || (zone === 'todo' && on)) { toggleCheck(item.id, keyOf(card.index)); return true; }
      return false;
    }
    if (card.kind === 'decision') {
      if (zone === 'shelf' && !decided) { decide(item.id, p); toast(`Saved: ${PATHS[p].name.toLowerCase()} for your ${name.toLowerCase()}.`); return true; }
      if (zone === 'slot' && decided) { decide(item.id, undefined); toast('Decision removed.'); return true; }
    }
    return false;
  };

  // A plain function (not a component) so cards are not remounted on every render.
  const stepCard = (i: number) => {
    const s = plan.steps[i];
    const on = !!item.checks[keyOf(i)];
    return (
      <DragCard key={i} id={`step-${i}`} data={{ kind: 'step', index: i, label: `Step ${i + 1}, ${s.title}` }}>
        <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 14px', borderRadius: 14, background: 'var(--surface)' }}>
          <span style={{ width: 26, height: 26, flex: 'none', borderRadius: 7, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, background: on ? PATHS[p].color : 'var(--surface2)', color: on ? 'var(--bg)' : 'var(--text)' }}>
            {on ? <Icon d={ICONS.check} size={15} width={3.5} stroke="var(--bg)" /> : i + 1}
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontWeight: 700, color: on ? 'var(--muted)' : 'var(--text)', textDecoration: on ? 'line-through' : 'none' }}>{s.title}</span>
            <span className="muted" style={{ display: 'block', fontSize: 14, lineHeight: 1.45 }}>{s.detail}</span>
          </span>
          <Grip />
        </div>
      </DragCard>
    );
  };

  const ticket = (
    <DragCard id="decision" data={{ kind: 'decision', label: `Decision ticket: ${PATHS[p].name} your ${name.toLowerCase()}` }}>
      <div className="tagcard" style={{ clipPath: 'none', borderRadius: 14, padding: '16px 16px 14px', background: decided ? PATHS[p].color : 'var(--marker)', color: decided ? 'var(--bg)' : '#15201C' }}>
        <div className="between" style={{ alignItems: 'center', flexWrap: 'nowrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.8 }}>{decided ? 'Decided' : 'Decision ticket'}</span>
          <Grip light />
        </div>
        <div className="disp" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 4 }}>{PATHS[p].name} my {name.toLowerCase()}</div>
      </div>
    </DragCard>
  );

  return (
    <section className="wrap" style={{ paddingTop: 40, paddingBottom: 96 }}>
      <Link to={`/item/${item.id}`} className="ulink muted fu noprint" style={dl(0.1)}>All five options</Link>
      <div className="between" style={{ marginTop: 12, alignItems: 'flex-end' }}>
        <h1 className="h-xl"><Lines lines={[`${PATHS[p].name} plan`, `for your ${name.toLowerCase()}`]} style={(i) => (i === 0 ? { color: PATHS[p].color } : undefined)} /></h1>
        <nav className="row fu noprint" aria-label="Switch plan" style={{ ...dl(0.8), gap: 6, flexWrap: 'wrap' }}>
          {res.ranking.map((x) => res.blocked[x]
            ? <span key={x} className="chip round" aria-disabled="true" style={{ minHeight: 40, padding: '4px 14px', fontSize: 14, opacity: 0.4, cursor: 'not-allowed' }}>{PATHS[x].name}</span>
            : <Link key={x} to={`/item/${item.id}/plan/${x}`} className="chip round" aria-current={x === p ? 'page' : undefined}
                style={{ minHeight: 40, padding: '4px 14px', fontSize: 14, ...(x === p ? { background: PATHS[x].color, borderColor: PATHS[x].color, color: 'var(--bg)' } : {}) }}>{PATHS[x].name}</Link>)}
        </nav>
      </div>

      {blocked ? (
        <div className="card fu" role="alert" style={{ ...dl(0.9), marginTop: 32, padding: 32, borderColor: 'var(--neg)' }}>
          <h2 className="h-md row" style={{ gap: 10 }}><Icon d={ICONS.warn} size={26} stroke="var(--neg)" />This option is blocked for safety.</h2>
          <p className="lede muted" style={{ marginTop: 10 }}>{blocked}. Choose one of the other options instead; we recommend {PATHS[res.top].name.toLowerCase()}.</p>
          <Link to={`/item/${item.id}/plan/${res.top}`} className="ulink" style={{ display: 'inline-block', marginTop: 20 }}>Open the {PATHS[res.top].name.toLowerCase()} plan</Link>
        </div>
      ) : (
        <>
          {/* facts strip */}
          <div className="card fu" style={{ ...dl(0.9), marginTop: 30, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', overflow: 'hidden' }}>
            {[
              ['Score', `${res.scores[p]} / 100`],
              ['Likely cost', tr.cost],
              ['Time', tr.time],
              ['CO₂e avoided', tr.co2Saved > 0 ? 'about ' + kg(tr.co2Saved) : 'none'],
            ].map(([k, v]) => (
              <div key={k} style={{ padding: '18px 22px', borderRight: '1px solid var(--border)' }}>
                <div className="muted" style={{ fontSize: 14 }}>{k}</div>
                <div className="disp" style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>{v}</div>
              </div>
            ))}
            <div style={{ padding: '18px 22px' }}>
              <div className="muted" style={{ fontSize: 14 }}>Difficulty and planet</div>
              <div style={{ display: 'grid', gap: 6, marginTop: 6 }}>
                <Dots n={tr.difficulty} color="var(--text)" label={`Difficulty ${tr.difficulty} of 5`} />
                <Dots n={tr.eco} color="var(--pos)" leaf label={`Planet friendliness ${tr.eco} of 5`} />
              </div>
            </div>
          </div>

          <div className="split" style={{ marginTop: 24, gap: 24, alignItems: 'flex-start' }}>
            <div className="card fu" style={{ ...dl(1.05), flex: '1.4 1 480px', padding: '28px 30px' }}>
              <div className="between" style={{ alignItems: 'center' }}>
                <h2 className="h-md">Work order</h2>
                {p === 'repair' && (
                  <div className="row noprint" role="group" aria-label="Who does the repair" style={{ gap: 6 }}>
                    <button type="button" className="chip" aria-pressed={mode === 'diy'} disabled={res.hazard} title={res.hazard ? 'Not safe to do yourself' : undefined} onClick={() => setMode(item.id, 'diy')} style={{ minHeight: 38, padding: '4px 14px', fontSize: 14, opacity: res.hazard ? 0.45 : 1 }}>Do it yourself</button>
                    <button type="button" className="chip" aria-pressed={mode === 'pro'} onClick={() => setMode(item.id, 'pro')} style={{ minHeight: 38, padding: '4px 14px', fontSize: 14 }}>Professional</button>
                  </div>
                )}
              </div>
              {/* Canvas Protocol: steps move from To do to Done, and the decision ticket goes onto the shelf. */}
              <Canvas onDrop={onDrop}>
                <div className="between" style={{ marginTop: 14, alignItems: 'baseline' }}>
                  <span className="drag-hint"><Grip /> Drag each step into Done as you finish it.</span>
                  <strong className="tnum">{done} of {plan.steps.length} done</strong>
                </div>
                <div className="progress" style={{ margin: '10px 0 16px' }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Plan progress"><span style={{ width: pct + '%', background: PATHS[p].color }} /></div>
                <div key={p + mode} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                  <DropZone id="todo" variant="list" label="To do" accepts={['step']} tone="var(--muted)" release="Release to move it back to To do"
                    hint={todoIdx.length ? 'Drag a step here to undo it' : 'Everything is done.'} icon={<Icon d={ICONS.reset} size={18} />}>
                    {todoIdx.map(stepCard)}
                  </DropZone>
                  <DropZone id="done" variant="list" className="done-zone" label="Done" accepts={['step']} tone={PATHS[p].color} release="Release to mark it done"
                    hint="Drop a step here when it's finished" icon={<Icon d={ICONS.check} size={18} width={2.6} />}>
                    {doneIdx.map(stepCard)}
                  </DropZone>
                </div>

                <h3 className="h-sm" style={{ marginTop: 28 }}>Your decision</h3>
                <div className="noprint" style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                  <DropZone id="slot" variant="list" label="Not decided yet" accepts={['decision']} tone="var(--muted)" release="Release to undo your decision"
                    hint={decided ? 'Drag the ticket back here to undo' : 'Drag this ticket onto My shelf'}>
                    {!decided && ticket}
                  </DropZone>
                  <DropZone id="shelf" variant="list" label="My shelf" accepts={['decision']} tone={PATHS[p].color} release="Release to save your decision"
                    hint={decided ? 'Saved to your shelf.' : 'Drop the ticket here to save this as your decision'} icon={<Icon d={ICONS.check} size={18} width={2.6} />}>
                    {decided && ticket}
                  </DropZone>
                </div>
              </Canvas>
              <div className="noprint" style={{ marginTop: 22 }}>
                <ToolTray card="This plan" cardIcon={<Icon d={ICONS.check} size={16} />} tools={[
                  { id: 'print', label: 'Print', hint: 'Drop to print this plan', release: 'Release to print', icon: <Icon d={ICONS.print} size={18} />, run: () => window.print() },
                ]} />
                {decided && <Link to="/shelf" className="ulink" style={{ display: 'inline-block', marginTop: 14 }}>Open my shelf</Link>}
              </div>
            </div>

            <aside className="fu" style={{ ...dl(1.15), flex: '1 1 340px', display: 'grid', gap: 16 }}>
              <Mat style={{ padding: '26px 26px 24px' }}>
                <h2 className="h-sm" style={{ color: 'var(--chalk)', marginBottom: 8 }}>{plan.notesTitle}</h2>
                {plan.notes.map((n) => <div key={n} className="hand" style={{ fontSize: 24, lineHeight: 1.25, color: 'var(--marker)', padding: '3px 0' }}>{n}</div>)}
              </Mat>
              <div className="card" style={{ padding: '20px 22px' }}>
                <strong>Good to know</strong>
                <p className="muted" style={{ marginTop: 4, fontSize: 15 }}>{plan.tip}</p>
                {plan.links.length > 0 && (
                  <div style={{ display: 'grid', gap: 8, marginTop: 14 }} className="noprint">
                    {plan.links.map((l) => (
                      <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="ulink navlink" style={{ fontSize: 15 }}>
                        {l.label}<Icon d={ICONS.external} size={16} /><span className="sr">(opens in a new tab)</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
              {p === 'recycle' && mats.map((m) => (
                <div key={m.id} className="card" style={{ padding: '20px 22px' }}>
                  <strong>{m.name}</strong>
                  <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 15 }} className="muted">{m.prep.map((x) => <li key={x}>{x}</li>)}</ul>
                  <p style={{ marginTop: 8, fontSize: 15 }}>{m.where}</p>
                  <p style={{ marginTop: 4, fontSize: 15, color: 'var(--neg)', fontWeight: 700 }}>{m.never}</p>
                </div>
              ))}
            </aside>
          </div>

          {p === 'repurpose' && ideas.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <h2 className="h-md">Ideas for your {it.name.toLowerCase()}</h2>
              <div className="grid-auto" style={{ ['--min' as string]: '280px', marginTop: 18 }}>
                {ideas.map((x) => (
                  <article key={x.id} className="card lift" style={{ padding: 22 }}>
                    <div className="muted" style={{ fontSize: 14 }}>{x.from}</div>
                    <h3 className="h-sm" style={{ marginTop: 2 }}>{x.to}</h3>
                    <div className="row" style={{ marginTop: 10, gap: 16, fontSize: 14, flexWrap: 'wrap' }}>
                      <span className="row" style={{ gap: 6 }}>Effort <Dots n={x.effort} color="var(--repurpose)" label={`Effort ${x.effort} of 5`} /></span>
                      <span className="muted">{x.time}</span>
                    </div>
                    <p style={{ marginTop: 10, fontSize: 15 }}><strong>You'll need:</strong> {x.materials.join(', ')}</p>
                    <ol style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 15 }}>{x.steps.map((st) => <li key={st}>{st}</li>)}</ol>
                    <p style={{ marginTop: 10, fontSize: 14, padding: '8px 12px', borderRadius: 10, background: 'var(--surface2)' }}><strong>Safety:</strong> {x.safety}</p>
                  </article>
                ))}
              </div>
            </div>
          )}
          <p className="muted" style={{ marginTop: 28, fontSize: 14 }}>Estimates are typical ranges for a {it.name.toLowerCase()} in the {categoryName(a).toLowerCase()} category, not quotes.</p>
        </>
      )}
    </section>
  );
}
