(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const slider = document.querySelector('.hero-slider');
  if (!slider) return;
  const slides = [...slider.querySelectorAll('.hero-slide')];
  const dots = [...slider.querySelectorAll('.slider-dots button')];
  const previous = slider.querySelector('.slider-arrow.prev');
  const next = slider.querySelector('.slider-arrow.next');
  if (slides.length < 2) return;
  let current = 0;
  let timer = null;
  let paused = false;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
  };
  const stop = () => { if (timer) window.clearInterval(timer); timer = null; };
  const start = () => {
    stop();
    if (!paused) timer = window.setInterval(() => show(current + 1), 5500);
  };
  previous?.addEventListener('click', () => { show(current - 1); start(); });
  next?.addEventListener('click', () => { show(current + 1); start(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); start(); }));
  slider.addEventListener('mouseenter', () => { paused = true; stop(); });
  slider.addEventListener('mouseleave', () => { paused = false; start(); });
  slider.addEventListener('focusin', () => { paused = true; stop(); });
  slider.addEventListener('focusout', () => { paused = false; start(); });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  start();
})();