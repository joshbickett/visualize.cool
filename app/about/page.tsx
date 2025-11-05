import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "visualize.cool is a collaborative platform for polished, educational visualizations. Learn about our mission and curation process."
};

export default function AboutPage() {
  return (
    <div className="page page--narrow">
      <h1>About visualize.cool</h1>
      <p>
        visualize.cool is a community-driven initiative to elevate interactive storytelling. We
        collect, refine, and publish visualizations that transform complex data and concepts into
        intuitive experiences.
      </p>
      <p>
        Accuracy, accessibility, and craft matter. Each submission is reviewed for data sources,
        assumptions, responsive behavior, and pedagogy. Our goal: help learners and enthusiasts build
        a meaningful mental model with every interaction.
      </p>
      <p>
        Have an idea or want to collaborate?{" "}
        <a href="/contribute">Learn how to contribute your visualization.</a>
      </p>
    </div>
  );
}
