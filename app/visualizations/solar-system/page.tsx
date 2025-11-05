import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const SolarSystem = dynamic(
  () => import("@/components/visualizations/SolarSystem"),
  { ssr: false, loading: () => <div className="viz-loading">Loading visualization…</div> }
);

export const metadata: Metadata = {
  title: "Solar System Scale Explorer",
  description:
    "Explore a finely-rendered solar system scale model with true-to-scale bodies, deep zoom, and adaptive orbital speeds.",
  openGraph: {
    title: "Solar System Scale Explorer · visualize.cool",
    description:
      "A responsive, interactive tour of our solar system that preserves physical scale while making distances and orbital periods intuitive.",
    type: "article"
  },
  alternates: {
    canonical: "https://visualize.cool/visualizations/solar-system"
  }
};

const highlights = [
  {
    title: "True-to-scale bodies",
    description:
      "Planets render at their physical radii while elliptical paths respect real eccentricities and perihelion orientation—no exaggeration."
  },
  {
    title: "Deep zoom focus",
    description:
      "Snap to any body and explore millimeter-to-AU detail with a logarithmic zoom range tuned for accuracy."
  },
  {
    title: "Accessible controls",
    description:
      "Keyboard shortcuts, fullscreen support, and a responsive speed slider make the model approachable on any device."
  },
  {
    title: "Real orbital motion",
    description:
      "Simulated orbital periods keep every body in motion; pause, resume, or focus instantly to compare timelines."
  }
];

export default function SolarSystemPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: "Solar System Scale Explorer",
    description:
      "Interactive solar system visualization that preserves true orbital distances and body radii with deep zoom and adaptive speed controls.",
    about: [
      { "@type": "Thing", name: "Solar system" },
      { "@type": "Thing", name: "Astronomy education" },
      { "@type": "Thing", name: "Data visualization" }
    ],
    url: "https://visualize.cool/visualizations/solar-system",
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
        <h1>Solar System Scale Explorer</h1>
        <p>
          This interactive recreation of our solar system blends accurate orbital mechanics with
          approachable controls. Bodies render at true physical scale relative to their orbits; use the
          deep zoom and precision focus to study detail without inflating planets.
        </p>
        <a className="link-arrow" href="/visualizations">
          ← Back to visualizations
        </a>
      </header>

      <section className="viz-page__media" aria-label="Solar system interactive visualization">
        <Suspense fallback={<div className="viz-loading">Initializing solar system…</div>}>
          <SolarSystem height="80vh" />
        </Suspense>
      </section>

      <section className="viz-page__details">
        <h2>How to explore</h2>
        <ul>
          <li>Drag anywhere to pan, scroll to zoom, and click a planet to focus.</li>
          <li>Toggle fullscreen for an immersive view, especially on larger displays.</li>
          <li>Use the extended zoom range to dive into inner-planet detail without losing scale.</li>
          <li>Slow orbital speed to &ldquo;real time&rdquo; or accelerate centuries per second with the responsive slider.</li>
          <li>Select a planet chip to snap the camera to its true-scale position and size.</li>
          <li>Press numbers <span className="ss-kbd">1</span>–<span className="ss-kbd">9</span> to jump directly to bodies, or <span className="ss-kbd">F</span> to fit the system.</li>
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
        <h2>Data & assumptions</h2>
        <p>
          Distances use mean semi-major axes in astronomical units, scaled linearly to fit a
          comfortable viewport. Planetary radii reflect mean equatorial values expressed in
          kilometers, and camera zoom provides reach without altering their relative proportions.
          Orbits are modeled as coplanar ellipses using J2000 eccentricities and perihelion angles to
          emphasize realistic scale relationships.
        </p>
        <p>
          Motion is simulated by advancing time in days per second. You can slow things down or pause
          entirely to inspect orbit geometry, rings, and resonances.
        </p>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </article>
  );
}
