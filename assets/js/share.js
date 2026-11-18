(() => {
  const shareIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V3m0 0L7 8m5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const makeMenu = () => {
    const wrap = document.createElement('div');
    wrap.className = 'share-wrap';
    wrap.innerHTML = '<button class="share-trigger" type="button" aria-expanded="false" aria-haspopup="menu">' + shareIcon + '<span>Chia sẻ</span></button><div class="share-menu" role="menu" hidden><button type="button" role="menuitem" data-share="facebook"><span class="share-brand share-facebook">f</span>Chia sẻ lên Facebook</button><button type="button" role="menuitem" data-share="zalo"><span class="share-brand share-zalo">Z</span>Chia sẻ lên Zalo</button><button type="button" role="menuitem" data-share="copy"><span class="share-copy-icon">↗</span>Sao chép liên kết</button><p class="share-feedback" aria-live="polite"></p></div>';
    const trigger = wrap.querySelector('.share-trigger');
    const menu = wrap.querySelector('.share-menu');
    trigger.addEventListener('click', () => {
      const open = menu.hidden;
      menu.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
    });
    wrap.addEventListener('click', async (event) => {
      const item = event.target.closest('[data-share]');
      if (!item) return;
      const url = window.location.href;
      const encoded = encodeURIComponent(url);
      if (item.dataset.share === 'facebook') {
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + encoded, 'share-facebook', 'width=640,height=520,noopener,noreferrer');
      } else if (item.dataset.share === 'zalo') {
        window.open('https://zalo.me/share?url=' + encoded, 'share-zalo', 'width=640,height=520,noopener,noreferrer');
      } else {
        const feedback = wrap.querySelector('.share-feedback');
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(url);
          } else {
            const field = document.createElement('textarea');
            field.value = url;
            field.setAttribute('readonly', '');
            field.style.position = 'fixed';
            field.style.opacity = '0';
            document.body.appendChild(field);
            field.select();
            const copied = document.execCommand('copy');
            field.remove();
            if (!copied) throw new Error('copy-unavailable');
          }
          feedback.textContent = 'Đã sao chép liên kết!';
        } catch (_) {
          feedback.textContent = 'Không thể tự sao chép. Hãy sao chép đường dẫn trên thanh địa chỉ.';
        }
      }
    });
    document.addEventListener('click', (event) => {
      if (!wrap.contains(event.target)) {
        menu.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
    return wrap;
  };
  const header = document.querySelector('.site-header');
  const footer = document.querySelector('footer');
  if (header && !header.querySelector('.share-wrap')) header.appendChild(makeMenu());
  if (footer && !footer.querySelector('.share-wrap')) {
    const label = document.createElement('span');
    label.className = 'footer-share-label';
    label.textContent = 'Cùng lan tỏa thông điệp';
    footer.append(label, makeMenu());
  }
})();