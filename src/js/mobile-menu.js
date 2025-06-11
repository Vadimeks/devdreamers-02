// Mobile menu
document.addEventListener('DOMContentLoaded', function () {
  const burger = document.querySelector('.burger-btn');
  const modalMenu = document.querySelector('.mobile-menu');
  const closeBtn = document.querySelector('.mobile-close');
  const backdrop = document.querySelector('.mobile-backdrop');
  const headerLogo = document.querySelector('.header-logo-link');

  let logoCloned = false;

  const closeMenu = () => {
    backdrop.classList.remove('open');
    modalMenu.classList.remove('open');
    document.body.style.overflow = '';
  };

  burger.addEventListener('click', () => {
    backdrop.classList.add('open');
    modalMenu.classList.add('open');
    document.body.style.overflow = 'hidden';

    if (!logoCloned && headerLogo) {
      const logoClone = headerLogo.cloneNode(true);
      logoClone.classList.add('mobile-logo');
      modalMenu.prepend(logoClone);
      logoCloned = true;
    }
  });

  closeBtn.addEventListener('click', closeMenu);

  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) closeMenu();
  });

  const mobileLinks = modalMenu.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  const mediaQuery = window.matchMedia('(min-width: 768px)');

  const handleMediaQueryChange = e => {
    if (e.matches) {
      if (backdrop.classList.contains('open')) {
        closeMenu();
      }
    }
  };

  mediaQuery.addEventListener('change', handleMediaQueryChange);

  handleMediaQueryChange(mediaQuery);
});
