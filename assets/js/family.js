(() => {
const main=document.querySelector('.article-page');if(!main)return;
fetch('../data/family-article.json').then(r=>r.ok?r.json():Promise.reject()).then(data=>{
if(data.visible===false)return;
const title=main.querySelector('h1'),lead=main.querySelector('.article-lead'),hero=main.querySelector('.article-hero'),end=main.querySelector('.article-end');
if(title&&data.title)title.textContent=data.title;if(lead&&data.sapo)lead.textContent=data.sapo;
main.querySelectorAll(':scope > p:not(.article-lead):not(.illustrative-note)').forEach(p=>p.remove());
main.querySelectorAll('.story-card').forEach(x=>x.remove());
if(hero){let anchor=hero;for(const paragraph of (data.paragraphs||[])){const p=document.createElement('p');p.textContent=paragraph;anchor.after(p);anchor=p;}}
let anchor=main.querySelector('.article-hero');if(anchor)anchor=anchor.parentNode.querySelector(':scope > p:last-of-type')||anchor;
(data.stories||[]).forEach((story,i)=>{const card=document.createElement('section');card.className='story-card';const eyebrow=document.createElement('span');eyebrow.className='eyebrow';eyebrow.textContent='CÂU CHUYỆN MINH HỌA 0'+(i+1);const h=document.createElement('h2');h.textContent=story.title;const body=document.createElement('p');body.textContent=story.body;const quote=document.createElement('blockquote');quote.textContent=story.message;const q=document.createElement('p');q.className='story-question';const b=document.createElement('b');b.textContent='Nếu là bạn? ';q.append(b,document.createTextNode(story.question));card.append(eyebrow,h,body,quote,q);if(anchor){anchor.after(card);anchor=card;}});
const note=main.querySelector('.illustrative-note');if(note&&data.illustrative_note)note.textContent='Lưu ý: '+data.illustrative_note;
}).catch(()=>{});
})();