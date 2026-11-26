// ZENVENT theme behaviour: thumb fitting, topic filter, live hero, lightbox
(function(){
  // 2:1 frames: banners near 2:1 fill (cover); anything else is contained over a blurred copy
  window.zvFit=function(img){
    var b=img.parentElement,cw=b.clientWidth,ch=b.clientHeight;if(!cw||!ch||!img.naturalWidth)return;
    var r=(img.naturalWidth/img.naturalHeight)/(cw/ch);b.classList.toggle('cover',r>0.6&&r<1.5);
  };
  document.querySelectorAll('.thumb img').forEach(function(i){
    if(i.naturalWidth)zvFit(i);i.addEventListener('load',function(){zvFit(i)});
  });
  addEventListener('load',function(){document.querySelectorAll('.thumb img').forEach(zvFit)});
  addEventListener('resize',function(){document.querySelectorAll('.thumb img').forEach(zvFit)});

  // topic filter (featured card always stays)
  var tabs=document.querySelectorAll('.tabs button');
  tabs.forEach(function(b){b.addEventListener('click',function(){
    var t=b.dataset.t;tabs.forEach(function(x){x.classList.toggle('on',x===b)});
    document.querySelectorAll('.list .row').forEach(function(r){r.hidden=t!=='All'&&(r.dataset.topics||'').split('|').indexOf(t)<0});
    document.querySelectorAll('.yrgroup').forEach(function(g){g.hidden=!g.querySelector('.row:not([hidden])')});
    var h=document.getElementById('sectitle');if(h)h.textContent=t==='All'?'More builds':t;
    var e=document.getElementById('nothing');if(e)e.hidden=!!document.querySelector('.list .row:not([hidden])');
  })});

  // live featured card: the embedded app only appears once it reports a rendered frame
  var live=document.querySelector('.feat .live[data-src]');
  if(live&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    addEventListener('message',function(e){if(e.data==='zv-hero-ready')live.closest('.feat').classList.add('ready')});
    var f=document.createElement('iframe');f.tabIndex=-1;f.setAttribute('aria-hidden','true');f.src=live.dataset.src;live.appendChild(f);
  }

  // lightbox for post images (also backs the old theme's imageModel() onclick)
  var lb=document.createElement('div');lb.className='lb';lb.innerHTML='<img alt="">';document.body.appendChild(lb);
  lb.onclick=function(){lb.classList.remove('open')};
  addEventListener('keydown',function(e){if(e.key==='Escape')lb.classList.remove('open')});
  window.imageModel=function(id){var i=document.getElementById(id);if(!i)return;lb.firstChild.src=i.src;lb.classList.add('open')};
  document.querySelectorAll('.hero img,.prose .box.alt img').forEach(function(i){i.onclick=function(){lb.firstChild.src=i.src;lb.classList.add('open')}});
})();
