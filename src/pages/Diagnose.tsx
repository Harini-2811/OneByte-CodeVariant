import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AGE_LABELS, AGE_NOTES, CATEGORIES, CATEGORY_ORDER, CONDITION_LABELS, DIY_LABELS, getItem, PRIORITY_LABELS, SEVERITY_LABELS, TIME_LABELS, USAGE_LABELS, WORKS_LABELS } from '../data/categories';
import type { Answers, CategoryId, Severity } from '../data/types';
import { defaultAnswers } from '../engine/engine';
import { rupee } from '../engine/format';
import { useRun } from '../hooks/useRun';
import { useSession } from '../state/session';
import { Sketch } from '../components/Sketch';
import { dl, Icon, ICONS, Lines, Mat } from '../components/ui';
import { CAT_ICONS } from './shared';

const STEPS = ['What is it?', 'Age and condition', "What's wrong", 'What matters', 'Review'];

function Seg<T extends string | number>({ label, value, options, onChange, hint }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void; hint?: ReactNode }) {
  return (
    <fieldset style={{ border: 0, padding: 0, margin: '0 0 26px' }}>
      <legend className="field-label">{label}{hint && <span className="field-hint"> {hint}</span>}</legend>
      <div className="seg">
        {options.map(([v, l]) => (
          <button key={String(v)} type="button" className="chip" aria-pressed={value === v} onClick={() => onChange(v)} style={{ justifyContent: 'center', padding: '8px 10px' }}>{l}</button>
        ))}
      </div>
    </fieldset>
  );
}

