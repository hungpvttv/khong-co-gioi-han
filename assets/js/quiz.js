(() => {
const root = document.getElementById('quiz-app');
if (!root) return;
const fallback = [
{q:"Bạn nữ muốn tham gia CLB robot?",a:["Robot hợp với con trai","Nên được thử sức theo năng lực","Chỉ tham gia khi không có bạn nam"],c:1,e:"Cơ hội học công nghệ không phụ thuộc giới tính."},
{q:"Bạn nam bật khóc vì bị bắt nạt?",a:["Trêu bạn","Bảo giấu cảm xúc","Lắng nghe và tìm người lớn hỗ trợ"],c:2,e:"Ai cũng có quyền bày tỏ cảm xúc và tìm trợ giúp."},
{q:"Việc nhà nên phân chia thế nào?",a:["Theo khả năng và sự chia sẻ","Chỉ mẹ và con gái","Chỉ bố quyết định"],c:0,e:"Mọi thành viên có thể đóng góp phù hợp."},
{q:"Bạn nam thích múa?",a:["Khuyên bỏ","Tôn trọng và động viên","Cười đùa"],c:1,e:"Năng khiếu nghệ thuật không phụ thuộc giới tính."},
{q:"Chọn trưởng nhóm theo tiêu chí nào?",a:["Luôn chọn nam","Luôn chọn nữ","Năng lực, trách nhiệm và hợp tác"],c:2,e:"Lựa chọn theo tiêu chí phù hợp, công bằng."},
{q:"Nghe câu nói “Con gái không giỏi toán”?",a:["Giải thích không thể đánh giá theo giới","Đồng ý","Khuyên bỏ toán"],c:0,e:"Năng lực cá nhân không thể suy ra từ giới tính."},
{q:"Bạn nữ muốn chơi bóng đá?",a:["Từ chối","Tạo cơ hội theo điều kiện chung","Bảo chọn môn khác"],c:1,e:"Khuyến khích tham gia công bằng và an toàn."},
{q:"Bạn bị chế giễu vì sở thích?",a:["Đứng xem","Tham gia trêu","Lên tiếng và tìm hỗ trợ"],c:2,e:"Tôn trọng và hỗ trợ xây dựng trường học an toàn."},
{q:"Bình đẳng giới nghĩa là gì?",a:["Mọi người giống nhau","Cơ hội công bằng, không phân biệt đối xử","Một giới luôn ưu tiên"],c:1,e:"Bình đẳng tôn trọng khác biệt."},
{q:"Lựa chọn nghề dựa vào đâu?",a:["Sở thích, năng lực, điều kiện và yêu cầu nghề","Chỉ giới tính","Định kiến bạn bè"],c:0,e:"Hướng nghiệp dựa trên năng lực và điều kiện thực tế."}
];
const labels={question_count_label:'Câu',score_label:'Điểm',next_label:'Tiếp theo',finish_label:'Xem kết quả',result_title:'Bạn đã hoàn thành câu hỏi!',retry_label:'Làm lại từ đầu',correct_label:'Chính xác!',incorrect_label:'Mình cùng tìm hiểu nhé!',excellent_result:'Bạn đã nắm được nhiều kiến thức quan trọng. Hãy tiếp tục lan tỏa cách nhìn tôn trọng và công bằng.',good_result:'Bạn đã có những hiểu biết nền tảng. Hãy xem lại phần giải thích và tiếp tục khám phá.',retry_result:'Mỗi câu hỏi là một cơ hội học hỏi. Hãy đọc lại phần giải thích và thử sức lần nữa nhé.'};
let questions=fallback,ui={...labels},index=0,score=0,answered=false;
const fetchJson = url => fetch(url).then(response=>response.ok?response.json():Promise.reject(new Error('Fetch failed')));
Promise.allSettled([fetchJson('../data/quiz.json'),fetchJson('../data/pages.json')]).then(results=>{
  const quizData=results[0].status==='fulfilled'?results[0].value:null;
  const pageData=results[1].status==='fulfilled'?results[1].value:null;
  if (Array.isArray(quizData?.questions)) {
    const parsed=quizData.questions.filter(x=>x.visible!==false).map(x=>({q:String(x.question||''),a:[x.option_a,x.option_b,x.option_c].map(v=>String(v||'')),c:['A','B','C'].indexOf(String(x.correct||'').toUpperCase()),e:String(x.explanation||'')}));
    if(parsed.length && parsed.every(x=>x.q && x.a.every(Boolean) && x.c>=0)) questions=parsed;
  }
  if(pageData?.quiz) ui={...ui,...pageData.quiz};
  render();
});
const count=document.getElementById('quiz-count'),scoreEl=document.getElementById('quiz-score'),progress=document.getElementById('quiz-progress-fill'),question=document.getElementById('quiz-question'),options=document.getElementById('quiz-options'),feedback=document.getElementById('quiz-feedback'),next=document.getElementById('quiz-next');
function render(){
  answered=false;
  const item=questions[index];
  count.textContent=(ui.question_count_label||'Câu')+' '+(index+1)+' / '+questions.length;
  scoreEl.textContent=(ui.score_label||'Điểm')+': '+score;
  progress.style.width=(index/questions.length*100)+'%';
  question.textContent=item.q; options.replaceChildren(); feedback.hidden=true; next.disabled=true;
  next.textContent=index===questions.length-1?(ui.finish_label||'Xem kết quả'):(ui.next_label||'Tiếp theo')+' →';
  item.a.forEach((answer,i)=>{
    const button=document.createElement('button');button.type='button';button.className='quiz-option';button.textContent=String.fromCharCode(65+i)+'. '+answer;
    button.addEventListener('click',()=>choose(i));options.append(button);
  });
}
function choose(choice){
  if(answered)return;answered=true;
  const item=questions[index];
  [...options.children].forEach((button,i)=>{button.disabled=true;if(i===item.c)button.classList.add('correct');if(i===choice&&choice!==item.c)button.classList.add('incorrect');});
  if(choice===item.c)score++;
  feedback.replaceChildren();
  const strong=document.createElement('b');strong.textContent=choice===item.c?(ui.correct_label||'Chính xác!'):(ui.incorrect_label||'Mình cùng tìm hiểu nhé!');
  const explanation=document.createElement('p');explanation.textContent=item.e;
  feedback.append(strong,explanation);feedback.hidden=false;
  scoreEl.textContent=(ui.score_label||'Điểm')+': '+score;next.disabled=false;
}
function result(){
  progress.style.width='100%';root.replaceChildren();
  const panel=document.createElement('div');panel.className='quiz-result';
  const eyebrow=document.createElement('span');eyebrow.className='eyebrow';eyebrow.textContent='HOÀN THÀNH';
  const heading=document.createElement('h2');heading.textContent=ui.result_title||'Bạn đã hoàn thành câu hỏi!';
  const total=document.createElement('p');total.className='quiz-result-score';total.textContent=score+' / '+questions.length+' câu trả lời đúng';
  const summary=document.createElement('p');summary.textContent=score>=Math.ceil(questions.length*.8)?ui.excellent_result:score>=Math.ceil(questions.length*.5)?ui.good_result:ui.retry_result;
  const retry=document.createElement('button');retry.className='button';retry.type='button';retry.textContent=(ui.retry_label||'Làm lại từ đầu')+' ↻';retry.addEventListener('click',()=>location.reload());
  panel.append(eyebrow,heading,total,summary,retry);root.append(panel);
}
next.addEventListener('click',()=>{if(!answered)return;if(index<questions.length-1){index++;render();}else result();});
render();
})();