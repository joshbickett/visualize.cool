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
    "Explore a finely-rendered solar system scale model. Adjust distance curves, exaggerate planet sizes, and feel orbital motion in real-time.",
  openGraph: {
    title: "Solar System Scale Explorer · visualize.cool",
    description:
      "A responsive, interactive tour of our solar system that makes distances and orbital periods intuitive.",
    type: "article"
  },
  alternates: {
    canonical: "https://visualize.cool/visualizations/solar-system"
  }
};

const highlights = [
  {
    title: "Flexible distance curves",
    description:
      "Switch between linear, square-root, and logarithmic spacing to surface the inner planets or appreciate the outer giants."
  },
  {
    title: "True-to-scale bodies",
    description:
      "Planets and the Sun render at their physical radii; enhance size uniformly when you need clarity without distorting proportions."
  },
  {
    title: "Accessible controls",
    description:
      "Keyboard shortcuts, a responsive zoom range, and a logarithmic speed slider let you explore comfortably on any device."
  },
  {
    title: "Real orbital motion",
    description:
      "Simulated orbital periods keep every body in motion; pause, resume, or focus on planets instantly to compare timelines."
  }
];

export default function SolarSystemPage() {
  return (
    <article className="viz-page">
      <header className="viz-page__header">
        <p className="viz-page__eyebrow">Visualization</p>
        <h1>Solar System Scale Explorer</h1>
        <p>
          This interactive recreation of our solar system blends accurate orbital mechanics with
          approachable controls. Bodies render at true physical scale relative to their orbits; dial the
          size multiplier only when you need additional clarity while preserving relative proportions.
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
          <li>Switch between true scale and enhanced size modes; the multiplier always maintains ratios.</li>
          <li>Slow orbital speed to &ldquo;real time&rdquo; or accelerate centuries per second with the responsive slider.</li>
          <li>Press numbers <span className="ss-kbd">1</span>–<span className="ss-kbd">9</span> to jump directly to bodies.</li>
          <li>Toggle orbit lines, labels, and orbital trails to reveal different perspectives.</li>
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
          Distances use mean semi-major axes in astronomical units, scaled via adjustable mapping to
          fit a comfortable viewport. Planetary radii reflect mean equatorial values expressed in
          kilometers. Size mode <code>x1</code> keeps planets at true scale relative to their orbital distances;
          higher multipliers enlarge every body proportionally for visibility. Orbits are rendered as
          circular and coplanar to emphasize scale relationships.
        </p>
        <p>
          Motion is simulated by advancing time in days per second. You can slow things down or pause
          entirely to inspect orbit geometry, rings, and resonances.
        </p>
      </section>
    </article>
  );
}
