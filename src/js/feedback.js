import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';

import 'css-star-rating/css/star-rating.css';
import { fetchFeedbacks } from './apiService';

const swiperWrapper = document.querySelector('.swiper-wrapper');

async function loadFeedbacks() {
  try {
    const response = await fetchFeedbacks(10, 1);
    const feedbacks = response.data;

    feedbacks.forEach(({ rating, descr, name }) => {
      const slide = createFeedbackSlide({ rating, text: descr, user: name });
      swiperWrapper.appendChild(slide);
    });

    initSwiper();
  } catch (error) {
    console.error('Oops...Error', error);
  }
}

loadFeedbacks();

function createFeedbackSlide({ rating, text, user }) {
  const slide = document.createElement('div');
  slide.classList.add('swiper-slide');

  const roundedRating = Math.round(rating);
  slide.innerHTML = `
    <div class="feedback-card">
      <div class="feedback-stars">${renderStars(roundedRating)}</div>
      <p class="feedback-text">"${text}"</p>
      <p class="feedback-user">– ${user}</p>
    </div>
  `;
  return slide;
}

function renderStars(count) {
  const max = 5;
  let starsHTML = '';

  for (let i = 1; i <= max; i++) {
    const iconId = i <= count ? 'icon-star-filled' : 'icon-star-outline';
    starsHTML += `
        <svg class="star-icon" width="24" height="24">
          <use href="/src/public/img/sprite.svg#${iconId}"></use>
        </svg>
      `;
  }

  return starsHTML;
}

function initSwiper() {
  new Swiper('.feedback-swiper', {
    loop: false,
    navigation: {
      nextEl: '.feedback-button-next',
      prevEl: '.feedback-button-prev',
    },
    pagination: {
      el: '.feedback-pagination',
      clickable: true,
    },
    grabCursor: true,
  });
}
