import type { Metadata } from "next";
import Link from "next/link";

const visualizations = [
  {
    slug: "solar-system",
    title: "Solar System Scale Explorer",
    description:
      "Beautiful, responsive tour of our solar system with adjustable distance curves, sizes, and orbital speeds."
  }
];

export const metadata: Metadata = {
  title: "Visualizations",
  description:
    "Browse interactive visualizations crafted by the visualize.cool community. Each project is tuned for clarity, accuracy, and delight."
};

export default function VisualizationsIndexPage() {
  return (
    <div className="page page--stack">
      <header className="page__header">
        <h1>Visualizations</h1>
        <p>
          Discover interactive experiences designed to make complex topics tangible. Filter, explore,
          and contribute your own perspective.
        </p>
      </header>

      <div className="grid">
        {visualizations.map((viz) => (
          <article key={viz.slug} className="grid__item">
            <h2>
              <Link href={`/visualizations/${viz.slug}`}>{viz.title}</Link>
            </h2>
            <p>{viz.description}</p>
            <Link className="link-arrow" href={`/visualizations/${viz.slug}`}>
              View visualization
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
