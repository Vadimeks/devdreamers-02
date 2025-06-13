// Замест:
// import Swiper from 'swiper/bundle';
// import 'swiper/css/bundle';

// ЗМЯНІЦЕ НА:

// 1. Імпартуем само ядро Swiper
import Swiper from 'swiper';

// 2. Імпартуем канкрэтныя модулі, якія вам патрэбны
// Згодна з вашым кодам, гэта Navigation і Pagination
import { Navigation, Pagination } from 'swiper/modules';

// 3. Імпартуем мінімальныя CSS-стылі
import 'swiper/css'; // Базавыя стылі Swiper
import 'swiper/css/navigation'; // Стылі для навігацыйных стрэлак
import 'swiper/css/pagination'; // Стылі для пагінацыі

import { fetchFeedbacks } from './apiService';

// Функцыі для адкрыцця/закрыцця мадальнага акна
// Імпартуем іх з асобнага файла modal-feedback.js
import { openFeedbackModal } from './modal-feedback'; // Мяркуецца, што openFeedbackModal будзе экспартавана з modal-feedback.js

const swiperWrapper = document.querySelector('.swiper-wrapper');
const leaveFeedbackButton = document.querySelector('.leave-feedback-button');

async function loadFeedbacks() {
  try {
    const response = await fetchFeedbacks(10, 1);
    const feedbacks = response.data;
    if (feedbacks && feedbacks.length > 0) {
      feedbacks.forEach(({ rating, descr, name }) => {
        const slide = createFeedbackSlide({ rating, text: descr, user: name });
        swiperWrapper.appendChild(slide);
      });
      initSwiper();
    } else {
      console.warn('No feedbacks received from the API.');
    }
  } catch (error) {
    console.error('Oops...Error loading feedbacks:', error);
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
      <p class="feedback-user">${user}</p>
    </div>
  `;
  return slide;
}

function renderStars(count) {
  const max = 5;
  let starsHTML = '';
  for (let i = 1; i <= max; i++) {
    const starClass = i <= count ? 'star-filled' : 'star-outline';
    starsHTML += `
        <svg class="star-icon ${starClass}" width="24" height="24">
          <use href="./img/sprite.svg#icon-star"></use>
        </svg>
      `;
  }
  return starsHTML;
}

function initSwiper() {
  const swiper = new Swiper('.feedback-swiper', {
    // ДАДАЙЦЕ ГЭТУЮ ОПЦЫЮ:
    modules: [Navigation, Pagination], // Тут пералічваем усе патрэбныя модулі

    loop: false,

    navigation: {
      nextEl: '.feedback-button-next',
      prevEl: '.feedback-button-prev',
    },
    pagination: {
      el: '.feedback-pagination',
      clickable: true,
      type: 'custom',
      renderCustom: function (swiperInstance, current, total) {
        const leftBulletClass =
          current === 1 ? 'swiper-pagination-bullet-active' : '';
        const middleBulletClass =
          current > 1 && current < total
            ? 'swiper-pagination-bullet-active'
            : '';
        const rightBulletClass =
          current === total ? 'swiper-pagination-bullet-active' : '';

        return `
          <span class="swiper-pagination-bullet ${leftBulletClass}" data-slide-target="first-slide-go"></span>
          <span class="swiper-pagination-bullet ${middleBulletClass}" data-slide-target="indicator-only"></span>
          <span class="swiper-pagination-bullet ${rightBulletClass}" data-slide-target="last-slide-go"></span>
        `;
      },
    },
    on: {
      init: function () {
        addPaginationClickHandlers(this);
      },
      paginationRender: function () {
        addPaginationClickHandlers(this);
      },
    },
    grabCursor: true,
  });

  function addPaginationClickHandlers(swiperInstance) {
    const paginationContainer = document.querySelector('.feedback-pagination');
    if (!paginationContainer) return;

    paginationContainer.removeEventListener(
      'click',
      handleCustomPaginationClick
    );
    paginationContainer.addEventListener('click', handleCustomPaginationClick);

    function handleCustomPaginationClick(event) {
      const clickedBullet = event.target.closest('.swiper-pagination-bullet');
      if (!clickedBullet) return;

      const targetAction = clickedBullet.getAttribute('data-slide-target');
      const totalSlides = swiperInstance.slides.length;

      if (targetAction === 'first-slide-go') {
        swiperInstance.slideTo(0);
      } else if (targetAction === 'last-slide-go') {
        swiperInstance.slideTo(totalSlides - 1);
      } else if (targetAction === 'indicator-only') {
        return;
      }
    }
  }
}

// Слухач падзей для кнопкі "Leave feedback"
document.addEventListener('DOMContentLoaded', () => {
  if (leaveFeedbackButton) {
    leaveFeedbackButton.addEventListener('click', openFeedbackModal);
  } else {
    console.warn('Leave feedback button not found.');
  }
});
