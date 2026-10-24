import { CATEGORIES, getItem } from './categories';
import type { Answers, CategoryId, PathId } from './types';

export interface Step {
  title: string;
  detail: string;
}

export interface RepurposeIdea {
  id: string;
  category: CategoryId;
  from: string;
  to: string;
  effort: number;
  time: string;
  materials: string[];
  safety: string;
  steps: string[];
}

export const REPURPOSE_IDEAS: RepurposeIdea[] = [
  { id: 'laptop-media', category: 'electronics', from: 'Old laptop', to: 'Home media player', effort: 2, time: '1 hour', materials: ['HDMI cable', 'A free media app'], safety: 'Check the battery is not swollen; run it plugged in if the battery is weak.', steps: ['Back up and wipe it', 'Install a lightweight media app', 'Connect it to your TV over HDMI'] },
  { id: 'phone-camera', category: 'electronics', from: 'Old phone', to: 'Home security camera', effort: 2, time: '30 minutes', materials: ['Phone stand', 'Charger', 'A free camera app'], safety: 'Never use a phone with a swollen battery. Keep it ventilated while charging.', steps: ['Factory reset it', 'Install a camera monitoring app', 'Mount it and keep it on charge'] },
  { id: 'speaker-radio', category: 'electronics', from: 'Old tablet', to: 'Kitchen recipe screen', effort: 1, time: '20 minutes', materials: ['Tablet stand'], safety: 'Keep it away from the stove and water.', steps: ['Remove unused apps', 'Add your favourite recipe sites', 'Mount it on a stand'] },
  { id: 'kettle-planter', category: 'appliances', from: 'Dead kettle', to: 'Herb planter', effort: 2, time: '1 hour', materials: ['Potting soil', 'Small stones', 'Herb seedlings'], safety: 'Cut the cable and remove the heating base before planting.', steps: ['Remove the cable and base', 'Drill drainage holes', 'Add stones, soil and herbs'] },
  { id: 'fan-cage', category: 'appliances', from: 'Fan guard', to: 'Wall photo display', effort: 2, time: '1 hour', materials: ['Mini pegs', 'Wall hook'], safety: 'Remove the motor and blades completely.', steps: ['Unscrew the front guard', 'Clean and paint it', 'Clip photos on with mini pegs'] },
  { id: 'chair-plant', category: 'furniture', from: 'Wobbly chair', to: 'Plant stand', effort: 2, time: 'An afternoon', materials: ['Sandpaper', 'Outdoor paint', 'Pot to fit the seat'], safety: 'Make sure it stands steady before putting a heavy pot on it.', steps: ['Remove the seat or cut a hole for the pot', 'Sand and paint it', 'Set the pot in place'] },
  { id: 'drawer-storage', category: 'furniture', from: 'Old drawer', to: 'Under-bed storage', effort: 2, time: '2 hours', materials: ['4 castor wheels', 'Screws'], safety: 'Check for nails and splinters.', steps: ['Clean and sand the drawer', 'Screw castors to the base', 'Slide it under the bed'] },
  { id: 'door-table', category: 'furniture', from: 'Table top', to: 'Wall shelf', effort: 3, time: 'An afternoon', materials: ['Shelf brackets', 'Wall plugs', 'Drill'], safety: 'Use brackets rated for the weight and fix them into a solid wall.', steps: ['Cut to size if needed', 'Fix the brackets level', 'Screw the shelf on'] },
  { id: 'jacket-tote', category: 'clothing', from: 'Denim jacket', to: 'Tote bag', effort: 3, time: 'A weekend', materials: ['Sewing kit or machine', 'Strap fabric'], safety: 'Remove metal rivets carefully.', steps: ['Cut the back panel', 'Sew the sides and base', 'Add straps from the sleeves'] },
  { id: 'tshirt-rags', category: 'clothing', from: 'Worn T-shirts', to: 'Cleaning cloths', effort: 1, time: '15 minutes', materials: ['Scissors'], safety: 'None.', steps: ['Cut into squares', 'Hem the edges if you like', 'Use, wash, reuse'] },
  { id: 'saree-cushion', category: 'clothing', from: 'Old saree', to: 'Cushion covers', effort: 3, time: 'A weekend', materials: ['Sewing kit', 'Cushion inserts', 'Zip or buttons'], safety: 'None.', steps: ['Measure the cushions', 'Cut two panels each', 'Sew with a zip or envelope back'] },
  { id: 'cable-ties', category: 'cables', from: 'Spare cables', to: 'Plant ties and organisers', effort: 1, time: '15 minutes', materials: ['Scissors'], safety: 'Only use cables that are not damaged. Cut off plugs.', steps: ['Cut off the plugs', 'Cut to lengths', 'Use as soft plant ties'] },
  { id: 'pan-tray', category: 'kitchen', from: 'Worn-out pan', to: 'Plant tray or bird bath', effort: 1, time: '20 minutes', materials: ['Pebbles'], safety: 'Never cook with a pan whose coating is peeling.', steps: ['Remove the handle', 'Add pebbles', 'Use under pots or fill with water'] },
  { id: 'jar-pens', category: 'kitchen', from: 'Chipped jar', to: 'Pen and brush holder', effort: 1, time: '15 minutes', materials: ['Sandpaper', 'Paint (optional)'], safety: 'Sand any sharp chips smooth first.', steps: ['Sand the chipped edge', 'Paint or wrap it', 'Use on your desk'] },
  { id: 'bag-pouch', category: 'accessories', from: 'Old bag', to: 'Storage pouches', effort: 2, time: '2 hours', materials: ['Sewing kit', 'Zips from the bag'], safety: 'None.', steps: ['Unpick the panels', 'Reuse its zips', 'Sew small pouches'] },
  { id: 'strap-keys', category: 'accessories', from: 'Watch strap', to: 'Key holder', effort: 1, time: '15 minutes', materials: ['Key ring'], safety: 'None.', steps: ['Remove the buckle', 'Loop it through a key ring', 'Fix with the buckle pin'] },
];

