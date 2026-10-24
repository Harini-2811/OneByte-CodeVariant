import { CATEGORIES, CATEGORY_ORDER, getItem, isCustom, itemFor } from '../data/categories';
import type { Answers, CategoryId, SketchKind } from '../data/types';

/** Extra words people use for items, mapped to [category, item type]. */
const SYNONYMS: Record<string, [CategoryId, string]> = {
  mobile: ['electronics', 'phone'], smartphone: ['electronics', 'phone'], iphone: ['electronics', 'phone'], notebook: ['electronics', 'laptop'], macbook: ['electronics', 'laptop'],
  ipad: ['electronics', 'tablet'], earphones: ['electronics', 'headphones'], earbuds: ['electronics', 'headphones'], headset: ['electronics', 'headphones'],
  mixie: ['appliances', 'mixer'], blender: ['appliances', 'mixer'], grinder: ['appliances', 'mixer'],
  desk: ['furniture', 'table'], stool: ['furniture', 'chair'], couch: ['furniture', 'sofa'], almirah: ['furniture', 'wardrobe'], cupboard: ['furniture', 'wardrobe'],
  pants: ['clothing', 'jeans'], trousers: ['clothing', 'jeans'], tshirt: ['clothing', 'shirt'], 't-shirt': ['clothing', 'shirt'], kurta: ['clothing', 'shirt'], dress: ['clothing', 'saree'], sneakers: ['clothing', 'shoes'], sandals: ['clothing', 'shoes'], chappal: ['clothing', 'shoes'],
  cable: ['cables', 'usb'], cord: ['cables', 'usb'], adapter: ['cables', 'charger'], 'power bank': ['electronics', 'phone'],
  pan: ['kitchen', 'nonstick'], tawa: ['kitchen', 'nonstick'], kadai: ['kitchen', 'vessel'], cooker: ['kitchen', 'cooker'], jar: ['kitchen', 'jar'], bottle: ['kitchen', 'jar'],
  backpack: ['accessories', 'bag'], purse: ['accessories', 'wallet'], handbag: ['accessories', 'bag'], glasses: ['accessories', 'sunglasses'],
};

const SYMPTOM_WORDS: Record<string, string[]> = {
  'wont-charge': ['charge', 'charging'], 'battery-drain': ['drain', 'battery life'], slow: ['slow', 'lag', 'hang'], 'cracked-screen': ['crack', 'screen broke', 'broken screen'], water: ['water', 'wet'], swollen: ['swollen', 'bulging', 'puffy'],
  'not-heating': ['heat', 'heating', 'not hot'], 'no-power': ["won't turn on", 'not turning on', 'dead', 'no power'], noise: ['noise', 'noisy', 'grinding'], leaking: ['leak'], burning: ['burning', 'smoke', 'spark'],
  wobbly: ['wobbl', 'shaky', 'loose leg'], 'broken-leg': ['broken leg', 'leg broke'], upholstery: ['upholster', 'cushion torn'], termite: ['termite'],
  'torn-seam': ['seam', 'torn', 'tear'], hole: ['hole'], button: ['button', 'zip'], sole: ['sole'], stain: ['stain'], fit: ["doesn't fit", 'too small', 'too big', 'tight'],
  frayed: ['fray', 'exposed', 'wire showing'], loose: ['loose'], hot: ['gets hot', 'overheat'],
  peeling: ['peel', 'flaking', 'coating'], handle: ['handle'], gasket: ['gasket', 'whistle'],
  zip: ['zip'], strap: ['strap'], unwanted: ['not needed', "don't need", 'spare', 'unused', 'extra'],
};

export interface Guess {
  category: CategoryId;
  itemType: string;
  symptom?: string;
}

/** Turns "my kettle stopped heating" into a prefilled diagnosis. Returns null when unsure. */
export function guess(text: string): Guess | null {
  const t = ' ' + text.toLowerCase().replace(/[^a-z0-9' -]/g, ' ') + ' ';
  let hit: [CategoryId, string] | null = null;
  for (const c of CATEGORY_ORDER) {
    for (const it of CATEGORIES[c].items) {
      const words = it.name.toLowerCase().split(/ or | /).filter((w) => w.length > 2);
      if (words.some((w) => t.includes(' ' + w))) { hit = [c, it.id]; break; }
    }
    if (hit) break;
  }
  if (!hit) {
    for (const [w, v] of Object.entries(SYNONYMS)) if (t.includes(w)) { hit = v; break; }
  }
  if (!hit) return null;
  const [category, itemType] = hit;
  const ids = new Set(CATEGORIES[category].symptoms.map((s) => s.id));
  let symptom: string | undefined;
  for (const [id, words] of Object.entries(SYMPTOM_WORDS)) {
    if (ids.has(id) && words.some((w) => t.includes(w))) { symptom = id; break; }
  }
  return { category, itemType, symptom };
}

/** Picks a drawing for the mat. Typed items get a matching sketch if we recognise the word, otherwise a parcel. */
export function sketchFor(a: Answers): SketchKind {
  if (!isCustom(a)) return itemFor(a).sketch;
  const g = guess(a.name);
  return g ? getItem(g.category, g.itemType).sketch : 'box';
}
