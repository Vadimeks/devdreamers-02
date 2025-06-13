import { fetchArtists as fetchArtistsFromApi } from './apiService.js';
import { openArtistModal } from './modal-artists.js';

const artistsList = document.getElementById('artists-list');
const loadMoreBtn = document.getElementById('load-more');
const globalLoader = document.getElementById('global-loader');

let currentPage = 1;
const limit = 8;
let buffer = [];
let isFetching = false;
let artistsCache = new Map();

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

    artists.forEach(artist => {
      buffer.push(artist);
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

loadMoreBtn.addEventListener('click', () => {
  loadMoreBtn.blur();
  if (buffer.length >= limit) {
    renderFromBuffer();
  } else if (!isFetching) {
    currentPage++;
    fetchArtists(currentPage);
  }
});

function showGlobalLoader() {
  if (globalLoader) {
    globalLoader.classList.add('is-active');
    globalLoader.style.display = 'block';
  }
}

function hideGlobalLoader() {
  if (globalLoader) {
    globalLoader.classList.remove('is-active');
    globalLoader.style.display = 'none';
  }
}

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
 * @param {Event} event - The click event object.
 */
async function onLearnMoreBtnClick(event) {
  const artistId = event.currentTarget.dataset.id;
  if (!artistId) {
    console.warn('Artist ID not found for modal. Cannot open modal.');
    return;
  }
  const cachedArtist = artistsCache.get(artistId);
  try {
    await openArtistModal(cachedArtist || artistId);
  } catch (error) {
    console.error('Error opening artist modal:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchArtists(currentPage);
});
