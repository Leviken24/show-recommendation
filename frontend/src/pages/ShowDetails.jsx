import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchShowById, fetchShowInteractions, postInteraction } from '../api/api';
import { useAuth } from '../context/useAuth';

// ── Interaction Panel ──────────────────────────────────────────────────────────
const InteractionPanel = ({ showId }) => {
  const { isAuthenticated } = useAuth();

  const [interactions, setInteractions] = useState({
    like: false,
    dislike: false,
    completed: false,
    rating: null
  });
  const [ratingInput, setRatingInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', msg }

  // Load this user's existing interactions for the show
  useEffect(() => {
    if (!isAuthenticated) return;

    let ignore = false;

    async function load() {
      try {
        const data = await fetchShowInteractions(showId);
        if (ignore) return;

        const state = { like: false, dislike: false, completed: false, rating: null };
        data.forEach((item) => {
          if (item.type === 'like')      state.like      = true;
          if (item.type === 'dislike')   state.dislike   = true;
          if (item.type === 'completed') state.completed = true;
          if (item.type === 'rating')    state.rating    = item.rating;
        });
        setInteractions(state);
        if (state.rating !== null) setRatingInput(String(state.rating));
      } catch {
        // Non-critical — silently ignore fetch errors
      }
    }

    load();
    return () => { ignore = true; };
  }, [showId, isAuthenticated]);

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleToggle = async (type) => {
    if (!isAuthenticated) {
      showFeedback('error', 'Please log in to interact with shows.');
      return;
    }
    setLoading(true);
    try {
      await postInteraction(showId, type);
      setInteractions((prev) => ({ ...prev, [type]: !prev[type] }));
      showFeedback('success', `${type.charAt(0).toUpperCase() + type.slice(1)} ${!interactions[type] ? 'saved' : 'removed'}!`);
    } catch (err) {
      showFeedback('error', err.message || 'Action failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showFeedback('error', 'Please log in to rate shows.');
      return;
    }
    const val = Number(ratingInput);
    if (!ratingInput || isNaN(val) || val < 1 || val > 10) {
      showFeedback('error', 'Enter a rating between 1 and 10.');
      return;
    }
    setLoading(true);
    try {
      await postInteraction(showId, 'rating', val);
      setInteractions((prev) => ({ ...prev, rating: val }));
      showFeedback('success', `Your rating of ${val}/10 was saved!`);
    } catch (err) {
      showFeedback('error', err.message || 'Rating failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="interaction-panel">
      <h3 className="interaction-title">Your Interaction</h3>

      {!isAuthenticated && (
        <p className="interaction-auth-note">
          <Link to="/login" className="auth-link">Log in</Link> to like, rate, and track this show.
        </p>
      )}

      {feedback && (
        <div className={`interaction-feedback ${feedback.type}`}>
          {feedback.type === 'success' ? '✓' : '⚠'} {feedback.msg}
        </div>
      )}

      <div className="interaction-buttons">
        {/* Like */}
        <button
          className={`interaction-btn like-btn ${interactions.like ? 'active' : ''}`}
          onClick={() => handleToggle('like')}
          disabled={loading}
          title="Like this show"
        >
          <span className="interaction-icon">👍</span>
          <span>{interactions.like ? 'Liked' : 'Like'}</span>
        </button>

        {/* Dislike */}
        <button
          className={`interaction-btn dislike-btn ${interactions.dislike ? 'active' : ''}`}
          onClick={() => handleToggle('dislike')}
          disabled={loading}
          title="Dislike this show"
        >
          <span className="interaction-icon">👎</span>
          <span>{interactions.dislike ? 'Disliked' : 'Dislike'}</span>
        </button>

        {/* Completed */}
        <button
          className={`interaction-btn completed-btn ${interactions.completed ? 'active' : ''}`}
          onClick={() => handleToggle('completed')}
          disabled={loading}
          title="Mark as completed"
        >
          <span className="interaction-icon">✅</span>
          <span>{interactions.completed ? 'Completed' : 'Mark Completed'}</span>
        </button>
      </div>

      {/* Rating */}
      <form className="rating-form" onSubmit={handleRatingSubmit}>
        <label className="rating-label">
          Your Rating
          {interactions.rating !== null && (
            <span className="current-rating"> — currently {interactions.rating}/10</span>
          )}
        </label>
        <div className="rating-input-row">
          <input
            type="number"
            className="rating-input"
            min="1"
            max="10"
            step="0.5"
            value={ratingInput}
            onChange={(e) => setRatingInput(e.target.value)}
            placeholder="1 – 10"
            disabled={!isAuthenticated || loading}
          />
          <button
            type="submit"
            className="btn-rate"
            disabled={!isAuthenticated || loading}
          >
            {interactions.rating !== null ? 'Update Rating' : 'Submit Rating'}
          </button>
        </div>
      </form>
    </div>
  );
};

// ── ShowDetails Page ───────────────────────────────────────────────────────────
export const ShowDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isInWatchlist, addToWatchlist, removeFromWatchlist } = useAuth();

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadShowDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchShowById(id);
        if (isMounted) {
          setShow(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load show details');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadShowDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="details-loading">
        <div className="spinner"></div>
        <p>Loading show details...</p>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="details-error">
        <h2>Show Not Found</h2>
        <p>{error || 'The requested show does not exist.'}</p>
        <Link to="/shows" className="btn-primary">
          ← Back to Browse Shows
        </Link>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(show._id);

  const toggleWatchlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (inWatchlist) {
      await removeFromWatchlist(show._id);
    } else {
      await addToWatchlist(show);
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
    <div className="show-details-page">
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="details-container">
        {/* Left column: Poster + Watchlist + Interactions */}
        <div className="details-poster-col">
          {show.poster && !imgError ? (
            <img
              src={show.poster}
              alt={show.title}
              className="details-poster"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="details-poster-placeholder">
              <span className="placeholder-icon">🎬</span>
              <span>{show.title}</span>
            </div>
          )}

          <button
            className={`btn-watchlist-action ${inWatchlist ? 'saved' : ''}`}
            onClick={toggleWatchlist}
          >
            {inWatchlist ? '✓ Remove from Watchlist' : '+ Add to Watchlist'}
          </button>

          {/* Interaction panel lives in the left column */}
          <InteractionPanel showId={show._id} />
        </div>

        {/* Right column: Info */}
        <div className="details-info-col">
          <div className="details-header">
            <span className={`category-badge ${show.category || 'default'}`}>
              {categoryLabel}
            </span>
            <h1 className="details-title">{show.title}</h1>
          </div>

          <div className="details-metadata-row">
            <div className="meta-pill rating-pill">
              ⭐ {show.rating ? Number(show.rating).toFixed(1) : 'N/A'} / 10
            </div>
            {show.releaseYear && (
              <div className="meta-pill">📅 {show.releaseYear}</div>
            )}
            {show.language && (
              <div className="meta-pill">🌐 {show.language}</div>
            )}
            {show.episodes && (
              <div className="meta-pill">📺 {show.episodes} Episodes</div>
            )}
            {show.duration && (
              <div className="meta-pill">⏱️ {show.duration}</div>
            )}
          </div>

          {show.genres && show.genres.length > 0 && (
            <div className="details-section">
              <h3>Genres</h3>
              <div className="genres-list">
                {show.genres.map((genre, idx) => (
                  <span key={idx} className="genre-tag">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="details-section">
            <h3>Synopsis</h3>
            <p className="details-description">
              {show.description || 'No description available for this drama.'}
            </p>
          </div>

          {show.cast && show.cast.length > 0 && (
            <div className="details-section">
              <h3>Cast</h3>
              <div className="cast-list">
                {show.cast.map((member, idx) => (
                  <span key={idx} className="cast-tag">
                    {member}
                  </span>
                ))}
              </div>
            </div>
          )}

          {show.tags && show.tags.length > 0 && (
            <div className="details-section">
              <h3>Tags</h3>
              <div className="tags-list">
                {show.tags.slice(0, 10).map((tag, idx) => (
                  <span key={idx} className="tag-pill">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default ShowDetails;
