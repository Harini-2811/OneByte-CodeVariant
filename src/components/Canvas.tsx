/**
 * The Canvas Protocol: primary actions happen by dragging a data card into an Action Zone.
 *
 * Works with mouse, touch and keyboard. Keyboard: focus a card, press Space or Enter to pick it up,
 * use the arrow keys to jump between drop zones, and press Space or Enter again to drop it
 * (Escape cancels). Every step is announced to screen readers.
 */
import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import {
  DndContext, DragOverlay, KeyboardSensor, MouseSensor, TouchSensor, pointerWithin, rectIntersection,
  useDraggable, useDroppable, useSensor, useSensors,
  type Announcements, type CollisionDetection, type DragEndEvent, type DragStartEvent, type KeyboardCoordinateGetter,
} from '@dnd-kit/core';
import '../styles/canvas.css';

export interface CardData {
  kind: string;
  label: string;
  [key: string]: unknown;
}

/** Return false to reject a drop (the card glides back). `zone` is null when dropped outside any zone. */
export type DropHandler = (card: CardData, zone: string | null) => boolean | void;

interface Ctx { active: CardData | null; flash: string | null; seen: boolean }
const CanvasCtx = createContext<Ctx>({ active: null, flash: null, seen: true });

const SEEN_KEY = 'fif-dragged';
/** True once the user has completed at least one drop (stops the "Drag me" hints). */
export function hasDragged(): boolean {
  try { return localStorage.getItem(SEEN_KEY) === '1'; } catch { return true; }
}
function markDragged() {
  try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* private mode */ }
  window.dispatchEvent(new Event('fif:dragged'));
}

/** Prefer the zone under the pointer; fall back to overlap (used by touch and keyboard). */
const collision: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  return hits.length ? hits : rectIntersection(args);
};

/** Arrow keys jump straight to the next or previous drop zone instead of nudging pixel by pixel. */
const jumpToZones: KeyboardCoordinateGetter = (event, { context }) => {
  const { droppableRects, droppableContainers, collisionRect } = context;
  if (!collisionRect) return undefined;
  const forward = event.code === 'ArrowRight' || event.code === 'ArrowDown';
  const back = event.code === 'ArrowLeft' || event.code === 'ArrowUp';
  if (!forward && !back) return undefined;
  event.preventDefault();
  const rects = droppableContainers.getEnabled()
    .map((c) => droppableRects.get(c.id))
    .filter((r): r is NonNullable<typeof r> => !!r)
    .sort((a, b) => a.top - b.top || a.left - b.left);
  if (!rects.length) return undefined;
  const cx = collisionRect.left + collisionRect.width / 2;
  const cy = collisionRect.top + collisionRect.height / 2;
  let i = rects.findIndex((r) => cx >= r.left && cx <= r.left + r.width && cy >= r.top && cy <= r.top + r.height);
  i = i === -1 ? (forward ? 0 : rects.length - 1) : (i + (forward ? 1 : -1) + rects.length) % rects.length;
  const r = rects[i];
  return { x: r.left + r.width / 2 - collisionRect.width / 2, y: r.top + r.height / 2 - collisionRect.height / 2 };
};

