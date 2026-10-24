import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/** Animation-delay style helper for the reveal system. */
export const dl = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

export const ICONS = {
  check: 'M20 6L9 17l-5-5',
  cross: 'M18 6L6 18 M6 6l12 12',
  dash: 'M6 12h12',
  arrowL: 'M19 12H5 M11 18l-6-6 6-6',
  warn: 'M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z M12 9v4 M12 17h.01',
  sun: 'M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8 M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4',
  moon: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z',
  share: 'M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7 M16 6l-4-4-4 4 M12 2v13',
  print: 'M6 9V2h12v7 M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2 M6 14h12v8H6z',
  info: 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20 M12 16v-4 M12 8h.01',
  external: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14L21 3',
  trash: 'M3 6h18 M8 6V4h8v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  search: 'M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14 M21 21l-4.3-4.3',
  reset: 'M3 12a9 9 0 1 0 3-6.7 M3 3v6h6',
  play: 'M7 4v16l13-8z',
  compare: 'M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4 M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M12 2v20',
  leaf: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z M2 21c0-3 1.9-5.4 5.1-6',
  coins: 'M8 8a6 6 0 1 0 0 12a6 6 0 1 0 0-12 M18.1 10.4A6 6 0 1 1 10.3 6.1 M7 12h1v4',
};

export function Icon({ d, size = 20, stroke = 'currentColor', width = 2, fill = 'none', label, style }: { d: string; size?: number; stroke?: string; width?: number; fill?: string; label?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={fill === 'none' ? stroke : 'none'} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden={label ? undefined : true} role={label ? 'img' : undefined} aria-label={label} style={{ flex: 'none', ...style }}>
      <path d={d} />
    </svg>
  );
}

export function Ring({ size = 30, width = 30, gap = 8, style, className }: { size?: number; width?: number; gap?: number; style?: CSSProperties; className?: string }) {
  const c = 2 * Math.PI * 78;
  const seg = c / 5;
  const cols = ['var(--repair)', 'var(--reuse)', 'var(--repurpose)', 'var(--replace)', 'var(--recycle)'];
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true" style={style} className={className}>
      <g transform="rotate(-90 100 100)" fill="none" strokeWidth={width}>
        {cols.map((col, i) => (
          <circle key={i} cx="100" cy="100" r="78" stroke={col} strokeDasharray={`${seg - gap} ${c - seg + gap}`} strokeDashoffset={-seg * i} style={{ transition: 'stroke .45s' }} />
        ))}
      </g>
    </svg>
  );
}

/** Heading lines that rise from behind a mask, one after another. */
export function Lines({ lines, delay = 0.5, step = 0.13, style }: { lines: ReactNode[]; delay?: number; step?: number; style?: (i: number) => CSSProperties | undefined }) {
  return <>{lines.map((l, i) => <span key={i} className="ln" style={style?.(i)}><span style={dl(delay + i * step)}>{l}</span></span>)}</>;
}

/** A number that rolls to its new value. */
export function Counter({ value, duration = 1100, delay = 0, format }: { value: number; duration?: number; delay?: number; format?: (n: number) => string }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setShown(value); from.current = value; return; }
    let raf = 0;
    const start = from.current;
    const t0 = performance.now() + delay * 1000;
    const tick = (t: number) => {
      const k = Math.min(1, Math.max(0, (t - t0) / duration));
      const e = 1 - Math.pow(1 - k, 3);
      const v = Math.round(start + (value - start) * e);
      setShown(v);
      from.current = v;
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, delay]);
  const f = format ?? ((n: number) => n.toLocaleString('en-IN'));
  return <span className="tnum"><span aria-hidden="true">{f(shown)}</span><span className="sr">{f(value)}</span></span>;
}

export function Dots({ n, of = 5, color, leaf, label, dim = 'var(--border)' }: { n: number; of?: number; color: string; leaf?: boolean; label: string; dim?: string }) {
  return (
    <span className={'dots' + (leaf ? ' leaf' : '')} role="img" aria-label={label}>
      {Array.from({ length: of }, (_, i) => <i key={i} style={{ background: i < n ? color : dim }} />)}
    </span>
  );
}

export function Mat({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={'mat ' + className} style={{ borderRadius: 22, padding: '30px 22px 22px', boxShadow: 'var(--shadow)', ...style }}>
      <div className="ruler" aria-hidden="true" />
      {children}
    </div>
  );
}
