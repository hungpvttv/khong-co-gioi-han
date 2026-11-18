(() => {
  const script = document.currentScript?.src || location.href;
  const root = new URL('../../', script);
  const page = location.pathname.split('/').filter(Boolean).slice(-1)[0] || 'home';
  const path = page === 'kien-thuc' ? 'knowledge' : page === 'phap-luat' ? 'legal' : page === 'thu-thach' ? 'quiz' : page === 'thu-thach-7-ngay' ? 'challenge' : '';
  if (!path) return;
  const text = (selector, value) => {
    const node = document.querySelector(selector);
    if (node && typeof value === 'string') node.textContent = value;
  };
  fetch(new URL('data/pages.json', root)).then(response => {
    if (!response.ok) throw new Error('Không tải được nội dung trang');
    return response.json();
  }).then(data => {
    const item = data[path];
    if (!item) return;
    text('main > .eyebrow', item.eyebrow);
    text('main > h1', item.title);
    text('main > .article-lead', item.lead);
    if (path === 'knowledge') {
      const firstHeading = document.querySelector('.knowledge-page > h2');
      document.querySelectorAll('.knowledge-page > p:not(.article-lead):not(.illustrative-note)').forEach(node=>node.remove());
      (item.paragraphs || []).forEach(value=>{
        const paragraph=document.createElement('p');paragraph.textContent=value;
        if(firstHeading)firstHeading.before(paragraph);
      });
      text('.knowledge-page > h2:nth-of-type(1)', item.concept_heading);
      text('.knowledge-page > h2:nth-of-type(2)', item.comparison_heading);
      text('.knowledge-page > .illustrative-note', item.note);
      const conceptGrid=document.querySelector('.knowledge-concepts');
      const conceptTemplate=conceptGrid?.querySelector('.concept-card');
      if(conceptGrid && conceptTemplate) {
        (item.concepts || []).forEach((entry,index)=>{
          let card=conceptGrid.querySelectorAll('.concept-card')[index];
          if(!card){card=conceptTemplate.cloneNode(true);conceptGrid.append(card);}
          card.hidden=entry.visible===false;
          const title=card.querySelector('.concept-title'),icon=title?.querySelector('.concept-icon'),description=card.querySelector('p');
          if(title && entry.title){title.replaceChildren();if(icon)title.append(icon);title.append(document.createTextNode(entry.title));}
          if(description)description.textContent=entry.description||'';
        });
        [...conceptGrid.querySelectorAll('.concept-card')].forEach((card,index)=>{if(index>=(item.concepts||[]).length)card.hidden=true;});
      }
      const compareGrid=document.querySelector('.knowledge-page .compare-grid');
      const compareTemplate=compareGrid?.querySelector('.compare-card');
      if(compareGrid && compareTemplate) {
        (item.comparisons || []).forEach((entry,index)=>{
          let card=compareGrid.querySelectorAll('.compare-card')[index];
          if(!card){card=compareTemplate.cloneNode(true);compareGrid.append(card);}
          card.hidden=entry.visible===false;
          const title=card.querySelector('h3'),correct=card.querySelector('.right-view');
          if(title)title.textContent=entry.misconception||'';
          if(correct)correct.textContent=entry.correct||'';
        });
        [...compareGrid.querySelectorAll('.compare-card')].forEach((card,index)=>{if(index>=(item.comparisons||[]).length)card.hidden=true;});
      }
      const button = document.querySelector('.knowledge-page > .button');
      if (button) { button.textContent = (item.button_label || 'Thử sức') + ' ↗'; if (item.button_url) button.href = item.button_url; }
    }
    if (path === 'legal') {
      text('.law-page > .notice', item.notice);
      text('.law-more h2', item.more_heading);
      text('.law-more .illustrative-note', item.more_note);
      const list = document.querySelector('.law-more ul');
      if (list && Array.isArray(item.more_links)) {
        list.replaceChildren();
        item.more_links.filter(entry => entry.visible !== false).forEach(entry => {
          const li = document.createElement('li'), a = document.createElement('a');
          a.href = entry.url || '#'; a.target = '_blank'; a.rel = 'noopener';
          a.textContent = entry.label || ''; li.append(a, document.createTextNode(entry.description || '')); list.append(li);
        });
      }
    }
    if (path === 'quiz') {
      text('.quiz-page > .quiz-note', item.note);
      const next = document.getElementById('quiz-next');
      if (next) next.textContent = item.next_label || 'Tiếp theo →';
      document.documentElement.dataset.quizCmsLoaded = 'true';
    }
    if (path === 'challenge') {
      text('.challenge-progress-head b', item.progress_title);
      text('.pledge h2', item.pledge_title);
      const pledgePs = document.querySelectorAll('.pledge > p');
      (item.pledge_paragraphs || []).forEach((value, index) => { if (pledgePs[index]) pledgePs[index].textContent = value; });
      const label = document.querySelector('.pledge-check');
      if (label && item.pledge_label) label.lastChild.textContent = ' ' + item.pledge_label;
      text('.challenge-page > .quiz-note', item.note);
    }
  }).catch(error => console.warn('CMS trang con: dùng nội dung dự phòng.', error));
})();