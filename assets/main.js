/* =========================================================
   Vision Play — landing interactions
   ========================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  const TILES = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t9", "t10", "t11", "t12"];
  const tileSrc = (t) => `assets/tiles/${t}.png`;

  /* ---------- Footer year ---------- */
  const yearEl = $("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- i18n: Korean / English toggle ---------- */
  (function i18n() {
    const nodes = $$("[data-ko]");
    nodes.forEach((el) => { if (el.dataset.en == null) el.dataset.en = el.innerHTML; });
    const toggles = $$("[data-lang-toggle]");
    function apply(lang) {
      nodes.forEach((el) => { el.innerHTML = lang === "ko" ? el.dataset.ko : el.dataset.en; });
      document.documentElement.lang = lang;
      toggles.forEach((b) => { b.textContent = lang === "ko" ? "한국어" : "English"; });
      try { localStorage.setItem("vpd_lang", lang); } catch (e) {}
    }
    let lang = "en";
    try { lang = localStorage.getItem("vpd_lang") || "en"; } catch (e) {}
    apply(lang === "ko" ? "ko" : "en");
    toggles.forEach((b) => b.addEventListener("click", () => {
      apply(document.documentElement.lang === "ko" ? "en" : "ko");
    }));
  })();

  /* ---------- Header scroll state ---------- */
  const header = $(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const toggle = $(".nav-toggle");
  const menu = $(".mobile-menu");
  if (toggle && menu) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    $$("a", menu).forEach((a) => a.addEventListener("click", () => setOpen(false)));
  }

  /* ---------- Starfields ---------- */
  function makeStars(layer, count) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const d = document.createElement("span");
      d.className = "star-dot";
      const size = Math.random() * 2 + 1;
      d.style.width = d.style.height = size + "px";
      d.style.left = Math.random() * 100 + "%";
      d.style.top = Math.random() * 100 + "%";
      d.style.animationDelay = (Math.random() * 4).toFixed(2) + "s";
      frag.appendChild(d);
    }
    layer.appendChild(frag);
  }
  $$(".stars").forEach((l) => makeStars(l, l.classList.contains("stars-dim") ? 40 : 80));

  /* ---------- Floating blocks in hero ---------- */
  const floatLayer = $(".float-layer");
  let floaters = [];
  if (floatLayer) {
    const spots = [
      { l: 8, t: 22, s: 78, d: 0 }, { l: 84, t: 18, s: 66, d: 1.2 },
      { l: 16, t: 70, s: 58, d: 2.1 }, { l: 90, t: 64, s: 80, d: .6 },
      { l: 72, t: 80, s: 52, d: 1.6 }, { l: 26, t: 40, s: 46, d: 2.6 },
    ];
    spots.forEach((p, i) => {
      const img = document.createElement("img");
      img.src = tileSrc(TILES[i % TILES.length]);
      img.alt = "";
      img.className = "float-block";
      img.style.left = p.l + "%";
      img.style.top = p.t + "%";
      img.style.width = p.s + "px";
      img.dataset.depth = (0.2 + (i % 3) * 0.18).toFixed(2);
      if (!reduceMotion) img.style.animation = `logoFloat ${5 + i}s ease-in-out ${p.d}s infinite`;
      floatLayer.appendChild(img);
      floaters.push(img);
    });
  }
  // Parallax on pointer move
  if (!reduceMotion && floaters.length) {
    let raf = null, mx = 0, my = 0;
    window.addEventListener("mousemove", (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(apply);
    });
    function apply() {
      raf = null;
      floaters.forEach((f) => {
        const d = parseFloat(f.dataset.depth) * 26;
        f.style.transform = `translate(${mx * d}px, ${my * d}px)`;
      });
    }
  }

  /* ---------- In-phone screenshot carousel ---------- */
  (function shotRotator() {
    const wrap = $("[data-shots]");
    const dotsWrap = $("[data-shot-dots]");
    if (!wrap) return;
    const shots = $$(".shot", wrap);
    if (!shots.length) return;
    let idx = 0;
    const dots = shots.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show screenshot " + (i + 1));
      if (i === 0) b.classList.add("is-active");
      b.addEventListener("click", () => go(i, true));
      if (dotsWrap) dotsWrap.appendChild(b);
      return b;
    });
    function go(n, user) {
      shots[idx].classList.remove("is-active");
      if (dots[idx]) dots[idx].classList.remove("is-active");
      idx = (n + shots.length) % shots.length;
      shots[idx].classList.add("is-active");
      if (dots[idx]) dots[idx].classList.add("is-active");
      if (user) restart();
    }
    let timer = null;
    function start() { if (!reduceMotion && shots.length > 1) timer = setInterval(() => go(idx + 1), 3400); }
    function restart() { if (timer) clearInterval(timer); start(); }
    start();
  })();

  /* ---------- Store badges (injected) ---------- */
  const GOOGLE_PLAY = "https://play.google.com/store/apps/details?id=com.vision.blocklumi";
  const APP_STORE = "https://apps.apple.com/app/id6765803755";
  const playBadge = `
    <a class="store-badge" href="${GOOGLE_PLAY}" target="_blank" rel="noopener" aria-label="Get Block Lumi on Google Play">
      <svg width="26" height="29" viewBox="0 0 512 512" aria-hidden="true">
        <path fill="#00d0ff" d="M47 21c-6 4-9 11-9 20v422c0 9 3 16 9 20l2 2 236-236v-6L49 19z"/>
        <path fill="#00f076" d="M51 23 287 245l66-66L92 22C77 13 62 14 51 23z"/>
        <path fill="#ffce00" d="M353 179l-66 66 66 66 78-44c22-13 22-31 0-44z"/>
        <path fill="#ff3a44" d="M51 467c11 9 26 10 41 1l261-156-66-66z"/>
      </svg>
      <span class="sb-text"><span class="sb-small">Get it on</span><span class="sb-big">Google Play</span></span>
    </a>`;
  const appleBadge = `
    <a class="store-badge" href="${APP_STORE}" target="_blank" rel="noopener" aria-label="Download Block Lumi on the App Store">
      <svg width="26" height="29" viewBox="0 0 384 512" aria-hidden="true">
        <path fill="#fff" d="M318 268c-1-50 41-74 43-75-23-34-59-39-72-39-31-3-60 18-75 18-16 0-39-18-64-17-33 0-63 19-80 49-34 59-9 147 24 195 16 24 36 50 62 49 25-1 34-16 64-16s38 16 64 15c26 0 43-24 59-48 18-27 26-53 26-54-1-1-50-19-51-77zM267 84c14-17 23-40 21-63-20 1-45 13-59 30-13 15-24 39-21 61 22 2 45-11 59-28z"/>
      </svg>
      <span class="sb-text"><span class="sb-small">Download on the</span><span class="sb-big">App Store</span></span>
    </a>`;
  $$("[data-badges]").forEach((el) => { el.innerHTML = playBadge + appleBadge; });

  /* ---------- Scroll reveal ---------- */
  const reveals = $$(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((r) => r.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e, i) => {
        if (e.isIntersecting) {
          const el = e.target;
          // small stagger for siblings
          const sibs = $$(".reveal", el.parentElement);
          const idx = sibs.indexOf(el);
          el.style.transitionDelay = Math.min(idx, 5) * 70 + "ms";
          el.classList.add("in");
          io.unobserve(el);
        }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((r) => io.observe(r));
  }
})();
