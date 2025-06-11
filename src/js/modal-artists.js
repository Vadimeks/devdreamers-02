import { fetchArtistDetails } from './apiService.js'; // Пераканайцеся, што шлях правільны

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

const BASE_PUBLIC_URL = '/script-ninjas-project';

let allAlbums = [];
let scrollPosition = 0;

function clearModalContent() {
  if (modalTitle) modalTitle.textContent = '';
  if (modalArtistImage) {
    modalArtistImage.src = '';
    modalArtistImage.alt = 'Artist Photo';
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
}

/**
 * Closes the artist modal and restores body scroll.
 */
function closeArtistModal() {
  if (artistModal) {
    artistModal.classList.remove('open');
  }
  if (document.body) {
    document.body.classList.remove('modal-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollPosition);
  }
  clearModalContent();
  document.removeEventListener('keydown', escapeKeyHandler);
  artistModal?.removeEventListener('click', outsideClickHandler);
}

/**
 * Handles clicks outside the modal to close it.
 * @param {MouseEvent} e - The click event.
 */
function outsideClickHandler(e) {
  if (e.target === artistModal) {
    closeArtistModal();
  }
}

/**
 * Handles the Escape key press to close the modal.
 * @param {KeyboardEvent} e - The keyboard event.
 */
function escapeKeyHandler(e) {
  if (e.key === 'Escape') {
    closeArtistModal();
  }
}

/**
 * Checks if a given URL is a valid YouTube video URL using a regex.
 * @param {string} url - The URL to validate.
 * @returns {boolean} - True if the URL is a valid YouTube URL, false otherwise.
 */
const isValidYoutubeUrl = url => {
  // If URL doesn't exist, isn't a string, or is empty after trimming
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return false;
  }

  // More robust regex to validate YouTube URLs
  const youtubeRegex =
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|)([\w-]{11})(.*)?$/;
  return youtubeRegex.test(url.trim());
};

/**
 * Renders the albums and their tracks within the modal.
 */
