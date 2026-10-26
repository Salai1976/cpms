/* Independent aptitude module. No placement data, auth, or API mutations. */
(() => {
  'use strict';
  const bank = [
    ['quant','easy','What is 25% of 240?',['40','50','60','80'],2,'25/100 × 240 = 60.'],
    ['quant','easy','A shirt costs ₹800 after a 20% discount. What was its original price?',['₹900','₹960','₹1000','₹1200'],2,'₹800 is 80% of the original price, so 800/0.8 = ₹1000.'],
    ['quant','easy','Find the average of 10, 20, 30 and 40.',['20','25','30','35'],1,'(10 + 20 + 30 + 40)/4 = 25.'],
    ['quant','medium','A train travels 180 km in 3 hours. Find its speed.',['45 km/h','50 km/h','60 km/h','90 km/h'],2,'Speed = distance/time = 180/3 = 60 km/h.'],
    ['quant','medium','A sum doubles in 5 years at simple interest. What is the annual rate?',['10%','15%','20%','25%'],2,'Interest equals principal over 5 years: 100/5 = 20% per year.'],
    ['quant','hard','A can finish work in 12 days and B in 18 days. Together they take:',['6 days','7.2 days','8 days','9 days'],1,'Combined daily work = 1/12 + 1/18 = 5/36, so time = 36/5 = 7.2 days.'],
    ['logical','easy','Find the next number: 2, 4, 8, 16, ?',['20','24','30','32'],3,'Each number is multiplied by 2.'],
    ['logical','easy','Which word is different?',['Apple','Mango','Carrot','Banana'],2,'Carrot is a vegetable; the others are fruits.'],
    ['logical','easy','If CAT becomes DBU (each letter shifts +1), DOG becomes:',['EPH','ENH','FPH','EOG'],0,'D→E, O→P, G→H.'],
    ['logical','medium','Find the next number: 3, 6, 11, 18, 27, ?',['34','36','38','40'],2,'Differences are 3, 5, 7, 9; next difference is 11, giving 38.'],
    ['logical','medium','All roses are flowers. Some flowers fade quickly. Which conclusion must be true?',['All roses fade quickly','Some roses fade quickly','All roses are flowers','No flowers fade quickly'],2,'Only the original statement that all roses are flowers is guaranteed.'],
    ['logical','hard','Find the next letter: A, C, F, J, O, ?',['S','T','U','V'],2,'Alphabet positions increase by 2, 3, 4, 5, then 6: O (15) → U (21).'],
    ['verbal','easy','Choose the correct spelling.',['Accomodation','Accommodation','Acommodation','Accommadation'],1,'Accommodation has double c and double m.'],
    ['verbal','easy','Choose the synonym of “rapid”.',['Slow','Quick','Weak','Late'],1,'Rapid means fast or quick.'],
    ['verbal','easy','Fill in the blank: She ___ to college every day.',['go','going','goes','gone'],2,'With she in the simple present, use goes.'],
    ['verbal','medium','Choose the correct sentence.',['He do not like tea.','He does not likes tea.','He does not like tea.','He not likes tea.'],2,'After does not, use the base verb like.'],
    ['verbal','medium','Choose the antonym of “scarce”.',['Rare','Limited','Abundant','Insufficient'],2,'Abundant means plentiful, the opposite of scarce.'],
    ['verbal','hard','Choose the correct form: Neither the manager nor the employees ___ available.',['is','are','was','be'],1,'With neither…nor, the verb agrees with the nearer subject, employees.']
  ].map(([category,level,question,options,correct,explanation]) => ({category,level,question,options,correct,explanation}));
  // Expand the curated bank with deterministic, checked-answer pattern variants.
  // IDs remain stable between page loads so completed questions stay completed.
  const extra=[];
  function add(cat,level,pattern,question,options,correct,explanation){
    extra.push({category:cat,level,pattern,question,options:options.map(String),correct,explanation});
  }
  for(let i=1;i<=24;i++){
    const base=40+i*10, pct=[10,20,25,50][i%4], result=base*pct/100;
    add('quant',i<9?'easy':i<17?'medium':'hard','Percentages',`Find ${pct}% of ${base}.`,[result+5,result,result+10,result-5],1,`${pct}/100 × ${base} = ${result}.`);
    const a=10+i,b=20+i*2,c=30+i*3, avg=(a+b+c)/3;
    add('quant',i<9?'easy':i<17?'medium':'hard','Averages',`What is the average of ${a}, ${b} and ${c}?`,[avg+2,avg-2,avg,avg+5],2,`(${a} + ${b} + ${c}) / 3 = ${avg}.`);
    const cost=100+i*20,profit=cost/5;
    add('quant',i<9?'easy':i<17?'medium':'hard','Profit and Loss',`An item is bought for ₹${cost} and sold at 20% profit. Find the selling price.`,[cost+profit,cost-profit,cost+profit+20,cost],0,`Selling price = ${cost} × 1.2 = ₹${cost+profit}.`);
    const hours=2+i, speed=20+i*2, dist=hours*speed;
    add('quant',i<9?'easy':i<17?'medium':'hard','Speed Distance Time',`A vehicle travels ${dist} km in ${hours} hours. What is its average speed?`,[speed+10,speed-5,speed,speed+5],2,`Speed = ${dist} / ${hours} = ${speed} km/h.`);
    const start=i+1, step=2+i%7, next=start+4*step;
    add('logical',i<9?'easy':i<17?'medium':'hard','Number Series',`Find the next term: ${[0,1,2,3].map(k=>start+k*step).join(', ')}, ?`,[next+step,next-1,next,next+1],2,`Add ${step} each time, so the next term is ${next}.`);
    const word=['CAT','DOG','SUN','PEN','MAP','HAT'][i%6];
    const encoded=[...word].map(c=>String.fromCharCode(65+(c.charCodeAt(0)-65+i%4+1)%26)).join('');
    add('logical',i<9?'easy':i<17?'medium':'hard','Coding-Decoding',`If every letter is shifted forward by ${i%4+1}, what is ${word} coded as?`,[word,encoded,encoded.split('').reverse().join(''),word.split('').reverse().join('')],1,`Move every letter ${i%4+1} place(s) forward in the alphabet (wrapping after Z).`);
    const dir=['North','East','South','West'][i%4];
    const right=['East','South','West','North'][i%4];
    add('logical',i<9?'easy':i<17?'medium':'hard','Direction Sense',`A student is facing ${dir}. Which direction will they face after turning 90° clockwise?`,[dir,'North-East',right,'South-West'],2,`A 90° clockwise turn from ${dir} points ${right}.`);
  }
  const verbalPatterns=[
    ['Subject-Verb Agreement','She ___ to school every day.',['go','goes','going','gone'],1,'The singular subject she takes goes.'],
    ['Articles','He bought ___ umbrella yesterday.',['a','an','the','no article'],1,'Use an before a vowel sound.'],
    ['Prepositions','She is interested ___ mathematics.',['on','at','in','by'],2,'The correct phrase is interested in.'],
    ['Tenses','They ___ dinner when I arrived.',['have','were having','has','will have'],1,'Past continuous describes an ongoing action interrupted in the past.'],
    ['Synonyms','Choose the synonym of “brief”.',['lengthy','short','difficult','heavy'],1,'Brief means short.'],
    ['Antonyms','Choose the antonym of “expand”.',['grow','increase','contract','extend'],2,'Contract means become smaller.'],
    ['Sentence Correction','Choose the grammatically correct sentence.',['He have a book.','He has a book.','He having a book.','He haves a book.'],1,'He takes has in the simple present.'],
    ['Vocabulary','Choose the meaning of “meticulous”.',['careless','very careful','quick','noisy'],1,'Meticulous means very careful and attentive to detail.'],
    ['Active-Passive Voice','Choose the passive voice of “The teacher praised the student.”',['The student was praised by the teacher.','The student praised the teacher.','The teacher was praised by the student.','The student is praise.'],0,'Past simple passive: was/were + past participle.'],
    ['Conjunctions','Choose the correct word: ___ it was raining, they played indoors.',['Because','Unless','Despite','Until'],0,'Because introduces the reason.'],
    ['Error Spotting','Which sentence has no grammatical error?',['She do her work.','They is ready.','We are prepared.','He were late.'],2,'We are prepared uses correct subject-verb agreement.'],
    ['Idioms','What does “break the ice” mean?',['damage something','start a conversation','become angry','stop working'],1,'Break the ice means make people feel comfortable and begin interaction.']
  ];
  verbalPatterns.forEach(([pattern,question,options,correct,explanation],i)=>{
    add('verbal',i<4?'easy':i<8?'medium':'hard',pattern,question,options,correct,explanation);
  });
  bank.forEach((q,i)=>{q.id='original-'+i;q.pattern=q.category==='quant'?'Mixed Quantitative':q.category==='logical'?'Mixed Reasoning':'Mixed Verbal';});
  extra.forEach((q,i)=>{q.id='pattern-'+i;bank.push(q);});
  // Remove duplicate question texts from selection; a pattern may still appear with new values.
  const uniqueBank=[...new Map(bank.map(q=>[q.question,q])).values()];
  const ATTEMPT_KEY='campushire_aptitude_attempted_v2';
  function seenIds(){try{const d=JSON.parse(localStorage.getItem(ATTEMPT_KEY)||'{}');return new Set(d[studentId()]||[]);}catch{return new Set();}}
  function saveSeen(){const id=studentId();if(!id)return;try{const d=JSON.parse(localStorage.getItem(ATTEMPT_KEY)||'{}');d[id]=[...new Set([...(d[id]||[]),...quiz.map(q=>q.id)])];localStorage.setItem(ATTEMPT_KEY,JSON.stringify(d));}catch{}}
  function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}
  const $ = id => document.getElementById(id);
  const HISTORY_KEY = 'campushire_aptitude_results_v1';
  const categoryNames = {quant:'Quantitative Aptitude',logical:'Logical Reasoning',verbal:'Verbal Ability'};
  function studentId(){
    return typeof currentUser !== 'undefined' && currentUser?.role === 'student' ? currentUser.email : null;
  }
  function readHistory(){
    try { const value = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
    catch { return {}; }
  }
  function saveResult(record){
    const id=studentId(); if(!id)return;
    try { const data=readHistory(); data[id]=[record,...(data[id]||[])].slice(0,50); localStorage.setItem(HISTORY_KEY,JSON.stringify(data)); }
    catch(e){$('aptNotice').textContent='Results displayed, but browser storage is unavailable. Your test history was not saved.';}
  }
  function renderHistory(){
    const el=$('aptHistory'); if(!el)return;
    const id=studentId(), records=id?(readHistory()[id]||[]):[];
    el.replaceChildren();
    if(!records.length){el.textContent='No completed tests yet. Finish a practice or mock test to see your progress here.';return;}
    const table=document.createElement('table');
    const head=document.createElement('thead');const tr=document.createElement('tr');
    ['Date','Mode','Topic','Marks','Percentage','Result'].forEach(x=>{const th=document.createElement('th');th.textContent=x;tr.append(th);});head.append(tr);table.append(head);
    const body=document.createElement('tbody');
    records.forEach(r=>{const row=document.createElement('tr');
      [new Date(r.date).toLocaleString(),r.mode,r.category,r.correct+' / '+r.total,r.percent+'%',r.percent>=60?'Target met':'Keep practising'].forEach(x=>{const td=document.createElement('td');td.textContent=x;row.append(td);});body.append(row);
    });table.append(body);const wrapper=document.createElement('div');wrapper.className='apt-table-wrap';wrapper.append(table);el.append(wrapper);
  }
  function metric(label,value){const box=document.createElement('div');box.className='apt-metric';const n=document.createElement('strong');n.textContent=value;const l=document.createElement('span');l.textContent=label;box.append(n,l);return box;}
  function renderRecommendations(){
    const area=$('aptRecommendations');area.replaceChildren();
    const summary=document.createElement('strong');summary.textContent='How to improve';area.append(summary);
    const misses={quant:0,logical:0,verbal:0};
    quiz.forEach((q,i)=>{if(answers[i]!==q.correct)misses[q.category]++;});
    const topics=Object.entries(misses).filter(([,n])=>n>0).sort((a,b)=>b[1]-a[1]);
    const message=document.createElement('p');message.textContent=topics.length
      ? 'Revise '+topics.map(([cat,n])=>categoryNames[cat]+' ('+n+' missed)').join(', ')+'. Review the explanations below and retry these topics.'
      : 'Excellent! You answered every question correctly. Try a harder difficulty or a timed mock test next.';
    area.append(message);
  }
  let quiz=[], position=0, answers=[], revealed=false, timer=null, seconds=0;
  function stopTimer(){ if(timer!==null){clearInterval(timer);timer=null;} }
  function start(){
    stopTimer();
    const category=$('aptCategory').value, difficulty=$('aptDifficulty').value;
    const seen=seenIds();
    const filtered=uniqueBank.filter(q=>(category==='all'||q.category===category)&&(difficulty==='all'||q.level===difficulty));
    const available=filtered.filter(q=>!seen.has(q.id));
    if(!available.length){$('aptNotice').textContent='You have completed all available questions in this selection! Choose another topic or difficulty to continue. Previously attempted questions will not repeat.';return;}
    // Rotate across patterns rather than taking many questions of one type.
    const groups={};shuffle(available).forEach(q=>(groups[q.pattern]??=[]).push(q));
    const keys=shuffle(Object.keys(groups));const ordered=[];
    while(keys.some(k=>groups[k].length)){for(const k of keys){if(groups[k].length)ordered.push(groups[k].pop());}}
    quiz=ordered.slice(0,Number($('aptCount').value));
    $('aptNotice').textContent=`${quiz.length} new question(s) selected across ${new Set(quiz.map(q=>q.pattern)).size} pattern(s). ${available.length-quiz.length} more unseen questions remain for this selection.`;
    position=0;answers=[];revealed=false;seconds=$('aptMode').value==='mock'?quiz.length*60:0;
    $('aptResults').hidden=true;$('aptQuiz').hidden=false;renderHistory();
    if($('aptMode').value==='mock'){
      timer=setInterval(()=>{seconds--;updateTimer();if(seconds<=0)finish();},1000);
    }
    render();
  }
  function updateTimer(){ $('aptTimer').textContent=$('aptMode').value==='mock'?`Time left: ${Math.floor(Math.max(0,seconds)/60)}:${String(Math.max(0,seconds)%60).padStart(2,'0')}`:'Practice mode'; }
  function render(){
    revealed=false;
    const q=quiz[position];$('aptProgress').textContent=`Question ${position+1} of ${quiz.length} · ${q.pattern} · ${q.level}`;
    $('aptProgressBar').style.width=`${position/quiz.length*100}%`;
    $('aptQuestion').textContent=q.question;
    $('aptOptions').replaceChildren();
    q.options.forEach((option,i)=>{
      const label=document.createElement('label');label.className='apt-option';
      const radio=document.createElement('input');radio.type='radio';radio.name='aptAnswer';radio.value=String(i);
      radio.addEventListener('change',()=>{$('aptNext').disabled=false;});
      label.append(radio,document.createTextNode(option));$('aptOptions').append(label);
    });
    $('aptFeedback').hidden=true;$('aptFeedback').textContent='';$('aptNext').disabled=true;
    $('aptNext').textContent=$('aptMode').value==='mock'?(position===quiz.length-1?'Finish Test':'Next Question'):'Check Answer';
    updateTimer();
  }
  function next(){
    const selected=document.querySelector('input[name="aptAnswer"]:checked');
    if(!selected)return;
    const q=quiz[position], choice=Number(selected.value), practice=$('aptMode').value==='practice';
    if(practice&&!revealed){
      answers[position]=choice;revealed=true;
      $('aptOptions').querySelectorAll('input').forEach(input=>input.disabled=true);
      $('aptFeedback').textContent=(choice===q.correct?'Correct! ':'Not quite. ')+`Answer: ${q.options[q.correct]}. ${q.explanation}`;
      $('aptFeedback').hidden=false;$('aptNext').textContent=position===quiz.length-1?'See Results':'Next Question';return;
    }
    if(!practice)answers[position]=choice;
    position++;if(position>=quiz.length)finish();else render();
  }
  function finish(){
    stopTimer();$('aptQuiz').hidden=true;$('aptResults').hidden=false;
    const correct=quiz.filter((q,i)=>answers[i]===q.correct).length;
    const total=quiz.length, wrong=quiz.filter((q,i)=>answers[i]!==undefined && answers[i]!==q.correct).length;
    const unanswered=total-correct-wrong, percent=Math.round(correct/total*100);
    $('aptScore').textContent=`${correct} / ${total} marks (${percent}%)`;
    const grid=$('aptResultGrid');grid.replaceChildren(
      metric('Correct',String(correct)),metric('Wrong',String(wrong)),metric('Unanswered',String(unanswered)),
      metric('Marks',`${correct} / ${total}`),metric('Percentage',percent+'%'),metric('Target',percent>=60?'Met':'Not met')
    );
    $('aptResultMessage').textContent=percent>=60
      ? 'Great progress! You reached the practice target of 60%. Try a harder level to keep improving.'
      : 'Keep practising! You are below the suggested 60% practice target. Review missed questions and try again.';
    renderRecommendations();
    saveSeen();
    saveResult({date:new Date().toISOString(),mode:$('aptMode').value==='mock'?'Mock Test':'Practice',
      category:$('aptCategory').selectedOptions[0].textContent,correct,total,wrong,unanswered,percent});
    renderHistory();
    $('aptReview').replaceChildren();
    quiz.forEach((q,i)=>{
      const item=document.createElement('div');item.className='apt-review-item';
      const heading=document.createElement('strong');heading.textContent=`${i+1}. ${q.question}`;
      const result=document.createElement('p');result.textContent=`Your answer: ${answers[i]===undefined?'Not answered':q.options[answers[i]]} | Correct: ${q.options[q.correct]}`;
      const explanation=document.createElement('p');explanation.textContent=q.explanation;
      item.append(heading,result,explanation);$('aptReview').append(item);
    });
  }
  function quit(){stopTimer();$('aptQuiz').hidden=true;$('aptNotice').textContent='Practice exited. You can start again anytime.';}
  document.addEventListener('DOMContentLoaded',()=>{
    if(!$('aptStart'))return;
    $('aptStart').addEventListener('click',start);
    $('aptNext').addEventListener('click',next);
    $('aptQuit').addEventListener('click',quit);
    $('aptRetry').addEventListener('click',start);
    $('aptClearHistory').addEventListener('click',()=>{
      const id=studentId();if(!id||!confirm('Clear your saved aptitude test history on this browser?'))return;
      const data=readHistory();delete data[id];localStorage.setItem(HISTORY_KEY,JSON.stringify(data));renderHistory();
    });
    renderHistory();
  });
})();
