/* 비전 개발 서비스 — 공유 JS (/dev/ + /dev/contact/) */
(function(){
  // header scrolled state
  var header=document.querySelector('.site-header');
  if(header){
    var onScroll=function(){ header.classList.toggle('scrolled', window.scrollY>10); };
    onScroll(); window.addEventListener('scroll',onScroll,{passive:true});
  }

  // mobile menu
  var tgl=document.querySelector('.nav-toggle'), menu=document.querySelector('.mobile-menu');
  if(tgl && menu){
    tgl.addEventListener('click',function(){
      var open=tgl.getAttribute('aria-expanded')==='true';
      tgl.setAttribute('aria-expanded',String(!open));
      menu.hidden=open;
    });
    menu.addEventListener('click',function(e){ if(e.target.tagName==='A'){menu.hidden=true;tgl.setAttribute('aria-expanded','false');} });
  }

  // stars
  var s=document.getElementById('stars');
  if(s){var html='';for(var i=0;i<46;i++){var sz=(Math.random()*2+1).toFixed(1);html+='<span class="star-dot" style="left:'+(Math.random()*100).toFixed(2)+'%;top:'+(Math.random()*100).toFixed(2)+'%;width:'+sz+'px;height:'+sz+'px;animation-delay:'+(Math.random()*4).toFixed(2)+'s"></span>';}s.innerHTML=html;}

  // scroll reveal
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});},{threshold:.12});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});

  // light content protection (form fields exempt)
  var isField=function(t){return t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable);};
  document.addEventListener('contextmenu',function(e){if(!isField(e.target))e.preventDefault();});
  document.addEventListener('dragstart',function(e){if(!isField(e.target))e.preventDefault();});
  document.addEventListener('keydown',function(e){
    var k=(e.key||'').toLowerCase();
    if(e.key==='F12'){e.preventDefault();return;}
    if((e.ctrlKey||e.metaKey)&&(k==='u'||k==='s')){e.preventDefault();return;}
    if((e.ctrlKey||e.metaKey)&&e.shiftKey&&(k==='i'||k==='j'||k==='c')){e.preventDefault();}
  });
})();
