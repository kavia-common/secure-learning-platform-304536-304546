import apiClient from './client';

// PUBLIC_INTERFACE
/**
 * Register a new user account
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - Display name
 * @returns {Promise} Registration response with user data and token
 */
export const register = async (email, password, displayName) => {
  const response = await apiClient.post('/api/auth/register', {
    email,
    password,
    displayName,
    roles: ['user'],
  });
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Login response with user data and token
 */
export const login = async (email, password) => {
  const response = await apiClient.post('/api/auth/login', {
    email,
    password,
  });
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Logout current session
 * @returns {Promise} Logout response
 */
export const logout = async () => {
  const response = await apiClient.post('/api/auth/logout');
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Get current authenticated user
 * @returns {Promise} User data
 */
export const getCurrentUser = async () => {
  const response = await apiClient.get('/api/auth/me');
  return response.data;
};
