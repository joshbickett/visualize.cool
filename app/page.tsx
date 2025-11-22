import Link from "next/link";

const GITHUB_URL = "https://github.com/joshbickett/visualize.cool";

const features = [
  {
    icon: "✦",
    title: "Open Source",
    description: "Community-driven and transparent. Anyone can contribute visualizations.",
  },
  {
    icon: "◈",
    title: "Data-Backed",
    description: "Every visualization includes sources, methodology, and assumptions.",
  },
  {
    icon: "⬡",
    title: "Interactive",
    description: "Learn by exploring. Tweak, zoom, and discover insights hands-on.",
  },
];

export default function HomePage() {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="landing__hero">
        <div className="landing__hero-bg">
          <div className="landing__orb landing__orb--1" />
          <div className="landing__orb landing__orb--2" />
          <div className="landing__orb landing__orb--3" />
          <div className="landing__grid-overlay" />
        </div>

        <div className="landing__hero-content">
          <div className="landing__badge">
            <span className="landing__badge-dot" />
            Open source project
          </div>

          <h1 className="landing__title">
            <span className="landing__title-line">Visualize ideas</span>
            <span className="landing__title-line landing__title-line--gradient">with wonder</span>
          </h1>

          <p className="landing__subtitle">
            A curated collection of interactive visualizations that make complex concepts
            feel intuitive. Explore science, technology, and the universe.
          </p>

          <div className="landing__cta">
            <Link className="btn btn--primary btn--lg" href="/visualizations/solar-system">
              <span className="btn__icon">◉</span>
              Explore Solar System
            </Link>
            <Link className="btn btn--glass" href="/visualizations">
              All Visualizations
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Cards */}
      <section className="landing__featured">
        <Link href="/visualizations/solar-system" className="featured-card">
          <div className="featured-card__glow" />
          <div className="featured-card__content">
            <span className="featured-card__label">Featured</span>
            <h2 className="featured-card__title">Solar System Scale Explorer</h2>
            <p className="featured-card__desc">
              Experience the true scale of our cosmic neighborhood. Glide through orbits and feel the vastness of space.
            </p>
            <span className="featured-card__action">
              Launch Explorer <span className="featured-card__arrow">→</span>
            </span>
          </div>
          <div className="featured-card__visual">
            <div className="featured-card__planet featured-card__planet--sun" />
            <div className="featured-card__orbit featured-card__orbit--1">
              <div className="featured-card__planet featured-card__planet--1" />
            </div>
            <div className="featured-card__orbit featured-card__orbit--2">
              <div className="featured-card__planet featured-card__planet--2" />
            </div>
            <div className="featured-card__orbit featured-card__orbit--3">
              <div className="featured-card__planet featured-card__planet--3" />
            </div>
          </div>
        </Link>

{/* <Link href="/visualizations/gpt-architecture" className="featured-card featured-card--alt">
          <div className="featured-card__glow featured-card__glow--alt" />
          <div className="featured-card__content">
            <span className="featured-card__label">New</span>
            <h2 className="featured-card__title">GPT Architecture Visualizer</h2>
            <p className="featured-card__desc">
              Explore how transformer models process text through attention heads and layers. See the magic behind AI.
            </p>
            <span className="featured-card__action">
              Explore Architecture <span className="featured-card__arrow">→</span>
            </span>
          </div>
          <div className="featured-card__visual featured-card__visual--gpt">
            <div className="featured-card__node featured-card__node--1" />
            <div className="featured-card__node featured-card__node--2" />
            <div className="featured-card__node featured-card__node--3" />
            <div className="featured-card__connection featured-card__connection--1" />
            <div className="featured-card__connection featured-card__connection--2" />
            <div className="featured-card__connection featured-card__connection--3" />
          </div>
        </Link> */}
      </section>

      {/* Features */}
      <section className="landing__features">
        <div className="landing__features-header">
          <h2 className="landing__section-title">Why visualize.cool?</h2>
        </div>
        <div className="landing__features-grid">
          {features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <span className="feature-card__icon">{feature.icon}</span>
              <h3 className="feature-card__title">{feature.title}</h3>
              <p className="feature-card__desc">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing__contribute">
        <div className="landing__contribute-card">
          <div className="landing__contribute-content">
            <h2 className="landing__contribute-title">Build with us</h2>
            <p className="landing__contribute-desc">
              Have an idea for a visualization? We welcome contributions from designers,
              developers, and curious minds.
            </p>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--outline"
            >
              <svg className="btn__github-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Contribute on GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
