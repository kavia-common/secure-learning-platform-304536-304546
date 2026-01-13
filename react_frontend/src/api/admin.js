import apiClient from './client';

// PUBLIC_INTERFACE
/**
 * Get all users (admin only)
 * @returns {Promise} Array of user objects
 */
export const getUsers = async () => {
  const response = await apiClient.get('/api/admin/users');
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Update user roles (admin only)
 * @param {string} userId - User identifier
 * @param {Array} roles - New roles array
 * @returns {Promise} Updated user
 */
export const updateUserRoles = async (userId, roles) => {
  const response = await apiClient.patch(`/api/admin/users/${userId}/roles`, {
    roles,
  });
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Reset a user's progress (admin only)
 * @param {string} userId - User identifier
 * @returns {Promise} Reset confirmation
 */
export const resetUserProgress = async (userId) => {
  const response = await apiClient.post(`/api/admin/users/${userId}/reset`);
  return response.data;
};
