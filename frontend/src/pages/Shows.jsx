import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchShows, searchShows } from "../api/api";
import ShowCard from "../components/ShowCard";

export const Shows = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";

  const [shows, setShows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchShows(category);
        if (!ignore) {
          setShows(data);
          setActiveSearch("");
        }
      } catch (err) {
        if (!ignore) setError(err.message || "Failed to load shows");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadData();
    return () => { ignore = true; };
  }, [category]);

  const handleCategorySwitch = (newCat) => {
    setSearchQuery("");
    setActiveSearch("");
    if (newCat) {
      setSearchParams({ category: newCat });
    } else {
      setSearchParams({});
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setActiveSearch("");
      try {
        setLoading(true);
        setError(null);
        const data = await fetchShows(category);
        setShows(data);
      } catch (err) {
        setError(err.message || "Failed to load shows");
      } finally {
        setLoading(false);
      }
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const results = await searchShows(trimmed);
      const filtered = category
        ? results.filter((s) => s.category?.toLowerCase() === category.toLowerCase())
        : results;
      setShows(filtered);
      setActiveSearch(trimmed);
    } catch (err) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClear = async () => {
    setSearchQuery("");
    setActiveSearch("");
    try {
      setLoading(true);
      setError(null);
      const data = await fetchShows(category);
      setShows(data);
    } catch (err) {
      setError(err.message || "Failed to load shows");
    } finally {
      setLoading(false);
    }
  };

  const categoryLabel =
    category === "kdrama" ? "K-Dramas" :
    category === "cdrama" ? "C-Dramas" :
    "Shows";

  return (
    <div className="shows-page">
      <div className="shows-page-header">
        <h1 className="page-title">Browse Shows</h1>
        <p className="page-subtitle">
          Explore our vast catalog of Korean and Chinese television dramas
        </p>

        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="text"
            placeholder="Search dramas by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            aria-label="Search dramas"
          />
          <button type="submit" className="btn-search">Search</button>
          {(searchQuery || activeSearch) && (
            <button type="button" className="btn-clear" onClick={handleSearchClear}>
              Clear
            </button>
          )}
        </form>

        <div className="category-switcher" role="tablist">
          <button
            className={"category-tab " + (category === "" ? "active" : "")}
            onClick={() => handleCategorySwitch("")}
          >All Dramas</button>
          <button
            className={"category-tab " + (category === "kdrama" ? "active" : "")}
            onClick={() => handleCategorySwitch("kdrama")}
          >K-Dramas</button>
          <button
            className={"category-tab " + (category === "cdrama" ? "active" : "")}
            onClick={() => handleCategorySwitch("cdrama")}
          >C-Dramas</button>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading shows...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p className="error-text">{error}</p>
          <button className="btn-retry" onClick={() => handleCategorySwitch(category)}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="shows-summary">
            {activeSearch ? (
              <span>
                <strong>{shows.length}</strong> result{shows.length !== 1 ? "s" : ""} for{" "}
                <em>&quot;{activeSearch}&quot;</em>
                {category ? " in " + categoryLabel : ""}
              </span>
            ) : (
              <span>Found <strong>{shows.length}</strong> {categoryLabel}</span>
            )}
          </div>

          {shows.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📺</span>
              {activeSearch ? (
                <>
                  <h3>No results for &quot;{activeSearch}&quot;</h3>
                  <p>Try a different title or browse by category below.</p>
                  <button className="btn-primary" onClick={handleSearchClear}>
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <h3>No shows found</h3>
                  <p>Try selecting a different category.</p>
                  <button className="btn-primary" onClick={() => handleCategorySwitch("")}>
                    View All Dramas
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="shows-grid">
              {shows.map((show) => (
                <ShowCard key={show._id} show={show} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Shows;
