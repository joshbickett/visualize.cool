import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const PlanetSizeComparison = dynamic(
  () => import("@/components/visualizations/PlanetSizeComparison"),
  { ssr: false, loading: () => <div className="viz-loading">Loading visualization…</div> }
);

export const metadata: Metadata = {
  title: "Planet Size Comparison",
  description:
    "Scroll through an interactive visualization comparing the true sizes of planets in our solar system, from tiny Pluto to the massive Sun.",
  openGraph: {
    title: "Planet Size Comparison · visualize.cool",
    description:
      "Experience the incredible scale differences between planets and the Sun through an interactive scroll-based visualization.",
    type: "article"
  },
  alternates: {
    canonical: "https://visualize.cool/visualizations/planet-size-comparison"
  }
};

const highlights = [
  {
    title: "True-to-scale radii",
    description:
      "Every celestial body renders at its actual proportional size—no exaggeration or artistic license."
  },
  {
    title: "Scroll to zoom out",
    description:
      "Pan from left to right to reveal increasingly massive bodies, from Pluto to the Sun."
  },
  {
    title: "Size comparisons",
    description:
      "Live ratios show how many times larger each body is compared to others in view."
  },
  {
    title: "Rich details",
    description:
      "Surface features like Jupiter's Great Red Spot, Saturn's rings, and Earth's continents are visible at larger scales."
  }
];

export default function PlanetSizeComparisonPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: "Planet Size Comparison",
    description:
      "Interactive scroll-based visualization comparing the true sizes of planets in our solar system.",
    about: [
      { "@type": "Thing", name: "Planetary science" },
      { "@type": "Thing", name: "Astronomy education" },
      { "@type": "Thing", name: "Data visualization" }
    ],
    url: "https://visualize.cool/visualizations/planet-size-comparison",
    learningResourceType: "InteractiveVisualization",
    audience: {
      "@type": "EducationalAudience",
      educationalRole: ["Students", "Educators", "Enthusiasts"]
    },
    creator: {
      "@type": "Organization",
      name: "visualize.cool",
      url: "https://visualize.cool"
    }
  };

  return (
    <article className="viz-page">
      <header className="viz-page__header">
        <p className="viz-page__eyebrow">Visualization</p>
        <h1>Planet Size Comparison</h1>
        <p>
          Scroll horizontally to journey from the smallest worlds to the largest. This
          visualization renders every body at true proportional scale, letting you grasp just how
          vast the size differences are across our solar system.
        </p>
        <a className="link-arrow" href="/visualizations">
          ← Back to visualizations
        </a>
      </header>

      <section className="viz-page__media" aria-label="Planet size comparison visualization">
        <Suspense fallback={<div className="viz-loading">Initializing planets…</div>}>
          <PlanetSizeComparison height="80vh" />
        </Suspense>
      </section>

      <section className="viz-page__details">
        <h2>How to explore</h2>
        <ul>
          <li>Scroll or drag horizontally to pan through the size scale.</li>
          <li>Start with the smallest bodies on the left—Pluto and the Moon.</li>
          <li>Watch the scale transform as gas giants and the Sun come into view.</li>
          <li>The info panel shows the current body&apos;s radius and Earth comparison.</li>
        </ul>
      </section>

      <section className="viz-page__grid" aria-label="Visualization highlights">
        {highlights.map((item) => (
          <article key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </section>

      <section className="viz-page__notes">
        <h2>Data & scale</h2>
        <p>
          All radii use equatorial measurements in kilometers. The Sun&apos;s radius of 696,340 km is
          roughly 109 times Earth&apos;s, and about 9.7 times Jupiter&apos;s. Pluto, the smallest body shown,
          could fit inside the Sun over 200 million times.
        </p>
        <p>
          The visualization maintains true proportions throughout—what you see is an accurate
          representation of relative sizes, not an artistic interpretation.
        </p>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </article>
  );
}
