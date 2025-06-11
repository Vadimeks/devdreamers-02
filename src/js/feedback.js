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
        // current - бягучы слайд (1-base index)
        // total - агульная колькасць слайдаў

        let leftBulletActive = '';
        let middleBulletActive = '';
        let rightBulletActive = '';

        // Вызначэнне, які булет актыўны
        if (current === 1) {
          // Калі бягучы слайд - першы
          leftBulletActive = 'swiper-pagination-bullet-active';
        } else if (current === total) {
          // Калі бягучы слайд - апошні
          rightBulletActive = 'swiper-pagination-bullet-active';
        } else {
          // Калі бягучы слайд - любы, акрамя першага і апошняга
          middleBulletActive = 'swiper-pagination-bullet-active';
        }

        // Аптымізаваныя data-slide-index для клікаў
        // Левы булет заўсёды пераводзіць на першы слайд (індэкс 0)
        // Правы булет заўсёды пераводзіць на апошні слайд (індэкс total - 1)
        // Сярэдні булет павінен пераводзіць на нейкі "сярэдні" слайд.
        // Калі ў вас толькі 3 булеты, то "сярэдні" павінен прадстаўляць усё, што не першы і не апошні.
        // Можна зрабіць так, каб клік па сярэднім булеце проста пераводзіў на бягучы слайд,
        // калі ён ужо не першы ці апошні, або на першы "не крайні" слайд.
        // Аднак, Swiper звычайна сам пераключае слайды пры кліку, калі `clickable: true`.
        // Калі `clickable: true` і вы выкарыстоўваеце `on: { paginationUpdate: ... }`,
        // то `data-slide-index` для сярэдняга булета павінен быць разумным.
        // Давайце зробім, каб сярэдні булет вёў на сярэдні індэкс усяго дыяпазону,
        // але калі слайдаў менш за 3, ён можа дубляваць іншыя.

        // Аптымізацыя data-slide-index:
        // Для сярэдняга булета, можна выкарыстоўваць індэкс сярэдняга слайда, калі ён існуе і ён не першы/апошні.
        // Але калі карыстальнік клікае на сярэдні булет, ён павінен перайсці на нейкі "сярэдні" слайд.
        // Калі слайдаў мала (1 ці 2), сярэдні булет можа не мець сэнсу.
        // Пакінем так, як было, бо гэта адпавядае вашай логіцы, што сярэдні булет прадстаўляе "ўсё астатняе".
        // Важна: Калі ў вас 3 слайды, індэксы 0, 1, 2. Сярэдні `Math.floor(3/2) = 1`. Гэта індэкс сярэдняга слайда.
        // Калі 4 слайды, індэксы 0, 1, 2, 3. Сярэдні `Math.floor(4/2) = 2`. Гэта індэкс трэцяга слайда.
        // Гэта нармальна для прадстаўлення "сярэдняга" стану.

        return `
          <span class="swiper-pagination-bullet ${leftBulletActive}" data-slide-index="0"></span>
          <span class="swiper-pagination-bullet ${middleBulletActive}" data-slide-index="${Math.floor(
          (total - 1) / 2 // Вылічваем індэкс сярэдняга слайда для `data-slide-index`
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
