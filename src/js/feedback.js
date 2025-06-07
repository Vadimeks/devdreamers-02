import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';

const swiperWrapper = document.querySelector('.swiper-wrapper');

async function fetchFeedback() {
  try {
    const response = await fetch(
      'https://sound-wave.b.goit.study/api/feedbacks?limit=10&page=1'
    );
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const feedbacks = await response.json();
    console.log('Полученные отзывы:', feedbacks);

    const list = Array.isArray(feedbacks) ? feedbacks : feedbacks.data;

    list.forEach(({ rating, descr, name }) => {
      const slide = createFeedbackSlide({ rating, text: descr, user: name });
      swiperWrapper.appendChild(slide);
    });

    initSwiper();
  } catch (error) {
    console.error('Oops...Error:', error);
  }
}

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
  return '★'.repeat(count) + '☆'.repeat(max - count);
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

fetchFeedback();
