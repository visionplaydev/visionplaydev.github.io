/*  Sheet-CMS Popup — 구글시트로 팝업/공지 관리 (재사용 드롭인 컴포넌트 · 최대 3개)
    ────────────────────────────────────────────────────────────────
    사용법 (페이지 하단):
      <script>window.POPUP_CMS_URL='<Apps Script 웹앱 /exec URL>';</script>
      <script src="/dev/popup-cms.js"></script>

    구글시트 '어드민' 탭 = 테이블 (1행 헤더, 2~4행 = 팝업 최대 3개):
      A노출(Y/N) B제목 C내용 D버튼링크 E버튼문구 F시작일 G종료일 H버튼색(셀 칠) I상단이미지 J통이미지
    · 노출=Y 인 팝업만 표시. 여러 개면 데스크탑=나란히 / 좁으면=계단식 겹침(반응형)
    · 상단이미지(I)=텍스트 위 / 통이미지(J)=이미지 단독(넣으면 나머지 무시, 클릭=버튼링크)
    · 버튼색=H칸 색칠(또는 #헥사) · Drive 공유링크는 자동으로 직접URL 변환
    · 속도: 캐시 즉시표시(SWR) → 백그라운드 최신확인 → 바뀌면 교체
*/
(function(){
  var URL = window.POPUP_CMS_URL;
  if(!URL) return;
  var LS = 'vpd_popup_dismiss', CK = 'vpd_popup_cache';

  function ymd(d){ return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
  try{ if(localStorage.getItem(LS)===ymd(new Date())) return; }catch(e){}

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];}); }
  function drive(v){
    var s=String(v||'').trim(); if(!s) return s;
    if(/lh3\.googleusercontent\.com/.test(s)) return s;
    var m=s.match(/drive\.google\.com\/file\/d\/([-\w]{20,})/) || s.match(/[?&]id=([-\w]{20,})/);
    return m ? ('https://lh3.googleusercontent.com/d/'+m[1]) : s;
  }
  function urlish(v){ return v && /^(https?:\/\/|\/|data:)/i.test(String(v).trim()); }

  function filterActive(list){
    var today = new Date(); today.setHours(12,0,0,0);
    return list.filter(function(c){
      if(String(c.on||'').trim().toUpperCase()!=='Y') return false;
      if(c.start){ var s=new Date(c.start); if(!isNaN(s.getTime()) && today<s) return false; }
      if(c.end){ var e=new Date(c.end); if(!isNaN(e.getTime())){ e.setHours(23,59,59,999); if(today>e) return false; } }
      return (c.title||'').trim() || (c.body||'').trim() || urlish(drive(c.full_image)) || urlish(drive(c.top_image));
    }).slice(0, 3);
  }

  var overlay = null, closedByUser = false, shownRaw = null;

  function display(list){
    if(closedByUser) return;                 // 유저가 닫았으면 재표시 안함
    var active = filterActive(list);
    if(overlay){                             // 기존 표시 제거(교체)
      if(overlay._onKey) document.removeEventListener('keydown', overlay._onKey);
      if(overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }
    overlay = active.length ? mount(active) : null;
  }

  // 1) 캐시 즉시 표시 (지연 0)
  var cachedRaw = null;
  try{ cachedRaw = localStorage.getItem(CK); }catch(e){}
  if(cachedRaw){ try{ shownRaw = cachedRaw; display(JSON.parse(cachedRaw)); }catch(e){} }

  // 2) 최신 fetch → 바뀌었으면 교체 (셀프 교정)
  fetch(URL, {method:'GET'}).then(function(r){ return r.json(); }).then(function(d){
    var list = (d && d.popups) || [];
    var raw = JSON.stringify(list);
    try{ localStorage.setItem(CK, raw); }catch(e){}
    if(raw === shownRaw) return;              // 캐시와 동일 → 그대로
    shownRaw = raw;
    display(list);
  }).catch(function(){ /* 조용히 무시 — 팝업은 부가 기능 */ });

  function injectStyle(){
    if(document.getElementById('vpdpop-style')) return;
    var st = document.createElement('style'); st.id = 'vpdpop-style';
    st.textContent =
      '.vpdpop-ov{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;background:rgba(4,6,14,.62);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);opacity:0;transition:opacity .25s ease}'
    + '.vpdpop-track{display:flex;flex-wrap:wrap;gap:18px;align-items:flex-start;justify-content:center;max-width:100%}'
    + '.vpdpop-card{position:relative;flex:0 0 auto;width:300px;max-width:86vw;max-height:90vh;overflow:auto;background:#0e1330;color:#eaf0ff;border:1px solid rgba(255,255,255,.12);border-radius:18px;box-shadow:0 24px 60px rgba(0,0,0,.5);font-family:system-ui,-apple-system,\'Noto Sans KR\',sans-serif}'
    + '.vpdpop-x{position:absolute;top:8px;right:8px;width:32px;height:32px;border-radius:50%;border:0;cursor:pointer;background:rgba(0,0,0,.5);color:#fff;font-size:20px;line-height:1;z-index:2}'
    + '.vpdpop-bar{display:flex;align-items:center;justify-content:center;gap:7px;padding:13px;border-top:1px solid rgba(255,255,255,.08);color:#7a85ad;font-size:.83rem;cursor:pointer;background:rgba(255,255,255,.02)}'
    + '.vpdpop-body{padding:24px 22px 20px;text-align:center}'
    + '.vpdpop-body h3{margin:0;font-size:1.24rem;font-weight:800;line-height:1.3;word-break:keep-all}'
    + '.vpdpop-body p{margin:11px 0 0;color:#aab4d6;font-size:.95rem;line-height:1.62;white-space:pre-line;word-break:keep-all}'
    + '.vpdpop-cta{display:inline-block;margin-top:16px;padding:.8em 1.6em;border-radius:999px;font-weight:700;text-decoration:none;color:#241a00}'
    + '.vpdpop-top{width:100%;display:block;max-height:210px;object-fit:cover}'
    + '.vpdpop-full{width:100%;display:block;max-height:74vh;object-fit:contain;background:#0a0d20}'
    + '@media(max-width:720px){'
    +   '.vpdpop-card{position:fixed;left:50%;top:20px;width:86vw;max-width:360px;max-height:84vh}'
    +   '.vpdpop-card:nth-child(1){transform:translateX(-50%);z-index:7}'
    +   '.vpdpop-card:nth-child(2){transform:translateX(-50%) translate(14px,14px);z-index:6}'
    +   '.vpdpop-card:nth-child(3){transform:translateX(-50%) translate(28px,28px);z-index:5}'
    + '}';
    document.head.appendChild(st);
  }

  function mount(list){
    injectStyle();
    var ov = document.createElement('div'); ov.className = 'vpdpop-ov';
    var track = document.createElement('div'); track.className = 'vpdpop-track';
    ov.appendChild(track);

    function closeAll(setFlag){
      closedByUser = true;
      if(setFlag){ try{ localStorage.setItem(LS, ymd(new Date())); }catch(e){} }
      ov.style.opacity = '0';
      setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); }, 260);
    }
    list.forEach(function(c){ track.appendChild(buildCard(c, track, closeAll)); });
    document.body.appendChild(ov);
    requestAnimationFrame(function(){ ov.style.opacity = '1'; });

    ov.addEventListener('click', function(e){ if(e.target===ov) closeAll(false); });
    function onKey(e){ if(e.key==='Escape'){ closeAll(false); document.removeEventListener('keydown', onKey); } }
    document.addEventListener('keydown', onKey);
    ov._onKey = onKey;
    return ov;
  }

  function buildCard(c, track, closeAll){
    var accent  = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(c.accent||'').trim()) ? String(c.accent).trim() : '#f7c948';
    var fullUrl = urlish(drive(c.full_image)) ? drive(c.full_image).trim() : '';   // 통이미지(단독)
    var topImg  = urlish(drive(c.top_image))  ? drive(c.top_image).trim()  : '';   // 상단 이미지
    var linkUrl = urlish(c.link)  ? String(c.link).trim()  : '';
    var title   = (c.title||'').trim();
    var body    = (c.body||'').trim();

    var card = document.createElement('div'); card.className = 'vpdpop-card';
    var html = '<button class="vpdpop-x" aria-label="닫기">&times;</button>';
    if(fullUrl){                                   // 통이미지 — 이미지 단독(나머지 무시)
      var im = '<img class="vpdpop-full" src="'+esc(fullUrl)+'" alt="">';
      if(linkUrl) im = '<a href="'+esc(linkUrl)+'" target="_blank" rel="noopener" style="display:block;line-height:0">'+im+'</a>';
      html += im;
    } else {                                       // 텍스트 카드 (+ 상단이미지)
      if(topImg) html += '<img class="vpdpop-top" src="'+esc(topImg)+'" alt="">';
      html += '<div class="vpdpop-body"><h3>'+esc(title||'공지')+'</h3><p>'+esc(body)+'</p>'
            + (linkUrl ? '<a class="vpdpop-cta" href="'+esc(linkUrl)+'" target="_blank" rel="noopener" style="background:'+esc(accent)+'">'+esc(c.link_text||'자세히 보기')+'</a>' : '')
            + '</div>';
    }
    html += '<label class="vpdpop-bar"><input type="checkbox" style="accent-color:'+esc(accent)+'">오늘 하루 보지 않기</label>';
    card.innerHTML = html;

    var dismiss = false;
    card.querySelector('input').addEventListener('change', function(e){ dismiss = e.target.checked; });
    card.querySelector('.vpdpop-x').addEventListener('click', function(){
      if(dismiss){ closeAll(true); return; }                       // 오늘안보기 = 전부 닫고 오늘 표시 안함
      if(card.parentNode) card.parentNode.removeChild(card);        // 아니면 이 카드만
      if(!track.children.length) closeAll(false);
    });
    return card;
  }
})();
