// feedback section js
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
        let leftBulletActive = '';
        let middleBulletActive = '';
        let rightBulletActive = '';

        if (current === 1) {
          leftBulletActive = 'swiper-pagination-bullet-active';
        } else if (current === total) {
          rightBulletActive = 'swiper-pagination-bullet-active';
        } else {
          middleBulletActive = 'swiper-pagination-bullet-active';
        }
        return `
          <span class="swiper-pagination-bullet ${leftBulletActive}" data-slide-index="0"></span>
          <span class="swiper-pagination-bullet ${middleBulletActive}" data-slide-index="${Math.floor(
          (total - 1) / 2
        )}"></span>
          <span class="swiper-pagination-bullet ${rightBulletActive}" data-slide-index="${
          total - 1
        }"></span>
        `;
      },
    },
    on: {
      paginationUpdate: function () {
        const bullets = document.querySelectorAll(
          '.feedback-pagination .swiper-pagination-bullet'
        );
        bullets.forEach(bullet => {
          bullet.onclick = () => {
            const index = parseInt(bullet.getAttribute('data-slide-index'));
            swiper.slideTo(index);
          };
        });
      },
    },
    grabCursor: true,
  });
}
