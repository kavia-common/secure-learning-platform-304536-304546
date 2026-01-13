import apiClient from './client';

// PUBLIC_INTERFACE
/**
 * Get current user's progress for all labs
 * @returns {Promise} Array of progress entries
 */
export const getMyProgress = async () => {
  const response = await apiClient.get('/api/progress/me');
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Get current user's progress summary
 * @returns {Promise} Progress summary with stats
 */
export const getProgressSummary = async () => {
  const response = await apiClient.get('/api/progress/summary');
  return response.data;
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
  return response.data;
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
