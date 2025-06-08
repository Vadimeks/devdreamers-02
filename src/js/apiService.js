// apiService.js
import axios from 'axios';

const API_BASE_URL = 'https://sound-wave.b.goit.study/api';

/**
 * Fetches a list of genres.
 * @returns {Promise<Array>} A promise that resolves to an array of genre objects.
 */
export async function fetchGenres() {
  try {
    const response = await axios.get(`${API_BASE_URL}/genres`);
    return response.data;
  } catch (error) {
    console.error('Error fetching genre list:', error);
    throw error;
  }
}

/**
 * Fetches a list of artists with pagination.
 * @param {number} limit The number of artists to fetch per page.
 * @param {number} page The page number to fetch.
 * @returns {Promise<Object>} A promise that resolves to an object containing artists, totalArtists, page, and limit.
 */
export async function fetchArtists(limit = 10, page = 1) {
  try {
    const response = await axios.get(`${API_BASE_URL}/artists`, {
      params: { limit, page },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching artist list:', error);
    throw error;
  }
}

/**
 * Fetches artist information and their albums by ID.
 * @param {string} artistId The ID of the artist.
 * @returns {Promise<Object>} A promise that resolves to an object containing artist details and albums.
 */
export async function fetchArtistDetailsWithAlbums(artistId) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/artists/${artistId}/albums`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching artist details with albums (ID: ${artistId}):`,
      error
    );
    throw error;
  }
}

/**
 * Fetches artist information and their tracks by ID.
 * @param {string} artistId The ID of the artist.
 * @returns {Promise<Object>} A promise that resolves to an object containing artist details and tracksList.
 */
export async function fetchArtistDetailsWithTracks(artistId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/artists/${artistId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching artist details with tracks (ID: ${artistId}):`,
      error
    );
    throw error;
  }
}

/**
 * Submits a new feedback.
 * @param {Object} feedbackData - Object containing feedback data.
 * @param {string} feedbackData.name - User's name.
 * @param {number} feedbackData.rating - Rating (e.g., from 1 to 5).
 * @param {string} feedbackData.descr - Description/comment.
 * @returns {Promise<Object>} A promise that resolves to an object with a processing message.
 */
export async function submitFeedback(feedbackData) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/feedbacks`,
      feedbackData
    );
    return response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
}

/**
 * Fetches a list of feedbacks with pagination.
 * @param {number} limit - The number of feedbacks per page.
 * @param {number} page - The page number.
 * @returns {Promise<Object>} A promise that resolves to an object containing an array of feedbacks, total count, and pagination info.
 */
export async function fetchFeedbacks(limit = 10, page = 1) {
  try {
    const response = await axios.get(`${API_BASE_URL}/feedbacks`, {
      params: { limit, page },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching feedback list:', error);
    throw error;
  }
}

/**
 * Registers a new user.
 * @param {Object} userData - User registration data.
 * @param {string} userData.email - User's email address.
 * @param {string} userData.password - User's password.
 * @returns {Promise<Object>} A promise that resolves to an object with an API key.
 */
export async function registerUser(userData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

/**
 * Logs in a user.
 * @param {Object} credentials - User login credentials.
 * @param {string} credentials.email - User's email address.
 * @param {string} credentials.password - User's password.
 * @returns {Promise<Object>} A promise that resolves to an object with an API key.
 */
export async function loginUser(credentials) {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
}
