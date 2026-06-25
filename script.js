// Comportamiento mínimo: enlace activo en scroll
document.addEventListener('DOMContentLoaded', function () {
  const nav = document.getElementById('primaryNav');
  const links = Array.from(nav.querySelectorAll('a'));

  // Highlight active section in nav
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  function onScroll() {
    const y = window.scrollY + 120; // offset for header
    let idx = sections.length - 1;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop > y) { idx = i - 1; break }
    }
    links.forEach(l => l.classList.remove('active'));
    if (idx >= 0) links[idx].classList.add('active');
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Smooth focus for skip link target
  const skip = document.querySelector('.skip-link');
  if (skip) skip.addEventListener('click', (e) => {
    const target = document.querySelector(skip.getAttribute('href'));
    if (target) target.setAttribute('tabindex', '-1');
    setTimeout(() => target && target.focus(), 10);
  });

  // Expand hero image in overlay
  const heroImage = document.getElementById('heroImage');
  const heroOverlay = document.getElementById('heroOverlay');
  const heroOverlayImage = document.getElementById('heroOverlayImage');
  const heroOverlayClose = document.getElementById('heroOverlayClose');

  if (heroImage && heroOverlay && heroOverlayImage && heroOverlayClose) {
    heroImage.style.cursor = 'zoom-in';
    heroImage.addEventListener('click', () => {
      heroOverlayImage.src = heroImage.src;
      heroOverlayImage.alt = heroImage.alt;
      heroOverlay.classList.add('active');
      heroOverlayClose.focus();
    });

    const closeOverlay = () => {
      heroOverlay.classList.remove('active');
      heroOverlayImage.src = '';
      heroImage.focus();
    };

    heroOverlayClose.addEventListener('click', closeOverlay);
    heroOverlay.addEventListener('click', (event) => {
      if (event.target === heroOverlay || event.target.dataset.close === 'true') {
        closeOverlay();
      }
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && heroOverlay.classList.contains('active')) {
        closeOverlay();
      }
    });
  }
});
