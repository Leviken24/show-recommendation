import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export const ShowCard = ({ show }) => {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useAuth();
  const [imgError, setImgError] = useState(false);

  if (!show) return null;

  const inWatchlist = isInWatchlist(show._id);

  const handleWatchlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(show._id);
    } else {
      addToWatchlist(show);
    }
  };

  const categoryLabel = show.category
    ? show.category.toUpperCase() === 'KDRAMA'
      ? 'K-Drama'
      : show.category.toUpperCase() === 'CDRAMA'
      ? 'C-Drama'
      : show.category
    : 'Drama';

  return (
    <div className="show-card">
      <Link to={`/shows/${show._id}`} className="show-card-link">
        <div className="poster-container">
          {show.poster && !imgError ? (
            <img
              src={show.poster}
              alt={show.title}
              className="show-poster"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="poster-placeholder">
              <span className="placeholder-icon">🎬</span>
              <span className="placeholder-text">{show.title}</span>
            </div>
          )}

          <div className="card-overlay">
            <button
              className={`watchlist-btn ${inWatchlist ? 'active' : ''}`}
              onClick={handleWatchlistClick}
              title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              aria-label={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {inWatchlist ? '✓ Saved' : '+ Watchlist'}
            </button>
          </div>

          <span className={`category-badge ${show.category || 'default'}`}>
            {categoryLabel}
          </span>
        </div>

        <div className="show-card-info">
          <h3 className="show-title" title={show.title}>
            {show.title}
          </h3>

          <div className="show-meta">
            <span className="rating-badge">
              ⭐ {show.rating ? Number(show.rating).toFixed(1) : 'N/A'}
            </span>
            <span className="release-year">{show.releaseYear || 'N/A'}</span>
            <span className="language-badge">{show.language || 'Unknown'}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ShowCard;
