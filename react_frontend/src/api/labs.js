import apiClient from './client';

// PUBLIC_INTERFACE
/**
 * Fetch all published labs
 * @returns {Promise} Array of lab objects
 */
export const getLabs = async () => {
  const response = await apiClient.get('/api/labs');
  // Handle both direct array and wrapped { data: [] } responses
  const data = response.data;
  if (Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray(data.data)) {
    return data.data;
  } else if (data && data.labs && Array.isArray(data.labs)) {
    return data.labs;
  }
  // Fallback to empty array to prevent runtime errors
  console.warn('Unexpected labs API response format:', data);
  return [];
};

// PUBLIC_INTERFACE
/**
 * Fetch a single lab by ID
 * @param {string} labId - Lab identifier
 * @returns {Promise} Lab detail object
 */
export const getLabById = async (labId) => {
  const response = await apiClient.get(`/api/labs/${labId}`);
  const data = response.data;
  // Handle wrapped responses
  if (data && data.data) {
    return data.data;
  }
  return data;
};

// PUBLIC_INTERFACE
/**
 * Fetch hints for a specific lab
 * @param {string} labId - Lab identifier
 * @returns {Promise} Array of hint objects
 */
export const getLabHints = async (labId) => {
  const response = await apiClient.get(`/api/labs/${labId}/hints`);
  const data = response.data;
  // Handle both direct array and wrapped responses
  if (Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray(data.data)) {
    return data.data;
  } else if (data && Array.isArray(data.hints)) {
    return data.hints;
  }
  console.warn('Unexpected hints API response format:', data);
  return [];
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
