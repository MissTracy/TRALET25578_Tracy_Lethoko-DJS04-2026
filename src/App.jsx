import { useEffect, useState } from "react";
import PodcastGrid from "./components/PodcastGrid";
import { genres } from "./data";
import { fetchPodcasts } from "./api/fetchPodcasts";
import Header from "./components/Header";

/**
 * App - The root component of the Podcast Explorer application. It handles:
 * - Fetching podcast data from a remote API
 * - Managing loading and error states
 * - Rendering the podcast grid once data is successfully fetched
 * - Displaying a header and fallback UI during loading or error
 * @returns {JSX.Element} The rendered application interface
 */
export default function App() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [selectedGenres, setSelectedGenres] = useState([]);

  useEffect(() => {
    fetchPodcasts(setPodcasts, setError, setLoading);
  }, []);

  const filteredPodcasts = podcasts
  .filter((podcast) => {
    const matchesSearch = podcast.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesGenres =
      selectedGenres.length === 0 ||
      podcast.genres.some((id) => selectedGenres.includes(id));

    return matchesSearch && matchesGenres;
  })
  .sort((a, b) => {
    if (sort === "title-asc") {
      return a.title.localeCompare(b.title);
    }

    if (sort === "title-desc") {
      return b.title.localeCompare(a.title);
    }

    return new Date(b.updated) - new Date(a.updated);
  });

  return (
    <>
      <Header />
  
      <main>
        {loading && (
          <div className="message-container">
            <div className="spinner"></div>
            <p>Loading podcasts...</p>
          </div>
        )}
  
        {error && (
          <div className="message-container">
            <div className="error">
              Error occurred while trying fetching podcasts: {error}
            </div>
          </div>
        )}
  
        {!loading && !error && (
          <>
            {/* controls */}
            <div className="controls">
              <input
                placeholder="Search podcasts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
  
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
              </select>
            </div>
  
            {/* grid */}
            <PodcastGrid
              podcasts={filteredPodcasts}
              genres={genres}
            />
          </>
        )}
      </main>
    </>
  );
}
