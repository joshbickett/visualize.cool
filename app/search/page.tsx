import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search across visualize.cool visualizations. Find interactive experiences by topic, tags, or keywords."
};

type SearchPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = typeof searchParams?.q === "string" ? searchParams.q : "";

  return (
    <div className="page page--narrow">
      <h1>Search visualize.cool</h1>
      <form className="search-form" role="search" action="/search">
        <label htmlFor="site-search" className="sr-only">
          Search visualize.cool
        </label>
        <input
          id="site-search"
          name="q"
          defaultValue={query}
          placeholder="Try “solar system”"
          autoComplete="off"
        />
        <button type="submit" className="btn btn--primary">
          Search
        </button>
      </form>

      {query ? (
        <div className="search-results-empty">
          <p>
            No custom search yet, but we&apos;re cataloging new visualizations weekly. Explore the{" "}
            <a href="/visualizations">visualizations directory</a> while we finish the search
            experience.
          </p>
        </div>
      ) : (
        <p>Enter a topic to discover upcoming interactive experiences.</p>
      )}
    </div>
  );
}
