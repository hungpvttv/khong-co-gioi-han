(() => {
const main=document.querySelector('.article-page');if(!main)return;
const resolveMedia=(value)=>{
 if(!value)return '';
 const clean=String(value).trim().replace(/^\\/+/, '');
 try{return new URL(clean,document.baseURI).href;}catch{return '';}
};
const makeImage=(src,alt,caption)=>{
 const figure=document.createElement('figure');figure.className='family-inline-figure';
 const img=document.createElement('img');img.src=resolveMedia(src);img.alt=alt||'';img.loading='lazy';
 img.addEventListener('error',()=>figure.remove(),{once:true});
 figure.append(img);
 if(caption){const figcaption=document.createElement('figcaption');figcaption.textContent=caption;figure.append(figcaption);}
 return figure;
};
const addText=(parent,tag,value,className)=>{
 if(!value)return null;const el=document.createElement(tag);if(className)el.className=className;el.textContent=value;parent.append(el);return el;
};
fetch('../data/family-article.json').then(r=>r.ok?r.json():Promise.reject()).then(data=>{
 if(data.visible===false)return;
 const title=main.querySelector('h1'),lead=main.querySelector('.article-lead'),hero=main.querySelector('.article-hero'),note=main.querySelector('.illustrative-note');
 if(title&&data.title)title.textContent=data.title;
 if(lead&&data.sapo)lead.textContent=data.sapo;
 main.querySelectorAll(':scope > p:not(.article-lead):not(.illustrative-note)').forEach(p=>p.remove());
 main.querySelectorAll('.story-card,.family-content-block').forEach(x=>x.remove());
 if(hero){
   const heroSrc=resolveMedia(data.hero_image);
   if(heroSrc){let img=hero.querySelector('img');if(!img){img=document.createElement('img');hero.append(img);}img.src=heroSrc;img.alt=data.hero_alt||'';hero.hidden=false;}
   else hero.hidden=true;
 }
 let anchor=hero;
 const blocks=Array.isArray(data.blocks)?data.blocks:[];
 if(blocks.length){
  blocks.forEach((block,index)=>{
   let el=null;
   switch(block.type){
    case 'paragraph': el=document.createElement('p');el.className='family-content-block';el.textContent=block.text||'';break;
    case 'heading': el=document.createElement('h2');el.className='family-content-block';el.textContent=block.heading||'';break;
    case 'image': el=makeImage(block.image,block.alt,block.caption);el.classList.add('family-content-block');break;
    case 'quote': el=document.createElement('blockquote');el.className='family-content-block family-editor-quote';el.textContent=block.quote||'';break;
    case 'story':
      el=document.createElement('section');el.className='story-card family-content-block';
      addText(el,'span','CÂU CHUYỆN MINH HỌA '+String(index).padStart(2,'0'),'eyebrow');
      addText(el,'h2',block.story_title);
      addText(el,'p',block.story_body);
      if(block.image)el.append(makeImage(block.image,block.alt,block.caption));
      addText(el,'blockquote',block.story_message);
      const q=document.createElement('p');q.className='story-question';const b=document.createElement('b');b.textContent='Nếu là bạn? ';q.append(b,document.createTextNode(block.story_question||''));if(block.story_question)el.append(q);
      break;
    default:return;
   }
   if(el&&anchor){anchor.after(el);anchor=el;}
  });
 } else {
  (data.paragraphs||[]).forEach(p=>{const el=addText(main,'p',p);if(el&&anchor){anchor.after(el);anchor=el;}});
  (data.stories||[]).forEach((story,i)=>{
   const card=document.createElement('section');card.className='story-card family-content-block';
   addText(card,'span','CÂU CHUYỆN MINH HỌA 0'+(i+1),'eyebrow');addText(card,'h2',story.title);addText(card,'p',story.body);addText(card,'blockquote',story.message);
   const q=document.createElement('p');q.className='story-question';const b=document.createElement('b');b.textContent='Nếu là bạn? ';q.append(b,document.createTextNode(story.question||''));card.append(q);
   if(anchor){anchor.after(card);anchor=card;}
  });
 }
 if(note&&data.illustrative_note){note.textContent='Lưu ý: '+data.illustrative_note;if(anchor)anchor.after(note);}
}).catch(()=>{});
})();