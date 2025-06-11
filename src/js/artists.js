// src/js/artists.js

//!==============================================================

import { fetchArtists as fetchArtistsFromApi } from './apiService.js';
import { openArtistModal } from './modal-artists.js';
// =================================================================
// 1. DOM Element Caching
// =================================================================
const artistsList = document.getElementById('artists-list');
const loadMoreBtn = document.getElementById('load-more');
const globalLoader = document.getElementById('global-loader');
// =================================================================
// 2. State Variables
// =================================================================
let currentPage = 1;
const limit = 8; // Number of items per page
let buffer = []; // Buffer for artists waiting to be rendered
let isFetching = false; // Flag indicating if an API request is in progress
let artistsCache = new Map(); // Cache to store all loaded artist objects by ID
// =================================================================
// 3. Data Fetching Functions
// =================================================================
/**
 * Asynchronously fetches a list of artists.
 * @param {number} page - The page number to load.
 */
async function fetchArtists(page = 1) {
  showGlobalLoader();
  isFetching = true;
  try {
    const data = await fetchArtistsFromApi(limit, page);
    const artists = data.artists || [];
    const total = data.totalArtists || 0;
    // Add new artists to the buffer and update the cache
    artists.forEach(artist => {
      buffer.push(artist);
      // Use _id, idArtist, or id as unique key, prioritizing what API typically returns
      const artistId = artist._id || artist.idArtist || artist.id;
      if (artistId) {
        artistsCache.set(artistId, artist);
      }
    });
    renderFromBuffer();
    const shownCount = document.querySelectorAll('.artist-card').length;
    if (shownCount >= total && buffer.length === 0) {
      loadMoreBtn.classList.add('hidden');
    } else {
      loadMoreBtn.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error fetching artists:', error);
    if (artistsList) {
      artistsList.innerHTML =
        '<li class="artist-card"><p>Failed to load artists. Please try again later.</p></li>';
    }
    if (loadMoreBtn) {
      loadMoreBtn.classList.add('hidden');
    }
  } finally {
    hideGlobalLoader();
    isFetching = false;
  }
}
/**
 * Renders artist cards from the buffer into the DOM.
 */
function renderFromBuffer() {
  const itemsToShow = buffer.splice(0, limit);
  const fragment = document.createDocumentFragment();
  itemsToShow.forEach(artist => {
    const card = document.createElement('li');
    card.classList.add('artist-card');
    const bio = artist.strBiographyEN || '';
    const firstSentence = bio.match(/^[^.!?]*[.!?]\s*/)?.[0] || '';
    const shortBio =
      firstSentence.length > 140
        ? firstSentence.slice(0, 140) + '…'
        : firstSentence || 'No biography available.';
    const artistGenres =
      Array.isArray(artist.genres) && artist.genres.length > 0
        ? artist.genres
        : [];
    const genresHtml = artistGenres
      .map(genre => `<span class="genre">${genre}</span>`)
      .join(' ');
    const artistId = artist._id || artist.idArtist || artist.id;
    card.innerHTML = `
      <div class="artists-image"><img class="artists-img" src="${
        artist.strArtistThumb ||
        artist.image ||
        'https://via.placeholder.com/200x200?text=No+Image'
      }" alt="${artist.strArtist || 'Artist image'}"></div>
      <p class="artist-genres">
        ${genresHtml || 'No genres'}
      </p>
      <h3 class="artist-name">${artist.strArtist || 'Unknown Artist'}</h3>
      <p class="artist-description">${shortBio}</p>
      <button class="learn-more-btn js-learn-more-btn"
              data-id="${artistId}">Learn More
        <svg class="load-icon" width="24" height="24"><use href="./img/sprite.svg#icon-caret-right"></use></svg>
      </button>
    `;

    fragment.appendChild(card);
  });
  if (artistsList) {
    artistsList.appendChild(fragment);
  }
  addLearnMoreButtonListeners();
}
// =================================================================
// 4. Event Handlers
// =================================================================
/**
 * Handles clicks on the "Load More" button.
 */
loadMoreBtn.addEventListener('click', () => {
  loadMoreBtn.blur();
  if (buffer.length >= limit) {
    renderFromBuffer();
  } else if (!isFetching) {
    currentPage++;
    fetchArtists(currentPage);
  }
});
/**
 * Shows the global loader.
 */
function showGlobalLoader() {
  if (globalLoader) {
    globalLoader.classList.add('is-active');
    globalLoader.style.display = 'block';
  }
}
/**
 * Hides the global loader.
 */
function hideGlobalLoader() {
  if (globalLoader) {
    globalLoader.classList.remove('is-active');
    globalLoader.style.display = 'none';
  }
}
/**
 * Attaches click handlers to all "Learn More" buttons that don't already have a listener.
 */
function addLearnMoreButtonListeners() {
  const learnMoreBtns = document.querySelectorAll('.js-learn-more-btn');
  learnMoreBtns.forEach(button => {
    if (!button.dataset.listenerAttached) {
      button.addEventListener('click', onLearnMoreBtnClick);
      button.dataset.listenerAttached = 'true';
    }
  });
}
/**
 * Handles clicks on the "Learn More" button, and opens the modal.
 * It attempts to pass a cached artist object with genres if available.
 * @param {Event} event - The click event object.
 */
async function onLearnMoreBtnClick(event) {
  const artistId = event.currentTarget.dataset.id;
  if (!artistId) {
    console.warn('Artist ID not found for modal. Cannot open modal.');
    return;
  }
  // Attempt to retrieve the full artist object from the cache
  const cachedArtist = artistsCache.get(artistId);
  try {
    // Pass the cached artist object if found, otherwise just the ID
    // The openArtistModal function in modal-artists.js will handle fetching
    // details if a full object isn't provided.
    await openArtistModal(cachedArtist || artistId);
  } catch (error) {
    console.error('Error opening artist modal:', error);
    // Optionally, display an error message to the user
  }
}
// =================================================================
// 5. Initial Load
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
  fetchArtists(currentPage);
});
