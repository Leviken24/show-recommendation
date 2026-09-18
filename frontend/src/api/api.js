const API_BASE_URL = 'https://show-recommendation-9c1f.vercel.app/';

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const fetchShows = async (category = '') => {
  const url = category
    ? `${API_BASE_URL}/api/shows?category=${encodeURIComponent(category)}`
    : `${API_BASE_URL}/api/shows`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch shows (${response.status})`);
  }
  return response.json();
};

export const searchShows = async (query) => {
  if (!query) return [];
  const response = await fetch(
    `${API_BASE_URL}/api/shows/search?q=${encodeURIComponent(query)}`
  );
  if (!response.ok) {
    throw new Error(`Failed to search shows (${response.status})`);
  }
  return response.json();
};

export const fetchShowById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/shows/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Show not found');
    }
    throw new Error(`Failed to fetch show details (${response.status})`);
  }
  return response.json();
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }
  return data;
};

export const registerUser = async (name, email, password) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, password })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  return data;
};

// ── Interactions ──────────────────────────────────────────────────────────────

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAuthToken()}`
});

export const postInteraction = async (showId, type, rating) => {
  const body = { showId, type };
  if (rating !== undefined && rating !== null) body.rating = rating;

  const response = await fetch(`${API_BASE_URL}/api/interactions`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Interaction failed');
  }
  return data;
};

export const fetchMyInteractions = async () => {
  const response = await fetch(`${API_BASE_URL}/api/interactions/me`, {
    headers: authHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch interactions');
  }
  return data;
};

export const fetchShowInteractions = async (showId) => {
  const response = await fetch(
    `${API_BASE_URL}/api/interactions/show/${showId}`,
    { headers: authHeaders() }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch show interactions');
  }
  return data;
};

// ── Watchlist ────────────────────────────────────────────────────────────────

export const addToWatchlistApi = async (showId) => {
  const response = await fetch(`${API_BASE_URL}/api/watchlist`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ showId })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to add show to watchlist');
  }
  return data;
};

export const fetchWatchlistApi = async () => {
  const response = await fetch(`${API_BASE_URL}/api/watchlist`, {
    headers: authHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch watchlist');
  }
  return data;
};

export const removeFromWatchlistApi = async (showId) => {
  const response = await fetch(`${API_BASE_URL}/api/watchlist/${showId}`, {
    method: 'DELETE',
    headers: authHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to remove show from watchlist');
  }
  return data;
};