import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contribute",
  description:
    "Share your visualization with the visualize.cool community. Read the guidelines to create accurate, accessible experiences."
};

const GITHUB_URL = "https://github.com/joshbickett/visualize.cool";

export default function ContributePage() {
  return (
    <div className="page page--narrow">
      <h1>Contribute a visualization</h1>
      <p>
        visualize.cool is open source and community-driven. Whether you have an idea for a new
        visualization or want to improve an existing one, we&apos;d love your contribution.
      </p>

      <h2>How to contribute</h2>
      <ol>
        <li>
          Fork the{" "}
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            GitHub repository
          </a>
        </li>
        <li>Create your visualization following the existing patterns</li>
        <li>Open a pull request with a clear description</li>
      </ol>

      <h2>Guidelines</h2>
      <ul>
        <li>Include a clear concept description and learning objectives</li>
        <li>Cite data sources and explain methodology</li>
        <li>Ensure responsive design for desktop and mobile</li>
        <li>Support keyboard navigation and accessibility</li>
      </ul>

      <p>
        Questions or ideas? Open an{" "}
        <a href={`${GITHUB_URL}/issues`} target="_blank" rel="noopener noreferrer">
          issue on GitHub
        </a>{" "}
        — we&apos;re excited to collaborate.
      </p>

      <div className="contribute__cta">
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--primary"
        >
          View on GitHub
        </a>
      </div>
    </div>
  );
}
