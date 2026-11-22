(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav && !toggle.dataset.bound) {
    toggle.dataset.bound = 'true';
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function initSlider() {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;
    if (slider.dataset.sliderBound === 'true') delete slider.dataset.sliderBound;
    if (slider.dataset.sliderBound) return;
    slider.dataset.sliderBound = 'true';
    const slides = [...slider.querySelectorAll('.hero-slide')];
    const dots = [...slider.querySelectorAll('.slider-dots button')];
    const previous = slider.querySelector('.slider-arrow.prev');
    const next = slider.querySelector('.slider-arrow.next');
    if (slides.length < 2) return;
    let current = 0, timer = null, paused = false;
    const show = index => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    };
    const stop = () => { if (timer) window.clearInterval(timer); timer = null; };
    const start = () => { stop(); if (!paused) timer = window.setInterval(() => show(current + 1), 5500); };
    previous?.addEventListener('click', () => { show(current - 1); start(); });
    next?.addEventListener('click', () => { show(current + 1); start(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); start(); }));
    slider.addEventListener('mouseenter', () => { paused = true; stop(); });
    slider.addEventListener('mouseleave', () => { paused = false; start(); });
    slider.addEventListener('focusin', () => { paused = true; stop(); });
    slider.addEventListener('focusout', () => { paused = false; start(); });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    start();
  }
  window.addEventListener('site:hero-updated', initSlider, { once: true });
  // Public page-view counter (homepage only), loaded via Apps Script JSONP.
  const counter = document.getElementById('public-page-views');
  if (counter) {
    const callbackName = 'renderPublicPageViews';
    let settled = false;
    let timeoutId;
    const script = document.createElement('script');
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      script.remove();
    };
    window[callbackName] = data => {
      finish();
      if (data && data.ok === true && Number.isFinite(Number(data.views))) {
        counter.textContent = 'Tổng lượt xem: ' + Number(data.views).toLocaleString('vi-VN');
      } else {
        counter.textContent = 'Tổng lượt xem: Chưa thể tải dữ liệu';
      }
      delete window[callbackName];
    };
    script.async = true;
    script.src = 'https://script.google.com/macros/s/AKfycbzfQTmfEyRspfoETRMLXUVZ073d1oTlcAuW62bExvMiQm9tnBxmRJqjuDJIKNWzdlk1UA/exec?callback=' + callbackName;
    script.onerror = () => {
      finish();
      counter.textContent = 'Tổng lượt xem: Chưa thể tải dữ liệu';
      delete window[callbackName];
    };
    timeoutId = window.setTimeout(() => {
      finish();
      counter.textContent = 'Tổng lượt xem: Chưa thể tải dữ liệu';
      delete window[callbackName];
    }, 12000);
    document.head.appendChild(script);
  }

})();