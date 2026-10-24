import type { Answers, Category, CategoryId, ItemType } from './types';

/**
 * Category knowledge base. Prices are typical Indian retail and repair ranges in rupees, and CO2e
 * figures are rounded, indicative footprints for manufacturing a new item. They exist to make
 * trade-offs comparable, not to be exact, and the interface labels them as estimates.
 */
export const CATEGORIES: Record<CategoryId, Category> = {
  electronics: {
    id: 'electronics',
    name: 'Electronics',
    blurb: 'Laptops, phones, tablets, headphones',
    base: { repair: 45, reuse: 35, repurpose: 25, replace: 35, recycle: 30 },
    items: [
      { id: 'laptop', name: 'Laptop', sketch: 'laptop', newPrice: 45000, repair: [1500, 7000], co2: 300 },
      { id: 'phone', name: 'Phone', sketch: 'phone', newPrice: 18000, repair: [800, 5000], co2: 70 },
      { id: 'tablet', name: 'Tablet', sketch: 'phone', newPrice: 22000, repair: [1200, 6000], co2: 100 },
      { id: 'headphones', name: 'Headphones', sketch: 'headphones', newPrice: 3000, repair: [300, 2000], co2: 12 },
      { id: 'speaker', name: 'Bluetooth speaker', sketch: 'box', newPrice: 2500, repair: [300, 1000], co2: 15 },
    ],
    symptoms: [
      { id: 'wont-charge', label: "Won't charge", type: 'fix' },
      { id: 'battery-drain', label: 'Battery drains fast', type: 'fix' },
      { id: 'slow', label: 'Runs very slow', type: 'fix' },
      { id: 'no-sound', label: 'No sound', type: 'fix' },
      { id: 'cracked-screen', label: 'Cracked screen', type: 'hard' },
      { id: 'water', label: 'Water damage', type: 'hard' },
      { id: 'scratches', label: 'Scratched body', type: 'cosmetic' },
      { id: 'unwanted', label: 'Works, just not needed', type: 'unwanted' },
      { id: 'swollen', label: 'Swollen battery', type: 'hazard' },
    ],
    repairShop: 'mobile and laptop repair shop',
    recycleWhere: 'an authorised e-waste collector',
    diyTools: ['Precision screwdriver set', 'Plastic pry tool', 'Anti-static wrist strap', 'Isopropyl alcohol and cloth'],
  },
  appliances: {
    id: 'appliances',
    name: 'Appliances',
    blurb: 'Kettles, mixers, fans, irons',
    base: { repair: 45, reuse: 30, repurpose: 20, replace: 35, recycle: 30 },
    items: [
      { id: 'kettle', name: 'Electric kettle', sketch: 'kettle', newPrice: 1500, repair: [250, 700], co2: 20 },
      { id: 'mixer', name: 'Mixer grinder', sketch: 'kettle', newPrice: 3500, repair: [300, 1200], co2: 35 },
      { id: 'fan', name: 'Table fan', sketch: 'fan', newPrice: 2200, repair: [200, 800], co2: 25 },
      { id: 'iron', name: 'Iron', sketch: 'box', newPrice: 1200, repair: [200, 600], co2: 15 },
      { id: 'toaster', name: 'Toaster', sketch: 'box', newPrice: 1800, repair: [250, 700], co2: 18 },
    ],
    symptoms: [
      { id: 'not-heating', label: 'Not heating', type: 'fix' },
      { id: 'no-power', label: "Won't turn on", type: 'fix' },
      { id: 'noise', label: 'Strange noise', type: 'fix' },
      { id: 'leaking', label: 'Leaking', type: 'hard' },
      { id: 'motor', label: 'Motor burnt out', type: 'hard' },
      { id: 'casing', label: 'Cracked casing', type: 'cosmetic' },
      { id: 'unwanted', label: 'Works, just not needed', type: 'unwanted' },
      { id: 'burning', label: 'Burning smell or sparks', type: 'hazard' },
    ],
    repairShop: 'electrical appliance repair shop',
    recycleWhere: 'an authorised e-waste collector',
    diyTools: ['Screwdriver set', 'Multimeter', 'Replacement fuse or thermostat', 'Insulation tape'],
  },
  furniture: {
    id: 'furniture',
    name: 'Furniture',
    blurb: 'Chairs, tables, shelves, sofas',
    base: { repair: 50, reuse: 40, repurpose: 45, replace: 20, recycle: 15 },
    items: [
      { id: 'chair', name: 'Chair', sketch: 'chair', newPrice: 3500, repair: [200, 900], co2: 30 },
      { id: 'table', name: 'Table', sketch: 'table', newPrice: 8000, repair: [300, 1500], co2: 60 },
      { id: 'shelf', name: 'Bookshelf', sketch: 'table', newPrice: 6000, repair: [250, 1200], co2: 45 },
      { id: 'sofa', name: 'Sofa', sketch: 'table', newPrice: 25000, repair: [1500, 6000], co2: 90 },
      { id: 'wardrobe', name: 'Wardrobe', sketch: 'box', newPrice: 15000, repair: [500, 2500], co2: 120 },
    ],
    symptoms: [
      { id: 'wobbly', label: 'Wobbly', type: 'fix' },
      { id: 'drawer', label: 'Drawer or door sticks', type: 'fix' },
      { id: 'upholstery', label: 'Torn upholstery', type: 'fix' },
      { id: 'hinge', label: 'Broken hinge', type: 'fix' },
      { id: 'broken-leg', label: 'Broken leg or frame', type: 'hard' },
      { id: 'termite', label: 'Termite damage', type: 'hard' },
      { id: 'surface', label: 'Scratched surface', type: 'cosmetic' },
      { id: 'unwanted', label: 'Fine, just not needed', type: 'unwanted' },
    ],
    repairShop: 'carpenter',
    recycleWhere: 'a scrap dealer, who will take the wood and metal',
    diyTools: ['Wood glue', 'Clamps', 'Screwdriver and spare screws', 'Sandpaper'],
  },
  clothing: {
    id: 'clothing',
    name: 'Clothing',
    blurb: 'Jackets, jeans, shirts, shoes',
    base: { repair: 45, reuse: 40, repurpose: 45, replace: 20, recycle: 25 },
    items: [
      { id: 'jacket', name: 'Jacket', sketch: 'jacket', newPrice: 2500, repair: [100, 450], co2: 25 },
      { id: 'jeans', name: 'Jeans', sketch: 'jacket', newPrice: 1800, repair: [80, 300], co2: 33 },
      { id: 'shirt', name: 'Shirt or top', sketch: 'jacket', newPrice: 900, repair: [50, 200], co2: 7 },
      { id: 'saree', name: 'Saree or dress', sketch: 'jacket', newPrice: 2500, repair: [100, 500], co2: 20 },
      { id: 'shoes', name: 'Shoes', sketch: 'shoe', newPrice: 2500, repair: [150, 600], co2: 14 },
    ],
    symptoms: [
      { id: 'torn-seam', label: 'Torn seam', type: 'fix' },
      { id: 'button', label: 'Missing button or broken zip', type: 'fix' },
      { id: 'sole', label: 'Sole coming off', type: 'fix' },
      { id: 'hole', label: 'Hole in fabric', type: 'fix' },
      { id: 'worn', label: 'Fabric worn thin', type: 'hard' },
      { id: 'stain', label: 'Stain', type: 'cosmetic' },
      { id: 'fit', label: "Doesn't fit any more", type: 'unwanted' },
    ],
    repairShop: 'tailor or cobbler',
    recycleWhere: 'a textile recycling or donation bin',
    diyTools: ['Needle and matching thread', 'Fabric patch or iron-on patch', 'Pins', 'Fabric glue (for shoes: shoe glue)'],
  },
  cables: {
    id: 'cables',
    name: 'Cables and chargers',
    blurb: 'Chargers, USB cables, extension boards',
    base: { repair: 35, reuse: 30, repurpose: 15, replace: 40, recycle: 35 },
    items: [
      { id: 'charger', name: 'Charger', sketch: 'plug', newPrice: 1200, repair: [100, 400], co2: 4 },
      { id: 'usb', name: 'USB cable', sketch: 'plug', newPrice: 400, repair: [50, 150], co2: 1 },
      { id: 'extension', name: 'Extension board', sketch: 'plug', newPrice: 700, repair: [100, 300], co2: 3 },
      { id: 'hdmi', name: 'HDMI cable', sketch: 'plug', newPrice: 500, repair: [80, 200], co2: 1 },
    ],
    symptoms: [
      { id: 'loose', label: 'Loose plug or socket', type: 'fix' },
      { id: 'intermittent', label: 'Works only at an angle', type: 'fix' },
      { id: 'slow-charge', label: 'Charges slowly', type: 'hard' },
      { id: 'bent', label: 'Bent connector', type: 'hard' },
      { id: 'unwanted', label: 'Spare, not needed', type: 'unwanted' },
      { id: 'frayed', label: 'Frayed or exposed wire', type: 'hazard' },
      { id: 'hot', label: 'Gets very hot', type: 'hazard' },
    ],
    repairShop: 'electrical repair shop',
    recycleWhere: 'an authorised e-waste collector',
    diyTools: ['Replacement plug', 'Wire stripper', 'Heat-shrink tubing', 'Screwdriver'],
  },
  kitchen: {
    id: 'kitchen',
    name: 'Kitchenware',
    blurb: 'Pans, cookers, jars, vessels',
    base: { repair: 40, reuse: 35, repurpose: 35, replace: 30, recycle: 30 },
    items: [
      { id: 'nonstick', name: 'Non-stick pan', sketch: 'pan', newPrice: 1200, repair: [150, 400], co2: 10 },
      { id: 'cooker', name: 'Pressure cooker', sketch: 'pan', newPrice: 2200, repair: [100, 500], co2: 18 },
      { id: 'jar', name: 'Glass jar', sketch: 'box', newPrice: 300, repair: [0, 100], co2: 2 },
      { id: 'vessel', name: 'Steel vessel', sketch: 'pan', newPrice: 800, repair: [80, 300], co2: 8 },
      { id: 'board', name: 'Cutting board', sketch: 'box', newPrice: 500, repair: [0, 150], co2: 3 },
    ],
    symptoms: [
      { id: 'handle', label: 'Loose handle', type: 'fix' },
      { id: 'gasket', label: 'Worn gasket or whistle', type: 'fix' },
      { id: 'warped', label: 'Warped base', type: 'hard' },
      { id: 'chipped', label: 'Chipped or dented', type: 'cosmetic' },
      { id: 'unwanted', label: 'Fine, just not needed', type: 'unwanted' },
      { id: 'peeling', label: 'Coating peeling into food', type: 'hazard' },
    ],
    repairShop: 'utensil repair shop',
    recycleWhere: 'a scrap dealer, who will take the metal',
    diyTools: ['Screwdriver', 'Replacement handle screws', 'Replacement gasket', 'Steel wool'],
  },
  accessories: {
    id: 'accessories',
    name: 'Accessories',
    blurb: 'Bags, watches, umbrellas, sunglasses',
    base: { repair: 45, reuse: 40, repurpose: 35, replace: 25, recycle: 20 },
    items: [
      { id: 'bag', name: 'Bag', sketch: 'bag', newPrice: 1800, repair: [100, 500], co2: 10 },
      { id: 'watch', name: 'Watch', sketch: 'box', newPrice: 3000, repair: [150, 800], co2: 8 },
      { id: 'umbrella', name: 'Umbrella', sketch: 'box', newPrice: 450, repair: [50, 150], co2: 3 },
      { id: 'sunglasses', name: 'Sunglasses', sketch: 'box', newPrice: 1500, repair: [100, 500], co2: 2 },
      { id: 'wallet', name: 'Wallet', sketch: 'bag', newPrice: 800, repair: [80, 300], co2: 3 },
    ],
    symptoms: [
      { id: 'strap', label: 'Broken strap', type: 'fix' },
      { id: 'zip', label: 'Zip splitting', type: 'fix' },
      { id: 'battery', label: 'Watch battery dead', type: 'fix' },
      { id: 'frame', label: 'Snapped frame', type: 'hard' },
      { id: 'scuffed', label: 'Scuffed or faded', type: 'cosmetic' },
      { id: 'unwanted', label: 'Fine, just not needed', type: 'unwanted' },
    ],
    repairShop: 'cobbler or watch repair shop',
    recycleWhere: 'separate bins for fabric, metal and plastic',
    diyTools: ['Needle and heavy thread', 'Zip slider replacement', 'Small screwdriver', 'Strong glue'],
  },
  other: {
    id: 'other',
    name: 'Something else',
    blurb: 'Anything not listed. Just type it in.',
    base: { repair: 42, reuse: 36, repurpose: 32, replace: 32, recycle: 28 },
    items: [],
    symptoms: [
      { id: 'not-working', label: 'Stopped working', type: 'fix' },
      { id: 'broken-part', label: 'A part is broken or missing', type: 'fix' },
      { id: 'loose', label: 'Loose or wobbly', type: 'fix' },
      { id: 'cracked', label: 'Cracked or badly damaged', type: 'hard' },
      { id: 'worn', label: 'Worn out', type: 'hard' },
      { id: 'cosmetic', label: 'Scratched or faded', type: 'cosmetic' },
      { id: 'unwanted', label: 'Works, just not needed', type: 'unwanted' },
      { id: 'unsafe', label: 'Unsafe: sparks, smoke or sharp edges', type: 'hazard' },
    ],
    repairShop: 'local repair shop',
    recycleWhere: 'a local recycler or scrap dealer',
    diyTools: ['Screwdriver set', 'Strong glue', 'Tape and clamps', 'Replacement parts for your model'],
  },
};

