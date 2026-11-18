(() => {
const gallery=document.querySelector('.activity-gallery');if(!gallery)return;
async function init(){
try{
const response=await fetch('data/gallery.json');if(response.ok){const data=await response.json();const items=(data.gallery||[]).filter(x=>x.visible!==false).sort((a,b)=>(a.order||0)-(b.order||0));if(items.length){gallery.innerHTML=items.map(item=>'<figure><img src="'+String(item.image).replace(/"/g,'&quot;')+'" alt="'+String(item.alt||'').replace(/"/g,'&quot;')+'"><figcaption>'+String(item.caption||'')+'</figcaption></figure>').join('');}}
}catch(_){}
const figures=[...gallery.querySelectorAll('figure')];if(!figures.length)return;
gallery.classList.add('gallery-carousel');const track=document.createElement('div');track.className='gallery-track';figures.forEach(f=>track.append(f));gallery.append(track);
const controls=document.createElement('div');controls.className='gallery-controls';const prev=document.createElement('button');prev.type='button';prev.className='gallery-arrow';prev.setAttribute('aria-label','Ảnh trước');prev.textContent='‹';const dots=document.createElement('div');dots.className='gallery-dots';const next=document.createElement('button');next.type='button';next.className='gallery-arrow';next.setAttribute('aria-label','Ảnh tiếp theo');next.textContent='›';
figures.forEach((_,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Đến ảnh '+(i+1));b.addEventListener('click',()=>go(i));dots.append(b);});controls.append(prev,dots,next);gallery.append(controls);
let index=0;function go(i){index=(i+figures.length)%figures.length;track.style.transform='translateX(-'+(index*100)+'%)';[...dots.children].forEach((d,n)=>d.classList.toggle('active',n===index));}
prev.addEventListener('click',()=>go(index-1));next.addEventListener('click',()=>go(index+1));go(0);
let startX=0;track.addEventListener('touchstart',e=>{startX=e.touches[0].clientX},{passive:true});track.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>45)go(index+(dx<0?1:-1));},{passive:true});
figures.forEach(fig=>fig.addEventListener('click',()=>{const img=fig.querySelector('img');const overlay=document.createElement('div');overlay.className='gallery-lightbox';overlay.innerHTML='<button type="button" aria-label="Đóng" class="lightbox-close">×</button><img alt=""><p></p>';overlay.querySelector('img').src=img.src;overlay.querySelector('img').alt=img.alt;overlay.querySelector('p').textContent=fig.querySelector('figcaption')?.textContent||img.alt;document.body.append(overlay);overlay.addEventListener('click',e=>{if(e.target===overlay||e.target.closest('.lightbox-close'))overlay.remove();});}));
}
init();
})();