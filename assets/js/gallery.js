(() => {
  const gallery = document.querySelector('.activity-gallery');
  if (!gallery) return;
  async function init() {
    try {
      const response = await fetch('data/gallery.json');
      if (response.ok) {
        const data = await response.json();
        const items = (data.gallery || []).filter(item => item.visible !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        if (items.length) {
          gallery.replaceChildren();
          items.forEach(item => {
            const figure = document.createElement('figure');
            const img = document.createElement('img');
            const caption = document.createElement('figcaption');
            let imagePath = String(item.image || '');
            while (imagePath.startsWith('/')) imagePath = imagePath.slice(1);
            img.src = new URL(imagePath, document.baseURI).href;
            img.alt = item.alt || '';
            caption.textContent = item.caption || '';
            figure.append(img, caption);
            gallery.append(figure);
          });
        }
      }
    } catch (error) {
      // Keep original HTML images as fallback if CMS data cannot load.
    }
    const figures = [...gallery.querySelectorAll('figure')];
    if (!figures.length) return;
    gallery.classList.add('gallery-carousel');
    const track = document.createElement('div');
    track.className = 'gallery-track';
    figures.forEach(figure => track.append(figure));
    gallery.append(track);
    const controls = document.createElement('div');
    controls.className = 'gallery-controls';
    const previous = document.createElement('button');
    previous.type = 'button'; previous.className = 'gallery-arrow';
    previous.setAttribute('aria-label', 'Ảnh trước'); previous.textContent = '‹';
    const dots = document.createElement('div'); dots.className = 'gallery-dots';
    const next = document.createElement('button');
    next.type = 'button'; next.className = 'gallery-arrow';
    next.setAttribute('aria-label', 'Ảnh tiếp theo'); next.textContent = '›';
    figures.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button'; dot.setAttribute('aria-label', 'Đến ảnh ' + (index + 1));
      dot.addEventListener('click', () => go(index)); dots.append(dot);
    });
    controls.append(previous, dots, next); gallery.append(controls);
    let current = 0;
    function go(index) {
      current = (index + figures.length) % figures.length;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      [...dots.children].forEach((dot, i) => dot.classList.toggle('active', i === current));
    }
    previous.addEventListener('click', () => go(current - 1));
    next.addEventListener('click', () => go(current + 1)); go(0);
    let touchStartX = 0;
    track.addEventListener('touchstart', event => { touchStartX = event.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', event => {
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 45) go(current + (delta < 0 ? 1 : -1));
    }, { passive: true });
    figures.forEach(figure => figure.addEventListener('click', () => {
      const source = figure.querySelector('img');
      const overlay = document.createElement('div'); overlay.className = 'gallery-lightbox';
      const close = document.createElement('button'); close.type = 'button';
      close.className = 'lightbox-close'; close.setAttribute('aria-label', 'Đóng'); close.textContent = '×';
      const image = document.createElement('img'); image.src = source.src; image.alt = source.alt;
      const text = document.createElement('p');
      text.textContent = figure.querySelector('figcaption')?.textContent || source.alt;
      overlay.append(close, image, text); document.body.append(overlay);
      overlay.addEventListener('click', event => {
        if (event.target === overlay || event.target === close) overlay.remove();
      });
    }));
  }
  init();
})();