export const CATEGORY_ORDER: CategoryId[] = ['electronics', 'appliances', 'furniture', 'clothing', 'cables', 'kitchen', 'accessories', 'other'];

export const OTHER_ITEM = 'other';

const median = (xs: number[]) => { const s = [...xs].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

/** Builds an item the user typed in, using typical cost ratios from its category. */
export function customItem(cat: CategoryId, name: string, price?: number): ItemType {
  const own = CATEGORIES[cat].items;
  const pool = own.length ? own : Object.values(CATEGORIES).flatMap((c) => c.items);
  const p = price && price > 0 ? price : median(pool.map((i) => i.newPrice));
  const lo = median(pool.map((i) => i.repair[0] / i.newPrice));
  const hi = median(pool.map((i) => i.repair[1] / i.newPrice));
  const co2 = median(pool.map((i) => i.co2 / i.newPrice));
  const r50 = (n: number) => Math.max(50, Math.round(n / 50) * 50);
  return { id: OTHER_ITEM, name: name.trim() || 'Your item', sketch: 'box', newPrice: p, repair: [r50(p * lo), r50(p * hi)], co2: Math.max(0.5, Math.round(p * co2 * 10) / 10) };
}

export function getItem(cat: CategoryId, itemId: string): ItemType {
  const c = CATEGORIES[cat];
  return c.items.find((i) => i.id === itemId) ?? c.items[0] ?? customItem(cat, '');
}

type ItemAnswers = Pick<Answers, 'category' | 'itemType' | 'name' | 'customPrice' | 'customCategory' | 'powered'>;

export const isCustom = (a: ItemAnswers) => a.category === 'other' || a.itemType === OTHER_ITEM;

/** The item for any answers, whether it is a listed item or one the user typed. */
export function itemFor(a: ItemAnswers): ItemType {
  return isCustom(a) ? customItem(a.category, a.name, a.customPrice) : getItem(a.category, a.itemType);
}

export function categoryName(a: ItemAnswers): string {
  return a.category === 'other' ? (a.customCategory?.trim() || 'Something else') : CATEGORIES[a.category].name;
}

export function isPowered(a: ItemAnswers): boolean {
  return a.category === 'other' ? !!a.powered : ['electronics', 'appliances', 'cables'].includes(a.category);
}

export function shopFor(a: ItemAnswers): string {
  return a.category === 'other' && a.powered ? 'local electrical repair shop' : CATEGORIES[a.category].repairShop;
}

export function recycleFor(a: ItemAnswers): string {
  return a.category === 'other' && a.powered ? 'an authorised e-waste collector' : CATEGORIES[a.category].recycleWhere;
}

export const AGE_LABELS = ['Under 1 year', '1 to 3 years', '3 to 5 years', '5 to 8 years', '8+ years'];
export const AGE_NOTES = ['under a year old', '1 to 3 years old', '3 to 5 years old', '5 to 8 years old', 'over 8 years old'];
export const USAGE_LABELS = ['Light', 'Regular', 'Heavy'];
export const CONDITION_LABELS = ['Like new', 'Good', 'Fair', 'Poor', 'Broken'];
export const WORKS_LABELS = ['Fully', 'Partly', 'Not at all'];
export const SEVERITY_LABELS = ['', 'Minor', 'Moderate', 'Severe'];
export const DIY_LABELS = ['Never', 'A little', 'Confident'];
export const TIME_LABELS: Record<string, string> = { today: 'Today', week: 'This week', norush: 'No rush' };
export const PRIORITY_LABELS: Record<string, string> = { money: 'Save money', time: 'Save time', eco: 'Lowest impact', effort: 'Least effort' };
