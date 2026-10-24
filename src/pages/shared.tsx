import { Link } from 'react-router-dom';
import type { CategoryId } from '../data/types';
import { Lines } from '../components/ui';

export const CAT_ICONS: Record<CategoryId, string> = {
  electronics: 'M4 5h16v11H4z M2 20h20',
  appliances: 'M5 2h14v20H5z M5 6h14 M12 9a5 5 0 1 0 0 10a5 5 0 1 0 0-10',
  furniture: 'M6 10V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4 M4 10h16v5H4z M6 15v5 M18 15v5',
  clothing: 'M20.4 6.6L16 4a4 4 0 0 1-8 0L3.6 6.6a2 2 0 0 0-.9 2.4l.6 1.8a1 1 0 0 0 1.1.7H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V11.5h1.6a1 1 0 0 0 1.1-.7l.6-1.8a2 2 0 0 0-.9-2.4z',
  cables: 'M12 22v-5 M9 8V2 M15 8V2 M6 8h12v4a6 6 0 0 1-12 0z',
  kitchen: 'M2 12h20 M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8 M8 8V6 M12 8V4 M16 8V6',
  accessories: 'M8 6h8v12H8z M9 6l1-4h4l1 4 M9 18l1 4h4l1-4',
  other: 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20 M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3 M12 17h.01',
};

export function Missing({ title = 'Nothing on the bench here.', text = "This item isn't in your current session. Items are kept only until you close the tab." }: { title?: string; text?: string }) {
  return (
    <section className="wrap" style={{ padding: '96px 24px', maxWidth: 760 }}>
      <h1 className="h-xl"><Lines lines={[title]} /></h1>
      <p className="lede fu muted" style={{ marginTop: 18, animationDelay: '.7s' }}>{text}</p>
      <div className="row fu" style={{ marginTop: 28, flexWrap: 'wrap', animationDelay: '.85s' }}>
        <Link to="/diagnose?new=1" className="btn btn-tag sheen">Start a diagnosis</Link>
        <Link to="/shelf" className="btn btn-line">Open my shelf</Link>
      </div>
    </section>
  );
}
