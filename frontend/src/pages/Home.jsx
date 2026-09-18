import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchShows } from '../api/api';
import ShowCard from '../components/ShowCard';

export const Home = () => {
  const [kdramas, setKdramas] = useState([]);
  const [cdramas, setCdramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadHomeData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [kList, cList] = await Promise.all([
          fetchShows('kdrama'),
          fetchShows('cdrama')
        ]);

        if (isMounted) {
          setKdramas(kList);
          setCdramas(cList);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load shows');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <span className="hero-tag"> Asian Drama Collection</span>
          <h1 className="hero-title">Discover Your Next Favorite Drama</h1>
          <p className="hero-subtitle">
            Explore thousands of top-rated Korean and Chinese dramas with ratings, genres, and cast insights.
          </p>
          <div className="hero-actions">
            <Link to="/shows" className="btn-primary">
              Browse All Shows
            </Link>
            <Link to="/shows?category=kdrama" className="btn-secondary">
              Explore K-Dramas
            </Link>
          </div>
        </div>
      </section>

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dramas from database...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p className="error-text">⚠️ {error}</p>
          <button
            className="btn-retry"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="home-sections">
          {/* K-Dramas Section */}
          <section className="shows-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">🇰🇷 Trending K-Dramas</h2>
                <p className="section-subtitle">Heartwarming romance, thrilling mysteries, and epic sagas</p>
              </div>
              <Link to="/shows?category=kdrama" className="section-link">
                View all K-Dramas →
              </Link>
            </div>

            <div className="shows-grid">
              {kdramas.slice(0, 8).map((show) => (
                <ShowCard key={show._id} show={show} />
              ))}
            </div>
          </section>

          {/* C-Dramas Section */}
          <section className="shows-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">🇨🇳 Popular C-Dramas</h2>
                <p className="section-subtitle">Xianxia, historical epics, and modern youth romances</p>
              </div>
              <Link to="/shows?category=cdrama" className="section-link">
                View all C-Dramas →
              </Link>
            </div>

            <div className="shows-grid">
              {cdramas.slice(0, 8).map((show) => (
                <ShowCard key={show._id} show={show} />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Home;
