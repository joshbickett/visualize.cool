import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const GPTArchitecture = dynamic(
  () => import("@/components/visualizations/GPTArchitecture"),
  { ssr: false, loading: () => <div className="viz-loading">Loading visualization...</div> }
);

export const metadata: Metadata = {
  title: "GPT Architecture Visualizer",
  description:
    "Interactive visualization of the GPT transformer architecture showing token embeddings, multi-head self-attention, and layer-by-layer processing.",
  openGraph: {
    title: "GPT Architecture Visualizer - visualize.cool",
    description:
      "Explore how GPT processes text through embeddings, attention heads, and transformer layers with this interactive visualization.",
    type: "article"
  },
  alternates: {
    canonical: "https://visualize.cool/visualizations/gpt-architecture"
  }
};

const highlights = [
  {
    title: "Token Embeddings",
    description:
      "See how input text is split into tokens and converted into high-dimensional vectors that capture semantic meaning."
  },
  {
    title: "Multi-Head Attention",
    description:
      "Watch how 3 attention heads independently learn different relationships between tokens, then combine their insights."
  },
  {
    title: "Layer-by-Layer Processing",
    description:
      "Follow data flow through 3 transformer layers, each refining the representation with attention and feed-forward networks."
  },
  {
    title: "Causal Masking",
    description:
      "Understand how GPT uses causal (autoregressive) attention - each token can only attend to previous tokens."
  }
];

export default function GPTArchitecturePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: "GPT Architecture Visualizer",
    description:
      "Interactive visualization of the GPT transformer architecture with token embeddings, multi-head self-attention, and transformer layers.",
    about: [
      { "@type": "Thing", name: "GPT" },
      { "@type": "Thing", name: "Transformer architecture" },
      { "@type": "Thing", name: "Machine learning" }
    ],
    url: "https://visualize.cool/visualizations/gpt-architecture",
    learningResourceType: "InteractiveVisualization",
    audience: {
      "@type": "EducationalAudience",
      educationalRole: ["Students", "Educators", "ML Engineers"]
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
        <h1>GPT Architecture Visualizer</h1>
        <p>
          Explore the inner workings of GPT-style transformer models. This simplified visualization
          shows how text flows through token embeddings, multi-head self-attention, and transformer
          layers to produce contextual representations.
        </p>
        <a className="link-arrow" href="/visualizations">
          &larr; Back to visualizations
        </a>
      </header>

      <section className="viz-page__media" aria-label="GPT architecture interactive visualization">
        <Suspense fallback={<div className="viz-loading">Initializing GPT visualization...</div>}>
          <GPTArchitecture height="85vh" />
        </Suspense>
      </section>

      <section className="viz-page__details">
        <h2>How to explore</h2>
        <ul>
          <li>Type or select sample text to see how tokens flow through the model.</li>
          <li>Click on any attention head to see its attention pattern matrix.</li>
          <li>Hover over connections to see attention weights between tokens.</li>
          <li>Use the layer selector to focus on specific transformer layers.</li>
          <li>Toggle between viewing attention patterns and value flows.</li>
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
        <h2>Architecture details</h2>
        <p>
          This visualization shows a simplified GPT with 3 transformer layers and 3 attention heads
          per layer. Real GPT models have many more layers (GPT-3 has 96) and heads (96 per layer),
          but the core mechanism is identical.
        </p>
        <p>
          Each transformer layer contains: (1) multi-head self-attention with causal masking,
          (2) layer normalization, (3) a feed-forward network, and (4) residual connections.
          The attention mechanism allows each token to gather information from all previous tokens.
        </p>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </article>
  );
}
