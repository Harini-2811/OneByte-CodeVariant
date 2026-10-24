import type { Answers } from './types';

export interface Preset {
  id: string;
  label: string;
  icon: string;
  answers: Answers;
}

const ICON = {
  laptop: 'M4 5h16v11H4z M2 20h20',
  chair: 'M6 10V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4 M4 10h16v5H4z M6 15v5 M18 15v5',
  shirt: 'M20.4 6.6L16 4a4 4 0 0 1-8 0L3.6 6.6a2 2 0 0 0-.9 2.4l.6 1.8a1 1 0 0 0 1.1.7H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V11.5h1.6a1 1 0 0 0 1.1-.7l.6-1.8a2 2 0 0 0-.9-2.4z',
  phone: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M12 18h.01',
};

/** One-click demo items, so anyone (including judges) can see a full result instantly. */
export const PRESETS: Preset[] = [
  {
    id: 'laptop', label: "Laptop won't charge", icon: ICON.laptop,
    answers: { category: 'electronics', itemType: 'laptop', name: 'Laptop', age: 1, usage: 1, condition: 2, works: 1, warranty: 'no', symptoms: { 'wont-charge': 2 }, notes: '', diy: 0, budget: 4000, time: 'week', priority: 'money', repairAccess: 'unsure' },
  },
  {
    id: 'chair', label: 'Wobbly chair', icon: ICON.chair,
    answers: { category: 'furniture', itemType: 'chair', name: 'Wooden chair', age: 3, usage: 1, condition: 2, works: 1, warranty: 'no', symptoms: { wobbly: 2 }, notes: '', diy: 1, budget: 2000, time: 'week', priority: 'eco', repairAccess: 'unsure' },
  },
  {
    id: 'jacket', label: 'Torn denim jacket', icon: ICON.shirt,
    answers: { category: 'clothing', itemType: 'jacket', name: 'Denim jacket', age: 2, usage: 1, condition: 1, works: 0, warranty: 'no', symptoms: { 'torn-seam': 1 }, notes: '', diy: 1, budget: 1000, time: 'norush', priority: 'money', repairAccess: 'yes' },
  },
  {
    id: 'phone', label: 'Swollen phone battery', icon: ICON.phone,
    answers: { category: 'electronics', itemType: 'phone', name: 'Old phone', age: 4, usage: 2, condition: 3, works: 1, warranty: 'no', symptoms: { swollen: 3 }, notes: '', diy: 0, budget: 2000, time: 'week', priority: 'eco', repairAccess: 'unsure' },
  },
];
