import type { CSSProperties, ReactNode } from 'react';
import type { SketchKind } from '../data/types';

/**
 * Chalk line drawings of the item on the cutting mat. Each stroke draws itself in sequence, and
 * a dashed marker circles where the fault usually is. Remount (change `key`) to replay.
 */
interface Props {
  kind: SketchKind;
  delay?: number;
  hazard?: boolean;
  label?: string;
  /** Handwritten name beside the parcel sketch, for items the user typed in. */
  caption?: string;
}

export function Sketch({ kind, delay = 0, hazard = false, label, caption }: Props) {
  const d = (x: number): CSSProperties => ({ animationDelay: `${(delay + x).toFixed(2)}s` });
  // Plain element factories (not components), so parent re-renders never remount and replay the drawing.
  const P = (path: string, at: number) => <path className="sk" pathLength={1} d={path} style={d(at)} />;
  const mark = hazard ? 'var(--hazard)' : 'var(--marker)';
  const Marker = (cx: number, cy: number, r: number, to: string) => (
    <g className="skf" style={d(1.1)} fill="none" stroke={mark} strokeWidth={hazard ? 2.4 : 2} strokeLinecap="round">
      <circle cx={cx} cy={cy} r={r} strokeDasharray="4 4" />
      <path d={to} strokeDasharray="5 5" />
    </g>
  );

  const drawings: Record<SketchKind, ReactNode> = {
    laptop: <>
      <rect className="sk" pathLength={1} x="90" y="40" width="230" height="150" rx="10" style={d(0)} />
      <rect className="sk" pathLength={1} x="104" y="54" width="202" height="120" rx="4" style={d(0.25)} />
      {P("M64 198 H346 L372 236 H38 Z", 0.45)}{P("M178 217 H232", 0.65)}
      {Marker(358, 222, 10, "M366 214 Q384 196 404 192")}
    </>,
    phone: <>
      <rect className="sk" pathLength={1} x="178" y="26" width="132" height="246" rx="22" style={d(0)} />
      <rect className="sk" pathLength={1} x="190" y="44" width="108" height="210" rx="8" style={d(0.3)} />
      <circle className="sk" pathLength={1} cx="244" cy="35" r="3" style={d(0.5)} />
      {hazard
        ? <g className="skf" style={d(1.1)} fill="none" stroke="var(--hazard)" strokeWidth="2.4" strokeLinecap="round"><path d="M310 74 Q346 149 310 224" strokeDasharray="6 5" /><path d="M336 140 Q358 124 384 120" strokeDasharray="5 5" /></g>
        : Marker(300, 262, 10, "M310 256 Q350 236 384 230")}
    </>,
    chair: <>
      {P("M170 36 V150 M290 36 V150", 0)}{P("M170 54 H290 M170 88 H290 M170 122 H290", 0.25)}
      {P("M148 150 H312 L328 176 H132 Z", 0.45)}{P("M138 176 V272 M322 176 V272 M170 176 V250 M290 176 V250 M138 236 H322", 0.65)}
      {Marker(322, 186, 11, "M333 180 Q360 156 390 152")}
    </>,
    table: <>
      {P("M70 110 H350 L370 130 H50 Z", 0)}{P("M60 130 V262 M360 130 V262", 0.3)}
      {P("M96 130 V236 M324 130 V236 M60 152 H360", 0.5)}
      {Marker(360, 140, 11, "M370 134 Q392 116 404 110")}
    </>,
    jacket: <>
      {P("M190 36 L160 44 L106 74 L80 196 L112 204 L126 112 L132 270 H308 L314 112 L328 204 L360 196 L334 74 L280 44 L250 36 Q220 62 190 36 Z", 0)}
      {P("M220 56 V270", 0.5)}{P("M150 132 H196 V162 H150 Z M244 132 H290 V162 H244 Z", 0.65)}
      <g className="skf" style={d(1.1)} fill="none" stroke={mark} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M334 124 l9 6 l-7 6 l9 6 l-7 6 l9 6" /><path d="M352 140 Q372 128 392 126" strokeDasharray="5 5" /></g>
    </>,
    shoe: <>
      {P("M60 210 Q60 170 100 160 L170 140 Q200 100 240 110 L250 150 Q300 170 350 180 Q380 188 380 210 Z", 0)}
      {P("M56 210 H384 V226 H56 Z", 0.4)}{P("M190 128 L214 150 M206 120 L228 144", 0.6)}
      {Marker(300, 220, 10, "M310 214 Q360 196 396 190")}
    </>,
    kettle: <>
      {P("M160 250 H320 L304 112 Q240 92 176 112 Z", 0)}{P("M190 106 Q240 72 290 106 M232 82 H248", 0.25)}
      {P("M176 142 L116 112 L122 104 L178 124 M304 128 Q370 136 352 210 L316 222", 0.45)}{P("M146 250 H334 V266 H146 Z", 0.65)}
      {Marker(240, 236, 12, "M254 232 Q330 230 392 214")}
    </>,
    fan: <>
      <circle className="sk" pathLength={1} cx="210" cy="120" r="92" style={d(0)} />
      {P("M210 106 Q186 46 214 34 Q236 66 222 108 M224 122 Q286 132 286 160 Q252 168 214 132 M200 128 Q160 176 134 162 Q144 128 198 116", 0.3)}
      <circle className="sk" pathLength={1} cx="210" cy="120" r="12" style={d(0.5)} />
      {P("M210 212 V250 M150 266 H270 Q270 252 250 252 H170 Q150 252 150 266", 0.65)}
      {Marker(210, 120, 20, "M232 112 Q320 70 392 66")}
    </>,
    pan: <>
      {P("M70 150 H330 Q330 214 200 214 Q70 214 70 150 Z", 0)}{P("M60 150 H340", 0.3)}
      {P("M340 158 H462 Q476 158 476 170 Q476 182 462 182 H340", 0.5)}
      {Marker(200, 186, 14, "M214 180 Q300 120 392 110")}
    </>,
    bag: <>
      {P("M110 120 H330 L350 260 H90 Z", 0)}{P("M160 120 Q160 60 220 60 Q280 60 280 120", 0.35)}
      {P("M110 150 H330 M206 150 V176 H234 V150", 0.55)}
      {Marker(300, 150, 10, "M310 144 Q350 120 392 116")}
    </>,
    plug: <>
      <rect className="sk" pathLength={1} x="170" y="40" width="80" height="70" rx="10" style={d(0)} />
      {P("M190 40 V14 M230 40 V14", 0.3)}{P("M210 110 V150 Q210 200 260 210 Q330 222 340 272", 0.45)}
      {Marker(226, 176, 12, "M240 172 Q320 150 392 146")}
    </>,
    headphones: <>
      {P("M110 170 Q110 50 220 50 Q330 50 330 170", 0)}
      <rect className="sk" pathLength={1} x="92" y="160" width="44" height="82" rx="14" style={d(0.35)} />
      <rect className="sk" pathLength={1} x="304" y="160" width="44" height="82" rx="14" style={d(0.5)} />
      {Marker(326, 200, 12, "M340 196 Q370 180 396 176")}
    </>,
    box: <>
      {P("M140 110 L240 70 L340 110 L240 150 Z", 0)}{P("M140 110 V214 L240 254 V150", 0.25)}
      {P("M340 110 V214 L240 254", 0.45)}{P("M190 90 L290 130 V160", 0.65)}
    </>,
  };

  return (
    <svg viewBox="0 0 520 300" role="img" aria-label={label ?? `Line drawing of the item`} style={{ width: '100%', height: 'auto' }}>
      <g fill="none" stroke="var(--chalk)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{drawings[kind]}</g>
      {caption && kind === 'box' && (
        <g className="skf" style={d(1.1)}>
          <path d="M340 130 Q366 110 392 106" fill="none" stroke="var(--marker)" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" />
          <text x="396" y="104" fill="var(--marker)" style={{ fontFamily: 'var(--hand)', fontSize: 26, fontWeight: 600 }}>
            {caption.length > 14 ? caption.slice(0, 13) + '\u2026' : caption}
          </text>
        </g>
      )}
    </svg>
  );
}
