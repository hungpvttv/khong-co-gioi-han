(() => {
const root=document.querySelector('.law-cards');if(!root)return;
fetch('../data/legal.json').then(r=>r.ok?r.json():Promise.reject()).then(data=>{
const cards=(data.cards||[]).filter(x=>x.visible!==false);if(!cards.length)return;
root.innerHTML='';
cards.forEach((item,i)=>{
const details=document.createElement('details');details.className='law-card';
const summary=document.createElement('summary');
const number=document.createElement('span');number.className='law-number';number.textContent=String(i+1).padStart(2,'0');
const heading=document.createElement('span');const title=document.createElement('b');title.textContent=item.title;const sub=document.createElement('small');sub.textContent=item.article;heading.append(title,sub);
const plus=document.createElement('span');plus.className='law-plus';plus.textContent='＋';summary.append(number,heading,plus);
const body=document.createElement('div');const p=document.createElement('p');p.textContent=item.summary;const a=document.createElement('a');a.href=item.source_url;a.target='_blank';a.rel='noopener';a.textContent=data.source_label||'Đọc văn bản gốc ↗';body.append(p,a);details.append(summary,body);root.append(details);
});
}).catch(()=>{});
})();