//  modal-feedback.js

import { submitFeedback } from './apiService';

let modalOverlay;
let modal;
let closeBtn;
let form;
let stars;
let loader;
let selectedRating = 0;

document.addEventListener('DOMContentLoaded', () => {
  modalOverlay = document.querySelector('.modal-overlay');
  modal = document.querySelector('.leave-feedback-modal');
  closeBtn = document.querySelector('.modal-close');
  form = document.querySelector('.feedback-form');
  stars = document.querySelectorAll('.star');
  loader = document.getElementById('feedback-loader');

  if (!modalOverlay || !modal || !closeBtn || !form) {
    console.warn('Modal elements not found for feedback modal.');
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

  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('is-open'))
      closeModal();
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.feedback-error')?.remove();

    const name = form.elements['name'].value.trim();
    const message = form.elements['message'].value.trim();

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

      // === Змена тут: Выкарыстанне функцыі submitFeedback з apiService.js ===
      const responseData = await submitFeedback({
        name,
        rating: selectedRating,
        descr: message, // Важна: назва поля павінна супадаць з API (descr, а не message)
      });
      // ===================================================================

      console.log('Feedback submitted successfully:', responseData); // Можна лагаваць адказ ад бэкэнда

      closeModal();
      form.reset();
      selectedRating = 0;
      highlightStars(0);
    } catch (err) {
      // submitFeedback з apiService.js ужо мае логіку апрацоўкі памылак axios і выкідвае іх,
      // таму мы тут проста перахопліваем выкінутую памылку.
      showError('Failed to submit feedback. Please try again later.');
      console.error('Error submitting feedback via apiService:', err);
    } finally {
      hideLoader();
    }
  });
});

export function openFeedbackModal() {
  if (!modalOverlay || !modal) {
    console.warn('Modal elements not initialized. Cannot open modal.');
    return;
  }
  modalOverlay.classList.add('is-open');
  document.body.classList.add('modal-open');
  form.reset();
  selectedRating = 0;
  highlightStars(0);
  document.querySelector('.feedback-error')?.remove();
}

function closeModal() {
  modalOverlay.classList.remove('is-open');
  document.body.classList.remove('modal-open');
}

function highlightStars(rating) {
  stars.forEach((star, index) => {
    star.classList.toggle('filled', index < rating);
  });
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
