import { useState, useEffect, useCallback } from 'react';
import {
  getAuthToken,
  setAuthToken,
  addToWatchlistApi,
  fetchWatchlistApi,
  removeFromWatchlistApi
} from '../api/api';
import { AuthContext } from './auth-context';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getAuthToken());
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [watchlist, setWatchlist] = useState(() => {
    const savedWatchlist = localStorage.getItem('watchlist');
    return savedWatchlist ? JSON.parse(savedWatchlist) : [];
  });

  const refreshWatchlist = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchWatchlistApi();
      if (Array.isArray(data)) {
        setWatchlist(data);
        localStorage.setItem('watchlist', JSON.stringify(data));
      }
    } catch {
      // Non-critical background sync
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    if (!token) return;
    let ignore = false;
    async function load() {
      try {
        const data = await fetchWatchlistApi();
        if (!ignore && Array.isArray(data)) {
          setWatchlist(data);
        }
      } catch {
        // Non-critical
      }
    }
    load();
    return () => { ignore = true; };
  }, [token]);

  const login = (jwtToken, userInfo = null) => {
    setToken(jwtToken);
    setAuthToken(jwtToken);
    if (userInfo) {
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    setWatchlist([]);
    localStorage.removeItem('user');
    localStorage.removeItem('watchlist');
  };

  const addToWatchlist = async (show) => {
    if (!show || !show._id) return;
    setWatchlist((prev) => {
      if (prev.some((item) => item._id === show._id || item.showId === show._id)) return prev;
      return [...prev, show];
    });

    if (token) {
      try {
        await addToWatchlistApi(show._id);
        await refreshWatchlist();
      } catch (err) {
        console.error('Failed to add to watchlist on backend:', err);
      }
    }
  };

  const removeFromWatchlist = async (showId) => {
    setWatchlist((prev) =>
      prev.filter((item) => item._id !== showId && item.showId !== showId)
    );

    if (token) {
      try {
        await removeFromWatchlistApi(showId);
        await refreshWatchlist();
      } catch (err) {
        console.error('Failed to remove from watchlist on backend:', err);
      }
    }
  };

  const isInWatchlist = (showId) => {
    return watchlist.some((item) => item._id === showId || item.showId === showId);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        login,
        logout,
        watchlist,
        setWatchlist,
        refreshWatchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
