import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSession } from '../state/session';
import { Icon, ICONS, Ring } from './ui';
import { DragGuide } from './Canvas';

/** Calm, always-on workshop atmosphere. The yellow lamp follows the pointer. */
export function Background() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--mx', e.clientX + 'px');
        el.style.setProperty('--my', e.clientY + 'px');
      });
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div className="bgfx" ref={ref} aria-hidden="true">
      <div className="grid" />
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="lamp" />
      <div className="cursor" />
      <Ring size={720} width={6} gap={8} className="ring" />
      {[12, 34, 58, 76, 90].map((l, i) => (
        <span key={i} className="dust" style={{ left: l + '%', top: 86 + (i % 3) * 4 + '%', animationDelay: [0, 3.5, 7, 1.8, 9.5][i] + 's' }} />
      ))}
    </div>
  );
}

type Theme = 'light' | 'dark';

export function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme as Theme) || 'light');
  const flip = (e: MouseEvent<HTMLButtonElement>) => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const apply = () => {
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('fif-theme', next); } catch { /* private mode */ }
      setTheme(next);
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (!doc.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return apply();
    const x = e.clientX || innerWidth - 60;
    const y = e.clientY || 30;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    doc.startViewTransition(apply).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)', pseudoElement: '::view-transition-new(root)' },
      );
    }).catch(() => undefined);
  };
  return (
    <button type="button" role="switch" aria-checked={theme === 'dark'} aria-label="Dark mode" className="switch" onClick={flip}>
      <span className="ico" style={{ left: 9 }} aria-hidden="true"><Icon d={ICONS.sun} size={16} /></span>
      <span className="ico" style={{ right: 9 }} aria-hidden="true"><Icon d={ICONS.moon} size={16} /></span>
      <span className="knob" aria-hidden="true" />
    </button>
  );
}

export function Header() {
  const { items } = useSession();
  const loc = useLocation();
  const inFlow = loc.pathname.startsWith('/diagnose') || loc.pathname.startsWith('/item');
  return (
    <header className="hdr">
      <div className="wrap hdr-in">
        <Link to="/" className="brand" aria-label="Fix It First home"><Ring size={30} /><span>Fix It First</span></Link>
        <nav className="nav" aria-label="Main">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/diagnose?new=1" className={() => (inFlow ? 'active' : '')}>Diagnose</NavLink>
          <NavLink to="/fixes">Common fixes</NavLink>
          <NavLink to="/shelf">My shelf{items.length > 0 && <span className="badge" aria-label={`${items.length} items`}>{items.length}</span>}</NavLink>
        </nav>
        <ThemeSwitch />
      </div>
      <DragGuide />
    </header>
  );
}

export function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap ftr-in">
        <span><span className="disp" style={{ fontWeight: 800, color: 'var(--text)' }}>Fix It First</span>, a decision assistant for repair, reuse, repurpose, replace and recycle.</span>
      </div>
    </footer>
  );
}

/** Scroll to top and move focus to the page on navigation, for keyboard and screen-reader users. */
export function RouteFocus() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    const main = document.getElementById('main');
    main?.focus({ preventScroll: true });
  }, [pathname]);
  return null;
}
