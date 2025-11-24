import type { Metadata } from "next";
import Link from "next/link";

const visualizations = [
  {
    slug: "solar-system",
    title: "Solar System Scale Explorer",
    description:
      "Beautiful, responsive tour of our solar system with true-to-scale bodies, deep zoom, and adaptive orbital speeds.",
    href: "/visualizations/solar-system"
  },
  {
    slug: "planet-size-comparison",
    title: "Planet Size Comparison",
    description:
      "Scroll through an interactive visualization comparing the true sizes of planets, from tiny Pluto to the massive Sun.",
    href: "/visualizations/planet-size-comparison"
  },
  // {
  //   slug: "gpt-architecture",
  //   title: "GPT Architecture Visualizer",
  //   description:
  //     "Interactive visualization of the GPT transformer architecture showing token embeddings, multi-head self-attention, and layer-by-layer processing.",
  //   href: "/visualizations/gpt-architecture"
  // }
] as const;

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
              <Link href={viz.href}>{viz.title}</Link>
            </h2>
            <p>{viz.description}</p>
            <Link className="link-arrow" href={viz.href}>
              View visualization
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