export interface Material {
  id: string;
  name: string;
  examples: string;
  prep: string[];
  where: string;
  never: string;
}

export const MATERIALS: Material[] = [
  { id: 'ewaste', name: 'E-waste', examples: 'Phones, laptops, chargers, small appliances', prep: ['Back up and factory reset', 'Remove SIM and memory cards', 'Take out removable batteries'], where: 'An authorised e-waste collector, or a brand take-back programme.', never: 'Never put electronics in household bins.' },
  { id: 'batteries', name: 'Batteries', examples: 'Lithium-ion, AA and AAA, power banks', prep: ['Tape over the terminals', 'Keep swollen batteries in a cool, open place', 'Do not puncture or crush'], where: 'An e-waste collector or a battery drop-off box.', never: 'Never bin them. Damaged lithium batteries can start fires.' },
  { id: 'textiles', name: 'Textiles', examples: 'Clothes, sarees, bedsheets, shoes', prep: ['Wash and dry', 'Pair shoes together', 'Separate wearable from worn-out'], where: 'Donate wearable items; textile recycling bins for the rest.', never: "Don't throw wearable clothes away." },
  { id: 'metal', name: 'Metal', examples: 'Steel vessels, pans, frames, cookers', prep: ['Remove plastic handles', 'Empty and clean'], where: 'A scrap dealer (kabadiwala). Metal often earns a little money.', never: "Don't mix with food waste." },
  { id: 'wood', name: 'Wood', examples: 'Chairs, tables, shelves', prep: ['Remove glass and fabric', 'Check for termites'], where: 'A carpenter may reuse it; otherwise a scrap dealer.', never: "Don't burn painted or treated wood." },
  { id: 'plastic', name: 'Plastic', examples: 'Casings, containers, cutting boards', prep: ['Clean and dry', 'Separate by type if marked'], where: 'Dry-waste collection or a scrap dealer.', never: "Don't burn plastic." },
  { id: 'glass', name: 'Glass', examples: 'Jars, bottles', prep: ['Rinse', 'Wrap broken pieces in paper'], where: 'Dry-waste collection or a scrap dealer.', never: 'Never leave broken glass loose in a bag.' },
];

export interface Problem {
  id: string;
  category: CategoryId;
  itemType: string;
  symptom: string;
  title: string;
  note: string;
  verdict: string;
  path: PathId;
}

