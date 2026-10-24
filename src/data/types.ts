export type PathId = 'repair' | 'reuse' | 'repurpose' | 'replace' | 'recycle';
export type CategoryId = 'electronics' | 'appliances' | 'furniture' | 'clothing' | 'cables' | 'kitchen' | 'accessories';
export type SketchKind = 'laptop' | 'phone' | 'chair' | 'table' | 'jacket' | 'shoe' | 'kettle' | 'fan' | 'pan' | 'bag' | 'plug' | 'headphones' | 'box';

/** How a symptom affects the decision. */
export type SymptomType =
  | 'fix' //      commonly repairable fault
  | 'hard' //     expensive or difficult to repair
  | 'cosmetic' // looks worse, works the same
  | 'unwanted' // works fine, the owner just doesn't need it
  | 'hazard'; //  unsafe to keep using

export type Severity = 1 | 2 | 3;

export interface Symptom {
  id: string;
  label: string;
  type: SymptomType;
}

export interface ItemType {
  id: string;
  name: string;
  sketch: SketchKind;
  /** Typical price of a new one, in rupees. */
  newPrice: number;
  /** Typical professional repair range, in rupees. */
  repair: [number, number];
  /** Rough embodied footprint of making a new one, kg CO2e. Indicative only. */
  co2: number;
}

export interface Category {
  id: CategoryId;
  name: string;
  blurb: string;
  base: Record<PathId, number>;
  items: ItemType[];
  symptoms: Symptom[];
  repairShop: string;
  recycleWhere: string;
  diyTools: string[];
}

export type Usage = 0 | 1 | 2;
export type Works = 0 | 1 | 2;
export type Warranty = 'yes' | 'no' | 'unsure';
export type TimeAvail = 'today' | 'week' | 'norush';
export type Priority = 'money' | 'time' | 'eco' | 'effort';
export type Access = 'yes' | 'no' | 'unsure';

export interface Answers {
  category: CategoryId;
  itemType: string;
  name: string;
  /** 0 under 1 yr, 1 1–3, 2 3–5, 3 5–8, 4 8+ */
  age: 0 | 1 | 2 | 3 | 4;
  /** 0 light, 1 regular, 2 heavy */
  usage: Usage;
  /** 0 like new … 4 broken */
  condition: 0 | 1 | 2 | 3 | 4;
  /** 0 fully, 1 partly, 2 not at all */
  works: Works;
  warranty: Warranty;
  symptoms: Record<string, Severity>;
  notes: string;
  /** 0 never, 1 a little, 2 confident */
  diy: 0 | 1 | 2;
  budget: number;
  time: TimeAvail;
  priority: Priority;
  repairAccess: Access;
}

export type ReasonKind = 'base' | 'plus' | 'minus' | 'block';
export interface Reason {
  label: string;
  delta: number;
  kind: ReasonKind;
}

export interface Tradeoff {
  cost: string;
  costMid: number;
  time: string;
  difficulty: number;
  effort: number;
  eco: number;
  co2Saved: number;
  moneySaved: number;
}

export interface Result {
  scores: Record<PathId, number>;
  reasons: Record<PathId, Reason[]>;
  blocked: Partial<Record<PathId, string>>;
  hazard: boolean;
  ranking: PathId[];
  top: PathId;
  gap: number;
  confidence: 'High confidence' | 'Medium confidence' | 'Close call';
  tradeoffs: Record<PathId, Tradeoff>;
  repairEstimate: number;
}
