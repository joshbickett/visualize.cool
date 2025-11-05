import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contribute",
  description:
    "Share your visualization with the visualize.cool community. Read the guidelines to create accurate, accessible experiences."
};

export default function ContributePage() {
  return (
    <div className="page page--narrow">
      <h1>Contribute a visualization</h1>
      <p>
        We welcome pull requests that add new visualizations or improve existing ones. To maintain
        quality, each submission should include:
      </p>
      <ul>
        <li>Clear concept description and learning objectives</li>
        <li>Data sources and methodology notes</li>
        <li>Responsive behavior across desktop and mobile</li>
        <li>Accessible interactions and keyboard support</li>
      </ul>
      <p>
        Review the repository README for setup details, then open a PR. Have questions? Reach out via
        discussions or GitHub issues—we are excited to collaborate.
      </p>
    </div>
  );
}