function renderAlbumsContent() {
  if (!artistAlbumsListContainer) return;

  artistAlbumsListContainer.innerHTML = '';

  if (allAlbums.length === 0) {
    artistAlbumsListContainer.innerHTML = `<li class="artist-albums-item"><p>No album information available.</p></li>`;
    return;
  }

  allAlbums.forEach(album => {
    const albumTitle =
      album.strAlbum && String(album.strAlbum).trim() !== ''
        ? album.strAlbum
        : 'Album Title';
    const albumYear =
      album.intYearReleased &&
      String(album.intYearReleased).trim() !== '' &&
      album.intYearReleased !== '0000' &&
      album.intYearReleased !== null
        ? ` (${album.intYearReleased})`
        : '';

    let albumItemHtml = `<li class="artist-albums-item">
                            <h3>${albumTitle}${albumYear}</h3>
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

        const trackDuration = track.intDuration
          ? formatDuration(track.intDuration)
          : '';

        // *** CRITICAL CHANGE: Use track.movie instead of track.strMusicVid ***
        const musicVidUrl = track.movie;
        const youtubeUrlIsValid = isValidYoutubeUrl(musicVidUrl);

        const youtubeLinkHtml = youtubeUrlIsValid
          ? `<button class="yt-button" data-url="${musicVidUrl}" aria-label="Watch on YouTube">
                <svg class="yt-icon" width="20" height="14">
                    <use href="${BASE_PUBLIC_URL}/img/sprite.svg#icon-youtube-modal"></use>
                </svg>
            </button>`
          : '';

        const trackName =
          track.strTrack && String(track.strTrack).trim() !== ''
            ? track.strTrack
            : 'Track Name';

        albumItemHtml += `<li class="album-track-item ${rowClass}">
                            <ul class="track-info-list">
                              <li class="track-info-item">${trackName}</li>
                              <li class="track-info-item track-info-item-time">${trackDuration}</li>
                              <li class="track-info-item track-info-item-link">${youtubeLinkHtml}</li>
                            </ul>
                          </li>`;
      });
    } else {
      albumItemHtml += `<li class="album-track-item"><p>No tracks available for this album.</p></li>`;
    }
    albumItemHtml += `</ul></li>`;
    artistAlbumsListContainer.insertAdjacentHTML('beforeend', albumItemHtml);
  });

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

/**
 * Formats duration from milliseconds to MM:SS format.
 * @param {number|string} ms - Duration in milliseconds.
 * @returns {string} - Formatted duration string.
 */
function formatDuration(ms) {
  const numMs = typeof ms === 'string' ? parseInt(ms, 10) : ms;

  if (typeof numMs !== 'number' || isNaN(numMs) || numMs <= 0) {
    return '';
  }
  const totalSeconds = Math.floor(numMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

/**
 * Toggles the expanded/collapsed state of the artist biography.
 */
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

/**
 * Opens the artist modal and populates it with details and tracks.
 * @param {object|string} artistData - The artist object or artist ID.
 */
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

  scrollPosition = window.scrollY;
  document.body.style.top = `-${scrollPosition}px`;
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
      String(artistData.strGenre).trim() !== ''
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
      modalTitle.textContent =
        finalArtistDetails.strArtist &&
        String(finalArtistDetails.strArtist).trim() !== ''
          ? finalArtistDetails.strArtist
          : '';

      modalArtistImage.src =
        finalArtistDetails.strArtistFanart ||
        finalArtistDetails.strArtistThumb ||
        finalArtistDetails.image ||
        '';
      modalArtistImage.alt = finalArtistDetails.strArtist || 'Artist Photo';

      if (artistInfoList) {
        const formedYear = finalArtistDetails.intFormedYear;
        const disbandedYear = finalArtistDetails.intDiedYear;

        let yearsActive = '';
        if (
          formedYear &&
          String(formedYear).trim() !== '' &&
          formedYear !== '0000' &&
          formedYear !== null
        ) {
          if (
            disbandedYear &&
            String(disbandedYear).trim() !== '' &&
            disbandedYear !== '0000' &&
            disbandedYear !== 'Present' &&
            disbandedYear !== null
          ) {
            yearsActive = `${formedYear} - ${disbandedYear}`;
          } else {
            yearsActive = `${formedYear} - present`;
          }
        }

        const gender =
          finalArtistDetails.strGender &&
          String(finalArtistDetails.strGender).trim() !== '' &&
          String(finalArtistDetails.strGender).trim().toLowerCase() !== 'null'
            ? finalArtistDetails.strGender
            : '';
        const members =
          finalArtistDetails.intMembers &&
          String(finalArtistDetails.intMembers).trim() !== '' &&
          finalArtistDetails.intMembers !== '0' &&
          finalArtistDetails.intMembers !== null
            ? finalArtistDetails.intMembers
            : '';
        const country =
          finalArtistDetails.strCountry &&
          String(finalArtistDetails.strCountry).trim() !== '' &&
          String(finalArtistDetails.strCountry).trim().toLowerCase() !== 'null'
            ? finalArtistDetails.strCountry
            : '';

        artistInfoList.innerHTML = `
          <li class="artist-info-item">
            <h3>Years Active</h3>
            <p class="artist-info">${yearsActive}</p>
          </li>
          <li class="artist-info-item">
            <h3>Gender</h3>
            <p class="artist-info">${gender}</p>
          </li>
          <li class="artist-info-item">
            <h3>Members</h3>
            <p class="artist-info">${members}</p>
          </li>
          <li class="artist-info-item">
            <h3>Country</h3>
            <p class="artist-info">${country}</p>
          </li>
        `;
      }

      if (artistBioParagraph) {
        const biographyText =
          finalArtistDetails.strBiographyEN &&
          String(finalArtistDetails.strBiographyEN).trim() !== '' &&
          String(finalArtistDetails.strBiographyEN).trim().toLowerCase() !==
            'null'
            ? finalArtistDetails.strBiographyEN
            : 'Biography unavailable.';
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
            if (
              genre &&
              String(genre).trim() !== '' &&
              String(genre).trim().toLowerCase() !== 'null'
            ) {
              const li = document.createElement('li');
              li.className = 'genres-item';
              li.textContent = genre;
              genresList.appendChild(li);
            }
          });
        }
        if (genresList.children.length === 0) {
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
          const albumId = track.idAlbum || albumName; // Use idAlbum if available, otherwise albumName

          if (!albumsMap.has(albumId)) {
            albumsMap.set(albumId, {
              strAlbum: albumName,
              intYearReleased: track.intYearReleased || '',
              idAlbum: albumId,
              tracks: [],
            });
          }
          albumsMap.get(albumId).tracks.push(track);
        });

        allAlbums = Array.from(albumsMap.values()).sort((a, b) => {
          const yearA = parseInt(a.intYearReleased) || 0;
          const yearB = parseInt(b.intYearReleased) || 0;
          return yearB - yearA; // Sort by year descending
        });

        renderAlbumsContent();
      } else {
        if (artistAlbumsListContainer) {
          artistAlbumsListContainer.innerHTML = `<li class="artist-albums-item"><p>Album and track information unavailable.</p></li>`;
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
      // Check for specific error types for a more informative message
      if (error.response) {
        // Axios error (if you're using it)
        errorMessage += `Status: ${error.response.status}. `;
        if (error.response.status === 404) {
          errorMessage +=
            'Resource not found at the specified URL. Incorrect ID or API path. Try a different ID or check API documentation.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage += `Message: ${error.response.data.message}`;
        }
      } else if (error.request) {
        // Network error
        errorMessage += 'No response received from the server. Network issue.';
      } else {
        // Other errors
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