export function Canvas({ children, onDrop }: { children: ReactNode; onDrop: DropHandler }) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 140, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: jumpToZones }),
  );
  const [active, setActive] = useState<CardData | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [seen, setSeen] = useState<boolean>(hasDragged);
  const timer = useRef<number>();

  const start = (e: DragStartEvent) => setActive((e.active.data.current as CardData) ?? null);
  const end = (e: DragEndEvent) => {
    const card = e.active.data.current as CardData | undefined;
    setActive(null);
    if (!card) return;
    const zone = e.over;
    const accepts = (zone?.data.current?.accepts as string[] | undefined) ?? [];
    const zoneId = zone && accepts.includes(card.kind) ? String(zone.id) : null;
    const ok = onDrop(card, zoneId);
    if (zoneId && ok !== false) {
      if (!seen) { setSeen(true); markDragged(); }
      setFlash(zoneId);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setFlash(null), 900);
    }
  };

  const zoneName = (over: { data: { current?: Record<string, unknown> } } | null) => (over?.data.current?.label as string | undefined) ?? 'a drop zone';
  const announcements: Announcements = {
    onDragStart: ({ active: a }) => `Picked up ${(a.data.current as CardData)?.label}. Use the arrow keys to move between drop zones, then press Space to drop, or Escape to cancel.`,
    onDragOver: ({ active: a, over }) => (over ? `${(a.data.current as CardData)?.label} is over ${zoneName(over)}.` : `${(a.data.current as CardData)?.label} is not over a drop zone.`),
    onDragEnd: ({ active: a, over }) => (over ? `Dropped ${(a.data.current as CardData)?.label} on ${zoneName(over)}.` : `${(a.data.current as CardData)?.label} was put back.`),
    onDragCancel: ({ active: a }) => `Cancelled. ${(a.data.current as CardData)?.label} was put back.`,
  };

  return (
    <DndContext sensors={sensors} collisionDetection={collision} onDragStart={start} onDragEnd={end} onDragCancel={() => setActive(null)}
      accessibility={{ announcements, screenReaderInstructions: { draggable: 'To pick up this card, press Space or Enter. Use the arrow keys to move between drop zones. Press Space or Enter again to drop it, or Escape to cancel.' } }}>
      <CanvasCtx.Provider value={{ active, flash, seen }}>
        {children}
      </CanvasCtx.Provider>
      <DragOverlay dropAnimation={{ duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' }}>
        {active ? <div className="dcard is-lifted">{active.node as ReactNode}</div> : null}
      </DragOverlay>
    </DndContext>
  );
}

/** A card that can be picked up and dropped into an Action Zone. */
export function DragCard({ id, data, children, className = '', style, disabled, nudge }: {
  id: string; data: CardData; children: ReactNode; className?: string; style?: CSSProperties; disabled?: boolean;
  /** Short hint ("Drag me") shown with a gentle wiggle until the user has completed a first drop. */
  nudge?: string;
}) {
  const { seen, active } = useContext(CanvasCtx);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, data: { ...data, node: children }, disabled });
  const showNudge = !!nudge && !seen && !active && !disabled;
  // Keyboard pickup only from the card itself, so Enter on a link or button inside it still works normally.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    listeners?.onKeyDown?.(e);
  };
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} onKeyDown={onKeyDown} aria-roledescription="draggable card" aria-disabled={disabled || undefined}
      data-nudge={showNudge ? nudge : undefined}
      className={`dcard ${isDragging ? 'is-ghost' : ''} ${disabled ? 'is-disabled' : ''} ${showNudge ? 'nudge' : ''} ${className}`} style={style}>
      {children}
    </div>
  );
}

/** Six-dot grip shown on draggable cards. */
export function Grip({ light }: { light?: boolean }) {
  return (
    <span className="grip" aria-hidden="true" style={light ? { color: 'rgba(21,32,28,.55)' } : undefined}>
      <svg width="12" height="18" viewBox="0 0 12 18" fill="currentColor"><circle cx="3" cy="3" r="1.6" /><circle cx="9" cy="3" r="1.6" /><circle cx="3" cy="9" r="1.6" /><circle cx="9" cy="9" r="1.6" /><circle cx="3" cy="15" r="1.6" /><circle cx="9" cy="15" r="1.6" /></svg>
    </span>
  );
}

