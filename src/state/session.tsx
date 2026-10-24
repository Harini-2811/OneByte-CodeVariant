import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import type { Answers, PathId } from '../data/types';

/**
 * Session store. Everything lives in sessionStorage, so it survives reloads and navigation
 * but disappears when the tab closes. No account, and no data ever leaves the browser.
 */

export interface Assessment {
  id: string;
  createdAt: number;
  answers: Answers;
  original: Answers;
  chosen?: PathId;
  decidedAt?: number;
  checks: Record<string, boolean>;
  mode: 'diy' | 'pro';
}

export interface Draft {
  answers: Answers;
  step: number;
  touched: boolean;
}

interface State {
  items: Assessment[];
  draft: Draft | null;
}

type Action =
  | { t: 'add'; item: Assessment }
  | { t: 'answers'; id: string; answers: Answers }
  | { t: 'reset'; id: string }
  | { t: 'decide'; id: string; path: PathId | undefined }
  | { t: 'check'; id: string; key: string }
  | { t: 'mode'; id: string; mode: 'diy' | 'pro' }
  | { t: 'remove'; id: string }
  | { t: 'clear' }
  | { t: 'draft'; draft: Draft | null };

const KEY = 'fif:session:v1';

function load(): State {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as State;
      if (Array.isArray(s.items)) return { items: s.items, draft: s.draft ?? null };
    }
  } catch { /* storage unavailable: start empty */ }
  return { items: [], draft: null };
}

function reducer(s: State, a: Action): State {
  const map = (id: string, f: (x: Assessment) => Assessment) => ({ ...s, items: s.items.map((x) => (x.id === id ? f(x) : x)) });
  switch (a.t) {
    case 'add': return { ...s, items: [...s.items, a.item] };
    case 'answers': return map(a.id, (x) => ({ ...x, answers: a.answers }));
    case 'reset': return map(a.id, (x) => ({ ...x, answers: x.original }));
    case 'decide': return map(a.id, (x) => ({ ...x, chosen: a.path, decidedAt: a.path ? Date.now() : undefined }));
    case 'check': return map(a.id, (x) => ({ ...x, checks: { ...x.checks, [a.key]: !x.checks[a.key] } }));
    case 'mode': return map(a.id, (x) => ({ ...x, mode: a.mode }));
    case 'remove': return { ...s, items: s.items.filter((x) => x.id !== a.id) };
    case 'clear': return { items: [], draft: null };
    case 'draft': return { ...s, draft: a.draft };
  }
}

interface Ctx {
  items: Assessment[];
  draft: Draft | null;
  get: (id: string | undefined) => Assessment | undefined;
  add: (answers: Answers) => string;
  setAnswers: (id: string, answers: Answers) => void;
  resetAnswers: (id: string) => void;
  decide: (id: string, path: PathId | undefined) => void;
  toggleCheck: (id: string, key: string) => void;
  setMode: (id: string, mode: 'diy' | 'pro') => void;
  remove: (id: string) => void;
  clear: () => void;
  setDraft: (d: Draft | null) => void;
  toast: (msg: string) => void;
}

const SessionCtx = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const n = useRef(0);

  useEffect(() => {
    try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore quota or privacy mode */ }
  }, [state]);

  const toast = useCallback((msg: string) => {
    const id = ++n.current;
    setToasts((t) => [...t, { id, msg }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const value = useMemo<Ctx>(() => ({
    items: state.items,
    draft: state.draft,
    get: (id) => state.items.find((x) => x.id === id),
    add: (answers) => {
      const id = Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
      const copy = structuredClone(answers);
      dispatch({ t: 'add', item: { id, createdAt: Date.now(), answers: copy, original: structuredClone(copy), checks: {}, mode: answers.diy === 2 ? 'diy' : 'pro' } });
      return id;
    },
    setAnswers: (id, answers) => dispatch({ t: 'answers', id, answers }),
    resetAnswers: (id) => dispatch({ t: 'reset', id }),
    decide: (id, path) => dispatch({ t: 'decide', id, path }),
    toggleCheck: (id, key) => dispatch({ t: 'check', id, key }),
    setMode: (id, mode) => dispatch({ t: 'mode', id, mode }),
    remove: (id) => dispatch({ t: 'remove', id }),
    clear: () => dispatch({ t: 'clear' }),
    setDraft: (d) => dispatch({ t: 'draft', draft: d }),
    toast,
  }), [state, toast]);

  return (
    <SessionCtx.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => <div key={t.id} className="toast">{t.msg}</div>)}
      </div>
    </SessionCtx.Provider>
  );
}

export function useSession(): Ctx {
  const c = useContext(SessionCtx);
  if (!c) throw new Error('useSession must be used inside SessionProvider');
  return c;
}

/** Encode answers in a URL-safe string so a result can be shared without any server. */
export function encodeAnswers(a: Answers): string {
  const json = JSON.stringify(a);
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeAnswers(s: string): Answers | null {
  try {
    const b = s.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(b)));
    const a = JSON.parse(json) as Answers;
    if (!a || typeof a !== 'object' || !a.category || !a.itemType) return null;
    return a;
  } catch {
    return null;
  }
}
