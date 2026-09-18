import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand">
          <h3>DramaVerse</h3>
          <p>Your premier destination for discovering the best K-dramas and C-dramas.</p>
        </div>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/shows">Browse Shows</Link>
          <Link to="/watchlist">Watchlist</Link>
        </div>
        <div className="footer-copy">
          <p>© {new Date().getFullYear()} DramaVerse Show Recommendation System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
