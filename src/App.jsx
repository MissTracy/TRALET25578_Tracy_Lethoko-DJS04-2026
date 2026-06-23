import { useEffect, useState } from "react";
import PodcastGrid from "./components/PodcastGrid";
import { genres } from "./data";
import { fetchPodcasts } from "./api/fetchPodcasts";
import Header from "./components/Header";

/**
 * App - Root component of the Podcast Explorer application.
 *
 * Handles:
 * - Fetching podcast data from a remote API
 * - Managing global UI state (search, sort, filter, pagination)
 * - Filtering podcasts by title and selected genre
 * - Sorting podcasts by newest or title (A-Z / Z-A)
 * - Paginating results into pages of 10 items
 * - Resetting pagination when filters or sorting change
 *
 * Features:
 * - Live search filtering by podcast title
 * - Genre filtering using dropdown selection
 * - Sorting by newest, title A-Z, or title Z-A
 * - Pagination with next/previous navigation
 *
 * State Management:
 * - podcasts: raw API data
 * - search: search input value
 * - sort: current sort mode
 * - selectedGenres: active genre filter
 * - currentPage: active pagination page
 * - podcastsPerPage: number of items per page
 *
 * Derived Data:
 * - filteredPodcasts: podcasts after search + filter + sort
 * - paginatedPodcasts: final slice of data shown per page
 * - totalPages: total number of pages based on filtered results
 *
 * @returns {JSX.Element} The rendered application UI
 */
export default function App() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [selectedGenres, setSelectedGenres] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const podcastsPerPage = 10;

  useEffect(() => {
    fetchPodcasts(setPodcasts, setError, setLoading);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sort, selectedGenres]);

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


  const totalPages = Math.ceil(
    filteredPodcasts.length / podcastsPerPage
  );

  const startIndex = (currentPage - 1) * podcastsPerPage;

  const paginatedPodcasts = filteredPodcasts.slice(
    startIndex,
    startIndex + podcastsPerPage
  );

  

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

              <select
                value={selectedGenres[0] || ""}
                onChange={(e) =>
                  setSelectedGenres(
                    e.target.value ? [Number(e.target.value)] : []
                  )
                }
              >
                <option value="">All Genres</option>

                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.title}
                  </option>
                ))}
              </select>
            </div>
  
            {/* grid */}
            <PodcastGrid
              podcasts={paginatedPodcasts}
              genres={genres}
            />

            <div className="pagination">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </>
  );
}