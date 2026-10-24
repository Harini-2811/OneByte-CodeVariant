import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, CATEGORY_ORDER } from '../data/categories';
import { MATERIALS, PROBLEMS, REPURPOSE_IDEAS, TIPS, type Tip } from '../data/guides';
import { PATHS } from '../data/paths';
import type { CategoryId } from '../data/types';
import { dl, Dots, Icon, ICONS, Lines } from '../components/ui';
import { CAT_ICONS } from './shared';

type Tab = 'problems' | 'repair' | 'reuse' | 'repurpose' | 'replace' | 'recycle';
const TABS: [Tab, string][] = [
  ['problems', 'Common problems'],
  ['repair', 'Repair tips'],
  ['reuse', 'Reuse ideas'],
  ['repurpose', 'Repurpose ideas'],
  ['replace', 'Replace smarter'],
  ['recycle', 'Recycle right'],
];

const GENERAL_ICON = 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20 M2 12h20 M12 2a15 15 0 0 1 0 20 M12 2a15 15 0 0 0 0 20';

export default function Library() {
  const [tab, setTab] = useState<Tab>('problems');
  const [cat, setCat] = useState<CategoryId | 'all'>('all');
  const [q, setQ] = useState('');
  const needle = q.trim().toLowerCase();
  const inCat = (c: CategoryId | 'all') => cat === 'all' || c === cat || c === 'all';
  const has = (text: string) => !needle || text.toLowerCase().includes(needle);

  const problems = useMemo(() => PROBLEMS.filter((p) => (cat === 'all' || p.category === cat) && has(p.title + ' ' + p.note + ' ' + CATEGORIES[p.category].name)), [cat, needle]); // eslint-disable-line react-hooks/exhaustive-deps
  const ideas = useMemo(() => REPURPOSE_IDEAS.filter((i) => (cat === 'all' || i.category === cat) && has(i.from + ' ' + i.to + ' ' + i.materials.join(' '))), [cat, needle]); // eslint-disable-line react-hooks/exhaustive-deps
  const tips = useMemo(() => (tab === 'repair' || tab === 'reuse' || tab === 'replace' ? TIPS.filter((t) => t.path === tab && inCat(t.category) && has(t.title + ' ' + t.summary + ' ' + t.points.join(' '))) : []), [tab, cat, needle]); // eslint-disable-line react-hooks/exhaustive-deps
  const mats = useMemo(() => MATERIALS.filter((m) => has(m.name + ' ' + m.examples)), [needle]); // eslint-disable-line react-hooks/exhaustive-deps

  const count = tab === 'problems' ? problems.length : tab === 'repurpose' ? ideas.length : tab === 'recycle' ? mats.length : tips.length;
  const catName = cat === 'all' ? '' : CATEGORIES[cat].name.toLowerCase();
  const tabName = (TABS.find(([t]) => t === tab)?.[1] ?? '').toLowerCase();

  return (
    <section className="wrap" style={{ paddingTop: 48, paddingBottom: 96 }}>
      <h1 className="h-xl"><Lines lines={['Common fixes']} /></h1>
      <p className="fu lede muted" style={{ ...dl(0.7), marginTop: 12 }}>Quick fixes and ideas for every path</p>

      <div className="fu between" style={{ ...dl(0.85), marginTop: 30, alignItems: 'center' }}>
        <div className="row" role="tablist" aria-label="Library sections" style={{ gap: 6, flexWrap: 'wrap' }}>
          {TABS.map(([t, l]) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} className="chip" aria-pressed={tab === t} onClick={() => setTab(t)}>{l}</button>
          ))}
        </div>
        <label className="row" style={{ position: 'relative', flex: '0 1 340px', minWidth: 220 }}>
          <span className="sr">Search the library</span>
          <span style={{ position: 'absolute', left: 14, color: 'var(--muted)', display: 'flex' }} aria-hidden="true"><Icon d={ICONS.search} size={18} /></span>
          <input className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search, e.g. zip, kettle, battery" style={{ paddingLeft: 42 }} />
        </label>
      </div>

      {tab !== 'recycle' && (
        <div className="fu chip-row" style={{ ...dl(0.95), marginTop: 18 }} role="group" aria-label="Filter by category">
          {(['all', ...CATEGORY_ORDER] as (CategoryId | 'all')[]).map((c) => (
            <button key={c} type="button" className="chip round" aria-pressed={cat === c} onClick={() => setCat(c)} style={{ minHeight: 40, padding: '4px 14px', fontSize: 14 }}>{c === 'all' ? 'All' : CATEGORIES[c].name}</button>
          ))}
        </div>
      )}
      <p className="sr" aria-live="polite">{count} results</p>

      <div key={tab} className="pegboard fu" style={{ ...dl(0.15), marginTop: 24, borderRadius: 24, border: '1px solid var(--border)', padding: '40px 24px 30px' }}>
        {count === 0 && (
          <div className="card" style={{ maxWidth: 560, margin: '0 auto', padding: '24px 26px', textAlign: 'center' }}>
            <p style={{ fontWeight: 700 }}>
              {needle ? `No results for "${q.trim()}".` : `No ${tabName} for ${catName || 'this filter'} yet.`}
            </p>
            <p className="muted" style={{ marginTop: 6, fontSize: 15 }}>
              {needle ? 'Try a different word, or ' : 'You can still '}
              <Link className="ulink" to={cat === 'all' || cat === 'other' ? '/diagnose?new=1' : `/diagnose?new=1&cat=${cat}`}>diagnose your item</Link>
              {' '}and get a full recommendation.
            </p>
          </div>
        )}

        {tab === 'problems' && (
          <div className="grid-auto" style={{ ['--min' as string]: '260px', gap: '34px 22px' }}>
            {problems.map((p, i) => (
              <Link key={p.id} to={`/diagnose?new=1&cat=${p.category}&item=${p.itemType}&sym=${p.symptom}${p.name ? '&name=' + encodeURIComponent(p.name) : ''}`} className="card hang fu" style={{ ...dl(0.2 + Math.min(i, 10) * 0.05), position: 'relative', padding: '26px 20px 18px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="peg" aria-hidden="true" />
                <span className="row muted" style={{ gap: 8, fontSize: 14 }}><Icon d={CAT_ICONS[p.category]} size={18} width={1.8} />{CATEGORIES[p.category].name}</span>
                <span className="disp" style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{p.title}</span>
                <span className="muted" style={{ fontSize: 15 }}>{p.note}</span>
                <span className="between" style={{ marginTop: 8, alignItems: 'center' }}>
                  <span className="row" style={{ gap: 8, fontSize: 14, fontWeight: 700 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: PATHS[p.path].color }} />{p.verdict}</span>
                  <span className="ulink" style={{ fontSize: 14 }}>Diagnose this</span>
                </span>
              </Link>
            ))}
          </div>
        )}

        {(tab === 'repair' || tab === 'reuse' || tab === 'replace') && (
          <div className="grid-auto" style={{ ['--min' as string]: '280px', gap: '34px 22px' }}>
            {tips.map((t, i) => <TipCard key={t.id} tip={t} index={i} />)}
          </div>
        )}

        {tab === 'repurpose' && (
          <div className="grid-auto" style={{ ['--min' as string]: '280px', gap: '34px 22px' }}>
            {ideas.map((x, i) => (
              <article key={x.id} className="card hang fu" style={{ ...dl(0.2 + Math.min(i, 10) * 0.05), position: 'relative', padding: '26px 20px 18px', borderRadius: 12, borderTop: '4px solid var(--repurpose)' }}>
                <span className="peg" aria-hidden="true" />
                <span className="row muted" style={{ gap: 8, fontSize: 14 }}><Icon d={CAT_ICONS[x.category]} size={18} width={1.8} />{x.from}</span>
                <h2 className="disp" style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 4 }}>{x.to}</h2>
                <div className="row" style={{ marginTop: 10, gap: 14, fontSize: 14 }}>
                  <span className="row" style={{ gap: 6 }}>Effort <Dots n={x.effort} color="var(--repurpose)" label={`Effort ${x.effort} of 5`} /></span>
                  <span className="muted">{x.time}</span>
                </div>
                <p style={{ marginTop: 8, fontSize: 15 }}><strong>You'll need:</strong> {x.materials.join(', ')}</p>
                <ol style={{ margin: '6px 0 0', paddingLeft: 20, fontSize: 15 }}>{x.steps.map((s) => <li key={s}>{s}</li>)}</ol>
                <p style={{ marginTop: 10, fontSize: 14, padding: '8px 12px', borderRadius: 10, background: 'var(--surface2)' }}><strong>Safety:</strong> {x.safety}</p>
              </article>
            ))}
          </div>
        )}

        {tab === 'recycle' && (
          <div className="grid-auto" style={{ ['--min' as string]: '300px', gap: '34px 22px' }}>
            {mats.map((m, i) => (
              <article key={m.id} className="card hang fu" style={{ ...dl(0.2 + i * 0.05), position: 'relative', padding: '26px 20px 18px', borderRadius: 12, borderTop: '4px solid var(--recycle)' }}>
                <span className="peg" aria-hidden="true" />
                <h2 className="disp row" style={{ fontSize: 21, fontWeight: 800, gap: 8 }}><Icon d={PATHS.recycle.icon} stroke="var(--recycle)" />{m.name}</h2>
                <p className="muted" style={{ fontSize: 14, marginTop: 2 }}>{m.examples}</p>
                <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 15 }}>{m.prep.map((x) => <li key={x}>{x}</li>)}</ul>
                <p style={{ marginTop: 8, fontSize: 15 }}><strong>Where:</strong> {m.where}</p>
                <p style={{ marginTop: 6, fontSize: 15, color: 'var(--neg)', fontWeight: 700 }}>{m.never}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TipCard({ tip, index }: { tip: Tip; index: number }) {
  const path = PATHS[tip.path];
  const general = tip.category === 'all';
  return (
    <article className="card hang fu" style={{ ...dl(0.2 + Math.min(index, 10) * 0.05), position: 'relative', padding: '26px 20px 18px', borderRadius: 12, borderTop: `4px solid ${path.color}` }}>
      <span className="peg" aria-hidden="true" />
      <span className="between" style={{ alignItems: 'center', flexWrap: 'nowrap' }}>
        <span className="row muted" style={{ gap: 8, fontSize: 14 }}>
          <Icon d={general ? GENERAL_ICON : CAT_ICONS[tip.category as CategoryId]} size={18} width={1.8} />
          {general ? 'Any item' : CATEGORIES[tip.category as CategoryId].name}
        </span>
        <Icon d={path.icon} size={18} stroke={path.color} />
      </span>
      <h2 className="disp" style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 6 }}>{tip.title}</h2>
      <p className="muted" style={{ fontSize: 15, marginTop: 4 }}>{tip.summary}</p>
      <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 15 }}>{tip.points.map((x) => <li key={x} style={{ marginTop: 4 }}>{x}</li>)}</ul>
    </article>
  );
}