export const PROBLEMS: Problem[] = [
  { id: 'kettle', category: 'appliances', itemType: 'kettle', symptom: 'not-heating', title: 'Kettle stopped heating', note: 'Usually the element or thermostat.', verdict: 'Often worth repairing', path: 'repair' },
  { id: 'jeans', category: 'clothing', itemType: 'jeans', symptom: 'hole', title: 'Jeans torn at the knee', note: 'Patch them, or turn them into shorts.', verdict: 'Repair or repurpose', path: 'repurpose' },
  { id: 'cable', category: 'cables', itemType: 'charger', symptom: 'frayed', title: 'Frayed charger cable', note: 'Stop using it right away.', verdict: 'Recycle safely', path: 'recycle' },
  { id: 'chair', category: 'furniture', itemType: 'chair', symptom: 'wobbly', title: 'Wobbly dining chair', note: 'Loose joints need glue and a clamp.', verdict: 'Easy repair', path: 'repair' },
  { id: 'pan', category: 'kitchen', itemType: 'nonstick', symptom: 'peeling', title: 'Non-stick pan peeling', note: "Flaking coating shouldn't touch food.", verdict: 'Recycle the metal', path: 'recycle' },
  { id: 'battery', category: 'electronics', itemType: 'phone', symptom: 'battery-drain', title: 'Phone battery drains fast', note: 'A battery swap is often cheap.', verdict: 'Often worth repairing', path: 'repair' },
  { id: 'zip', category: 'accessories', itemType: 'bag', symptom: 'zip', title: 'Bag zip keeps splitting', note: 'A tailor or cobbler can replace it.', verdict: 'Easy repair', path: 'repair' },
  { id: 'slow', category: 'electronics', itemType: 'laptop', symptom: 'slow', title: 'Old laptop is very slow', note: 'More memory or an SSD can transform it.', verdict: 'Repair or reuse', path: 'reuse' },
  { id: 'fan', category: 'appliances', itemType: 'fan', symptom: 'noise', title: 'Fan makes a grinding noise', note: 'Usually needs cleaning and oil.', verdict: 'Easy repair', path: 'repair' },
  { id: 'shoes', category: 'clothing', itemType: 'shoes', symptom: 'sole', title: 'Shoe sole coming off', note: 'A cobbler can re-glue or re-stitch it.', verdict: 'Easy repair', path: 'repair' },
  { id: 'cooker', category: 'kitchen', itemType: 'cooker', symptom: 'gasket', title: 'Cooker whistle leaks steam', note: 'A new gasket costs very little.', verdict: 'Easy repair', path: 'repair' },
  { id: 'table', category: 'furniture', itemType: 'table', symptom: 'unwanted', title: 'Table you no longer need', note: 'Someone nearby probably does.', verdict: 'Reuse it', path: 'reuse' },
];

/* ---------------- action plans ---------------- */

const mapLink = (q: string) => 'https://www.google.com/maps/search/' + encodeURIComponent(q + ' near me');

export interface PlanContent {
  steps: Step[];
  notesTitle: string;
  notes: string[];
  tip: string;
  links: { label: string; href: string }[];
}

