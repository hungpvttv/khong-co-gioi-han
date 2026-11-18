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
      const paragraphs = [...document.querySelectorAll('.knowledge-page > p:not(.article-lead):not(.illustrative-note)')];
      (item.paragraphs || []).forEach((value, index) => { if (paragraphs[index]) paragraphs[index].textContent = value; });
      text('.knowledge-page > h2:nth-of-type(1)', item.concept_heading);
      text('.knowledge-page > h2:nth-of-type(2)', item.comparison_heading);
      text('.knowledge-page > .illustrative-note', item.note);
      const button = document.querySelector('.knowledge-page > .button');
      if (button) { button.textContent = (item.button_label || 'Thử sức') + ' ↗'; if (item.button_url) button.href = item.button_url; }
    }
    if (path === 'legal') {
      text('.law-page > .notice', item.notice);
      text('.law-more h2', item.more_heading);
      text('.law-more .illustrative-note', item.more_note);
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