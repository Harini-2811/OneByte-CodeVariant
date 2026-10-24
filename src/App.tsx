import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Background, Footer, Header, RouteFocus, Tape } from './components/Shell';
import Home from './pages/Home';
import Diagnose from './pages/Diagnose';
import Analysing from './pages/Analysing';
import Results from './pages/Results';
import Plan from './pages/Plan';
import Shelf from './pages/Shelf';
import Library from './pages/Library';
import { NotFound, Shared } from './pages/Misc';

const TITLES: [RegExp, string][] = [
  [/^\/$/, 'Fix It First — Repair, reuse, repurpose, replace or recycle?'],
  [/^\/diagnose/, 'Diagnose an item — Fix It First'],
  [/^\/item\/[^/]+\/analysing/, 'Diagnosing… — Fix It First'],
  [/^\/item\/[^/]+\/plan/, 'Your plan — Fix It First'],
  [/^\/item\//, 'Your options — Fix It First'],
  [/^\/shelf/, 'My shelf — Fix It First'],
  [/^\/fixes/, 'Common fixes — Fix It First'],
];

export default function App() {
  const loc = useLocation();
  useEffect(() => {
    document.title = TITLES.find(([r]) => r.test(loc.pathname))?.[1] ?? 'Page not found — Fix It First';
  }, [loc.pathname]);

  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <Background />
      <Tape />
      <RouteFocus />
      <Header />
      {/* Keyed by path, so every page change replays the reveal sequence. */}
      <main id="main" tabIndex={-1} key={loc.pathname} style={{ outline: 'none' }}>
        <Routes location={loc}>
          <Route path="/" element={<Home />} />
          <Route path="/diagnose" element={<Diagnose />} />
          <Route path="/item/:id/analysing" element={<Analysing />} />
          <Route path="/item/:id" element={<Results />} />
          <Route path="/item/:id/plan/:path" element={<Plan />} />
          <Route path="/shelf" element={<Shelf />} />
          <Route path="/fixes" element={<Library />} />
          <Route path="/shared" element={<Shared />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
