/*  Sheet-CMS Popup — 구글시트로 팝업/공지 관리 (재사용 드롭인 컴포넌트)
    ────────────────────────────────────────────────────────────────
    사용법 (페이지 하단):
      <script>window.POPUP_CMS_URL='<Apps Script 웹앱 /exec URL>';</script>
      <script src="/dev/popup-cms.js"></script>

    구글시트 '설정' 탭 (A열=키, B열=값):
      popup_on         Y            (Y면 노출, 그 외 숨김)
      popup_title      여름 특별 할인 🎉
      popup_body       7월 한 달간 전 상품 20% 할인! (줄바꿈 그대로 반영)
      popup_start      2026-07-01    (선택, 이 날짜부터)
      popup_end        2026-07-31    (선택, 이 날짜까지)
      popup_link       https://...   (선택, 버튼 링크)
      popup_link_text  자세히 보기    (선택, 버튼 문구)
      popup_image      https://...   (선택, 상단 이미지 URL)
      popup_accent     #f7c948       (선택, 포인트 색)
    → 클라이언트는 popup_on 을 Y↔N 만 바꿔도 팝업 껐다 켰다. (실시간)
*/
(function(){
  var URL = window.POPUP_CMS_URL;
  if(!URL) return;
  var LS = 'vpd_popup_dismiss';

  function ymd(d){ return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
  try{ if(localStorage.getItem(LS)===ymd(new Date())) return; }catch(e){}

  fetch(URL, {method:'GET'})
    .then(function(r){ return r.json(); })
    .then(function(d){
      var c = (d && d.config) || {};
      if(String(c.popup_on||'').trim().toUpperCase()!=='Y') return;
      var today=new Date(); today.setHours(12,0,0,0);
      if(c.popup_start){ var s=new Date(c.popup_start); if(!isNaN(s.getTime()) && today<s) return; }
      if(c.popup_end){ var e=new Date(c.popup_end); if(!isNaN(e.getTime())){ e.setHours(23,59,59,999); if(today>e) return; } }
      render(c);
    })
    .catch(function(){ /* 조용히 무시 — 팝업은 부가 기능 */ });

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];}); }

  function render(c){
    var accent = c.popup_accent || '#f7c948';
    var img  = c.popup_image ? '<img src="'+esc(c.popup_image)+'" alt="" style="width:100%;display:block;max-height:230px;object-fit:cover">' : '';
    var link = c.popup_link ? '<a href="'+esc(c.popup_link)+'" target="_blank" rel="noopener" style="display:inline-block;margin-top:18px;padding:.82em 1.7em;border-radius:999px;font-weight:700;text-decoration:none;color:#241a00;background:'+esc(accent)+'">'+esc(c.popup_link_text||'자세히 보기')+'</a>' : '';

    var ov = document.createElement('div');
    ov.setAttribute('style','position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(4,6,14,.62);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);opacity:0;transition:opacity .25s ease');
    ov.innerHTML =
      '<div role="dialog" aria-modal="true" style="position:relative;max-width:400px;width:100%;background:#0e1330;color:#eaf0ff;border:1px solid rgba(255,255,255,.12);border-radius:20px;overflow:hidden;box-shadow:0 30px 70px rgba(0,0,0,.5);font-family:system-ui,-apple-system,\'Noto Sans KR\',sans-serif;transform:translateY(14px);transition:transform .25s ease">'
      + img
      + '<button aria-label="닫기" data-x style="position:absolute;top:10px;right:10px;width:34px;height:34px;border-radius:50%;border:0;cursor:pointer;background:rgba(0,0,0,.38);color:#fff;font-size:21px;line-height:1">&times;</button>'
      + '<div style="padding:26px 24px 22px;text-align:center">'
      +   '<h3 style="margin:0;font-size:1.32rem;font-weight:800;line-height:1.3;word-break:keep-all">'+esc(c.popup_title||'공지')+'</h3>'
      +   '<p style="margin:12px 0 0;color:#aab4d6;font-size:.98rem;line-height:1.65;white-space:pre-line;word-break:keep-all">'+esc(c.popup_body||'')+'</p>'
      +   link
      + '</div>'
      + '<label style="display:flex;align-items:center;justify-content:center;gap:7px;padding:14px;border-top:1px solid rgba(255,255,255,.08);color:#7a85ad;font-size:.85rem;cursor:pointer;background:rgba(255,255,255,.02)"><input type="checkbox" data-today style="accent-color:'+esc(accent)+'">오늘 하루 보지 않기</label>'
      + '</div>';
    document.body.appendChild(ov);
    requestAnimationFrame(function(){ ov.style.opacity='1'; ov.firstChild.style.transform='none'; });

    var dismissToday=false;
    function close(){
      if(dismissToday){ try{ localStorage.setItem(LS, ymd(new Date())); }catch(e){} }
      ov.style.opacity='0';
      setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); }, 260);
    }
    ov.querySelector('[data-x]').addEventListener('click', close);
    ov.querySelector('[data-today]').addEventListener('change', function(e){ dismissToday=e.target.checked; });
    ov.addEventListener('click', function(e){ if(e.target===ov) close(); });
    document.addEventListener('keydown', function onKey(e){ if(e.key==='Escape'){ close(); document.removeEventListener('keydown', onKey); } });
  }
})();
