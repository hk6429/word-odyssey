// Presentation only. Existing chapter buttons remain the learning entry points.
export function createImmersion(){
 const $=s=>document.querySelector(s);
 const stage=document.createElement('section');stage.className='world-stage';stage.id='world-stage';stage.setAttribute('aria-labelledby','world-title');
 stage.innerHTML=`<div class="world-landscape" role="img" aria-label="英倫潑墨旅程"></div><div class="world-shade"></div><div class="world-portrait" role="img"></div><header class="world-heading"><p id="world-place"></p><h1 id="world-title"></h1><p id="world-progress"></p></header><nav class="world-tools" aria-label="旅途選單"><button data-world-panel="chapter"></button><button data-world-panel="route"></button><button data-world-panel="cast"></button><button data-world-panel="practice"></button></nav><section class="world-dialogue" aria-label="故事對話"><div class="world-speaker"><strong id="world-speaker"></strong><span id="world-page"></span></div><p id="world-line" aria-live="polite"></p><div class="world-actions"><button id="world-back"></button><button id="world-next" class="primary"></button></div></section>`;
 $('#journey-view').prepend(stage);
 const drawer=document.createElement('dialog');drawer.id='world-drawer';drawer.className='world-drawer';drawer.setAttribute('aria-labelledby','world-drawer-title');
 drawer.innerHTML='<header class="drawer-heading"><h2 id="world-drawer-title"></h2><button id="world-close"></button></header><div data-world-content="chapter"></div><div data-world-content="route"></div><div data-world-content="cast"></div><div data-world-content="practice"></div>';
 document.body.append(drawer);
 $('[data-world-content="chapter"]').append($('#chapter-panel'));
 $('[data-world-content="route"]').append($('.map-section'));
 $('[data-world-content="cast"]').append($('#adventure-panel'));
 $('[data-world-content="practice"]').append($('.stats-strip'),$('#practice-panel'),$('#milestones'),$('.ritual'));
 let data=null,line=0,lines=[],key='',panel='chapter';
 const text=(zh,en)=>data?.locale==='en'?en:zh;
 const labels=()=>({chapter:text('小關進度','Progress'),route:text('旅程目錄','Chapters'),cast:text('我的旅伴','Companions'),practice:text('練習安排','Practice')});
 function close(){if(drawer.open)drawer.close();}
 function open(name){panel=name;for(const node of drawer.querySelectorAll('[data-world-content]'))node.hidden=node.dataset.worldContent!==name;$('#world-drawer-title').textContent=labels()[name];if(!drawer.open)drawer.showModal();drawer.scrollTop=0;}
 function paint(){
  $('#world-line').textContent=lines[line]||'';$('#world-page').textContent=`${line+1} / ${lines.length}`;
  $('#world-back').textContent=text('‹ 上一句','‹ Back');$('#world-back').disabled=line===0;
  $('#world-next').textContent=line<lines.length-1?text('繼續 →','Continue →'):data.action+' →';$('#world-next').disabled=line===lines.length-1&&data.disabled;
 }
 stage.querySelectorAll('[data-world-panel]').forEach(b=>b.onclick=()=>open(b.dataset.worldPanel));
 $('#world-close').onclick=close;$('#world-back').onclick=()=>{line=Math.max(0,line-1);paint();};
 $('#world-next').onclick=()=>{if(line<lines.length-1){line++;paint();}else{close();$('#chapter-start').click();}};
 return {close,open,update(next){
  data=next;const nextKey=`${data.stageId}:${data.locale}`;if(key!==nextKey){line=0;key=nextKey;}
  lines=data.story.match(/[^。！？.!?]+[。！？.!?]?/g)||[data.story];line=Math.min(line,lines.length-1);
  $('#world-title').textContent=data.title;$('#world-place').textContent=data.place;$('#world-progress').textContent=data.progress;
  $('#world-speaker').textContent=text('同行的旅伴','Your companion');
  const role=['cartographer','scholar','scout'].indexOf(data.role);$('.world-portrait').style.backgroundPosition=`${Math.max(0,role)*50}% center`;
  $('.world-portrait').setAttribute('aria-label',text('與你同行的英倫旅人','Your travelling companion'));
  $('.world-landscape').style.backgroundImage=`url('assets/${data.stageId<=10?'hero-journey':`map-region-${String(Math.floor((data.stageId-1)/10)+1).padStart(2,'0')}`}.webp')`;
  for(const b of stage.querySelectorAll('[data-world-panel]'))b.textContent=labels()[b.dataset.worldPanel];
  $('#world-close').textContent=text('收起 ×','Close ×');$('#world-drawer-title').textContent=labels()[panel];paint();
 }};
}
