import { fetchArtistDetails } from './apiService.js';

const artistModal = document.getElementById('artistModal');
const closeModalButton = artistModal?.querySelector('.close-modal');
const modalLoader = document.getElementById('modalLoader');

const modalArtistImage = artistModal?.querySelector('#modal-artist-image');
const modalTitle = artistModal?.querySelector('.modal-title');

const artistInfoList = artistModal?.querySelector('.artist-info-list');
const artistBioParagraph = artistModal?.querySelector('.artist-info-bio-text');
const readMoreBioBtn = artistModal?.querySelector('#read-more-bio-btn');
const genresList = artistModal?.querySelector('.genres-list');
const artistAlbumsListContainer = artistModal?.querySelector(
  '.artist-albums-list'
);
const artistAlbumsBlock = artistModal?.querySelector('.artist-albums-block');

let allAlbums = [];
let currentAlbumPage = 1;
const albumsPerPage = 8;

function clearModalContent() {
  if (modalTitle) modalTitle.textContent = 'Artist Name';
  if (modalArtistImage) {
    modalArtistImage.src = '';
    modalArtistImage.alt = '';
  }
  if (artistInfoList) artistInfoList.innerHTML = '';
  if (artistBioParagraph) artistBioParagraph.innerHTML = '';
  if (genresList) genresList.innerHTML = '';
  if (artistAlbumsListContainer) artistAlbumsListContainer.innerHTML = '';

  if (modalLoader) modalLoader.style.display = 'none';

  const existingPaginationControls = artistModal?.querySelector(
    '.pagination-controls'
  );
  if (existingPaginationControls) {
    existingPaginationControls.remove();
  }

  if (readMoreBioBtn) {
    readMoreBioBtn.style.display = 'none';
    readMoreBioBtn.textContent = 'Read More';
    if (artistBioParagraph) artistBioParagraph.classList.remove('expanded');
    readMoreBioBtn.removeEventListener('click', toggleBiography);
  }

  allAlbums = [];
  currentAlbumPage = 1;
}

function closeArtistModal() {
  if (artistModal) {
    artistModal.classList.remove('open');
  }
  if (document.body) {
    document.body.classList.remove('modal-open');
  }
  clearModalContent();
  document.removeEventListener('keydown', escapeKeyHandler);
  artistModal?.removeEventListener('click', outsideClickHandler);
}

function outsideClickHandler(e) {
  if (e.target === artistModal) {
    closeArtistModal();
  }
}

function escapeKeyHandler(e) {
  if (e.key === 'Escape') {
    closeArtistModal();
  }
}

function renderAlbums(page) {
  if (!artistAlbumsListContainer) return;

  const startIndex = (page - 1) * albumsPerPage;
  const endIndex = startIndex + albumsPerPage;
  const albumsToDisplay = allAlbums.slice(startIndex, endIndex);

  artistAlbumsListContainer.innerHTML = '';

  if (albumsToDisplay.length === 0) {
    artistAlbumsListContainer.innerHTML = `<li class="artist-albums-item"><p>No album information available.</p></li>`;
    const existingPaginationControls = artistModal?.querySelector(
      '.pagination-controls'
    );
    if (existingPaginationControls) {
      existingPaginationControls.remove();
    }
    return;
  }

  albumsToDisplay.forEach(album => {
    let albumItemHtml = `<li class="artist-albums-item">
                            <h3>${album.strAlbum || 'Album Title'} (${
      album.intYearReleased || 'Year'
    })</h3>
                            <ul class="album-track-list">`;

    albumItemHtml += `<li class="album-track-item track-header">
                            <ul class="track-info-list">
                                <li class="track-info-item">Track</li>
                                <li class="track-info-item track-info-item-time">Time</li>
                                <li class="track-info-item track-info-item-link">Link</li>
                            </ul>
                        </li>`;

    if (album.tracks && album.tracks.length > 0) {
      album.tracks.forEach((track, index) => {
        const rowClass = index % 2 === 0 ? 'even-row' : 'odd-row';
        albumItemHtml += `<li class="album-track-item ${rowClass}">
                            <ul class="track-info-list">
                                <li class="track-info-item">${
                                  track.strTrack || 'Track Name'
                                }</li>
                                <li class="track-info-item track-info-item-time">${
                                  track.intDuration
                                    ? formatDuration(track.intDuration)
                                    : '-'
                                }</li>
                                <li class="track-info-item track-info-item-link">`;
        if (
          track.movie &&
          typeof track.movie === 'string' &&
          track.movie !== 'null' &&
          (track.movie.startsWith('http://') ||
            track.movie.startsWith('https://'))
        ) {
          albumItemHtml += `<button class="yt-button" data-url="${track.movie}" aria-label="Watch on YouTube">
                                <svg class="yt-icon" width="20" height="20">
                                  <use href="./img/sprite.svg#icon-youtube"></use>
                                </svg>
                            </button>`;
        } else {
          albumItemHtml += `-`;
        }
        albumItemHtml += `</li>
                            </ul>
                        </li>`;
      });
    } else {
      albumItemHtml += `<li class="album-track-item"><p>No tracks available for this album.</p></li>`;
    }
    albumItemHtml += `</ul></li>`;
    artistAlbumsListContainer.insertAdjacentHTML('beforeend', albumItemHtml);
  });

  const totalPages = Math.ceil(allAlbums.length / albumsPerPage);

  const existingPaginationControls = artistModal?.querySelector(
    '.pagination-controls'
  );
  if (existingPaginationControls) {
    existingPaginationControls.remove();
  }

  if (totalPages > 1) {
    const paginationControls = document.createElement('div');
    paginationControls.className = 'pagination-controls';

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = page === 1;
    prevButton.addEventListener('click', () => {
      currentAlbumPage--;
      renderAlbums(currentAlbumPage);
    });

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = page === totalPages;
    nextButton.addEventListener('click', () => {
      currentAlbumPage++;
      renderAlbums(currentAlbumPage);
    });

    const pageInfo = document.createElement('span');
    pageInfo.textContent = ` ${page} / ${totalPages} `;

    paginationControls.appendChild(prevButton);
    paginationControls.appendChild(pageInfo);
    paginationControls.appendChild(nextButton);

    if (artistAlbumsBlock) {
      artistAlbumsBlock.appendChild(paginationControls);
    } else if (artistModal) {
      artistModal.appendChild(paginationControls);
    }
  }

  const ytButtons = artistAlbumsListContainer?.querySelectorAll('.yt-button');
  ytButtons?.forEach(btn => {
    btn.addEventListener('click', function (e) {
      const url = e.currentTarget.dataset.url;
      if (url) {
        window.open(url, '_blank');
      }
    });
  });
}

