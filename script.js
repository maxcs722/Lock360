// Comportamiento mínimo: menú móvil y enlace activo en scroll
document.addEventListener('DOMContentLoaded', function () {
  const nav = document.getElementById('primaryNav');
  const toggle = document.getElementById('navToggle');
  const links = Array.from(nav.querySelectorAll('a'));

  // Toggle menú móvil
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });

  // Close nav on link click (mobile)
  links.forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

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
});

