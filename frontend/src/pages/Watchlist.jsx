import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import ShowCard from '../components/ShowCard';

export const Watchlist = () => {
  const { isAuthenticated, watchlist } = useAuth();

  return (
    <div className="watchlist-page">
      <div className="watchlist-header">
        <h1 className="page-title">My Watchlist</h1>
        <p className="page-subtitle">
          Your personal collection of dramas to watch later
        </p>
      </div>

      {!isAuthenticated ? (
        <div className="empty-state">
          <span className="empty-icon">🔒</span>
          <h3>Log In to Access Your Watchlist</h3>
          <p>Sign in to your account to view and manage your saved dramas.</p>
          <Link to="/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      ) : watchlist.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📑</span>
          <h3>Your watchlist is empty</h3>
          <p>Explore dramas and click "+ Watchlist" on any title to save it here.</p>
          <Link to="/shows" className="btn-primary">
            Explore Shows
          </Link>
        </div>
      ) : (
        <div className="shows-grid">
          {watchlist.map((show) => (
            <ShowCard key={show._id || show.showId} show={show} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
