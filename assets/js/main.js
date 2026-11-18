(() => {
 const toggle=document.querySelector('.menu-toggle');
 const nav=document.querySelector('.main-nav');
 if(toggle&&nav){
  toggle.addEventListener('click',()=>{
   const open=nav.classList.toggle('open');
   toggle.setAttribute('aria-expanded',String(open));
   toggle.setAttribute('aria-label',open?'Đóng menu':'Mở menu');
  });
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
   nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');
  }));
 }
})();