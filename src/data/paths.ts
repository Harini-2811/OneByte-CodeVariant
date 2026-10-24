import type { PathId } from './types';

export const PATH_ORDER: PathId[] = ['repair', 'reuse', 'repurpose', 'replace', 'recycle'];

export interface PathMeta {
  id: PathId;
  name: string;
  verb: string;
  line: string;
  keeps: string;
  keepsLevel: number;
  color: string;
  icon: string;
}

export const PATHS: Record<PathId, PathMeta> = {
  repair: {
    id: 'repair', name: 'Repair', verb: 'Repair it',
    line: 'Fix the fault and keep the whole thing.',
    keeps: 'The whole item, with you', keepsLevel: 5, color: 'var(--repair)',
    icon: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  },
  reuse: {
    id: 'reuse', name: 'Reuse', verb: 'Reuse it',
    line: 'A new owner, or a new job at home.',
    keeps: 'The whole item, elsewhere', keepsLevel: 4, color: 'var(--reuse)',
    icon: 'M17 2l4 4-4 4 M3 11v-1a4 4 0 0 1 4-4h14 M7 22l-4-4 4-4 M21 13v1a4 4 0 0 1-4 4H3',
  },
  repurpose: {
    id: 'repurpose', name: 'Repurpose', verb: 'Repurpose it',
    line: 'Same materials, made into something else.',
    keeps: 'Most materials, new form', keepsLevel: 3, color: 'var(--repurpose)',
    icon: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z',
  },
  replace: {
    id: 'replace', name: 'Replace', verb: 'Replace it',
    line: 'Buy smarter, and pass the old one on.',
    keeps: 'Parts, if resold or traded', keepsLevel: 2, color: 'var(--replace)',
    icon: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0',
  },
  recycle: {
    id: 'recycle', name: 'Recycle', verb: 'Recycle it',
    line: 'Recover the raw materials, safely.',
    keeps: 'Raw materials only', keepsLevel: 1, color: 'var(--recycle)',
    icon: 'M7 19H4.8a1.8 1.8 0 0 1-1.6-2.7L7.2 9.5 M11 19h8.2a1.8 1.8 0 0 0 1.6-2.7l-1.2-2.1 M14 16l-3 3 3 3 M8.3 13.6L7.2 9.5 3.1 10.6 M9.3 5.3l1.1-1.9a1.8 1.8 0 0 1 3.1 0l3.9 6.8 M13.4 9.5l3.9 1.1 1.1-4.1',
  },
};
