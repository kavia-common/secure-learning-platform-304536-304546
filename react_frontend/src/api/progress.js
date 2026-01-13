import apiClient from './client';

// PUBLIC_INTERFACE
/**
 * Get current user's progress for all labs
 * @returns {Promise} Array of progress entries
 */
export const getMyProgress = async () => {
  const response = await apiClient.get('/api/progress/me');
  const data = response.data;
  // Handle both direct array and wrapped responses
  if (Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray(data.data)) {
    return data.data;
  } else if (data && Array.isArray(data.progress)) {
    return data.progress;
  }
  console.warn('Unexpected progress API response format:', data);
  return [];
};

// PUBLIC_INTERFACE
/**
 * Get current user's progress summary
 * @returns {Promise} Progress summary with stats
 */
export const getProgressSummary = async () => {
  const response = await apiClient.get('/api/progress/summary');
  const data = response.data;
  // Handle wrapped responses
  if (data && data.data) {
    return data.data;
  }
  return data;
};

// PUBLIC_INTERFACE
/**
 * Get leaderboard
 * @param {number} limit - Number of entries to fetch
 * @returns {Promise} Leaderboard array
 */
export const getLeaderboard = async (limit = 10) => {
  const response = await apiClient.get('/api/progress/leaderboard', {
    params: { limit },
  });
  const data = response.data;
  // Handle both direct array and wrapped responses
  if (Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray(data.data)) {
    return data.data;
  } else if (data && Array.isArray(data.leaderboard)) {
    return data.leaderboard;
  }
  console.warn('Unexpected leaderboard API response format:', data);
  return [];
};

// PUBLIC_INTERFACE
/**
 * Reset current user's progress
 * @returns {Promise} Reset confirmation
 */
export const resetProgress = async () => {
  const response = await apiClient.post('/api/progress/reset');
  return response.data;
};