interface ZoneProps {
  id: string;
  label: string;
  hint: string;
  /** Shown while an accepted card is over the zone, e.g. "Release to run the diagnosis". */
  release: string;
  accepts: string[];
  icon?: ReactNode;
  tone?: string;
  /** "bare" keeps the children's own look and adds an overlay while dragging. "list" stacks cards inside. */
  variant?: 'tray' | 'bare' | 'list';
  /** A slim, single-row tray for small tool actions. */
  compact?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** An Action Zone. It glows when a card it accepts is being dragged, and stamps when one lands. */
export function DropZone({ id, label, hint, release, accepts, icon, tone = 'var(--marker)', variant = 'tray', compact, children, className = '', style }: ZoneProps) {
  const { active, flash } = useContext(CanvasCtx);
  const { setNodeRef, isOver } = useDroppable({ id, data: { accepts, label } });
  const can = !!active && accepts.includes(active.kind);
  const cls = [
    variant === 'bare' ? 'dzone-bare' : 'dzone', variant === 'list' ? 'dzone-list' : '', compact ? 'compact' : '',
    can ? 'is-ready' : '', can && isOver ? 'is-over' : '', active && !can ? 'is-muted' : '', flash === id ? 'is-done' : '', className,
  ].join(' ');

  return (
    <div ref={setNodeRef} className={cls} style={{ ['--tone' as string]: tone, ...style }} role="region" aria-label={`${label}: ${hint}`}>
      {variant === 'tray' && (
        <>
          {icon && <span className="dz-icon" aria-hidden="true">{icon}</span>}
          {compact ? (
            <span className="dz-text"><span className="dz-label">{label}</span><span className="dz-hint">{can && isOver ? release : hint}</span></span>
          ) : (
            <>
              <span className="dz-label">{label}</span>
              <span className="dz-hint">{can && isOver ? release : hint}</span>
            </>
          )}
          {children}
        </>
      )}
      {variant === 'list' && (
        <>
          <div className="dz-head">
            {icon && <span className="dz-icon sm" aria-hidden="true">{icon}</span>}
            <span className="dz-label">{label}</span>
          </div>
          <div className="dz-body">{children}</div>
          <span className="dz-hint">{can && isOver ? release : hint}</span>
        </>
      )}
      {variant === 'bare' && (
        <>
          {children}
          <div className="dz-veil" aria-hidden="true">
            <span className="dz-label">{can && isOver ? release : label}</span>
          </div>
        </>
      )}
    </div>
  );
}

export function useCanvas() {
  return useContext(CanvasCtx);
}

/**
 * A small drag-and-drop tool strip: one document card (this result, this plan, your shelf)
 * and slim zones for tool actions like Share, Print and Export. Replaces the old tool buttons.
 */
export function ToolTray({ card, cardIcon, tools }: {
  card: string;
  cardIcon: ReactNode;
  tools: { id: string; label: string; hint: string; release: string; icon: ReactNode; run: () => void }[];
}) {
  return (
    <Canvas onDrop={(c, zone) => {
      if (c.kind !== 'doc' || !zone) return false;
      const t = tools.find((x) => x.id === zone);
      if (!t) return false;
      window.setTimeout(t.run, 250);
      return true;
    }}>
      <div className="tooltray">
        <DragCard id="doc" data={{ kind: 'doc', label: card }}>
          <span className="chip doc-chip">{cardIcon}{card}<Grip /></span>
        </DragCard>
        <span className="tooltray-arrow" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14 M13 6l6 6-6 6" /></svg>
        </span>
        {tools.map((t) => (
          <DropZone key={t.id} id={t.id} label={t.label} hint={t.hint} release={t.release} accepts={['doc']} compact icon={t.icon} />
        ))}
      </div>
    </Canvas>
  );
}

/** Explains drag and drop on first visit; disappears after the first successful drop. */
export function DragGuide() {
  const [show, setShow] = useState<boolean>(() => !hasDragged());
  useEffect(() => {
    const off = () => setShow(false);
    window.addEventListener('fif:dragged', off);
    return () => window.removeEventListener('fif:dragged', off);
  }, []);
  if (!show) return null;
  return (
    <div className="drag-guide" role="note">
      <div className="wrap row" style={{ gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Grip />
        <span><strong>This app works by drag and drop.</strong> Pick up any card with the dots and drop it into a dashed zone to make things happen.</span>
        <span className="muted" style={{ fontSize: 13 }}>Keyboard: Space to pick up, arrow keys to move, Space to drop.</span>
      </div>
    </div>
  );
}
