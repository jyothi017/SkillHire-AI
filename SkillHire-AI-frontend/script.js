/* SkillHire AI logic: question bank, engine, pages. No server or API needed. */
(function(){
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const mem={};
const store={get(k,d){try{const v=localStorage.getItem('sh:'+k);if(v)return JSON.parse(v)}catch(e){}return k in mem?mem[k]:d},
  set(k,v){mem[k]=v;try{localStorage.setItem('sh:'+k,JSON.stringify(v))}catch(e){}}};
const DN={B:'Basic',I:'Intermediate',A:'Advanced'}, TN={T:'Technical',S:'Scenario',C:'Coding',D:'System design',P:'Project',H:'Behavioral'};

/* ---------- question bank: [question, difficulty, type, key points separated by ;] ---------- */
const BANK={
'Java':[["What is the difference between JDK, JRE and JVM?",'B','T','JVM runs bytecode;JRE is the JVM plus libraries;JDK is the JRE plus compiler and tools'],
 ["How does HashMap work internally, and what happens when two keys have the same hash?",'I','T','Keys are hashed to buckets;Collisions use chaining with lists or trees;equals and hashCode must agree;Resizing and load factor'],
 ["A Java service slows down and its memory keeps growing. How would you find the cause?",'A','S','Take a heap dump and use a profiler;Look for leaks such as static collections or unclosed resources;Read GC logs;Fix and verify under load']],
'Python':[["What is the difference between a list, a tuple and a set in Python?",'B','T','List is ordered and mutable;Tuple is ordered and immutable;Set is unordered with unique items;Choose by use case'],
 ["A script that reads a 2 GB file runs out of memory. How would you fix it?",'I','S','Read line by line or in chunks;Use generators;Process and release each piece;Use a context manager'],
 ["Write a function that returns the first non-repeating character in a string and explain its complexity.",'A','C','Count characters with a dictionary;Second pass to find the first count of one;O(n) time;Handle empty input']],
'JavaScript':[["What is the difference between var, let and const?",'B','T','Function scope versus block scope;Hoisting and the temporal dead zone;const blocks reassignment, not mutation'],
 ["Explain how closures work and give a practical use.",'I','T','A function keeps access to its outer scope;Example such as counters or private data;Risks with loops and memory'],
 ["A page freezes while a large list is processed. How would you fix it using what you know about the event loop?",'A','S','One thread means long work blocks the UI;Split the work or use a Web Worker;Schedule work asynchronously;Measure before and after']],
'SQL':[["What is the difference between INNER JOIN and LEFT JOIN?",'B','T','Inner join keeps only matching rows;Left join keeps every left row with NULLs for no match;Small example'],
 ["Write a query to find the second highest salary in an employee table.",'I','C','Subquery or DENSE_RANK;Handle ties and the case with no second value;Explains the approach'],
 ["A report query takes 30 seconds. How would you speed it up?",'A','S','Read the execution plan;Add or fix indexes;Avoid SELECT * and wasteful joins;Retest after each change']],
'Data Structures':[["When would you use a stack and when a queue?",'B','T','Stack is last-in first-out, e.g. undo or recursion;Queue is first-in first-out, e.g. scheduling;Real examples'],
 ["How would you detect a cycle in a linked list?",'I','C','Fast and slow pointers;O(n) time and O(1) space;Mentions the hash-set alternative'],
 ["You need fast lookups, ordered traversal and range queries. Which data structure fits and why?",'A','S','Balanced tree or sorted structure;Compares with a hash map;Time complexity trade-offs']],
'Algorithms':[["What is Big O notation and why does it matter?",'B','T','Growth rate as input grows;Ignores constants;Compares O(n) with O(n log n)'],
 ["Explain binary search and when it cannot be used.",'I','C','Halves a sorted range each step;O(log n);Needs sorted or monotonic data;Edge cases'],
 ["How would you find the top 10 items in a stream of a billion records?",'A','S','Min-heap of size 10;O(n log k) time;Avoids sorting everything;Reasons about memory']],
'OOP':[["What are the four pillars of object-oriented programming?",'B','T','Encapsulation;Abstraction;Inheritance;Polymorphism with one example each'],
 ["When would you choose composition over inheritance?",'I','T','Has-a versus is-a;Reduces tight coupling;Easier to test and change;Example'],
 ["Design the classes for a parking lot system.",'A','D','Finds the classes: lot, spot, vehicle, ticket;Relationships and responsibilities;Extensibility;Edge cases such as a full lot']],
'Spring Boot':[["What does @SpringBootApplication do?",'B','T','Combines configuration, auto-configuration and component scan;Starts the application context'],
 ["Explain dependency injection and how Spring uses it.",'I','T','The container supplies dependencies;Constructor injection is preferred;Easier testing and looser coupling'],
 ["A Spring Boot endpoint is slow under load. How would you investigate?",'A','S','Use metrics and logs such as Actuator;Check database queries and connection pool;Profile threads;Fix and load test']],
'React':[["What is the difference between props and state?",'B','T','Props are passed in and read-only;State is owned by the component;State changes cause a re-render'],
 ["How does useEffect work and what are common mistakes with it?",'I','T','Runs after render;Dependency array;Cleanup function;Missing dependencies and infinite loops'],
 ["A React list re-renders slowly with thousands of rows. What would you do?",'A','S','Stable keys and memoisation;Virtualised list;Avoid unnecessary state updates;Measure with the profiler']],
'HTML & CSS':[["What is the CSS box model?",'B','T','Content, padding, border, margin;box-sizing;Example of its effect on layout'],
 ["Explain Flexbox and Grid and when to use each.",'I','T','Flexbox is one-dimensional;Grid is two-dimensional;Examples of each;Using both together'],
 ["How would you make a page work well on phones and on large screens?",'A','S','Responsive units and media queries;Mobile-first layout;Images and touch targets;Testing on real sizes']],
'Node.js':[["How does Node.js handle many requests with a single thread?",'B','T','Event loop;Non-blocking I/O;Thread pool for some work;CPU-heavy work blocks everything'],
 ["What is middleware in Express and how is it used?",'I','T','Functions run in order on each request;Used for auth, logging and parsing;Calls next or ends the response'],
 ["An API starts timing out under heavy traffic. How would you diagnose it?",'A','S','Check event-loop delay and CPU;Look for blocking code and slow downstream calls;Add caching, limits and scaling;Verify with a load test']],
'REST APIs':[["What makes an API RESTful?",'B','T','Resources and URLs;HTTP methods;Stateless requests;Correct status codes'],
 ["How would you design pagination and error responses for an API?",'I','T','Limit and offset or cursor;Consistent error format;Correct status codes;Documentation'],
 ["Design an API for a high-traffic booking service.",'A','D','Resource model and endpoints;Idempotency and rate limiting;Caching and versioning;Consistency under concurrent bookings']],
'Git':[["What is the difference between git merge and git rebase?",'B','T','Merge keeps history with a merge commit;Rebase replays commits on a new base;Do not rebase shared branches'],
 ["You pushed a bug to the main branch. How do you undo it safely?",'I','S','Revert instead of rewriting shared history;Tell the team;Fix forward when needed'],
 ["Two developers changed the same lines. How do you resolve the conflict well?",'A','S','Understand both changes;Edit and test the result;Talk to the other author;Write a clear commit message']],
'Linux':[["How do you check disk space, running processes and open ports on Linux?",'B','T','df and du;ps or top;ss or netstat;One use of each'],
 ["A server is at 100 percent CPU. How would you find the cause?",'I','S','Find the process with top or htop;Check logs and recent changes;Look at threads;Mitigate, then fix the root cause'],
 ["Explain file permissions and how you would secure a shared folder.",'A','T','Read, write, execute for owner, group, others;chmod and chown;Least privilege;Use groups']],
'Networking':[["What happens when you type a URL into a browser?",'B','T','DNS lookup;TCP and TLS connection;HTTP request and response;Page rendering'],
 ["What is the difference between TCP and UDP?",'I','T','TCP is reliable and ordered;UDP is fast without guarantees;Use cases for each'],
 ["Users cannot reach a service in one region. How would you troubleshoot?",'A','S','Check DNS, routing and firewall rules;Test from different locations;Check load balancer health;Compare with a working region']],
'AWS':[["What is the difference between EC2 and S3?",'B','T','EC2 provides virtual servers;S3 is object storage;A typical use for each'],
 ["How would you make a web application on AWS highly available?",'I','S','Multiple availability zones;Load balancer and auto scaling;Managed database with failover;Health checks'],
 ["Your monthly cloud bill doubled. How would you find out why and reduce it?",'A','S','Use cost tools and tags;Find idle or oversized resources;Reserved capacity or savings plans;Set budgets and alerts']],
'Docker':[["What is the difference between an image and a container?",'B','T','An image is a read-only template;A container is a running instance;Layers'],
 ["How would you reduce the size of a Docker image?",'I','T','Smaller base image;Multi-stage builds;Remove build tools and caches;Use .dockerignore'],
 ["A container keeps restarting. How would you debug it?",'A','S','Check logs and exit code;Inspect configuration and environment;Check limits and health checks;Reproduce locally']],
'Kubernetes':[["What are a Pod, a Deployment and a Service in Kubernetes?",'B','T','A pod runs containers;A deployment manages replicas and updates;A service gives stable network access'],
 ["A pod is in CrashLoopBackOff. What do you check?",'I','S','kubectl logs and describe;Config and secrets;Probes and resource limits;Fix and redeploy'],
 ["How would you release a new version with no downtime?",'A','S','Rolling update;Readiness probes;Rollback plan;Canary or blue-green option']],
'CI/CD':[["What is the difference between continuous integration and continuous delivery?",'B','T','CI merges and tests often;Delivery keeps code ready to release;Deployment may be manual or automatic'],
 ["Design a pipeline for a web application.",'I','S','Build, test, scan, package, deploy;Stages and gates;Fast feedback;Secrets handled safely'],
 ["A deployment broke production. How should the pipeline and team respond?",'A','S','Quick rollback;Find the cause from logs;Add tests or checks;Blameless review']],
'Security':[["What is the difference between authentication and authorization?",'B','T','Authentication proves who you are;Authorization decides what you can do;Example'],
 ["How do SQL injection and cross-site scripting work and how are they prevented?",'I','T','Untrusted input is run as code;Parameterised queries;Output encoding and validation;Least privilege'],
 ["You suspect a service account key was leaked. What do you do?",'A','S','Revoke and rotate the key;Check logs for misuse;Limit the blast radius;Fix how it leaked']],
'Machine Learning':[["What is the difference between supervised and unsupervised learning?",'B','T','Labelled versus unlabelled data;Examples of each;Typical algorithms'],
 ["What are overfitting and underfitting and how do you handle them?",'I','T','Too complex versus too simple;Gap between train and validation scores;Regularisation, more data, simpler model, cross-validation'],
 ["Your model scores 98 percent accuracy but fails in production. What could be wrong?",'A','S','Class imbalance or the wrong metric;Data leakage or drift;Training data differs from live data;Monitor and retrain']],
'Statistics':[["What is the difference between mean, median and mode, and when is the median better?",'B','T','Definitions;Median resists outliers;Skewed data example'],
 ["Explain a p-value in simple words.",'I','T','Chance of data this extreme if the null is true;Not the chance the hypothesis is true;Threshold and context'],
 ["An A/B test shows a small improvement. How do you decide whether to ship it?",'A','S','Sample size and significance;Practical size of the effect;Test duration and bias;Decision and follow-up']],
'Data Visualization':[["How do you choose between a bar chart, a line chart and a pie chart?",'B','T','Line for trends over time;Bar for comparing categories;Pie only for a few parts of a whole'],
 ["A manager says your dashboard is confusing. What do you change?",'I','S','Ask what decision it supports;Remove clutter;Clear labels and consistent colours;Test with a real user'],
 ["How would you present a metric that has a few extreme outliers?",'A','S','Check whether the outliers are errors;Show with and without them;Use a log scale or the median;Explain the choice']],
'Excel':[["What is the difference between VLOOKUP and XLOOKUP?",'B','T','VLOOKUP searches the first column and returns to the right;XLOOKUP searches in any direction;Exact match handling'],
 ["You receive a messy sales sheet with duplicates and blanks. How do you clean it?",'I','S','Keep a copy of the original;Remove duplicates;Handle blanks;Standardise formats'],
 ["How would you summarise sales by region and month with a pivot table?",'A','C','Region in rows and month in columns;Sum of sales as values;Filters and checks;Add a chart']],
'Testing':[["What is the difference between unit, integration and end-to-end tests?",'B','T','Scope and speed;Example of each;The test pyramid'],
 ["How would you write tests for a function that calculates a discount?",'I','S','Normal cases;Boundary and invalid values;Clear expected results;Independent tests'],
 ["Your test suite is slow and flaky. What do you do?",'A','S','Find the flaky tests and their causes;Remove time and data dependence;Run in parallel;Track results over time']]
};
const GENERIC={
 P1:["Describe a project you are proud of. What was your role and what did you build?",'B','P','Clear scope and goal;Own contribution, not only the team work;Technologies and why they were chosen;Result or outcome','Projects'],
 P2:["What was the hardest problem in your project and how did you solve it?",'I','P','A specific problem;Steps taken and alternatives considered;Result and what was learned','Projects'],
 P3:["If you could rebuild your project today, what would you change?",'I','P','Honest view of weaknesses;Concrete technical or process changes;Reasons linked to what was learned','Projects'],
 H1:["Tell me about a time you disagreed with a teammate. What happened?",'B','H','A specific example;Listened to the other view;Reached a result;No blame on others','Behavioral'],
 H2:["Tell me about a time you made a mistake or missed a deadline. What did you do?",'I','H','Owns the mistake;Actions to limit the damage;What changed afterwards','Behavioral'],
 H3:["Why do you want this role, and where do you want to be in three years?",'B','H','Understands the role;Links own skills to the role;Realistic learning plans','Behavioral'],
 D1:["Design a URL shortener. Walk through your approach.",'A','D','Requirements and scale;API and data model;How short IDs are generated;Caching and scaling','System Design'],
 D2:["Design a notification system that sends email and push messages.",'A','D','Requirements and message types;Queue and workers;Retries and failures;Scaling and monitoring','System Design']};

const ROLES={
 'Software Engineer':['Data Structures','Algorithms','OOP','SQL','Git','REST APIs'],
 'Java Developer':['Java','OOP','Data Structures','SQL','Spring Boot','REST APIs'],
 'Python Developer':['Python','Data Structures','OOP','SQL','Git','Testing'],
 'Full Stack Developer':['JavaScript','React','Node.js','SQL','REST APIs','Git'],
 'Frontend Developer':['JavaScript','React','HTML & CSS','REST APIs','Testing','Git'],
 'Backend Developer':['Node.js','SQL','REST APIs','Security','Docker','Git'],
 'Cloud Engineer':['AWS','Linux','Networking','Security','Docker','Kubernetes'],
 'DevOps Engineer':['Linux','Docker','Kubernetes','CI/CD','Git','AWS'],
 'Data Engineer':['Python','SQL','Linux','Docker','Git'],
 'Data Scientist':['Python','Statistics','Machine Learning','SQL','Data Visualization'],
 'AI / ML Engineer':['Python','Machine Learning','Statistics','Docker','Git'],
 'Cybersecurity Engineer':['Security','Networking','Linux','Python'],
 'QA / Test Engineer':['Testing','SQL','REST APIs','Git','CI/CD'],
 'Mobile App Developer':['JavaScript','React','REST APIs','Git','Testing'],
 'Other Engineering Role':[]};

const ALIAS={'js':'JavaScript','javascript':'JavaScript','node':'Node.js','nodejs':'Node.js','node.js':'Node.js','express':'Node.js',
 'dsa':['Data Structures','Algorithms'],'data structures and algorithms':['Data Structures','Algorithms'],
 'oops':'OOP','oop':'OOP','object oriented programming':'OOP','spring':'Spring Boot','springboot':'Spring Boot',
 'reactjs':'React','react.js':'React','html':'HTML & CSS','css':'HTML & CSS','html/css':'HTML & CSS','html and css':'HTML & CSS','html & css':'HTML & CSS',
 'rest':'REST APIs','api':'REST APIs','apis':'REST APIs','rest api':'REST APIs','restful apis':'REST APIs',
 'k8s':'Kubernetes','ci/cd':'CI/CD','cicd':'CI/CD','jenkins':'CI/CD','github actions':'CI/CD',
 'iam':'Security','cybersecurity':'Security','infosec':'Security','aws':'AWS','amazon web services':'AWS','cloud':'AWS',
 'ml':'Machine Learning','stats':'Statistics','tableau':'Data Visualization','power bi':'Data Visualization','visualization':'Data Visualization','visualisation':'Data Visualization',
 'spreadsheets':'Excel','qa':'Testing','unit testing':'Testing','test automation':'Testing','selenium':'Testing',
 'mysql':'SQL','postgresql':'SQL','postgres':'SQL','databases':'SQL','database':'SQL','dbms':'SQL',
 'github':'Git','version control':'Git','unix':'Linux','shell':'Linux','bash':'Linux','networks':'Networking','computer networks':'Networking','containers':'Docker'};
const KW={};
Object.keys(ALIAS).forEach(a=>[].concat(ALIAS[a]).forEach(n=>(KW[n]=KW[n]||[]).push(a)));
Object.keys(BANK).forEach(n=>(KW[n]=KW[n]||[]).push(n.toLowerCase()));

/* ---------- engine ---------- */
let uid=0; const nid=()=>'q'+(++uid)+Math.random().toString(36).slice(2,6);
function canon(tok){
  const k=tok.toLowerCase().replace(/\s+/g,' ').trim(); if(!k) return [];
  if(ALIAS[k]) return [].concat(ALIAS[k]);
  const hit=Object.keys(BANK).find(n=>n.toLowerCase()===k); if(hit) return [hit];
  return [tok.trim().replace(/\b\w/g,c=>c.toUpperCase())];
}
function parseSkills(t){const out=[];t.split(/[,;\n]+/).forEach(x=>canon(x).forEach(n=>{if(!out.includes(n))out.push(n)}));return out}
function mentions(text,skill){
  return (KW[skill]||[skill.toLowerCase()]).some(k=>new RegExp('(^|[^a-z0-9])'+k.replace(/[.*+?^${}()|[\]\\\/]/g,'\\$&')+'($|[^a-z0-9])','i').test(text));
}
function tpl(s){return [[`Explain the core concepts of ${s} in your own words.`,'B','T','Defines the main ideas clearly;Gives a simple example;Says when it is used'],
 [`Describe a real situation where you used ${s}. What problem did it solve?`,'I','S','A concrete situation;Own contribution;Result and lessons learned'],
 [`A system that uses ${s} fails in production. How would you find and fix the cause?`,'A','S','Gather evidence first;Isolate the cause;Fix and verify;Prevent a repeat']]}
function mk(r,skill,src,generic){return {id:nid(),text:r[0],d:r[1],diff:DN[r[1]],type:TN[r[2]],keys:r[3].split(';').map(x=>x.trim()),skill:skill,src:src,generic:!!generic,approved:false}}
function pool(name){const raw=BANK[name];return (raw||tpl(name)).map(r=>mk(r,name,raw?'Bank':'Template',false))}
function genList(level){
  const ord=(level==='F'||level==='E')?['P1','H1','P2','H2','P3','H3']:['P1','H1','D1','P2','H2','D2','P3','H3'];
  return ord.map(k=>{const g=GENERIC[k];return mk(g,g[4],'Bank',true)});
}
function buildSet(skills,count,diff,level){
  const pref=(level==='F'||level==='E')?['B','I','A']:level==='1'?['I','B','A']:['I','A','B'];
  const lists=skills.map(n=>{let p=pool(n);if(diff)p=p.filter(q=>q.d===diff);p.sort((a,b)=>pref.indexOf(a.d)-pref.indexOf(b.d));return p});
  const rr=[];for(let r=0;;r++){let any=false;lists.forEach(l=>{if(l[r]){rr.push(l[r]);any=true}});if(!any)break}
  const gen=genList(level);
  const reserve=count>=15?4:count>=10?3:count>=6?2:0;
  const target=count-reserve;
  let out=rr.slice(0,target).concat(gen.slice(0,reserve));
  const need=count-out.length;
  if(need>0)out=out.concat(rr.slice(target).concat(gen.slice(reserve)).slice(0,need));
  const rank={B:0,I:1,A:2};
  out.sort((a,b)=>(a.generic?1:0)-(b.generic?1:0)||rank[a.d]-rank[b.d]);
  return out;
}
function coverage(set,skills){
  return skills.map(s=>{
    const a=set.filter(q=>q.skill===s), m=set.filter(q=>q.skill!==s&&mentions(q.text,s));
    const lv=new Set(a.map(q=>q.d));
    let rating='Not covered',cls='bad';
    if(a.length>=2&&lv.size>=2){rating='Reasonably assessed';cls='ok'}
    else if(a.length>=1){rating='Lightly assessed';cls='warn'}
    else if(m.length){rating='Mentioned only';cls='warn'}
    return {s,a,m,rating,cls};
  });
}
const STOP=new Set('a an the of to in on for and or is are was were be been what how why when which do does did you your with from by at as it its this that can could would should will about between explain describe tell me my i we our'.split(' '));
const norm=t=>t.toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const toks=t=>new Set(norm(t).split(' ').filter(w=>w&&!STOP.has(w)));
function jac(a,b){let i=0;a.forEach(x=>{if(b.has(x))i++});return i/((a.size+b.size-i)||1)}
function dupes(set){
  const res=[],T=set.map(q=>toks(q.text));
  for(let i=0;i<set.length;i++)for(let j=i+1;j<set.length;j++){
    const a=set[i],b=set[j];let level=null,why='';
    if(norm(a.text)===norm(b.text)){level='Exact duplicate';why='The wording is the same.'}
    else{const s=jac(T[i],T[j]);
      if(s>=0.6){level='Similar meaning';why='They share '+Math.round(s*100)+'% of their key words.'}
      else if(a.skill===b.skill&&a.type===b.type&&a.d===b.d&&!a.generic&&!b.generic){level='Same competency';why='Same skill, type and difficulty, so a candidate would show the same ability in both.'}}
    if(level)res.push({a,b,level,why});
  }
  return res;
}
function altFor(q,set){
  const used=new Set(set.map(x=>norm(x.text)));
  if(q.generic){return genList('3').find(g=>g.skill===q.skill&&!used.has(norm(g.text)))||null}
  return pool(q.skill).find(p=>!used.has(norm(p.text)))||null;
}

/* ---------- state ---------- */
let G=store.get('gen',{role:'',skills:[],set:[]});
let P={qs:[],i:0,ans:{},sc:{},rev:{},done:false,role:'',level:'F'};
let R={edit:null};
const save=()=>store.set('gen',G);

/* ---------- navigation ---------- */
const ICON={home:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
 practice:'<path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2L12 3Z"/>',
 generate:'<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
 coverage:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>',
 rubric:'<path d="M5 12l4.5 4.5L19 7"/>',
 review:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="currentColor"/>'};
const PAGES=[['home','Dashboard','Interview Dashboard'],['practice','Practice Interview','Practice Interview'],['generate','Generate Questions','Generate Questions'],['coverage','Skill Coverage','Skill Coverage'],['rubric','Evaluation Rubrics','Evaluation Rubrics'],['review','Review','Human Review']];
$('#nav').innerHTML=PAGES.map(p=>`<button data-page="${p[0]}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[p[0]]}</svg>${p[1]}</button>`).join('');
const bankCount=Object.values(BANK).reduce((n,a)=>n+a.length,0)+Object.keys(GENERIC).length;
$('#bankNote').textContent=bankCount+' questions across '+Object.keys(BANK).length+' skills. Any other skill gets clearly marked template questions. No live AI model is used.';

function page(id){
  $$('.view').forEach(v=>{if(v.parentElement.tagName==='MAIN')v.hidden=v.id!==id});
  $$('#nav button').forEach(b=>b.setAttribute('aria-current',b.dataset.page===id?'page':'false'));
  $('#title').textContent=PAGES.find(p=>p[0]===id)[2];
  ({home:renderHome,practice:renderPractice,generate:renderGen,coverage:renderCov,rubric:renderRub,review:renderRev})[id]();
  window.scrollTo(0,0);
}

/* ---------- home ---------- */
function renderHome(){
  let cov='—',covSub='Generate questions to see coverage.';
  if(G.set.length){const c=coverage(G.set,G.skills),n=c.filter(x=>x.cls!=='bad'&&x.rating!=='Mentioned only').length;cov=Math.round(n/c.length*100)+'%';covSub=n+' of '+c.length+' skills have at least one question. One question is only light coverage.'}
  let st='Not started',stSub='Start a personalised practice session.';
  if(P.qs.length&&!P.done){st='In progress';stSub='Question '+(P.i+1)+' of '+P.qs.length+'.'}
  if(P.done){st='Finished';stSub='See your summary on the Practice page.'}
  $('#homeCards').innerHTML=`<article><small>SUPPORTED ROLES</small><h2>${Object.keys(ROLES).length-1}+</h2><p class="muted small">Or type your own skills for any other role.</p></article>
   <article><small>QUESTION TYPES</small><h2>6</h2><p class="muted small">Technical, scenario, coding, system design, behavioral and project.</p></article>
   <article><small>SKILL COVERAGE</small><h2>${cov}</h2><p class="muted small">${covSub}</p></article>
   <article><small>INTERVIEW STATUS</small><h2>${st}</h2><p class="muted small">${stSub}</p></article>`;
  const last=store.get('last',null), lc=$('#lastCard');
  if(last){lc.hidden=false;lc.innerHTML=`<h3>Last practice session</h3><p>${esc(last.role)} · ${last.answered} of ${last.total} questions self-scored · average ${last.avg===null?'n/a':last.avg.toFixed(1)} out of 5 · ${esc(last.date)}</p>`}else lc.hidden=true;
}

/* ---------- practice ---------- */
$('#roleSelect').innerHTML=Object.keys(ROLES).map(r=>`<option>${r}</option>`).join('');
$('#roleList').innerHTML=Object.keys(ROLES).filter(r=>ROLES[r].length).map(r=>`<option value="${r}">`).join('');
$('#roleSelect').value='Java Developer';
$('#practiceSkills').value=ROLES['Java Developer'].join(', ');
$('#genSkills').value=ROLES['Cloud Engineer'].join(', ');
$('#roleSelect').addEventListener('change',e=>{const s=ROLES[e.target.value];if(s&&s.length)$('#practiceSkills').value=s.join(', ')});
$('#genRole').addEventListener('input',e=>{const s=ROLES[e.target.value];if(s&&s.length)$('#genSkills').value=s.join(', ')});

$('#startPractice').addEventListener('click',()=>{
  const skills=parseSkills($('#practiceSkills').value), msg=$('#pMsg');
  if(!skills.length){msg.hidden=false;msg.textContent='Add at least one skill, separated by commas.';return}
  const level=$('#pLevel').value,count=+$('#pCount').value;
  const qs=buildSet(skills,count,'',level);
  msg.hidden=!(qs.length<count);
  if(qs.length<count)msg.textContent='Only '+qs.length+' different questions are available for these skills. Add more skills for a longer session.';
  P={qs,i:0,ans:{},sc:{},rev:{},done:false,role:$('#roleSelect').value,level};
  renderPractice();$('#practiceArea').scrollIntoView({block:'start'});
});

function renderPractice(){
  const box=$('#practiceArea');
  if(!P.qs.length){box.innerHTML='<h3>Your interview</h3><p class="muted">Choose your role and skills, then press Start. Your questions will appear here.</p>';return}
  if(P.done){
    const scored=P.qs.filter(q=>P.sc[q.id]),avg=scored.length?scored.reduce((a,q)=>a+P.sc[q.id],0)/scored.length:null;
    const by={};scored.forEach(q=>(by[q.skill]=by[q.skill]||[]).push(P.sc[q.id]));
    const rows=Object.keys(by).map(s=>({s,a:by[s].reduce((x,y)=>x+y,0)/by[s].length}));
    const weak=rows.filter(r=>r.a<=2.5);
    box.innerHTML=`<h3>Your summary</h3>
     <p>You self-scored <b>${scored.length}</b> of ${P.qs.length} questions. ${avg===null?'Score at least one question to see an average.':'Your average is <b>'+avg.toFixed(1)+'</b> out of 5.'}</p>
     ${rows.length?`<div class="tbl" style="margin-top:12px"><table><thead><tr><th>Skill</th><th>Average self-score</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.s)}</td><td>${r.a.toFixed(1)}</td></tr>`).join('')}</tbody></table></div>`:''}
     <p style="margin-top:12px">${weak.length?'Spend more time on: <b>'+weak.map(r=>esc(r.s)).join(', ')+'</b>.':(scored.length?'No skill scored 2.5 or below. Try a harder level next.':'')}</p>
     <p class="muted small" style="margin-top:8px">Scores are your own judgement against the key points. They are practice feedback, not an assessment.</p>
     <div class="acts" style="margin-top:14px"><button class="primary" data-act="restart">Start a new session</button></div>`;
    return;
  }
  const q=P.qs[P.i],rev=P.rev[q.id],sc=P.sc[q.id]||0,last=P.i===P.qs.length-1;
  box.innerHTML=`<div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:8px"><h3 style="margin:0">Question ${P.i+1} of ${P.qs.length}</h3><span class="muted small">${esc(P.role)}</span></div>
   <div class="prog" style="margin-bottom:16px"><i style="width:${(P.i+1)/P.qs.length*100}%"></i></div>
   <div class="chips" style="margin-bottom:10px"><span class="chip">${esc(q.skill)}</span><span class="chip ${q.d}">${q.diff}</span><span class="chip">${q.type}</span>${q.src==='Template'?'<span class="chip warn">Template question</span>':''}</div>
   <h2 style="margin-bottom:14px">${esc(q.text)}</h2>
   <label for="pAns">YOUR ANSWER (OPTIONAL, FOR YOUR OWN PRACTICE)</label><textarea id="pAns" style="min-height:120px" placeholder="Type or speak your answer first, then check the key points.">${esc(P.ans[q.id]||'')}</textarea>
   <div class="acts" style="margin-top:12px">${rev?'':'<button class="primary" data-act="reveal">Show what a good answer includes</button>'}</div>
   ${rev?`<div class="box" style="margin-top:14px"><h4>A good answer includes</h4><ul class="list">${q.keys.map(k=>`<li>${esc(k)}</li>`).join('')}</ul></div>
   <label>HOW WELL DID YOU COVER IT? (1 = NOT AT ALL, 5 = FULLY)</label><div class="scores">${[1,2,3,4,5].map(n=>`<button data-act="score" data-v="${n}" aria-pressed="${sc===n}" aria-label="Score ${n}">${n}</button>`).join('')}</div>`:''}
   <div class="acts" style="margin-top:18px;justify-content:space-between"><button class="ghost" data-act="back" ${P.i===0?'disabled style="opacity:.4"':''}>← Back</button>
   <button class="primary" data-act="${last?'finish':'next'}">${last?'Finish session':'Next question →'}</button></div>`;
}
document.addEventListener('input',e=>{if(e.target.id==='pAns'&&P.qs[P.i])P.ans[P.qs[P.i].id]=e.target.value});

/* ---------- generate ---------- */
$('#genBtn').addEventListener('click',()=>{
  const skills=parseSkills($('#genSkills').value);
  if(!skills.length){$('#genOut').innerHTML='<p class="msg">Add at least one required skill, separated by commas.</p>';return}
  const count=+$('#gCount').value;
  const set=buildSet(skills,count,$('#gDiff').value,$('#gLevel').value);
  G={role:$('#genRole').value.trim()||'Engineering role',skills,set,short:set.length<count?count:0};
  save();renderGen();
});
function qCard(q,i,extra){
  return `<div class="q"><div class="q-top"><span class="q-n">${i+1}</span><div class="q-t">${esc(q.text)}</div></div>
   <div class="chips"><span class="chip">${esc(q.skill)}</span><span class="chip ${q.d}">${q.diff}</span><span class="chip">${q.type}</span>${q.src==='Template'?'<span class="chip warn">Template · needs human check</span>':''}${q.src==='Yours'?'<span class="chip">Your question</span>':''}</div>${extra||''}</div>`;
}
function renderGen(){
  const o=$('#genOut');
  if(!G.set.length){o.innerHTML='<p class="muted">Choose a role and skills, then press Generate. Questions will appear here.</p>';return}
  o.innerHTML=(G.short?`<p class="msg" style="margin-bottom:14px">Only ${G.set.length} different questions are available for these skills and this difficulty. Add skills or choose Mixed to reach ${G.short}.</p>`:'')+
   `<p class="muted small" style="margin-bottom:14px">${esc(G.role)} · ${G.set.length} questions · ${G.skills.length} skills</p>`+
   G.set.map((q,i)=>qCard(q,i,`<div class="acts"><button class="ghost" data-act="toRubric" data-id="${q.id}">View rubric</button></div>`)).join('')+
   `<div class="acts" style="margin-top:18px"><button class="primary" data-page="coverage">Check skill coverage →</button><button class="ghost" data-page="review">Send to review</button></div>`;
}

/* ---------- coverage ---------- */
function renderCov(){
  const o=$('#covOut');
  if(!G.set.length){o.innerHTML='<div class="card empty"><p class="muted">No question set yet. Generate one first, then come back to see which skills it covers.</p><button class="primary" data-page="generate">Generate questions</button></div>';return}
  const c=coverage(G.set,G.skills), assessed=c.filter(x=>x.a.length).length, gaps=c.filter(x=>!x.a.length);
  o.innerHTML=`<div class="card"><h3>${esc(G.role)}: ${G.set.length} questions, ${G.skills.length} skills</h3>
   <p class="muted small" style="margin-bottom:8px">${assessed} of ${G.skills.length} skills have at least one question that tests them. "Lightly assessed" means one question, which is not full coverage.</p>
   ${c.map(x=>`<div class="bar-row"><b>${esc(x.s)}</b><div class="bar"><i style="width:${Math.min(x.a.length,3)/3*100}%"></i></div><span class="rate ${x.cls}">${x.rating}</span>
   <span class="muted small" style="grid-column:1/-1;margin-top:-6px">${x.a.length} assessing${x.m.length?' · '+x.m.length+' only mention it':''}</span></div>`).join('')}</div>
   <div class="card"><h3>Missing topics and suggestions</h3>${gaps.length?gaps.map(x=>{const alt=altFor({skill:x.s,generic:false},G.set);
     return `<div class="review"><div><span class="badge yellow">GAP</span><b>${esc(x.s)} ${x.rating==='Mentioned only'?'is only mentioned in a question about something else.':'has no question.'}</b>
     <small class="muted">${alt?'Suggested question: '+esc(alt.text):'No unused bank question is left for this skill. Add your own on the Review page.'}</small></div>${alt?`<button class="ghost" data-act="addGap" data-skill="${esc(x.s)}">Add this question</button>`:''}</div>`}).join(''):'<p class="muted">Every required skill has at least one question. Skills with only one question could use a second one at a different difficulty.</p>'}</div>
   <div class="card"><h3>Competency map</h3><div class="graph"><b>${esc(G.role)}</b>${c.map(x=>`<span>${esc(x.s)}<em>${x.a.length}</em></span>`).join('')}</div></div>`;
}

/* ---------- rubric ---------- */
function rubricList(){
  const l=[];G.set.forEach(q=>l.push(['g',q]));P.qs.forEach(q=>l.push(['p',q]));return l;
}
function renderRub(keepSel){
  const l=rubricList(),sel=$('#rubSel'),prev=sel.value;
  if(!l.length){sel.innerHTML='';$('#rubOut').innerHTML='<div class="empty"><p class="muted">No questions yet. Generate a set or start a practice session first.</p><button class="primary" data-page="generate">Generate questions</button></div>';return}
  const opt=(kind,q,i)=>`<option value="${kind}:${q.id}">${kind==='g'?'Generated':'Practice'} ${i+1}. ${esc(q.text.length>80?q.text.slice(0,80)+'...':q.text)}</option>`;
  sel.innerHTML=l.filter(x=>x[0]==='g').map((x,i)=>opt('g',x[1],i)).join('')+l.filter(x=>x[0]==='p').map((x,i)=>opt('p',x[1],i)).join('');
  if(keepSel&&[...sel.options].some(o=>o.value===keepSel))sel.value=keepSel;else if(prev&&[...sel.options].some(o=>o.value===prev))sel.value=prev;
  drawRub();
}
const MIST={T:['Repeats a memorised definition with no example','Mixes up two similar terms','Gives only one side of a trade-off'],
 S:['Jumps to a fix without gathering evidence','Skips verifying the fix','Names tools but not the reasoning'],
 C:['Ignores empty or extreme inputs','Does not state time or space cost','Cannot explain the code line by line'],
 D:['Starts drawing boxes before asking about requirements','Ignores scale, failure and cost','Cannot justify the choice of data store'],
 P:['Describes the team, not their own work','Cannot explain a technical choice','Gives no measurable result'],
 H:['Gives no specific example','Blames other people','Shows no lesson learned']};
const PRAC={T:'Links the idea to a real example',S:'Gathers evidence before fixing and checks the result',C:'Handles edge cases and states time and space cost',D:'Starts from requirements and covers scale and failure',P:'Separates own work from the team work',H:'Gives a specific example with a result'};
const TCODE=Object.fromEntries(Object.entries(TN).map(([k,v])=>[v,k]));
function drawRub(){
  const v=$('#rubSel').value;if(!v)return;
  const [k,id]=v.split(':'),q=(k==='g'?G.set:P.qs).find(x=>x.id===id);if(!q)return;
  const n=q.keys.length,t=TCODE[q.type]||'T';
  const depth=q.d==='B'?'Explains the idea in their own words':q.d==='I'?'Explains why and how, not only what':'Discusses trade-offs and edge cases';
  $('#rubOut').innerHTML=`<span class="chip ${q.d}">${q.diff}</span> <span class="chip">${q.type}</span> <span class="chip">${esc(q.skill)}</span>
   <h2 style="margin:10px 0 16px">${esc(q.text)}</h2>
   <div class="rub">
    <div class="box"><h4>Expected answer points</h4>${n?`<ul class="list">${q.keys.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p class="muted">No answer points are stored for your own question. Write 3 to 5 points before you use it.</p>'}</div>
    <div class="box"><h4>Evaluation criteria</h4><ul class="list"><li><b>Accuracy:</b> facts and terms are correct</li><li><b>Depth:</b> ${depth}</li><li><b>Clarity:</b> structured and easy to follow</li><li><b>Practical thinking:</b> ${PRAC[t]}</li></ul></div>
    <div class="box full"><h4>Scoring scale, 1 to 5</h4>
     <div class="rubric"><b>5 · Excellent</b><span>${n?'Covers all '+n+' points accurately':'Covers every expected point accurately'}, gives an example and explains trade-offs.</span></div>
     <div class="rubric"><b>4 · Good</b><span>Covers most points correctly with small gaps.</span></div>
     <div class="rubric"><b>3 · Adequate</b><span>Covers about half the points. Correct but shallow.</span></div>
     <div class="rubric"><b>2 · Developing</b><span>Mentions one or two points. Vague or partly wrong.</span></div>
     <div class="rubric"><b>1 · Needs work</b><span>Cannot answer, or the answer is wrong or unrelated.</span></div></div>
    <div class="box"><h4>Common mistakes</h4><ul class="list">${MIST[t].map(x=>`<li>${x}</li>`).join('')}</ul></div>
    <div class="box"><h4>Strong and weak answers</h4><ul class="list"><li><b>Strong:</b> gives a concrete example, states limits, checks their own answer</li><li><b>Weak:</b> only definitions, cannot say why, or contradicts themselves</li></ul></div>
   </div><p class="muted small" style="margin-top:12px">Judge the content, not accent or confidence. Accept other valid approaches. A person should check these points before use.</p>`;
}
$('#rubSel').addEventListener('change',drawRub);

/* ---------- review ---------- */
const CHECKS=[['Relevance','Each question fits the role, level and round.'],['Factual accuracy','Every technical point and expected answer is correct.'],['Difficulty','The mix of basic, intermediate and advanced suits the level.'],['Fairness','No bias in wording or examples. No personal questions.'],['Skill coverage','Count the questions per skill yourself and compare with the coverage page.'],['Rubric quality','Scores are clear and other valid approaches are accepted.']];
let ticks=store.get('ticks',{});
function renderRev(){
  const sel=$('#cSkill');sel.innerHTML=['General'].concat(G.skills).map(s=>`<option>${esc(s)}</option>`).join('');
  $('#checks').innerHTML=CHECKS.map((c,i)=>`<label class="chk" style="margin:0;letter-spacing:0;font-size:14px;color:var(--fg)"><input type="checkbox" data-tick="${i}" ${ticks[i]?'checked':''}><span><b>${c[0]}</b><span class="muted" style="font-weight:400">${c[1]}</span></span></label>`).join('');
  const o=$('#revOut');
  if(!G.set.length){$('#revHead').textContent='Questions';o.innerHTML='<div class="empty"><p class="muted">No questions to review yet.</p><button class="primary" data-page="generate">Generate questions</button></div>';$('#dupOut').innerHTML='<p class="muted">Nothing to compare yet.</p>';return}
  const d=dupes(G.set),dupIds=new Set(d.map(x=>x.b.id)),ap=G.set.filter(q=>q.approved).length;
  $('#revHead').textContent='Questions: '+ap+' of '+G.set.length+' approved'+(d.length?' · '+d.length+' repeat'+(d.length>1?'s':'')+' found':'');
  o.innerHTML=G.set.map((q,i)=>{
    const st=dupIds.has(q.id)?'dup':q.approved?'ok':'rev';
    const badge=st==='dup'?'<span class="badge red">✕ DUPLICATE</span>':st==='ok'?'<span class="badge green">✓ APPROVED</span>':'<span class="badge yellow">⚠ REVIEW</span>';
    if(R.edit===q.id)return `<div class="review"><div style="flex:1">${badge}<textarea id="editBox" aria-label="Edit question">${esc(q.text)}</textarea></div><div class="acts"><button class="ghost ok" data-act="saveEdit" data-id="${q.id}">Save</button><button class="ghost" data-act="cancelEdit">Cancel</button></div></div>`;
    const alt=st==='dup'?altFor(q,G.set):null;
    return `<div class="review"><div>${badge}<b>${i+1}. ${esc(q.text)}</b><small class="muted">${esc(q.skill)} · ${q.diff} · ${q.type}${q.src==='Template'?' · template, check carefully':''}</small></div>
     <div class="acts">${st==='dup'&&alt?`<button class="ghost" data-act="replace" data-id="${q.id}">Replace</button>`:''}${st!=='dup'?`<button class="ghost ok" data-act="approve" data-id="${q.id}">${q.approved?'Unapprove':'Approve'}</button>`:''}<button class="ghost" data-act="edit" data-id="${q.id}">Edit</button><button class="ghost bad" data-act="remove" data-id="${q.id}">Remove</button></div></div>`}).join('');
  $('#dupOut').innerHTML=d.length?d.map(x=>`<div class="review"><div><span class="badge red">${x.level.toUpperCase()}</span><b>Question ${G.set.indexOf(x.a)+1} and question ${G.set.indexOf(x.b)+1}</b><small class="muted">${x.why} Keep question ${G.set.indexOf(x.a)+1}, then replace or reword question ${G.set.indexOf(x.b)+1}.</small></div></div>`).join(''):'<p class="muted">No exact, similar or same-competency repeats found in this set. The check compares wording and skill, so a person should still read the set once.</p>';
}
document.addEventListener('change',e=>{const t=e.target.closest('[data-tick]');if(t){ticks[t.dataset.tick]=t.checked;store.set('ticks',ticks)}});
$('#cAdd').addEventListener('click',()=>{
  const text=$('#cText').value.trim();if(!text)return;
  const sk=$('#cSkill').value,d=$('#cDiff').value,t=$('#cType').value;
  G.set.push({id:nid(),text,d,diff:DN[d],type:TN[t],keys:[],skill:sk,src:'Yours',generic:sk==='General',approved:false});
  if(!G.role)G.role='Engineering role';
  $('#cText').value='';save();renderRev();
});
$('#copyApproved').addEventListener('click',()=>{
  const b=$('#copyApproved'),box=$('#exportBox'),list=G.set.filter(q=>q.approved);
  if(!list.length){b.textContent='Approve a question first';setTimeout(()=>b.textContent='Copy approved questions',1800);return}
  const text=list.map((q,i)=>(i+1)+'. '+q.text+' ['+q.skill+', '+q.diff+']').join('\n');
  const ok=()=>{b.textContent='Copied';setTimeout(()=>b.textContent='Copy approved questions',1600)};
  const fb=()=>{box.hidden=false;box.value=text;box.focus();box.select()};
  try{navigator.clipboard.writeText(text).then(ok,fb)}catch(err){fb()}
});

/* ---------- actions ---------- */
document.addEventListener('click',e=>{
  const pg=e.target.closest('[data-page]');if(pg){page(pg.dataset.page);return}
  const a=e.target.closest('[data-act]');if(!a)return;
  const act=a.dataset.act,id=a.dataset.id;
  if(act==='reveal'){P.rev[P.qs[P.i].id]=true;renderPractice()}
  else if(act==='score'){P.sc[P.qs[P.i].id]=+a.dataset.v;renderPractice()}
  else if(act==='next'){P.i++;renderPractice()}
  else if(act==='back'){if(P.i>0){P.i--;renderPractice()}}
  else if(act==='finish'){
    P.done=true;const sc=P.qs.filter(q=>P.sc[q.id]);
    store.set('last',{role:P.role,answered:sc.length,total:P.qs.length,avg:sc.length?sc.reduce((s,q)=>s+P.sc[q.id],0)/sc.length:null,date:new Date().toLocaleDateString()});
    renderPractice()}
  else if(act==='restart'){P={qs:[],i:0,ans:{},sc:{},rev:{},done:false,role:'',level:'F'};renderPractice();window.scrollTo(0,0)}
  else if(act==='toRubric'){page('rubric');$('#rubSel').value='g:'+id;drawRub()}
  else if(act==='addGap'){const s=a.dataset.skill,alt=altFor({skill:s,generic:false},G.set);if(alt){G.set.push(alt);save();renderCov()}}
  else if(act==='approve'){const q=G.set.find(x=>x.id===id);if(q){q.approved=!q.approved;save();renderRev()}}
  else if(act==='edit'){R.edit=id;renderRev()}
  else if(act==='cancelEdit'){R.edit=null;renderRev()}
  else if(act==='saveEdit'){const q=G.set.find(x=>x.id===id),v=$('#editBox').value.trim();if(q&&v){q.text=v;q.approved=false;q.keys=q.keys||[]}R.edit=null;save();renderRev()}
  else if(act==='remove'){G.set=G.set.filter(x=>x.id!==id);save();renderRev()}
  else if(act==='replace'){const i=G.set.findIndex(x=>x.id===id);if(i>-1){const alt=altFor(G.set[i],G.set);if(alt){G.set[i]=alt;save();renderRev()}}}
});
$('#theme').addEventListener('click',()=>{
  const r=document.documentElement,cur=r.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  r.setAttribute('data-theme',cur==='dark'?'light':'dark');
});
page('home');
})();
