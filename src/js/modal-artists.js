document.addEventListener('DOMContentLoaded', () => {
                  const modal = document.getElementById('artistModal');
                  const closeModalButton = modal.querySelector('.close-modal');
                  const modalLoader = modal.querySelector('#modalLoader');
                
                  /**
                   * Открытие модального окна с привязкой к id артиста.
                   * @param {number|string} artistId – Идентификатор артиста.
                   */
                  window.openArtistModal = function (artistId) {
                    modal.classList.add('active'); 
                    document.body.style.overflow = 'hidden';
                
                    modalLoader.style.display = 'block';
                
                    fetch(`/artists/${artistId}`)
                      .then(response => response.json())
                      .then(data => {
                        modalLoader.style.display = 'none';
                
                        const titleEl = modal.querySelector('.modal-title');
                        titleEl.textContent = data.name || 'Без названия';
                
                        const photoEl = modal.querySelector('.hero-artist-img');
                        photoEl.src = data.photoUrl || '';
                        photoEl.alt = data.name || 'Artist Photo';
                
                        const infoItems = modal.querySelectorAll('.artist-info-list .artist-info');
                        if (infoItems.length >= 4) {
                          infoItems[0].textContent = data.yearsActive || '';
                          infoItems[1].textContent = data.sex || '';
                          infoItems[2].textContent = Array.isArray(data.members)
                            ? data.members.join(', ')
                            : data.members || '';
                          infoItems[3].textContent = data.country || '';
                        }
                
                        const bioEl = modal.querySelector('.artist-bio .artist-info');
                        if (bioEl) {
                          bioEl.textContent = data.biography || '';
                        }
                
                        const genresListEl = modal.querySelector('.ganres-list');
                        if (genresListEl && Array.isArray(data.genres)) {
                          genresListEl.innerHTML = ''; 
                          data.genres.forEach(genre => {
                            const li = document.createElement('li');
                            li.className = 'ganres-item';
                            li.textContent = genre;
                            genresListEl.appendChild(li);
                          });
                        }
                
                        const albumsListEl = modal.querySelector('.artist-albums-list');
                        if (albumsListEl && Array.isArray(data.albums)) {
                          albumsListEl.innerHTML = ''; 
                          data.albums.forEach(album => {
                            const albumItem = document.createElement('li');
                            albumItem.className = 'artist-albums-item';
                
                            const albumNameEl = document.createElement('h3');
                            albumNameEl.className = 'album-name';
                            albumNameEl.textContent = album.albumName || 'Альбом';
                            albumItem.appendChild(albumNameEl);
                
                            const trackListEl = document.createElement('ul');
                            trackListEl.className = 'album-track-list';
                
                            const trackHeader = document.createElement('li');
                            trackHeader.className = 'album-track-item';
                            const trackHeaderList = document.createElement('ul');
                            trackHeaderList.className = 'track-info-list';
                            ['Track', 'Time', 'Link'].forEach(headerText => {
                              const li = document.createElement('li');
                              li.className = 'track-info-item';
                              li.textContent = headerText;
                              trackHeaderList.appendChild(li);
                            });
                            trackHeader.appendChild(trackHeaderList);
                            trackListEl.appendChild(trackHeader);
                
                            if (Array.isArray(album.tracks)) {
                              album.tracks.forEach(track => {
                                const trackItem = document.createElement('li');
                                trackItem.className = 'album-track-item';
                                const trackInfoList = document.createElement('ul');
                                trackInfoList.className = 'track-info-list';
                
                                const trackNameItem = document.createElement('li');
                                trackNameItem.className = 'track-info-item';
                                trackNameItem.textContent = track.trackName || '';
                                trackInfoList.appendChild(trackNameItem);
                
                                const trackTimeItem = document.createElement('li');
                                trackTimeItem.className = 'track-info-item';
                                trackTimeItem.textContent = track.time || '';
                                trackInfoList.appendChild(trackTimeItem);
                
                                const trackLinkItem = document.createElement('li');
                                trackLinkItem.className = 'track-info-item';
                                if (track.youtubeLink) {
                                  const youtubeLink = document.createElement('a');
                                  youtubeLink.href = track.youtubeLink;
                                  youtubeLink.target = '_blank';
                                  youtubeLink.textContent = 'YouTube';
                                  trackLinkItem.appendChild(youtubeLink);
                                } else {
                                  trackLinkItem.textContent = '-';
                                }
                                trackInfoList.appendChild(trackLinkItem);
                
                                trackItem.appendChild(trackInfoList);
                                trackListEl.appendChild(trackItem);
                              });
                            }
                
                            albumItem.appendChild(trackListEl);
                            albumsListEl.appendChild(albumItem);
                          });
                        }
                      })
                      .catch(error => {
                        modalLoader.textContent = 'Помилка завантаження даних';
                        console.error('Error fetching artist data:', error);
                      });
                  };
                
                  function closeModal() {
                    modal.classList.remove('active');
                    document.body.style.overflow = ''; 
                  }
                
                  closeModalButton.addEventListener('click', closeModal);
                
                  modal.addEventListener('click', event => {
                    if (event.target === modal) {
                      closeModal();
                    }
                  });
                
                  document.addEventListener('keydown', event => {
                    if (event.key === 'Escape' && modal.classList.contains('active')) {
                      closeModal();
                    }
                  });
                });
                             