function formatDuration(ms) {
  const numMs = typeof ms === 'string' ? parseInt(ms, 10) : ms;

  if (typeof numMs !== 'number' || isNaN(numMs) || numMs < 0) {
    return 'N/A';
  }
  const totalSeconds = Math.floor(numMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function toggleBiography() {
  if (artistBioParagraph && readMoreBioBtn) {
    artistBioParagraph.classList.toggle('expanded');
    readMoreBioBtn.textContent = artistBioParagraph.classList.contains(
      'expanded'
    )
      ? 'Read Less'
      : 'Read More';
  }
}

export async function openArtistModal(artistData) {
  const requiredElements = [
    artistModal,
    modalLoader,
    modalTitle,
    modalArtistImage,
    artistInfoList,
    artistBioParagraph,
    genresList,
    artistAlbumsListContainer,
  ];
  if (requiredElements.some(el => !el)) {
    console.error(
      'One or more modal DOM elements not found. Check your HTML IDs and classes.'
    );
    return;
  }

  document.body.classList.add('modal-open');
  artistModal.classList.add('open');
  modalLoader.style.display = 'block';

  clearModalContent();

  document.addEventListener('keydown', escapeKeyHandler);
  artistModal?.addEventListener('click', outsideClickHandler);
  closeModalButton?.addEventListener('click', closeArtistModal);
  let fullArtistDetailsFromApi;
  let artistIdToFetch;
  let genresFromCache = [];

  if (typeof artistData === 'object' && artistData !== null) {
    artistIdToFetch = artistData._id;
    if (Array.isArray(artistData.genres) && artistData.genres.length > 0) {
      genresFromCache = artistData.genres;
    } else if (
      typeof artistData.strGenre === 'string' &&
      artistData.strGenre.trim() !== ''
    ) {
      genresFromCache = artistData.strGenre
        .split(';')
        .map(genre => genre.trim())
        .filter(genre => genre !== '');
    }
  } else {
    artistIdToFetch = artistData;
  }

  if (!artistIdToFetch) {
    console.error('Artist ID is missing for modal.');
    modalLoader.style.display = 'none';
    if (modalTitle) modalTitle.textContent = 'Error: Artist ID missing';
    return;
  }

  try {
    fullArtistDetailsFromApi = await fetchArtistDetails(artistIdToFetch);

    const finalArtistDetails = { ...fullArtistDetailsFromApi };

    if (genresFromCache.length > 0) {
      finalArtistDetails.genres = genresFromCache;
    } else {
      finalArtistDetails.genres = [];
    }

    modalLoader.style.display = 'none';

    if (finalArtistDetails) {
      modalTitle.textContent = finalArtistDetails.strArtist || 'Unknown Artist';
      modalArtistImage.src =
        finalArtistDetails.strArtistFanart ||
        finalArtistDetails.strArtistThumb ||
        finalArtistDetails.image ||
        'https://via.placeholder.com/250x250.png?text=No+Image';
      modalArtistImage.alt = finalArtistDetails.strArtist || 'Artist Photo';

      if (artistInfoList) {
        const formedYear = finalArtistDetails.intFormedYear;
        const disbandedYear = finalArtistDetails.intDiedYear;

        let yearsActive = 'information unavailable';
        if (formedYear) {
          if (
            disbandedYear &&
            disbandedYear !== '0000' &&
            disbandedYear !== null
          ) {
            yearsActive = `${formedYear} - ${disbandedYear}`;
          } else {
            yearsActive = `${formedYear} - present`;
          }
        }

        artistInfoList.innerHTML = `
          <li class="artist-info-item">
            <h3>Years Active</h3>
            <p class="artist-info">${yearsActive}</p>
          </li>
          <li class="artist-info-item">
            <h3>Gender</h3>
            <p class="artist-info">${
              finalArtistDetails.strGender || 'information unavailable'
            }</p>
          </li>
          <li class="artist-info-item">
            <h3>Members</h3>
            <p class="artist-info">${
              finalArtistDetails.intMembers || 'information unavailable'
            }</p>
          </li>
          <li class="artist-info-item">
            <h3>Country</h3>
            <p class="artist-info">${
              finalArtistDetails.strCountry || 'information unavailable'
            }</p>
          </li>
        `;
      }

      if (artistBioParagraph) {
        const biographyText =
          finalArtistDetails.strBiographyEN || 'Biography unavailable.';
        artistBioParagraph.textContent = biographyText;

        if (biographyText.length > 300) {
          artistBioParagraph.classList.add('collapsed');
          if (readMoreBioBtn) {
            readMoreBioBtn.style.display = 'block';
            readMoreBioBtn.textContent = 'Read More';
            readMoreBioBtn.addEventListener('click', toggleBiography);
          }
        } else {
          artistBioParagraph.classList.remove('collapsed');
          if (readMoreBioBtn) {
            readMoreBioBtn.style.display = 'none';
            readMoreBioBtn.removeEventListener('click', toggleBiography);
          }
        }
      }

      if (genresList) {
        genresList.innerHTML = '';
        let displayGenres = finalArtistDetails.genres || [];

        if (displayGenres.length > 0) {
          displayGenres.forEach(genre => {
            const li = document.createElement('li');
            li.className = 'genres-item';
            li.textContent = genre;
            genresList.appendChild(li);
          });
        } else {
          const li = document.createElement('li');
          li.className = 'genres-item';
          li.textContent = 'Genres unavailable';
          genresList.appendChild(li);
        }
      }

      if (
        finalArtistDetails.tracksList &&
        finalArtistDetails.tracksList.length > 0
      ) {
        const albumsMap = new Map();
        finalArtistDetails.tracksList.forEach(track => {
          const albumName = track.strAlbum || 'Unknown Album';
          const albumId = track.idAlbum || albumName;

          if (!albumsMap.has(albumId)) {
            albumsMap.set(albumId, {
              strAlbum: albumName,
              intYearReleased: track.intYearReleased || 'Unknown',
              idAlbum: albumId,
              tracks: [],
            });
          }
          albumsMap.get(albumId).tracks.push(track);
        });

        allAlbums = Array.from(albumsMap.values()).sort((a, b) => {
          const yearA = parseInt(a.intYearReleased) || 0;
          const yearB = parseInt(b.intYearReleased) || 0;
          return yearB - yearA;
        });

        renderAlbums(currentAlbumPage);
      } else {
        if (artistAlbumsListContainer) {
          artistAlbumsListContainer.innerHTML = `<li class="artist-albums-item"><p>Album and track information unavailable.</p></li>`;
        }
        const existingPaginationControls = artistModal?.querySelector(
          '.pagination-controls'
        );
        if (existingPaginationControls) {
          existingPaginationControls.remove();
        }
      }
    } else {
      if (modalTitle) modalTitle.textContent = 'Artist Not Found';
      if (artistInfoList)
        artistInfoList.innerHTML =
          '<li class="artist-info-item"><p>Could not retrieve artist details.</p></li>';
      if (artistBioParagraph) artistBioParagraph.innerHTML = '';
      if (genresList) genresList.innerHTML = '';
      if (artistAlbumsListContainer) artistAlbumsListContainer.innerHTML = '';
    }
  } catch (error) {
    modalLoader.style.display = 'none';
    if (artistModal) {
      if (modalTitle) modalTitle.textContent = 'Error loading data!';
      let errorMessage = 'Unfortunately, artist data could not be loaded. ';
      if (error.response) {
        errorMessage += `Status: ${error.response.status}. `;
        if (error.response.status === 404) {
          errorMessage +=
            'Resource not found at the specified URL. Incorrect ID or API path. Try a different ID or check API documentation.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage += `Message: ${error.response.data.message}`;
        }
      } else if (error.request) {
        errorMessage += 'No response received from the server. Network issue.';
      } else {
        errorMessage += `Message: ${error.message}`;
      }

      if (artistInfoList)
        artistInfoList.innerHTML = `<li class="artist-info-item"><p class="error">${errorMessage}</p></li>`;
      if (artistBioParagraph) artistBioParagraph.innerHTML = '';
      if (genresList) genresList.innerHTML = '';
      if (artistAlbumsListContainer) artistAlbumsListContainer.innerHTML = '';
    }
    console.error('Error fetching data:', error);
  }
}
