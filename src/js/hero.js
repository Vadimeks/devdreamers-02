// src/js/hero.js

// Імпартуем УСЕ версіі Hero-малюнкаў.
// Гэта дазволіць Vite правільна апрацаваць іх і даць нам канчатковыя, хэшаваныя URL-адрасы.
import heroMobileImg from '../img/hero/img-hero-mobile.webp';
import heroMobile2xImg from '../img/hero/img-hero-mobile@2x.webp';
import heroTabletImg from '../img/hero/img-hero-tablet.webp';
import heroTablet2xImg from '../img/hero/img-hero-tablet@2x.webp';
import heroDesktopImg from '../img/hero/img-hero-desktop.webp';
import heroDesktop2xImg from '../img/hero/img-hero-desktop@2x.webp';

// Аб'яўляем зменную для таймера за межамі слухача падзей, каб яна была даступная
// і магла захоўваць спасылку на таймаўт.
let resizeTimeout;
let currentLoadedImageUrl; // Таксама выносім сюды для зручнасці

/**
 * Дадае preload-тэг для зададзенага URL малюнка.
 * Прадухіляе дубляванне тэгаў.
 * @param {string} imageUrl - URL малюнка для preload.
 */
function addPreloadLink(imageUrl) {
  if (
    !imageUrl ||
    document.querySelector(`link[rel="preload"][href="${imageUrl}"]`)
  ) {
    return; // Не дадаём, калі URL пусты або тэг ужо існуе
  }
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = imageUrl;
  document.head.appendChild(link);
}

/**
 * Вызначае аптымальны URL для Hero-малюнка на аснове бягучай шырыні экрана і шчыльнасці пікселяў.
 * @returns {string} URL малюнка.
 */
function getHeroBackgroundImageUrl() {
  const is2x = window.devicePixelRatio >= 1.5; // Выкарыстоўваем 1.5 для больш агульнай падтрымкі @2x

  if (window.matchMedia('(min-width: 1440px)').matches) {
    return is2x ? heroDesktop2xImg : heroDesktopImg;
  } else if (window.matchMedia('(min-width: 768px)').matches) {
    return is2x ? heroTablet2xImg : heroTabletImg;
  } else {
    return is2x ? heroMobile2xImg : heroMobileImg;
  }
}

/**
 * Усталёўвае фонавы малюнак для Hero-кантейнера і яго пазіцыянаванне.
 * @param {string} imageUrl - URL малюнка для ўстаноўкі.
 */
function setHeroBackgroundImage(imageUrl) {
  const heroImageContainer = document.querySelector('.hero-img-wrapper');
  if (!heroImageContainer) {
    console.error('Hero image container (.hero-img-wrapper) not found!');
    return;
  }
  heroImageContainer.style.backgroundImage = `url(${imageUrl})`;

  // Усталёўваем background-position у залежнасці ад брэйкпоінта
  if (window.matchMedia('(min-width: 1440px)').matches) {
    heroImageContainer.style.backgroundPosition = 'center right';
  } else {
    heroImageContainer.style.backgroundPosition = 'center bottom';
  }
}

/**
 * Ініцыялізуе Hero-секцыю: дадае preload-тэг і ўсталёўвае фонавы малюнак.
 */
function initHeroSection() {
  currentLoadedImageUrl = getHeroBackgroundImageUrl(); // Ініцыялізуем бягучы URL
  addPreloadLink(currentLoadedImageUrl); // Дадаем preload для першай загружанай выявы
  setHeroBackgroundImage(currentLoadedImageUrl); // Усталёўваем малюнак
}

// Запускаем ініцыялізацыю пасля загрузкі DOM.
document.addEventListener('DOMContentLoaded', initHeroSection);

// Дадаем слухач на змену памеру акна, каб дынамічна абнаўляць малюнак.
window.addEventListener('resize', () => {
  // Выкарыстоўваем аб'яўленую раней зменную resizeTimeout
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  resizeTimeout = setTimeout(() => {
    const newImageUrl = getHeroBackgroundImageUrl();
    if (newImageUrl !== currentLoadedImageUrl) {
      setHeroBackgroundImage(newImageUrl); // Усталёўваем новы малюнак
      addPreloadLink(newImageUrl); // Прэлоадзім новую выяву, калі яна змянілася
      currentLoadedImageUrl = newImageUrl; // Абнаўляем бягучы URL
    }
  }, 250); // Затрымка 250 мс пасля спынення змены памеру
});
