document.addEventListener('DOMContentLoaded', () => {
  const modalOverlay = document.querySelector('.modal-overlay');
  const modal = document.querySelector('.leave-feedback-modal');
  const closeBtn = document.querySelector('.modal-close');
  const form = document.querySelector('.feedback-form');
  const stars = document.querySelectorAll('.star');
  const loader = document.getElementById('feedback-loader');
  let selectedRating = 0;

  if (!modalOverlay || !modal || !closeBtn || !form) {
    console.warn('Modal elements not found');
    return;
  }

  stars.forEach((star, index) => {
    const starIndex = index + 1;
    star.addEventListener('mouseenter', () => highlightStars(starIndex));
    star.addEventListener('mouseleave', () => highlightStars(selectedRating));
    star.addEventListener('click', () => {
      selectedRating = starIndex;
      highlightStars(selectedRating);
    });
  });

  function highlightStars(rating) {
    stars.forEach((star, index) => {
      star.classList.toggle('filled', index < rating);
    });
  }

  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  function closeModal() {
    modalOverlay.classList.remove('is-open');
    document.body.classList.remove('modal-open');
  }

  function showLoader() {
    loader?.style.setProperty('display', 'block');
  }

  function hideLoader() {
    loader?.style.setProperty('display', 'none');
  }

  function showError(message) {
    const existing = document.querySelector('.feedback-error');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = 'feedback-error';
    el.textContent = message;
    el.style.color = 'red';
    el.style.marginTop = '8px';
    form.appendChild(el);
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.feedback-error')?.remove();

    const name = form.elements['name'].value.trim();
    const message = form.elements['message'].value.trim();

    // Валідація
    if (name.length < 2 || name.length > 16) {
      showError('Name must be between 2 and 16 characters.');
      return;
    }
    if (selectedRating < 1 || selectedRating > 5) {
      showError('Please select a rating between 1 and 5.');
      return;
    }
    if (message.length < 10 || message.length > 512) {
      showError('Message must be between 10 and 512 characters.');
      return;
    }

    showLoader();

    try {
      console.log('Submitting data:', {
        name,
        rating: selectedRating,
        message,
      });
      const response = await fetch(
        'https://sound-wave.b.goit.study/api/feedbacks',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            rating: selectedRating,
            descr: message,
          }),
        }
      );

      if (!response.ok) throw new Error('Server error');

      closeModal();
      form.reset();
      selectedRating = 0;
      highlightStars(0);
    } catch (err) {
      showError('Failed to submit feedback. Please try again later.');
      console.error(err);
    } finally {
      hideLoader();
    }
  });
});
