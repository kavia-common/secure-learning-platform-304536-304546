import apiClient from './client';

// PUBLIC_INTERFACE
/**
 * Fetch all published labs
 * @returns {Promise} Array of lab objects
 */
export const getLabs = async () => {
  const response = await apiClient.get('/api/labs');
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Fetch a single lab by ID
 * @param {string} labId - Lab identifier
 * @returns {Promise} Lab detail object
 */
export const getLabById = async (labId) => {
  const response = await apiClient.get(`/api/labs/${labId}`);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Fetch hints for a specific lab
 * @param {string} labId - Lab identifier
 * @returns {Promise} Array of hint objects
 */
export const getLabHints = async (labId) => {
  const response = await apiClient.get(`/api/labs/${labId}/hints`);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Submit solution for a lab
 * @param {string} labId - Lab identifier
 * @param {string} answer - Submitted answer
 * @param {number} hintsUsed - Number of hints used
 * @returns {Promise} Submission result with validation and progress update
 */
export const submitLabSolution = async (labId, answer, hintsUsed = 0) => {
  const response = await apiClient.post(`/api/labs/${labId}/submit`, {
    answer,
    hintsUsed,
  });
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Create a new lab (admin only)
 * @param {object} labData - Lab data
 * @returns {Promise} Created lab
 */
export const createLab = async (labData) => {
  const response = await apiClient.post('/api/labs', labData);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Update a lab (admin only)
 * @param {string} labId - Lab identifier
 * @param {object} labData - Updated lab data
 * @returns {Promise} Updated lab
 */
export const updateLab = async (labId, labData) => {
  const response = await apiClient.put(`/api/labs/${labId}`, labData);
  return response.data;
};

// PUBLIC_INTERFACE
/**
 * Delete a lab (admin only)
 * @param {string} labId - Lab identifier
 * @returns {Promise} Deletion confirmation
 */
export const deleteLab = async (labId) => {
  const response = await apiClient.delete(`/api/labs/${labId}`);
  return response.data;
};