export default function Diagnose() {
  const { draft, setDraft } = useSession();
  const [params, setParams] = useSearchParams();
  const run = useRun();

  // Start fresh (optionally prefilled from the URL), or resume the saved draft.
  const [answers, setAnswers] = useState<Answers>(() => draft?.answers ?? defaultAnswers());
  const [step, setStep] = useState<number>(() => draft?.step ?? 1);
  const [hasCat, setHasCat] = useState<boolean>(() => draft?.touched ?? false);
  const [unmatched, setUnmatched] = useState(false);

  useEffect(() => {
    if (params.get('new') !== '1' && !params.get('cat')) return;
    const a = defaultAnswers();
    const cat = params.get('cat') as CategoryId | null;
    let s = 1;
    let picked = false;
    if (cat && CATEGORIES[cat]) {
      a.category = cat;
      a.itemType = getItem(cat, params.get('item') ?? '').id;
      picked = true;
      const sym = params.get('sym');
      if (sym && CATEGORIES[cat].symptoms.some((x) => x.id === sym)) { a.symptoms = { [sym]: 2 }; s = 2; }
    }
    const note = params.get('note');
    if (note) { a.notes = note; if (!picked) setUnmatched(true); }
    setAnswers(a); setStep(s); setHasCat(picked);
    setParams({}, { replace: true });
  }, [params, setParams]);

  useEffect(() => { setDraft({ answers, step, touched: hasCat }); }, [answers, step, hasCat]); // eslint-disable-line react-hooks/exhaustive-deps

  const up = (patch: Partial<Answers>) => setAnswers((a) => ({ ...a, ...patch }));
  const cat = CATEGORIES[answers.category];
  const item = getItem(answers.category, answers.itemType);
  const selected = cat.symptoms.filter((s) => answers.symptoms[s.id]);
  const hazard = selected.some((s) => s.type === 'hazard');
  const canNext = step === 1 ? hasCat : step === 3 ? selected.length > 0 : true;
  const go = (n: number) => { setStep(n); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const toggleSym = (id: string) => setAnswers((a) => {
    const s = { ...a.symptoms };
    if (s[id]) delete s[id]; else s[id] = 2;
    return { ...a, symptoms: s };
  });
  const setSev = (id: string, v: Severity) => setAnswers((a) => ({ ...a, symptoms: { ...a.symptoms, [id]: v } }));

  const notes = useMemo(() => {
    if (!hasCat) return ['pick a category to start'];
    const n: string[] = [];
    if (step >= 2) n.push(`${AGE_NOTES[answers.age]}, ${CONDITION_LABELS[answers.condition].toLowerCase()}`);
    if (step >= 2 && answers.warranty === 'yes') n.push('still under warranty');
    selected.slice(0, 3).forEach((s) => n.push(`${s.label.toLowerCase()} (${SEVERITY_LABELS[answers.symptoms[s.id]].toLowerCase()})${s.type === 'hazard' ? '!' : ''}`));
    if (step >= 4) n.push(`up to ${rupee(answers.budget)}`);
    return n;
  }, [hasCat, step, answers, selected]);

  const review: [string, string, number][] = [
    ['Item', `${answers.name.trim() || item.name} (${cat.name.toLowerCase()})`, 1],
    ['Age and use', `${AGE_LABELS[answers.age]}, ${USAGE_LABELS[answers.usage].toLowerCase()} use`, 2],
    ['Condition', `${CONDITION_LABELS[answers.condition]}, works ${WORKS_LABELS[answers.works].toLowerCase()}, warranty: ${answers.warranty === 'unsure' ? 'not sure' : answers.warranty}`, 2],
    ['Problems', selected.map((s) => `${s.label} (${SEVERITY_LABELS[answers.symptoms[s.id]].toLowerCase()})`).join(', ') || 'None', 3],
    ['Fix it yourself', DIY_LABELS[answers.diy], 4],
    ['Budget and time', `Up to ${rupee(answers.budget)}, ${TIME_LABELS[answers.time].toLowerCase()}`, 4],
    ['Top priority', PRIORITY_LABELS[answers.priority], 4],
  ];

  return (
    <section className="wrap" style={{ paddingTop: 48, paddingBottom: 96 }}>
      <div className="between" style={{ alignItems: 'flex-end' }}>
        <h1 className="h-xl"><Lines lines={['Put it on the bench.']} /></h1>
        <p className="fu muted" style={dl(0.8)}>Five quick screens. Tap what fits. Your answers save as you go.</p>
      </div>

      <ol className="fu" aria-label="Progress" style={{ ...dl(0.8), listStyle: 'none', margin: '32px 0 0', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 10 }}>
        {STEPS.map((label, i) => {
          const n = i + 1;
          const cur = n === step;
          const done = n < step;
          const locked = n > 1 && !hasCat;
          return (
            <li key={label}>
              <button type="button" disabled={locked} onClick={() => go(n)} aria-current={cur ? 'step' : undefined} style={{ width: '100%', textAlign: 'left', background: 'none', border: 0, padding: 0, cursor: locked ? 'not-allowed' : 'pointer' }}>
                <span style={{ display: 'block', height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                  <span style={{ display: 'block', height: '100%', width: cur || done ? '100%' : '0%', background: cur ? 'var(--marker)' : 'var(--text)', transition: 'width .6s var(--ease), background-color .4s' }} />
                </span>
                <span className="muted" style={{ display: 'block', marginTop: 10, fontSize: 14 }}>Step {n}</span>
                <span className="step-label" style={{ display: 'block', fontWeight: 700, fontSize: 15, lineHeight: 1.3, color: cur || done ? 'var(--text)' : 'var(--muted)' }}>{label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="split" style={{ marginTop: 32, gap: 32, alignItems: 'flex-start' }}>
        <div className="card" style={{ flex: '1.25 1 520px', padding: 'clamp(22px, 3vw, 34px)', boxShadow: 'var(--shadow)' }}>
          {/* ---------------- step 1 ---------------- */}
          {step === 1 && (
            <div key="s1">
              <h2 className="h-md"><Lines lines={['What is it?']} delay={0.05} /></h2>
              <p className="fu muted" style={{ ...dl(0.15), margin: '6px 0 22px' }}>Pick the closest category, then the item.</p>
              {unmatched && <p className="fu" style={{ ...dl(0.2), marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'var(--surface2)', fontSize: 15 }}>We couldn't tell what "{answers.notes}" is, so pick the closest category. We kept your words as a note.</p>}
              <div className="grid-auto" style={{ ['--min' as string]: '150px', gap: 10 }}>
                {CATEGORY_ORDER.map((c, i) => (
                  <button key={c} type="button" className="chip lift fu" aria-pressed={hasCat && answers.category === c}
                    onClick={() => { setHasCat(true); setAnswers((a) => (a.category === c ? a : { ...a, category: c, itemType: CATEGORIES[c].items[0].id, symptoms: {} })); }}
                    style={{ ...dl(0.15 + i * 0.05), flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', minHeight: 100, padding: 16, borderRadius: 14, borderWidth: 2 }}>
                    <Icon d={CAT_ICONS[c]} size={26} width={1.8} />
                    <span style={{ fontSize: 16, lineHeight: 1.2 }}>{CATEGORIES[c].name}</span>
                  </button>
                ))}
              </div>
              {hasCat && (
                <div className="fu" style={{ ...dl(0.05), marginTop: 26 }}>
                  <span className="field-label">Which one?</span>
                  <div className="chip-row">
                    {cat.items.map((it) => (
                      <button key={it.id} type="button" className="chip round" aria-pressed={answers.itemType === it.id} onClick={() => up({ itemType: it.id })}>{it.name}</button>
                    ))}
                  </div>
                </div>
              )}
              <label className="fu" style={{ ...dl(0.5), display: 'block', marginTop: 26 }}>
                <span className="field-label">Give it a name <span className="field-hint">(optional)</span></span>
                <input className="input" value={answers.name} maxLength={40} onChange={(e) => up({ name: e.target.value })} placeholder={`e.g. My ${item.name.toLowerCase()}`} />
              </label>
            </div>
          )}

          {/* ---------------- step 2 ---------------- */}
          {step === 2 && (
            <div key="s2">
              <h2 className="h-md"><Lines lines={['How old is it, and how is it holding up?']} delay={0.05} /></h2>
              <p className="fu muted" style={{ ...dl(0.15), margin: '6px 0 22px' }}>Rough answers are fine.</p>
              <div className="fu" style={dl(0.2)}>
                <fieldset style={{ border: 0, padding: 0, margin: '0 0 26px' }}>
                  <legend className="field-label">Age</legend>
                  <div className="chip-row">
                    {AGE_LABELS.map((l, i) => <button key={l} type="button" className="chip" aria-pressed={answers.age === i} onClick={() => up({ age: i as Answers['age'] })}>{l}</button>)}
                  </div>
                </fieldset>
                <Seg label="How much has it been used?" value={answers.usage} options={USAGE_LABELS.map((l, i) => [i as Answers['usage'], l])} onChange={(v) => up({ usage: v })} />
              </div>
              <fieldset className="fu" style={{ ...dl(0.3), border: 0, padding: 0, margin: '0 0 26px' }}>
                <legend className="field-label">Overall condition</legend>
                <div className="seg">
                  {CONDITION_LABELS.map((l, i) => (
                    <button key={l} type="button" className="chip" aria-pressed={answers.condition === i} onClick={() => up({ condition: i as Answers['condition'] })} style={{ flexDirection: 'column', minHeight: 74, padding: '10px 4px', gap: 8, justifyContent: 'center' }}>
                      <span style={{ display: 'flex', gap: 3 }} aria-hidden="true">
                        {Array.from({ length: 5 }, (_, j) => <i key={j} style={{ width: 8, height: 8, borderRadius: 2, background: j < 5 - i ? (answers.condition === i ? 'var(--marker)' : 'var(--muted)') : 'var(--border)' }} />)}
                      </span>
                      <span style={{ fontSize: 14 }}>{l}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="fu" style={dl(0.4)}>
                <Seg label="Does it still work?" value={answers.works} options={WORKS_LABELS.map((l, i) => [i as Answers['works'], l])} onChange={(v) => up({ works: v })} />
                <Seg label="Is it under warranty?" value={answers.warranty} options={[['yes', 'Yes'], ['no', 'No'], ['unsure', 'Not sure']]} onChange={(v) => up({ warranty: v })} />
                {answers.warranty !== 'no' && <p className="fu" style={{ marginTop: -14, fontSize: 15, padding: '10px 14px', borderRadius: 10, background: 'var(--surface2)' }}>Worth checking first: a repair under warranty is usually free.</p>}
              </div>
            </div>
          )}

          {/* ---------------- step 3 ---------------- */}
          {step === 3 && (
            <div key="s3">
              <h2 className="h-md"><Lines lines={["What's wrong with it?"]} delay={0.05} /></h2>
              <p className="fu muted" style={{ ...dl(0.15), margin: '6px 0 22px' }}>Choose everything that applies. Then tell us how bad each one is.</p>
              <div className="chip-row">
                {cat.symptoms.map((s, i) => (
                  <button key={s.id} type="button" className={'chip round fu' + (s.type === 'hazard' ? ' danger' : '')} aria-pressed={!!answers.symptoms[s.id]} onClick={() => toggleSym(s.id)} style={dl(0.15 + i * 0.04)}>
                    {s.type === 'hazard' && <Icon d={ICONS.warn} size={16} width={2.2} />}{s.label}
                  </button>
                ))}
              </div>
              {hazard && (
                <div className="fu row" role="alert" style={{ marginTop: 22, alignItems: 'flex-start', padding: '16px 18px', borderRadius: 14, border: '1.5px solid var(--neg)', background: 'var(--surface2)' }}>
                  <Icon d={ICONS.warn} size={22} stroke="var(--neg)" style={{ marginTop: 2 }} />
                  <div><strong>Stop using it for now.</strong> This can be a safety risk. We'll rule out options that aren't safe, and show you how to get rid of it properly.</div>
                </div>
              )}
              {selected.length > 0 && (
                <div style={{ marginTop: 26 }}>
                  <span className="field-label">How bad is it?</span>
                  <div className="stack" style={{ ['--gap' as string]: '10px' }}>
                    {selected.map((s) => (
                      <div key={s.id} className="fu between" style={{ alignItems: 'center', padding: '10px 14px', borderRadius: 12, background: 'var(--surface2)', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700 }}>{s.label}</span>
                        <div className="row" role="group" aria-label={`Severity of ${s.label}`} style={{ gap: 6 }}>
                          {([1, 2, 3] as Severity[]).map((v) => (
                            <button key={v} type="button" className="chip" aria-pressed={answers.symptoms[s.id] === v} onClick={() => setSev(s.id, v)} style={{ minHeight: 38, padding: '4px 12px', fontSize: 14 }}>{SEVERITY_LABELS[v]}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <label className="fu" style={{ ...dl(0.5), display: 'block', marginTop: 26 }}>
                <span className="field-label">Anything else? <span className="field-hint">(optional)</span></span>
                <textarea className="input" value={answers.notes} maxLength={300} onChange={(e) => up({ notes: e.target.value })} placeholder="e.g. It started after it fell off the table." />
              </label>
            </div>
          )}

          {/* ---------------- step 4 ---------------- */}
          {step === 4 && (
            <div key="s4">
              <h2 className="h-md"><Lines lines={['What matters to you?']} delay={0.05} /></h2>
              <p className="fu muted" style={{ ...dl(0.15), margin: '6px 0 22px' }}>This is how we weigh the options for you, not for everyone.</p>
              <div className="fu" style={dl(0.2)}>
                <Seg label="Happy to fix things yourself?" value={answers.diy} options={DIY_LABELS.map((l, i) => [i as Answers['diy'], l])} onChange={(v) => up({ diy: v })} />
              </div>
              <label className="fu" style={{ ...dl(0.3), display: 'block', marginBottom: 26 }}>
                <span className="between" style={{ alignItems: 'baseline' }}><span className="field-label" style={{ margin: 0 }}>Most you'd spend</span><span className="disp" style={{ fontSize: 22, fontWeight: 800 }}>{answers.budget >= 20000 ? rupee(20000) + '+' : rupee(answers.budget)}</span></span>
                <input type="range" min={0} max={20000} step={250} value={answers.budget} onChange={(e) => up({ budget: Number(e.target.value) })} aria-valuetext={rupee(answers.budget)} />
                <span className="between muted" style={{ fontSize: 13 }}><span>Nothing</span><span>{rupee(20000)}+</span></span>
              </label>
              <div className="fu" style={dl(0.4)}>
                <Seg label="When do you need it sorted?" value={answers.time} options={[['today', 'Today'], ['week', 'This week'], ['norush', 'No rush']]} onChange={(v) => up({ time: v })} />
                <fieldset style={{ border: 0, padding: 0, margin: '0 0 26px' }}>
                  <legend className="field-label">Top priority</legend>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                    {Object.entries(PRIORITY_LABELS).map(([k, l]) => <button key={k} type="button" className="chip" aria-pressed={answers.priority === k} onClick={() => up({ priority: k as Answers['priority'] })}>{l}</button>)}
                  </div>
                </fieldset>
                <Seg label={`Is there a ${cat.repairShop} near you?`} value={answers.repairAccess} options={[['yes', 'Yes'], ['no', 'No'], ['unsure', "Don't know"]]} onChange={(v) => up({ repairAccess: v })} />
              </div>
            </div>
          )}

          {/* ---------------- step 5 ---------------- */}
          {step === 5 && (
            <div key="s5">
              <h2 className="h-md"><Lines lines={['Check your answers.']} delay={0.05} /></h2>
              <p className="fu muted" style={{ ...dl(0.15), margin: '6px 0 18px' }}>Everything below feeds the scores. Change anything before we diagnose.</p>
              <dl style={{ margin: 0 }}>
                {review.map(([k, v, s], i) => (
                  <div key={k} className="fu between" style={{ ...dl(0.2 + i * 0.05), padding: '12px 0', borderBottom: '1px solid var(--border)', flexWrap: 'nowrap', alignItems: 'flex-start' }}>
                    <div style={{ minWidth: 0 }}>
                      <dt className="muted" style={{ fontSize: 14 }}>{k}</dt>
                      <dd style={{ margin: 0, fontWeight: 700 }}>{v}</dd>
                    </div>
                    <button type="button" className="ulink" onClick={() => go(s)} aria-label={`Edit ${k.toLowerCase()}`}>Edit</button>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="between" style={{ marginTop: 30, paddingTop: 22, borderTop: '1px solid var(--border)', alignItems: 'center' }}>
            <button type="button" className="btn btn-line" disabled={step === 1} onClick={() => go(step - 1)}>Back</button>
            {step < 5
              ? <button type="button" className="btn btn-ink sheen" disabled={!canNext} onClick={() => go(step + 1)}>{step === 1 && !hasCat ? 'Pick a category' : step === 3 && !canNext ? 'Pick at least one' : 'Next'}</button>
              : <button type="button" className="btn btn-tag btn-lg sheen" onClick={() => { setDraft(null); run(answers); }}>Run diagnosis</button>}
          </div>
        </div>

        <aside className="fi" aria-label="Your item so far" style={{ ...dl(0.6), flex: '1 1 360px', position: 'sticky', top: 96 }}>
          <Mat style={{ padding: '28px 20px 20px' }}>
            <Sketch key={item.sketch + (hazard ? '-h' : '')} kind={hasCat ? (hazard && item.sketch === 'phone' ? 'phone' : item.sketch) : 'box'} hazard={hazard} label={`Line drawing of a ${item.name.toLowerCase()}`} />
            <div style={{ marginTop: 6, paddingTop: 14, borderTop: '1.5px dashed var(--chalkDim)' }}>
              <div className="disp" style={{ fontSize: 22, fontWeight: 700 }}>{hasCat ? answers.name.trim() || item.name : 'Your item'}</div>
              <div className="hand" style={{ fontSize: 23, lineHeight: 1.25, color: hazard ? 'var(--hazard)' : 'var(--marker)', minHeight: 58 }} aria-live="polite">
                {notes.map((n) => <span key={n} className="fi" style={{ display: 'block' }}>{n}</span>)}
              </div>
            </div>
          </Mat>
          <p className="muted" style={{ fontSize: 14, marginTop: 12 }}>Saved as a draft in this browser. You can leave and come back.</p>
        </aside>
      </div>
    </section>
  );
}
