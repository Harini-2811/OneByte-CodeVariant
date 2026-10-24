export function rupee(n: number): string {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

/** Compact rupees: ₹850, ₹1.5k, ₹45k. */
export function rupeeShort(n: number): string {
  const v = Math.round(n);
  if (v < 1000) return '₹' + v;
  const k = v / 1000;
  return '₹' + (k >= 10 ? Math.round(k) : Math.round(k * 10) / 10) + 'k';
}

export function rupeeRange(lo: number, hi: number): string {
  if (hi <= 0) return 'Free';
  if (lo <= 0) return 'Up to ' + rupeeShort(hi);
  return rupeeShort(lo) + '–' + rupeeShort(hi);
}

export function kg(n: number): string {
  if (n < 1) return 'under 1 kg';
  return (n >= 10 ? Math.round(n) : Math.round(n * 10) / 10) + ' kg';
}

export function signed(n: number): string {
  if (n > 0) return '+' + n;
  if (n < 0) return '−' + Math.abs(n);
  return '0';
}