export function planFor(path: PathId, a: Answers, mode: 'diy' | 'pro', hazard: boolean): PlanContent {
  const cat = CATEGORIES[a.category];
  const item = getItem(a.category, a.itemType);
  const thing = item.name.toLowerCase();
  const usesData = a.category === 'electronics';

  if (path === 'repair') {
    if (mode === 'diy' && !hazard) {
      return {
        steps: [
          { title: 'Confirm the fault', detail: `Rule out the simple stuff first. For a ${thing}, try another socket, charger or a quick clean.` },
          { title: 'Check the warranty', detail: a.warranty === 'no' ? 'You said it is out of warranty, so a DIY fix will not void anything.' : 'If it is still covered, a free repair beats DIY. Check before opening it.' },
          { title: 'Get the tools and part', detail: 'You will need the tools listed on the bench. Buy the exact part for your model.' },
          { title: 'Follow a guide for your model', detail: 'Search for a step-by-step repair guide for your exact model. Photograph every step as you go.' },
          { title: 'Test, then recycle the old part', detail: `Test it before closing up. Take the broken part to ${cat.recycleWhere}.` },
        ],
        notesTitle: 'Tools for this job',
        notes: cat.diyTools,
        tip: 'Keep screws in labelled cups or an egg tray, in the order you removed them.',
        links: [{ label: 'Find repair guides', href: 'https://www.google.com/search?q=' + encodeURIComponent(`${item.name} repair guide`) }],
      };
    }
    return {
      steps: [
        { title: 'Note the symptoms', detail: 'Write down exactly what happens and when. It speeds up diagnosis and avoids paying for guesswork.' },
        { title: a.warranty === 'no' ? 'Find a local repair shop' : 'Try the warranty first', detail: a.warranty === 'no' ? `Look for a ${cat.repairShop} nearby and ask two of them for a quote.` : 'Contact the brand service centre with your bill. Repairs under warranty are usually free.' },
        { title: 'Ask the right questions', detail: 'Is the part new or refurbished? Is the repair guaranteed? How long will it take?' },
        { title: usesData ? 'Back up and protect your data' : 'Agree the price first', detail: usesData ? 'Back up and sign out of accounts before you hand it over.' : 'Agree a price in writing before work starts.' },
        { title: 'Keep the bill', detail: 'A repair bill helps if the same fault comes back, and when you sell it later.' },
      ],
      notesTitle: 'Questions for the shop',
      notes: ['Is the part new or refurbished?', 'Is the repair guaranteed?', 'Can I have the old part back?'],
      tip: hazard ? 'Because of the safety issue, do not attempt this yourself. Tell the technician about it upfront.' : 'A fair repair usually costs well under half the price of a new one.',
      links: [{ label: `Find a ${cat.repairShop} nearby`, href: mapLink(cat.repairShop) }, { label: 'Find a repair café', href: mapLink('repair cafe') }],
    };
  }

  if (path === 'reuse') {
    return {
      steps: [
        { title: 'Clean it and check it', detail: 'Make sure it is safe and works the way you will describe it.' },
        { title: usesData ? 'Wipe personal data' : 'Gather the extras', detail: usesData ? 'Back up, sign out of every account, then factory reset.' : 'Manuals, spare parts and accessories make it more useful.' },
        { title: 'Try it in a new role first', detail: `Could your ${thing} do a different job at home before it leaves?` },
        { title: 'Offer it locally', detail: 'Friends, family, a building group, or a local resale or giveaway app.' },
        { title: 'Or donate it', detail: 'Charities, schools and shelters often need exactly this.' },
      ],
      notesTitle: 'Where it could go',
      notes: ['Family or neighbours', 'A local giveaway group', 'A charity or school'],
      tip: 'Describe any faults honestly. It builds trust and avoids returns.',
      links: [{ label: 'Find donation points nearby', href: mapLink('donation centre') }],
    };
  }

  if (path === 'repurpose') {
    const ideas = REPURPOSE_IDEAS.filter((i) => i.category === a.category);
    return {
      steps: [
        { title: 'Pick an idea', detail: 'Start with the simplest one below. You can always try another later.' },
        { title: 'Make it safe', detail: `Remove ${a.category === 'electronics' || a.category === 'appliances' || a.category === 'cables' ? 'batteries, cables and' : ''} sharp edges or anything that could break.` },
        { title: 'Gather materials', detail: 'Most ideas need basic tools and things you already own.' },
        { title: 'Make it', detail: 'Give yourself a free afternoon or a weekend.' },
        { title: 'Recycle the leftovers', detail: `Whatever you do not use goes to ${cat.recycleWhere}.` },
      ],
      notesTitle: 'Ideas for this item',
      notes: ideas.map((i) => `${i.from.toLowerCase()} into ${i.to.toLowerCase()}`),
      tip: 'Repurposing is the best use of materials that cannot do their original job any more.',
      links: [],
    };
  }

  if (path === 'replace') {
    return {
      steps: [
        { title: 'Sell or trade in the old one', detail: 'Even broken items have value as parts. Many brands offer exchange discounts.' },
        { title: 'Look at refurbished first', detail: 'Certified refurbished is cheaper and has a far lower footprint than new.' },
        { title: 'Check repairability', detail: 'Choose a model with available spare parts and a real warranty.' },
        { title: 'Recycle what is left', detail: `If nobody wants the old one, take it to ${cat.recycleWhere}.` },
      ],
      notesTitle: 'Buy smarter',
      notes: ['Refurbished first', 'Trade in the old one', 'Check for spare parts'],
      tip: 'If you do replace, the old item still matters. Sell it, donate it or recycle it.',
      links: [{ label: `Find refurbished ${thing}s`, href: 'https://www.google.com/search?q=' + encodeURIComponent(`certified refurbished ${item.name}`) }],
    };
  }

  const isE = a.category === 'electronics' || a.category === 'appliances' || a.category === 'cables';
  return {
    steps: [
      { title: 'Make it safe', detail: hazard ? 'Stop using it now. Keep it in a cool, open place away from anything flammable.' : 'Stop using anything damaged.' },
      { title: isE ? 'Wipe data and remove batteries' : 'Empty and clean it', detail: isE ? 'Factory reset anything with accounts. Remove batteries and tape the terminals.' : 'Clean items are easier to recycle.' },
      { title: 'Separate the materials', detail: 'Metal, plastic, glass, wood and fabric are recycled differently.' },
      { title: 'Drop it off', detail: `Take it to ${cat.recycleWhere}.` },
      { title: 'Never use household bins', detail: isE ? 'Batteries and electronics in household waste can start fires.' : 'Sorted materials are far more likely to be recycled.' },
    ],
    notesTitle: 'Before you drop it off',
    notes: isE ? ['Batteries out first', 'Tape the terminals', 'Ask for a receipt'] : ['Clean and dry', 'Separate materials', 'Ask the scrap dealer'],
    tip: 'Recycling recovers materials, but it is the last step, not the first.',
    links: [{ label: isE ? 'Find e-waste collectors nearby' : 'Find recyclers nearby', href: mapLink(isE ? 'e-waste collection centre' : 'scrap dealer') }],
  };
}
