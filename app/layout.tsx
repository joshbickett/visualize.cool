import Link from "next/link";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = new URL("https://visualize.cool");
const siteTitle = "visualize.cool | Interactive Space & Data Visualizations";
const siteDescription =
  "Explore curated, high-fidelity visualizations that make complex topics intuitive—starting with a solar system scale explorer.";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: siteTitle,
    template: "%s · visualize.cool"
  },
  description: siteDescription,
  keywords: [
    "interactive visualization",
    "data visualization",
    "space visualization",
    "solar system",
    "education"
  ],
  authors: [{ name: "visualize.cool" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    siteName: "visualize.cool",
    images: [
      {
        url: "/share-image.svg",
        width: 1200,
        height: 630,
        alt: "visualize.cool – interactive visualizations",
        type: "image/svg+xml"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    creator: "@visualizecool"
  },
  alternates: {
    canonical: siteUrl
  },
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1
  },
  manifest: "/site.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#0b0f1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "visualize.cool",
  url: siteUrl.toString(),
  description: siteDescription,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl.toString()}search?q={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <div className="app-shell">
          <header className="app-header">
            <div className="app-logo">
              <div aria-hidden className="app-logo__mark" />
              <Link href="/" aria-label="visualize.cool home">
                visualize.cool
              </Link>
            </div>
            <nav className="app-nav" aria-label="Primary navigation">
              <Link href="/visualizations">Visualizations</Link>
              <Link href="/about">About</Link>
              <Link href="/contribute">Contribute</Link>
            </nav>
          </header>
          <main className="app-main">{children}</main>
          <footer className="app-footer">
            <p>© {new Date().getFullYear()} visualize.cool. Crafted for curious minds.</p>
            <p>
              <a href="/visualizations">Discover visualizations</a> ·{" "}
              <a href="/contribute">Submit a visualization</a>
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
