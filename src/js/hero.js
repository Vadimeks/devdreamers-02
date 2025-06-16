document.addEventListener('DOMContentLoaded', () => {
  const heroColumnOne = document.querySelector('.hero-column-one');
  const heroColumnTwo = document.querySelector('.hero-column-two');

  if (!heroColumnOne || !heroColumnTwo) {
    return;
  }

  const allArtistCards = Array.from(
    document.querySelectorAll('.hero-artist-card')
  ).sort((a, b) => {
    return parseInt(a.dataset.artistIndex) - parseInt(b.dataset.artistIndex);
  });

  let currentOrder = [...allArtistCards];

  const rotateArtists = () => {
    const firstPositions = new Map();
    currentOrder.forEach(card => {
      firstPositions.set(
        card.dataset.artistIndex,
        card.getBoundingClientRect()
      );
    });

    const newOrder = [
      currentOrder[2],
      currentOrder[0],
      currentOrder[4],
      currentOrder[1],
      currentOrder[5],
      currentOrder[3],
    ];

    currentOrder = newOrder;

    heroColumnOne.innerHTML = '';
    heroColumnTwo.innerHTML = '';

    heroColumnOne.appendChild(currentOrder[0]);
    heroColumnTwo.appendChild(currentOrder[1]);
    heroColumnOne.appendChild(currentOrder[2]);
    heroColumnTwo.appendChild(currentOrder[3]);
    heroColumnOne.appendChild(currentOrder[4]);
    heroColumnTwo.appendChild(currentOrder[5]);

    currentOrder.forEach(card => {
      const lastPosition = card.getBoundingClientRect();
      const firstPosition = firstPositions.get(card.dataset.artistIndex);

      if (!firstPosition) {
        card.style.transform = '';
        return;
      }

      const deltaX = firstPosition.left - lastPosition.left;
      const deltaY = firstPosition.top - lastPosition.top;

      card.style.transition = 'none';
      card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

      card.offsetWidth;

      card.style.transition = 'transform 0.5s ease-in-out';
      card.style.transform = 'translate(0, 0)';
    });
  };

  let animationIntervalId;

  const startAnimation = (initialDelay = 1000, subsequentDelay = 3000) => {
    clearInterval(animationIntervalId);

    setTimeout(() => {
      rotateArtists();
      animationIntervalId = setInterval(rotateArtists, subsequentDelay);
    }, initialDelay);
  };

  startAnimation();

  const exploreBtn = document.querySelector('.explore-btn');
  // Зменена artists-section на artist-section
  const artistsSection = document.getElementById('artist-section');

  if (exploreBtn && artistsSection) {
    exploreBtn.addEventListener('click', event => {
      event.preventDefault();
      artistsSection.scrollIntoView({
        behavior: 'smooth',
      });
    });
  }
});
