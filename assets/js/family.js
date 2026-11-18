(() => {
  const main = document.querySelector('.article-page');
  if (!main) return;

  // CMS stores media paths relative to the website root. On GitHub Pages,
  // resolve them against the project root rather than the current subfolder.
  const resolveMedia = (value) => {
    if (!value) return '';
    const clean = String(value).trim().replace(/^\/+/, '');
    try {
      return new URL(clean, new URL('../', document.baseURI)).href;
    } catch {
      return '';
    }
  };

  const makeImage = (src, alt, caption) => {
    const resolved = resolveMedia(src);
    if (!resolved) return null;
    const figure = document.createElement('figure');
    figure.className = 'family-inline-figure';
    const img = document.createElement('img');
    img.src = resolved;
    img.alt = alt || '';
    img.loading = 'lazy';
    img.addEventListener('error', () => figure.remove(), { once: true });
    figure.append(img);
    if (caption) {
      const figcaption = document.createElement('figcaption');
      figcaption.textContent = caption;
      figure.append(figcaption);
    }
    return figure;
  };

  const addText = (parent, tag, value, className) => {
    if (!value) return null;
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = value;
    parent.append(el);
    return el;
  };

  fetch('../data/family-article.json', { cache: 'no-cache' })
    .then((response) => response.ok ? response.json() : Promise.reject(new Error('Không tải được dữ liệu bài viết')))
    .then((data) => {
      if (data.visible === false) { main.hidden = true; return; }

      const eyebrow = main.querySelector(':scope > .eyebrow');
      const title = main.querySelector('h1');
      const lead = main.querySelector('.article-lead');
      const hero = main.querySelector('.article-hero');
      const note = main.querySelector('.illustrative-note');

      if (eyebrow) {
        eyebrow.textContent = data.eyebrow || '';
        eyebrow.hidden = !data.eyebrow;
      }
      if (title && data.title) title.textContent = data.title;
      if (lead && data.sapo) lead.textContent = data.sapo;

      main.querySelectorAll(':scope > p:not(.article-lead):not(.illustrative-note)').forEach((p) => p.remove());
      main.querySelectorAll('.story-card,.family-content-block').forEach((item) => item.remove());

      if (hero) {
        const heroSrc = resolveMedia(data.hero_image);
        if (heroSrc) {
          let img = hero.querySelector('img');
          if (!img) {
            img = document.createElement('img');
            hero.append(img);
          }
          img.src = heroSrc;
          img.alt = data.hero_alt || '';
          img.addEventListener('error', () => { hero.hidden = true; }, { once: true });
          hero.hidden = false;
        } else {
          hero.hidden = true;
        }
      }

      let anchor = hero;
      let storyNumber = 0;
      const blocks = Array.isArray(data.blocks) ? data.blocks : [];

      if (blocks.length) {
        blocks.forEach((block) => {
          let element = null;

          switch (block.type) {
            case 'paragraph': {
              element = document.createElement('div');
              element.className = 'family-content-block family-paragraph-block';
              addText(element, 'p', block.text || '');
              const image = makeImage(block.image, block.alt, block.caption);
              if (image) element.append(image);
              break;
            }
            case 'heading': {
              element = document.createElement('h2');
              element.className = 'family-content-block';
              element.textContent = block.heading || '';
              break;
            }
            case 'image': {
              element = makeImage(block.image, block.alt, block.caption);
              if (element) element.classList.add('family-content-block');
              break;
            }
            case 'quote': {
              element = document.createElement('blockquote');
              element.className = 'family-content-block family-editor-quote';
              element.textContent = block.quote || '';
              break;
            }
            case 'story': {
              storyNumber += 1;
              element = document.createElement('section');
              element.className = 'story-card family-content-block';
              addText(element, 'span', (data.story_label || 'CÂU CHUYỆN MINH HỌA') + ' ' + String(storyNumber).padStart(2, '0'), 'eyebrow');
              addText(element, 'h2', block.story_title);
              addText(element, 'p', block.story_body);
              const image = makeImage(block.image, block.alt, block.caption);
              if (image) element.append(image);
              addText(element, 'blockquote', block.story_message);
              if (block.story_question) {
                const question = document.createElement('p');
                question.className = 'story-question';
                const label = document.createElement('b');
                label.textContent = (data.story_question_label || 'Nếu là bạn?') + ' ';
                question.append(label, document.createTextNode(block.story_question));
                element.append(question);
              }
              break;
            }
            default:
              break;
          }

          if (element && anchor) {
            anchor.after(element);
            anchor = element;
          }
        });
      } else {
        (data.paragraphs || []).forEach((paragraph) => {
          const element = addText(main, 'p', paragraph);
          if (element && anchor) {
            anchor.after(element);
            anchor = element;
          }
        });
        (data.stories || []).forEach((story, index) => {
          const card = document.createElement('section');
          card.className = 'story-card family-content-block';
          addText(card, 'span', (data.story_label || 'CÂU CHUYỆN MINH HỌA') + ' 0' + (index + 1), 'eyebrow');
          addText(card, 'h2', story.title);
          addText(card, 'p', story.body);
          addText(card, 'blockquote', story.message);
          const question = document.createElement('p');
          question.className = 'story-question';
          const label = document.createElement('b');
          label.textContent = (data.story_question_label || 'Nếu là bạn?') + ' ';
          question.append(label, document.createTextNode(story.question || ''));
          card.append(question);
          if (anchor) {
            anchor.after(card);
            anchor = card;
          }
        });
      }


      const ending = main.querySelector('.article-end');
      if (ending) {
        const endingTitle = ending.querySelector('h2');
        const endingText = ending.querySelector('p');
        const endingLink = ending.querySelector('a');
        if (endingTitle && data.article_end_title) endingTitle.textContent = data.article_end_title;
        if (endingText && data.article_end_text) endingText.textContent = data.article_end_text;
        if (endingLink) {
          if (data.article_end_button_label) endingLink.textContent = data.article_end_button_label + ' ↗';
          if (data.article_end_button_url) endingLink.href = data.article_end_button_url;
        }
      }
      if (note && data.illustrative_note) {
        note.textContent = 'Lưu ý: ' + data.illustrative_note;
        if (anchor) anchor.after(note);
      }
    })
    .catch((error) => console.error('[Bài viết gia đình]', error));
})();
