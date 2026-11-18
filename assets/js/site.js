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

      if (home) {
        const stepNodes = [...document.querySelectorAll('.steps .step-card')];
        (home.steps || []).forEach((item, index) => {
          const node = stepNodes[index]; if (!node) return;
          node.hidden = item.visible === false;
          const strong = node.querySelector('strong'), small = node.querySelector('small'), link = node.querySelector('.step-link');
          if (strong) strong.textContent = item.title || '';
          if (small) small.textContent = item.description || '';
          if (link) link.innerHTML = '';
          if (link) { link.append(document.createTextNode(item.cta || 'Khám phá ')); const b = document.createElement('b'); b.textContent = '↗'; link.append(b); }
          node.href = String(item.url || '#').startsWith('#') ? item.url : assetUrl(item.url);
        });
        (home.doors || []).forEach(item => {
          const section = document.getElementById(item.id); if (!section) return;
          section.hidden = item.visible === false;
          const eyebrow = section.querySelector('.eyebrow'), heading = section.querySelector('h2'), paragraph = section.querySelector('.feature-inner > div > p, .feature-inner div > p');
          if (eyebrow && item.eyebrow) eyebrow.textContent = item.eyebrow;
          if (heading && item.title) heading.textContent = item.title;
          if (paragraph && item.description) paragraph.textContent = item.description;
          const link = section.querySelector('.text-link, .feature-inner .button');
          if (link && item.link_label) { link.textContent = item.link_label + ' ↗'; if (item.link_url) link.href = String(item.link_url).startsWith('#') ? item.link_url : assetUrl(item.link_url); }
        });
        const compareNodes = [...document.querySelectorAll('.infographic-section .compare-card')];
        (home.comparisons || []).forEach((item, index) => {
          const node = compareNodes[index]; if (!node) return;
          node.hidden = item.visible === false;
          const title = node.querySelector('h3'), right = node.querySelector('.right-view');
          if (title) title.textContent = item.misconception || '';
          if (right) right.textContent = item.correct || '';
        });
        const situations = [...document.querySelectorAll('.situation-grid .situation')];
        (home.situations || []).forEach((item, index) => {
          const node = situations[index]; if (!node) return;
          node.hidden = item.visible === false;
          const summary = node.querySelector('summary'), paragraphs = node.querySelectorAll('p');
          if (summary) summary.textContent = item.title || '';
          [item.context, item.explanation, item.action].forEach((value, pIndex) => {
            const paragraph = paragraphs[pIndex]; if (!paragraph) return;
            const label = paragraph.querySelector('b');
            paragraph.replaceChildren();
            if (label) { paragraph.append(label); paragraph.append(document.createTextNode(' ' + (value || ''))); }
            else paragraph.textContent = value || '';
          });
        });
        const conceptNodes = [...document.querySelectorAll('.infographic-section .concept-card')];
        (home.concepts || []).forEach((item, index) => {
          const node = conceptNodes[index]; if (!node) return;
          node.hidden = item.visible === false;
          const title = node.querySelector('.concept-title'), description = node.querySelector('p');
          if (title && item.title) { const icon = title.querySelector('.concept-icon'); title.textContent = ''; if (icon) title.append(icon); title.append(document.createTextNode(item.title)); }
          if (description) description.textContent = item.description || '';
        });
        const closing = document.querySelector('.closing');
        if (closing && home.closing) {
          setText('.closing .eyebrow', home.closing.eyebrow);
          setText('.closing h2', home.closing.title);
          setText('.closing p', home.closing.description);
        }
      }
      document.documentElement.dataset.siteCmsLoaded = 'true';
    } catch (error) {
      console.warn('CMS website: dùng nội dung dự phòng trong HTML.', error);
      window.dispatchEvent(new CustomEvent('site:hero-updated'));
    }
  }
  init();
})();