import { CATEGORIES, isPowered, itemFor, recycleFor, shopFor } from './categories';
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
  { id: 'other-parts', category: 'other', from: 'Anything broken', to: 'Spare-parts donor', effort: 2, time: '1 hour', materials: ['Screwdriver', 'Labelled bags'], safety: 'Remove batteries and anything sharp first.', steps: ['Take off useful parts: screws, knobs, cables, fabric', 'Label and store them', 'Recycle the rest'] },
  { id: 'other-makers', category: 'other', from: 'Anything still sound', to: 'Project material for a school or maker space', effort: 1, time: '30 minutes', materials: ['A bag or box'], safety: 'Mention any faults when you hand it over.', steps: ['Clean it', 'Ask a local school, college or maker space', 'Drop it off'] },
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
  /** Prefills the item name, for items in "Something else". */
  name?: string;
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
  { id: 'toy', category: 'other', itemType: 'other', name: 'Toy', symptom: 'broken-part', title: 'Toy with a broken part', note: 'Glue, a new screw or a spare part usually does it.', verdict: 'Easy repair', path: 'repair' },
  { id: 'instrument', category: 'other', itemType: 'other', name: 'Guitar', symptom: 'not-working', title: "Instrument that won't play right", note: 'Strings, pegs and pads are cheap to replace.', verdict: 'Often worth repairing', path: 'repair' },
];

/* ---------------- tips for repair, reuse and replace ---------------- */

export interface Tip {
  id: string;
  path: 'repair' | 'reuse' | 'replace';
  /** 'all' means the tip applies to any item. */
  category: CategoryId | 'all';
  title: string;
  summary: string;
  points: string[];
}

