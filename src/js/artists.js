import { fetchArtists as getArtists } from './apiService.js';

const artistsList = document.getElementById('artists-list');
const loadMoreBtn = document.getElementById('load-more');
const loader = document.getElementById('global-loader');

let currentPage = 1;
const limit = 8;
let buffer = [];
let isFetching = false;

//!================================================================

async function loadArtists(page = 1) {
  showLoader();
  isFetching = true;

  try {
    const data = await getArtists(limit, page); // Axios: .data вже готове
    const artists = data.artists || [];
    const total = data.totalArtists || 0;
    buffer.push(...artists);

    setTimeout(() => {
      renderFromBuffer();

      const shownCount = document.querySelectorAll('.artist-card').length;
      if (shownCount >= total && buffer.length === 0) {
        loadMoreBtn.classList.add('hidden');
      } else {
        loadMoreBtn.classList.remove('hidden');
      }

      hideLoader();
      isFetching = false;
    }, 500);
  } catch (error) {
    console.error('Error fetching artists:', error);
    hideLoader();
    isFetching = false;
  }
}

function renderFromBuffer() {
  const itemsToShow = buffer.splice(0, limit);

  itemsToShow.forEach(artist => {
    const card = document.createElement('li');
    card.classList.add('artist-card');

    const bio = artist.strBiographyEN || '';
    const firstSentence = bio.match(/.*?[.!?]/)?.[0] || '';
    const shortBio =
      firstSentence.length > 140
        ? firstSentence.slice(0, 140) + '…'
        : firstSentence;

    card.innerHTML = `
      <img class="artists-img" src="${
        artist.strArtistThumb || artist.image
      }" alt="${artist.strArtist}">
      <p class="artist-genres">
        ${(artist.genres || [])
          .map(genre => `<span class="genre">${genre}</span>`)
          .join(' ')}
      </p>
      <h3 class="artist-name">${artist.strArtist}</h3>
      <p class="artist-description">${shortBio}</p>
      <button class="learn-more-btn js-learn-more-btn" data-artist-id="${
        artist.id
      }">
        Learn More
        <svg class="learn-icon" width="24" height="24">
          <use href="./img/sprite.svg#icon-caret-right"></use>
        </svg>
      </button>
    `;

    artistsList.appendChild(card);
  });
}

loadMoreBtn.addEventListener('click', () => {
  loadMoreBtn.blur();
  if (buffer.length >= limit) {
    renderFromBuffer();
  } else if (!isFetching) {
    currentPage++;
    loadArtists(currentPage);
  }
});

function showLoader() {
  loader.classList.add('is-active');
  loader.style.display = 'block';
}

function hideLoader() {
  loader.classList.remove('is-active');
  loader.style.display = 'none';
}

loadArtists(currentPage);
