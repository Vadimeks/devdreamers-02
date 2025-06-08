const artistsList = document.getElementById('artists-list');
const loadMoreBtn = document.getElementById('load-more');
const loader = document.getElementById('global-loader');

let currentPage = 1;
const limit = 8;
let buffer = [];
let isFetching = false;

//!================================================================

async function fetchArtists(page = 1) {
  showLoader();
  isFetching = true;

  try {
    const response = await fetch(
      `https://sound-wave.b.goit.study/api/artists?page=${page}`
    );
    const data = await response.json();

    const artists = data.artists || [];
    const total = data.totalArtists || 0;
    buffer.push(...artists);

    renderFromBuffer();

    const shownCount = document.querySelectorAll('.artist-card').length;
    if (shownCount >= total && buffer.length === 0) {
      loadMoreBtn.classList.add('hidden');
    } else {
      loadMoreBtn.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error fetching artists:', error);
  } finally {
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
  ${
    artist.genres
      ?.map(genre => `<span class="genre">${genre}</span>`)
      .join(' ') || ''
  }
</p>
        <h3 class="artist-name">${artist.strArtist}</h3>
        <p class="artist-description">${shortBio}</p>
        <button class="learn-more-btn js-learn-more-btn" data-id="${
          artist.id
        }">Learn More<svg class="load-icon" width="24" height="24"><use href="./img/symbol-defs.svg#icon-caret-right"></use></svg></button>
      `;

    artistsList.appendChild(card);
  });
}

loadMoreBtn.addEventListener('click', () => {
  if (buffer.length >= limit) {
    renderFromBuffer();
  } else if (!isFetching) {
    currentPage++;
    fetchArtists(currentPage);
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

fetchArtists(currentPage);
