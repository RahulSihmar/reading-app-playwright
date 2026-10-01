import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { articles } from './articles.js';

function ReadingPage() {
  const { pageNumber } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [spooky, setSpooky] = useState(false);
  const index = Number(pageNumber) - 1;
  const article = articles[index];
  const nextIndex = (index + 1) % articles.length;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSpooky(false);
  }, [location.pathname]);

  useEffect(() => {
    document.title = `${article?.title ?? 'Reflection'} — Still / Becoming`;
  }, [article?.title]);

  useEffect(() => {
    if (!spooky) return undefined;
    const timer = window.setTimeout(() => setSpooky(false), 1300);
    return () => window.clearTimeout(timer);
  }, [spooky]);

  if (!article) return <Navigate to="/read/1" replace />;

  return (
    <main className={`reading-page${spooky ? ' is-spooky' : ''}`}>
      <div className="reading-shell">
        <div className="article-topline">
          <span>{article.date}</span>
          <span>{article.readTime}</span>
        </div>

        <article aria-labelledby="article-title">
          <p className="eyebrow">{article.category} <span aria-hidden="true">/</span> Original reflection</p>
          <h1 id="article-title">{article.title}</h1>
          <p className="article-intro">{article.intro}</p>
          <div className="article-rule" aria-hidden="true"><span>✳</span></div>
          <div className="article-copy">
            {article.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <p className="article-signoff">A note to return to, whenever you need it.</p>
        </article>

        <nav className="article-navigation" aria-label="Article navigation">
          <label htmlFor="article-picker">Choose a reflection</label>
          <select
            id="article-picker"
            value={index + 1}
            onChange={(event) => navigate(`/read/${event.target.value}`)}
          >
            {articles.map((item, itemIndex) => (
              <option key={item.title} value={itemIndex + 1}>
                {String(itemIndex + 1).padStart(2, '0')} — {item.title}
              </option>
            ))}
          </select>
          <Link className="next-button" to={`/read/${nextIndex + 1}`}>
            <span>Next reflection</span><span aria-hidden="true">↗</span>
          </Link>
        </nav>

        <section className="playful-note" aria-label="Optional playful effect">
          <span className="playful-icon" aria-hidden="true">☾</span>
          <div>
            <h2>A little midnight magic</h2>
            <p>Tap if you dare. The ghost is friendly.</p>
          </div>
          <button
            className="spooky-button"
            type="button"
            aria-pressed={spooky}
            onClick={() => setSpooky(true)}
          >
            Summon a ghost <span aria-hidden="true">✦</span>
          </button>
          <span className="ghost" aria-hidden="true">👻</span>
          {spooky && (
            <span className="spooky-message" role="status" aria-live="polite">
              A quiet presence passed by.
            </span>
          )}
        </section>

        <footer className="page-footer">
          <span>Page {String(index + 1).padStart(2, '0')} of {String(articles.length).padStart(2, '0')}</span>
          <span>Take what is useful. Leave the rest.</span>
        </footer>
      </div>
    </main>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const parsedPage = Number(location.pathname.split('/').at(-1));
  const currentPage = !Number.isNaN(parsedPage) && parsedPage >= 1 && parsedPage <= articles.length ? parsedPage : 1;

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="site-frame">
      <header className="site-header">
        <Link className="wordmark" to="/read/1" aria-label="Still Becoming home">
          <span className="wordmark-mark" aria-hidden="true">s.</span>
          <span>still <i>/</i> becoming</span>
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? 'Close' : 'Explore'} <span aria-hidden="true">{menuOpen ? '−' : '+'}</span>
        </button>
        <nav
          className={`site-navigation${menuOpen ? ' is-open' : ''}`}
          id="site-navigation"
          aria-label="Main navigation"
        >
          <Link to="/read/1">The journal</Link>
          <a href="#about">About this collection</a>
          <label className="nav-select-label" htmlFor="header-page-picker">Go to page</label>
          <select
            id="header-page-picker"
            aria-label="Go to page"
            value={currentPage}
            onChange={(event) => navigate(`/read/${event.target.value}`)}
          >
            {articles.map((article, index) => (
              <option key={article.title} value={index + 1}>
                Page {index + 1}: {article.title}
              </option>
            ))}
          </select>
        </nav>
      </header>
      <div className="collection-banner" id="about">
        <span>Ten original notes on attention, stillness & everyday life</span>
        <span className="banner-disclaimer">Independent reflections — not quotations or reproduced works.</span>
      </div>
      <Routes>
        <Route path="/" element={<Navigate to="/read/1" replace />} />
        <Route path="/read/:pageNumber" element={<ReadingPage />} />
        <Route path="*" element={<Navigate to="/read/1" replace />} />
      </Routes>
    </div>
  );
}

export default App;