export const TIPS: Tip[] = [
  // repair
  { id: 'r-charge', path: 'repair', category: 'electronics', title: "Phone or laptop won't charge", summary: 'Usually the cable, the adapter or lint in the port.', points: ['Try a different cable, adapter and socket', 'Switch it off, then clear the port gently with a dry toothbrush', 'Still dead? A port or battery swap at a repair shop is usually affordable'] },
  { id: 'r-slow', path: 'repair', category: 'electronics', title: 'Speed up a slow laptop', summary: 'Most slow laptops need tidying or one cheap upgrade.', points: ['Remove apps that start automatically', 'Keep at least 20% of the storage free', 'An SSD or extra memory can make an old laptop feel new'] },
  { id: 'r-kettle', path: 'repair', category: 'appliances', title: "Kettle that won't heat", summary: 'Often a contact or thermostat fault, not the whole kettle.', points: ['Check the socket and the plug fuse first', 'Unplug, then clean the contacts on the base', 'A thermostat swap at a repair shop costs far less than a new kettle'] },
  { id: 'r-fan', path: 'repair', category: 'appliances', title: 'Quiet a noisy fan', summary: 'Dust and dry bearings cause most of the noise.', points: ['Unplug it and clean the blades and guard', 'Add a drop of sewing-machine oil to the motor shaft', 'Tighten the blade screw and the guard clips'] },
  { id: 'r-chair', path: 'repair', category: 'furniture', title: 'Fix a wobbly chair', summary: 'Loose joints are the usual cause, and an easy fix.', points: ['Tighten every screw and bolt first', 'Work wood glue into loose joints', 'Clamp or tie it tight and leave it overnight'] },
  { id: 'r-seam', path: 'repair', category: 'clothing', title: 'Mend a torn seam', summary: 'A ten-minute job by hand, or a quick visit to a tailor.', points: ['Turn the garment inside out', 'Use a backstitch along the original seam line', 'Or ask a tailor; small seam repairs cost very little'] },
  { id: 'r-plug', path: 'repair', category: 'cables', title: 'Loose plug on a cable', summary: 'Only for cables with no visible damage to the wire.', points: ['Unplug it before you touch anything', 'Fit a replacement plug rated for the device', 'If any wire is exposed, replace the cable instead'] },
  { id: 'r-gasket', path: 'repair', category: 'kitchen', title: 'Cooker leaking steam', summary: 'A worn gasket is the usual culprit, and very cheap.', points: ['Check the brand and size printed on the lid', 'Buy a matching gasket and safety valve', 'Soak the new gasket in water before fitting it'] },
  { id: 'r-zip', path: 'repair', category: 'accessories', title: 'Zip that keeps splitting', summary: 'The slider has usually just loosened.', points: ['Squeeze the slider gently closed with pliers', 'Run it up and down a few times to test', 'If the teeth are damaged, a tailor or cobbler can replace the zip'] },
  { id: 'r-any', path: 'repair', category: 'all', title: 'Before any repair', summary: 'Three checks that save time and money.', points: ['Check the warranty or guarantee first', 'Photograph each step as you take it apart', 'Ask for a quote before agreeing to any repair'] },
  // reuse
  { id: 'u-local', path: 'reuse', category: 'all', title: 'Pass it on nearby', summary: 'Someone close by usually needs exactly what you have.', points: ['Ask family, friends and neighbours first', 'Post it in your building or neighbourhood group', 'Use a local resale or giveaway app'] },
  { id: 'u-devices', path: 'reuse', category: 'electronics', title: 'Donate working devices', summary: 'Schools and charities can put old devices straight to use.', points: ['Back up, sign out and factory reset it', 'Include the charger and cable', 'Ask local schools, NGOs and community centres'] },
  { id: 'u-clothes', path: 'reuse', category: 'clothing', title: 'Donate wearable clothes', summary: 'Clean, wearable clothes help someone immediately.', points: ['Wash and fold them', 'Keep pairs of shoes together', 'Give them to a clothing bank, shelter or donation drive'] },
  { id: 'u-furniture', path: 'reuse', category: 'furniture', title: 'Find furniture a new home', summary: 'Furniture is costly to replace, so it is easy to pass on.', points: ['Offer it to new tenants or students moving in', 'Hostels and community halls often need tables and chairs', 'Take clear photos and give accurate measurements'] },
  { id: 'u-appliances', path: 'reuse', category: 'appliances', title: 'Give appliances a second home', summary: 'A working appliance you have replaced is still useful.', points: ['Clean it and test that it works safely', 'Offer it to a hostel, shelter or someone setting up a home', 'Include the manual if you still have it'] },
  { id: 'u-kitchen', path: 'reuse', category: 'kitchen', title: 'Reuse jars and containers', summary: 'Glass and steel containers last for decades.', points: ['Use them for dry storage at home', 'Take them to refill and bulk stores', 'Offer spares to local food sellers'] },
  { id: 'u-swap', path: 'reuse', category: 'accessories', title: 'Swap instead of storing', summary: 'Bags, watches and accessories are popular at swaps.', points: ['Look for a local swap event or group', 'Clean and check zips and straps first', 'Bundle small items together'] },
  { id: 'u-role', path: 'reuse', category: 'all', title: 'Give it a new job at home', summary: 'Something you have outgrown can still do a simpler task.', points: ['An old phone becomes a music player or alarm clock', 'A spare chair becomes a bedside table', 'An old laptop becomes a family recipe or video screen'] },
  // replace
  { id: 'p-refurb', path: 'replace', category: 'all', title: 'Look at refurbished first', summary: 'Cheaper than new, with a far smaller footprint.', points: ['Choose certified refurbished with a warranty', 'Check the return policy before you buy', 'Compare the price with a new one to be sure it is worth it'] },
  { id: 'p-repairable', path: 'replace', category: 'all', title: 'Buy something you can repair', summary: 'Your next item should outlive this one.', points: ['Check spare parts are sold for the model', 'Look for a service centre near you', 'Prefer screws over glue where you can'] },
  { id: 'p-trade', path: 'replace', category: 'all', title: 'Trade in the old one', summary: 'Even a broken item can lower the price of the new one.', points: ['Ask about exchange offers when you buy', 'Sell working parts separately', 'Recycle whatever is left properly'] },
  { id: 'p-battery', path: 'replace', category: 'electronics', title: 'Choose a replaceable battery', summary: 'The battery is usually the first part to wear out.', points: ['Check whether the battery can be replaced', 'Look up the price of a replacement battery', 'Avoid models where the battery is glued in'] },
  { id: 'p-clothes', path: 'replace', category: 'clothing', title: 'Buy fewer, better clothes', summary: 'Well-made clothes are easier to repair and last longer.', points: ['Check the stitching and the fabric weight', 'Prefer natural or single-fibre fabrics, which recycle better', 'Buy second-hand where you can'] },
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
  const item = itemFor(a);
  const thing = item.name.toLowerCase();
  const usesData = a.category === 'electronics' || (a.category === 'other' && !!a.powered);

  if (path === 'repair') {
    if (mode === 'diy' && !hazard) {
      return {
        steps: [
          { title: 'Confirm the fault', detail: `Rule out the simple stuff first. For a ${thing}, try another socket, charger or a quick clean.` },
          { title: 'Check the warranty', detail: a.warranty === 'no' ? 'You said it is out of warranty, so a DIY fix will not void anything.' : 'If it is still covered, a free repair beats DIY. Check before opening it.' },
          { title: 'Get the tools and part', detail: 'You will need the tools listed on the bench. Buy the exact part for your model.' },
          { title: 'Follow a guide for your model', detail: 'Search for a step-by-step repair guide for your exact model. Photograph every step as you go.' },
          { title: 'Test, then recycle the old part', detail: `Test it before closing up. Take the broken part to ${recycleFor(a)}.` },
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
        { title: a.warranty === 'no' ? 'Find a local repair shop' : 'Try the warranty first', detail: a.warranty === 'no' ? `Look for a ${shopFor(a)} nearby and ask two of them for a quote.` : 'Contact the brand service centre with your bill. Repairs under warranty are usually free.' },
        { title: 'Ask the right questions', detail: 'Is the part new or refurbished? Is the repair guaranteed? How long will it take?' },
        { title: usesData ? 'Back up and protect your data' : 'Agree the price first', detail: usesData ? 'Back up and sign out of accounts before you hand it over.' : 'Agree a price in writing before work starts.' },
        { title: 'Keep the bill', detail: 'A repair bill helps if the same fault comes back, and when you sell it later.' },
      ],
      notesTitle: 'Questions for the shop',
      notes: ['Is the part new or refurbished?', 'Is the repair guaranteed?', 'Can I have the old part back?'],
      tip: hazard ? 'Because of the safety issue, do not attempt this yourself. Tell the technician about it upfront.' : 'A fair repair usually costs well under half the price of a new one.',
      links: [{ label: `Find a ${shopFor(a)} nearby`, href: mapLink(shopFor(a)) }, { label: 'Find a repair café', href: mapLink('repair cafe') }],
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
        { title: 'Make it safe', detail: `Remove ${isPowered(a) ? 'batteries, cables and' : ''} sharp edges or anything that could break.` },
        { title: 'Gather materials', detail: 'Most ideas need basic tools and things you already own.' },
        { title: 'Make it', detail: 'Give yourself a free afternoon or a weekend.' },
        { title: 'Recycle the leftovers', detail: `Whatever you do not use goes to ${recycleFor(a)}.` },
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
        { title: 'Recycle what is left', detail: `If nobody wants the old one, take it to ${recycleFor(a)}.` },
      ],
      notesTitle: 'Buy smarter',
      notes: ['Refurbished first', 'Trade in the old one', 'Check for spare parts'],
      tip: 'If you do replace, the old item still matters. Sell it, donate it or recycle it.',
      links: [{ label: `Find refurbished ${thing}s`, href: 'https://www.google.com/search?q=' + encodeURIComponent(`certified refurbished ${item.name}`) }],
    };
  }

  const isE = isPowered(a);
  return {
    steps: [
      { title: 'Make it safe', detail: hazard ? 'Stop using it now. Keep it in a cool, open place away from anything flammable.' : 'Stop using anything damaged.' },
      { title: isE ? 'Wipe data and remove batteries' : 'Empty and clean it', detail: isE ? 'Factory reset anything with accounts. Remove batteries and tape the terminals.' : 'Clean items are easier to recycle.' },
      { title: 'Separate the materials', detail: 'Metal, plastic, glass, wood and fabric are recycled differently.' },
      { title: 'Drop it off', detail: `Take it to ${recycleFor(a)}.` },
      { title: 'Never use household bins', detail: isE ? 'Batteries and electronics in household waste can start fires.' : 'Sorted materials are far more likely to be recycled.' },
    ],
    notesTitle: 'Before you drop it off',
    notes: isE ? ['Batteries out first', 'Tape the terminals', 'Ask for a receipt'] : ['Clean and dry', 'Separate materials', 'Ask the scrap dealer'],
    tip: 'Recycling recovers materials, but it is the last step, not the first.',
    links: [{ label: isE ? 'Find e-waste collectors nearby' : 'Find recyclers nearby', href: mapLink(isE ? 'e-waste collection centre' : 'scrap dealer') }],
  };
}
