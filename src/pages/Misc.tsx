import { useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CATEGORIES } from '../data/categories';
import { decodeAnswers, useSession } from '../state/session';
import { Lines, Mat } from '../components/ui';
import { Missing } from './shared';

/** Opens a result someone shared. The answers travel in the link, so no server is needed. */
export function Shared() {
  const [params] = useSearchParams();
  const { add, toast } = useSession();
  const nav = useNavigate();
  const done = useRef(false);
  const a = decodeAnswers(params.get('d') ?? '');
  const valid = !!a && !!CATEGORIES[a.category];

  useEffect(() => {
    if (!valid || done.current || !a) return;
    done.current = true;
    const id = add(a);
    toast('Opened a shared result. It is now on your shelf.');
    nav(`/item/${id}`, { replace: true });
  }, [valid, a, add, nav, toast]);

  if (!valid) return <Missing title="That link didn't work." text="The shared result is incomplete or damaged. You can run your own diagnosis in about 90 seconds." />;
  return null;
}

export function NotFound() {
  return (
    <section className="wrap" style={{ paddingTop: 72, paddingBottom: 96 }}>
      <div className="split" style={{ alignItems: 'center' }}>
        <div style={{ flex: '1 1 380px' }}>
          <p className="kicker fu" style={{ animationDelay: '.4s' }}>Page not found</p>
          <h1 className="h-xl" style={{ marginTop: 10 }}><Lines lines={["This page didn't", 'survive the repair.']} /></h1>
          <p className="lede muted fu" style={{ marginTop: 18, animationDelay: '.8s' }}>The link may be old, or the page may have moved.</p>
          <div className="row fu" style={{ marginTop: 26, flexWrap: 'wrap', animationDelay: '.95s' }}>
            <Link to="/" className="btn btn-ink sheen">Back to the bench</Link>
            <Link to="/diagnose?new=1" className="btn btn-line">Start a diagnosis</Link>
          </div>
        </div>
        <div className="fi" style={{ flex: '1 1 320px', animationDelay: '.6s' }}>
          <Mat style={{ minHeight: 260, display: 'grid', placeItems: 'center' }}>
            <span className="disp" style={{ fontSize: 120, fontWeight: 800, letterSpacing: '-0.06em', color: 'var(--chalk)' }}>404</span>
            <span className="hand" style={{ position: 'absolute', right: 26, bottom: 20, fontSize: 24, color: 'var(--marker)' }}>missing part</span>
          </Mat>
        </div>
      </div>
    </section>
  );
}

export { Missing };
