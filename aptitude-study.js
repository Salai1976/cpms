/* CampusHire Aptitude Preparation: independent learning-only module */
(() => {
  const topics = [
    {cat:'Quantitative Aptitude',title:'Percentages',formula:'Percentage = (Part ÷ Whole) × 100',example:'45 out of 60 = (45 ÷ 60) × 100 = 75%.',tip:'Convert fractions to percentages before solving comparisons.'},
    {cat:'Quantitative Aptitude',title:'Ratio and Proportion',formula:'For a:b = c:d, a × d = b × c',example:'2:3 = 8:12 because 2 × 12 = 3 × 8 = 24.',tip:'Keep units the same before comparing ratios.'},
    {cat:'Quantitative Aptitude',title:'Profit and Loss',formula:'Profit % = (Profit ÷ Cost Price) × 100',example:'Buy for ₹200, sell for ₹250: profit = ₹50; profit % = 25%.',tip:'Use cost price as the base for profit and loss percentages.'},
    {cat:'Quantitative Aptitude',title:'Simple Interest',formula:'SI = (Principal × Rate × Time) ÷ 100',example:'₹1,000 at 5% for 2 years: SI = ₹100.',tip:'Use time in years when the rate is annual.'},
    {cat:'Quantitative Aptitude',title:'Averages',formula:'Average = Sum of observations ÷ Number of observations',example:'Average of 4, 6, 8 = 18 ÷ 3 = 6.',tip:'If every value increases by 2, the average also increases by 2.'},
    {cat:'Quantitative Aptitude',title:'Time, Speed and Distance',formula:'Speed = Distance ÷ Time',example:'120 km in 3 hours = 40 km/h.',tip:'Convert minutes to hours before calculating km/h.'},
    {cat:'Quantitative Aptitude',title:'Time and Work',formula:'Work completed in 1 day = 1 ÷ Number of days',example:'A finishes in 10 days and B in 15: together 1/10 + 1/15 = 1/6 per day, so 6 days.',tip:'Add work rates, not days.'},
    {cat:'Logical Reasoning',title:'Number Series',formula:'Look for differences, ratios, squares, or alternating patterns.',example:'2, 5, 8, 11, ? → add 3 each time → 14.',tip:'Write the gaps between consecutive terms first.'},
    {cat:'Logical Reasoning',title:'Coding and Decoding',formula:'Compare letter positions: A=1, B=2, … Z=26.',example:'If CAT becomes DBU, each letter moves forward one position.',tip:'Check whether the same shift applies to every letter.'},
    {cat:'Logical Reasoning',title:'Direction Sense',formula:'Draw N ↑, E →, S ↓, W ←.',example:'Facing North, turn right → East; turn right again → South.',tip:'Sketch the route instead of tracking turns mentally.'},
    {cat:'Logical Reasoning',title:'Blood Relations',formula:'Draw a small family tree with generations.',example:'My mother’s brother is my maternal uncle.',tip:'Track the relationship one person at a time.'},
    {cat:'Logical Reasoning',title:'Syllogisms',formula:'Use only the information supplied in the statements.',example:'All roses are flowers. All flowers are plants. Therefore, all roses are plants.',tip:'Do not assume the converse of a statement.'},
    {cat:'Logical Reasoning',title:'Seating Arrangement',formula:'Fix positions and apply constraints one by one.',example:'If A sits immediately left of B in a row facing North, the order is A, B.',tip:'Draw a row or circle before placing people.'},
    {cat:'Verbal Ability',title:'Subject–Verb Agreement',formula:'Singular subject → singular verb; plural subject → plural verb.',example:'She writes code. They write code.',tip:'Identify the main subject before choosing the verb.'},
    {cat:'Verbal Ability',title:'Tenses',formula:'Present: work/works; Past: worked; Future: will work.',example:'Yesterday she completed the test.',tip:'Look for time words such as yesterday, now, and tomorrow.'},
    {cat:'Verbal Ability',title:'Synonyms and Antonyms',formula:'Synonym = similar meaning; antonym = opposite meaning.',example:'Rapid → fast (synonym); rapid → slow (antonym).',tip:'Learn words in sentences, not only isolated lists.'},
    {cat:'Verbal Ability',title:'Sentence Correction',formula:'Check grammar, meaning, word order, and punctuation.',example:'Incorrect: He go to college. Correct: He goes to college.',tip:'Read the corrected sentence aloud to check flow.'},
    {cat:'Verbal Ability',title:'Reading Comprehension',formula:'Read the question, find evidence, then choose the answer.',example:'If a passage says a train arrived late due to rain, the reason is rain—not traffic.',tip:'Choose answers supported by the passage, not assumptions.'}
  ];
  const links = [
    {title:'IndiaBIX — Aptitude',url:'https://www.indiabix.com/aptitude/questions-and-answers/',desc:'Topic-wise aptitude practice'},
    {title:'IndiaBIX — Logical Reasoning',url:'https://www.indiabix.com/logical-reasoning/questions-and-answers/',desc:'Reasoning question sets'},
    {title:'IndiaBIX — Verbal Ability',url:'https://www.indiabix.com/verbal-ability/questions-and-answers/',desc:'English practice questions'},
    {title:'Khan Academy — Arithmetic',url:'https://www.khanacademy.org/math/arithmetic',desc:'Foundational maths lessons'},
    {title:'British Council — LearnEnglish',url:'https://learnenglish.britishcouncil.org/',desc:'Grammar, vocabulary and reading'}
  ];
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render(filter='All') {
    const holder = document.getElementById('ch-study-topics');
    if (!holder) return;
    holder.innerHTML = topics.filter(t=>filter==='All'||t.cat===filter).map(t=>`
      <details class="ch-study-topic"><summary><span>${esc(t.title)}</span><span class="ch-study-chevron">＋</span></summary>
      <div class="ch-study-topic-body"><p><strong>Concept / Formula:</strong> ${esc(t.formula)}</p><p><strong>Solved example:</strong> ${esc(t.example)}</p><p><strong>Preparation tip:</strong> ${esc(t.tip)}</p></div></details>`).join('');
  }
  function init() {
    const filters = document.getElementById('ch-study-filters');
    const linksHolder = document.getElementById('ch-study-links');
    if (!filters || !linksHolder) return;
    ['All','Quantitative Aptitude','Logical Reasoning','Verbal Ability'].forEach((cat,i)=>{
      const b=document.createElement('button'); b.type='button'; b.className='ch-study-filter'+(i===0?' selected':''); b.textContent=cat;
      b.addEventListener('click',()=>{filters.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');render(cat);});
      filters.appendChild(b);
    });
    linksHolder.innerHTML=links.map(l=>`<a class="ch-study-link" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer"><strong>${esc(l.title)} ↗</strong><small>${esc(l.desc)}</small></a>`).join('');
    render();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
