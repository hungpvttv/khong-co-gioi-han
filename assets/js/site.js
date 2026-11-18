(() => {
  const scriptUrl = document.currentScript?.src || location.href;
  const rootUrl = new URL('../../', scriptUrl);
  const assetUrl = value => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
    return new URL(raw.replace(/^\/+/, ''), rootUrl).href;
  };
  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node && typeof value === 'string') node.textContent = value;
  };
  async function init() {
    try {
      const [siteResponse, homeResponse] = await Promise.all([
        fetch(new URL('data/site.json', rootUrl)),
        document.querySelector('.hero-slider') ? fetch(new URL('data/homepage.json', rootUrl)) : Promise.resolve(null)
      ]);
      if (!siteResponse.ok) throw new Error('Không tải được cấu hình website');
      const site = await siteResponse.json();
      const home = homeResponse?.ok ? await homeResponse.json() : null;
      document.querySelectorAll('.site-header').forEach(header => {
        const brand = header.querySelector('.brand');
        if (brand) {
          brand.href = rootUrl.href;
          const logo = brand.querySelector('.brand-logo');
          if (logo && site.logo) { logo.src = assetUrl(site.logo); logo.alt = 'Logo ' + (site.name || 'website'); }
          const name = brand.querySelector('span');
          if (name) name.textContent = site.name || '';
        }
        const nav = header.querySelector('.main-nav');
        if (nav && Array.isArray(site.menu)) {
          nav.replaceChildren();
          site.menu.filter(item => item.visible !== false).forEach(item => {
            const a = document.createElement('a');
            a.textContent = item.label || '';
            const url = String(item.url || '#');
            a.href = url.startsWith('#') ? url : assetUrl(url);
            nav.append(a);
          });
        }
      });
      document.querySelectorAll('footer').forEach(footer => {
        const title = footer.querySelector('strong');
        const description = footer.querySelector('span');
        if (title) title.textContent = site.footer_title || site.name || '';
        if (description) description.textContent = site.footer_text || site.slogan || '';
      });
      if (site.description) {
        let description = document.querySelector('meta[name="description"]');
        if (!description) { description = document.createElement('meta'); description.name = 'description'; document.head.append(description); }
        description.content = site.description;
      }
      if (site.name) document.title = document.title.replace(/KHÔNG CÓ GIỚI HẠN/g, site.name);
      if (site.favicon) {
        let icon = document.querySelector('link[rel="icon"]');
        if (!icon) { icon = document.createElement('link'); icon.rel = 'icon'; document.head.append(icon); }
        icon.href = assetUrl(site.favicon);
      }
      if (home) {
        setText('.hero-intro .eyebrow', home.hero_eyebrow);
        setText('.hero-intro h1', home.hero_title);
        setText('.hero-intro .hero-slogan', home.hero_slogan);
        setText('.hero-intro .hero-description', home.hero_description);
        const cta = document.querySelector('.hero-intro .button');
        if (cta) { cta.childNodes[0].textContent = (home.hero_button || 'Khám phá ngay') + ' '; cta.href = String(home.hero_button_url || '#hanh-trinh').startsWith('#') ? home.hero_button_url : assetUrl(home.hero_button_url); }
        const slider = document.querySelector('.hero-slider');
        const slides = (home.hero_slides || []).filter(item => item.visible !== false);
        if (slider && slides.length) {
          const shade = slider.querySelector('.hero-shade');
          const controls = slider.querySelector('.slider-controls');
          slider.querySelectorAll('.hero-slide').forEach(node => node.remove());
          slides.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'hero-slide slide-' + (index + 1) + (index === 0 ? ' is-active' : '');
            const img = document.createElement('img');
            img.src = assetUrl(item.image); img.alt = item.alt || '';
            div.append(img); slider.insertBefore(div, shade || controls || null);
          });
          let dots = slider.querySelector('.slider-dots');
          if (!dots) { dots = document.createElement('div'); dots.className = 'slider-dots'; (controls || slider).append(dots); }
          dots.replaceChildren();
          slides.forEach((item, index) => {
            const button = document.createElement('button');
            button.type = 'button'; button.setAttribute('aria-label', 'Ảnh ' + (index + 1));
            if (index === 0) button.classList.add('active');
            dots.append(button);
          });
          const prev = slider.querySelector('.slider-arrow.prev');
          const next = slider.querySelector('.slider-arrow.next');
          if (prev) prev.hidden = slides.length < 2;
          if (next) next.hidden = slides.length < 2;
          slider.dataset.cmsReady = 'true';
          window.dispatchEvent(new CustomEvent('site:hero-updated'));
        }
      }
      document.documentElement.dataset.siteCmsLoaded = 'true';
    } catch (error) {
      console.warn('CMS website: dùng nội dung dự phòng trong HTML.', error);
    }
  }
  init();
})();