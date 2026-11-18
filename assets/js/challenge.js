(() => {
const tasks=["Không dùng một câu nói mang định kiến giới.","Chủ động chia sẻ một công việc gia đình phù hợp.","Động viên một người theo đuổi sở thích.","Tìm hiểu một nghề nghiệp thường bị gắn với khuôn mẫu giới.","Lắng nghe và tôn trọng ý kiến khác biệt.","Chia sẻ một thông điệp tích cực về bình đẳng giới.","Nhìn lại một suy nghĩ hoặc hành động mình muốn thay đổi."];
const key='khong-gioi-han-challenge-v1';let done=[];try{done=JSON.parse(localStorage.getItem(key)||'[]')}catch(_){}
const root=document.getElementById('challenge-days');if(!root)return;
const count=document.getElementById('challenge-count'),fill=document.getElementById('challenge-fill');
function draw(){root.innerHTML='';tasks.forEach((task,i)=>{const label=document.createElement('label');label.className='challenge-day'+(done.includes(i)?' is-done':'');const input=document.createElement('input');input.type='checkbox';input.checked=done.includes(i);input.addEventListener('change',()=>{done=input.checked?[...done,i]:done.filter(x=>x!==i);try{localStorage.setItem(key,JSON.stringify(done))}catch(_){}draw();});const body=document.createElement('span');body.innerHTML='<b>Ngày '+(i+1)+'</b><span></span>';body.querySelector('span').textContent=task;label.append(input,body);root.append(label);});count.textContent=done.length+'/7 ngày hoàn thành';fill.style.width=(done.length/7*100)+'%';}
draw();
})();