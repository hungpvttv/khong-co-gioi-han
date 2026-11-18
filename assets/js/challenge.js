(() => {
const fallback=["Không dùng một câu nói mang định kiến giới.","Chủ động chia sẻ một công việc gia đình phù hợp.","Động viên một người theo đuổi sở thích.","Tìm hiểu một nghề nghiệp thường bị gắn với khuôn mẫu giới.","Lắng nghe và tôn trọng ý kiến khác biệt.","Chia sẻ một thông điệp tích cực về bình đẳng giới.","Nhìn lại một suy nghĩ hoặc hành động mình muốn thay đổi."];
let tasks=fallback.map((title,i)=>({day:i+1,title}));
let ui={day_label:'Ngày',completion_label:'ngày hoàn thành'};
const key='khong-gioi-han-challenge-v1';let done=[];
try{done=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(done))done=[];}catch(_){}
const root=document.getElementById('challenge-days');if(!root)return;
const count=document.getElementById('challenge-count'),fill=document.getElementById('challenge-fill');
function draw(){
 root.replaceChildren();
 tasks.forEach((task,i)=>{
  const label=document.createElement('label');label.className='challenge-day'+(done.includes(i)?' is-done':'');
  const input=document.createElement('input');input.type='checkbox';input.checked=done.includes(i);
  input.addEventListener('change',()=>{done=input.checked?[...new Set([...done,i])]:done.filter(x=>x!==i);try{localStorage.setItem(key,JSON.stringify(done));}catch(_){}draw();});
  const body=document.createElement('span'),day=document.createElement('b'),description=document.createElement('span');
  day.textContent=(ui.day_label||'Ngày')+' '+(task.day||i+1);description.textContent=task.title||'';
  body.append(day,description);label.append(input,body);root.append(label);
 });
 done=done.filter(i=>Number.isInteger(i)&&i>=0&&i<tasks.length);
 try{localStorage.setItem(key,JSON.stringify(done));}catch(_){}
 count.textContent=done.length+'/'+tasks.length+' '+(ui.completion_label||'ngày hoàn thành');
 fill.style.width=(tasks.length?done.length/tasks.length*100:0)+'%';
}
Promise.allSettled([
 fetch('../data/challenge.json',{cache:'no-cache'}).then(r=>r.ok?r.json():Promise.reject()),
 fetch('../data/pages.json',{cache:'no-cache'}).then(r=>r.ok?r.json():Promise.reject())
]).then(results=>{
 const data=results[0].status==='fulfilled'?results[0].value:null;
 const pages=results[1].status==='fulfilled'?results[1].value:null;
 if(Array.isArray(data?.days)){
  const list=data.days.filter(x=>x.visible!==false).sort((a,b)=>(a.day||0)-(b.day||0)).filter(x=>x.title);
  if(list.length)tasks=list;
 }
 if(pages?.challenge)ui={...ui,...pages.challenge};
 draw();
});
draw();
})();