import Link from "next/link";

const features = [
  {
    title: "Curated creations",
    description: "Every visualization is peer-reviewed for accuracy, clarity, and delight."
  },
  {
    title: "Transparent data",
    description: "Explore sources, assumptions, and methodology alongside each experience."
  },
  {
    title: "Built to learn",
    description: "Interact, tweak controls, and uncover insights that static charts miss."
  }
];

export default function HomePage() {
  return (
    <div className="hero">
      <section className="hero__lead">
        <p className="hero__eyebrow">Curated interactive learning</p>
        <h1 className="hero__title">
          Visualize complex ideas with clarity and a touch of wonder.
        </h1>
        <p className="hero__subtitle">
          visualize.cool is a growing library of interactive experiences. Dive into the solar system
          to feel the vastness of space, and follow along as we craft new perspectives across science,
          technology, and culture.
        </p>
        <div className="hero__cta">
          <Link className="btn btn--primary" href="/visualizations/solar-system">
            Explore the Solar System
          </Link>
          <Link className="btn btn--ghost" href="/visualizations">
            Browse visualizations
          </Link>
        </div>
      </section>

      <section className="hero__card">
        <Link href="/visualizations/solar-system" className="viz-card">
          <div className="viz-card__badge">Featured visualization</div>
          <h2 className="viz-card__title">Solar System Scale Explorer</h2>
          <p className="viz-card__copy">
            Glide across orbits, adjust scales, and truly feel the magnitude of our celestial
            neighborhood.
          </p>
          <span className="viz-card__link">
            View visualization <span aria-hidden>→</span>
          </span>
        </Link>
      </section>

      <section className="hero__features" aria-label="Why visualize.cool exists">
        {features.map((feature) => (
          <article key={feature.title} className="feature">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
