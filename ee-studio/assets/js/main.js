/* EE Studio, interactions
   GSAP + ScrollTrigger for scroll choreography, Lenis for smooth scroll.
   Everything degrades to a static, readable page without JS or with reduced motion. */
(() => {
  "use strict";

  const doc = document.documentElement;
  const body = document.body;
  doc.classList.add("js");

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const params = new URLSearchParams(location.search);
  const page = body.dataset.page;
  const PROJECTS = window.EE_PROJECTS || [];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };

  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------
     World (spor): design / foto. Two sites in one.
     --------------------------------------------------------- */
  const PAGE_DEFAULT_WORLD = { om: "foto", priser: "foto" };
  const NAVIGATING_PAGES = ["index", "design", "foto"];
  const locked = body.dataset.worldLock === "true";

  function syncWorldUI() {
    const w = body.dataset.world;
    $$("[data-world-set]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.worldSet === w)));
    $$(".seg[data-world-seg]").forEach((seg) => {
      const btns = $$(".seg__btn", seg);
      const i = btns.findIndex((b) => b.dataset.worldSet === w);
      seg.style.setProperty("--i", Math.max(0, i));
    });
  }

  function setWorld(w, { persist = true, silent = false } = {}) {
    body.dataset.world = w || "";
    if (persist && w) store.set("ee-world", w);
    syncWorldUI();
    if (!silent) document.dispatchEvent(new CustomEvent("world:change", { detail: w }));
  }

  if (locked) {
    store.set("ee-world", body.dataset.world);
  } else if (page !== "index") {
    const fromUrl = params.get("spor");
    const initial = ["design", "foto"].includes(fromUrl) ? fromUrl : (page === "arbeid" ? "" : (store.get("ee-world") || PAGE_DEFAULT_WORLD[page] || ""));
    body.dataset.world = initial;
  }
  syncWorldUI();

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-world-set]");
    if (!b) return;
    const w = b.dataset.worldSet;
    if (NAVIGATING_PAGES.includes(page)) {
      if (page === w) return;
      store.set("ee-world", w);
      go(`${w}.html`);
      return;
    }
    const next = body.dataset.world === w && page === "arbeid" ? "" : w;
    setWorld(next);
    const url = new URL(location.href);
    if (next) url.searchParams.set("spor", next); else url.searchParams.delete("spor");
    history.replaceState(null, "", url);
  });

  /* ---------------------------------------------------------
     Smooth scroll
     --------------------------------------------------------- */
  let lenis = null;
  if (!reduced && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.095, wheelMultiplier: 1, smoothWheel: true });
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollToY = (y) => (lenis ? lenis.scrollTo(y, { duration: 1.2 }) : window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" }));

  /* ---------------------------------------------------------
     Page transitions (curtain)
     --------------------------------------------------------- */
  function go(href) {
    if (reduced) { location.href = href; return; }
    body.classList.add("is-leaving");
    setTimeout(() => { location.href = href; }, 620);
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank" || a.hasAttribute("download")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
    e.preventDefault();
    closeMenu();
    go(url.href);
  });
  window.addEventListener("pageshow", (e) => { if (e.persisted) body.classList.remove("is-leaving"); });

  /* ---------------------------------------------------------
     Header + menu
     --------------------------------------------------------- */
  const header = $("[data-header]");
  let lastY = 0;
  const darkZones = () => $$("[data-header-theme='dark']");
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 30);
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    if (goingDown && y > 400 && !body.classList.contains("menu-open")) header.classList.add("is-hidden");
    else if (goingUp || y < 400) header.classList.remove("is-hidden");
    lastY = y;
    const mid = header.offsetHeight / 2;
    const onDark = darkZones().some((el) => { const r = el.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
    header.classList.toggle("on-dark", onDark);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = $(".burger");
  const menu = $("#menu");
  function closeMenu() {
    if (!body.classList.contains("menu-open")) return;
    body.classList.remove("menu-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Åpne meny");
    menu.setAttribute("aria-hidden", "true");
    lenis && lenis.start();
  }
  burger && burger.addEventListener("click", () => {
    const open = !body.classList.contains("menu-open");
    if (!open) return closeMenu();
    body.classList.add("menu-open");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Lukk meny");
    menu.setAttribute("aria-hidden", "false");
    lenis && lenis.stop();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  /* ---------------------------------------------------------
     Helpers to render project cards
     --------------------------------------------------------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function phHTML(p, label) {
    const bg = (p.ph && p.ph.bg) || "var(--w-soft)";
    const fg = (p.ph && p.ph.fg) || "var(--w-deep)";
    return `<div class="ph" style="--ph-bg:${bg};--ph-fg:${fg}"><span class="logo-mark"></span><span class="ph__name">${esc(label || p.title)}</span><span class="ph__note">Bilder kommer</span></div>`;
  }
  function mediaHTML(p, src) {
    return src ? `<img src="${src}" alt="${esc(p.title)}, ${esc(p.tags.join(", "))}" loading="lazy" decoding="async">` : phHTML(p);
  }
  function tagsHTML(p) {
    return p.tags.map((t) => `<span class="tag ${/foto/i.test(t) ? "tag--fill" : ""}">${esc(t)}</span>`).join("");
  }
  function cardHTML(p, i, { variant = "", img = "cover" } = {}) {
    const src = img === "tall" ? (p.tall || p.cover) : p.cover;
    return `<article class="card ${variant}" data-world-tags="${p.world.join(" ")}" data-cats="${esc(p.cats.join("|"))}">
      <a href="prosjekt.html?p=${p.slug}" data-cursor="Se" aria-label="${esc(p.title)}">
        <div class="card__media" data-img-reveal>${mediaHTML(p, src)}</div>
      </a>
      <div class="card__body">
        <h3 class="card__title"><a href="prosjekt.html?p=${p.slug}">${esc(p.title)}</a></h3>
        <span class="card__idx">${String(i + 1).padStart(2, "0")}</span>
        <div class="tags">${tagsHTML(p)}</div>
      </div>
    </article>`;
  }

  /* Rail (landing) */
  $$("[data-projects='rail']").forEach((track) => {
    const w = track.dataset.world;
    const list = PROJECTS.filter((p) => !w || p.world.includes(w)).slice(0, Number(track.dataset.limit) || 6);
    const variants = ["card--wide", "card--tall", "", "card--wide", "card--tall", ""];
    track.innerHTML = list.map((p, i) => cardHTML(p, i, { variant: variants[i % variants.length], img: variants[i % variants.length] === "card--tall" ? "tall" : "cover" })).join("") +
      `<div class="card card--more"><a href="arbeid.html${w ? "?spor=" + w : ""}" data-cursor="Alt">Se alt arbeid <span class="btn__arrow" aria-hidden="true" style="margin-inline:auto;width:1.6rem;height:1.6rem"></span></a></div>`;
  });

  /* Grid (arbeid + world pages) */
  $$("[data-projects='grid']").forEach((grid) => {
    const fixed = grid.dataset.world;
    const list = PROJECTS.filter((p) => !fixed || p.world.includes(fixed)).slice(0, Number(grid.dataset.limit) || 99);
    grid.innerHTML = list.map((p, i) => cardHTML(p, i, { img: "cover" })).join("") + `<p class="pgrid__empty" hidden>Ingen prosjekter i denne kategorien ennå.</p>`;
  });

  /* Arbeid filters */
  const filterRoot = $("[data-filter]");
  if (filterRoot) {
    const grid = $("[data-projects='grid']");
    const tabs = $("[data-filter-cats]");
    const count = $("[data-filter-count]");
    let cat = params.get("kategori") || "";
    function cats() {
      const w = body.dataset.world;
      const set = new Set();
      PROJECTS.filter((p) => !w || p.world.includes(w)).forEach((p) => p.cats.forEach((c) => set.add(c)));
      return Array.from(set);
    }
    function renderTabs() {
      const list = cats();
      if (cat && !list.includes(cat)) cat = "";
      tabs.innerHTML = [`<button class="tabs__btn" type="button" data-cat="" aria-pressed="${!cat}"><span>Alle</span></button>`]
        .concat(list.map((c) => `<button class="tabs__btn" type="button" data-cat="${esc(c)}" aria-pressed="${cat === c}"><span>${esc(c)}</span></button>`)).join("");
    }
    function apply(animate = true) {
      const w = body.dataset.world;
      let n = 0;
      const shown = [];
      $$(".card", grid).forEach((card) => {
        const okW = !w || card.dataset.worldTags.split(" ").includes(w);
        const okC = !cat || card.dataset.cats.split("|").includes(cat);
        const show = okW && okC;
        card.classList.toggle("is-hidden", !show);
        if (show) { n++; shown.push(card); }
      });
      $(".pgrid__empty", grid).hidden = n > 0;
      count.textContent = `${n} ${n === 1 ? "prosjekt" : "prosjekter"}`;
      $$(".seg__btn[data-world-filter]", filterRoot).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.worldFilter === (w || ""))));
      const seg = $(".seg", filterRoot);
      seg && seg.style.setProperty("--i", ["", "design", "foto"].indexOf(w || ""));
      if (animate && hasGsap && !reduced) {
        shown.forEach((c) => { $("[data-img-reveal]", c).classList.add("is-in"); });
        gsap.fromTo(shown, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .9, stagger: .07, ease: "expo.out", clearProps: "transform,opacity" });
        ScrollTrigger.refresh();
      }
    }
    filterRoot.addEventListener("click", (e) => {
      const wb = e.target.closest("[data-world-filter]");
      if (wb) {
        const w = wb.dataset.worldFilter;
        setWorld(w, { persist: !!w });
        const url = new URL(location.href);
        if (w) url.searchParams.set("spor", w); else url.searchParams.delete("spor");
        history.replaceState(null, "", url);
        return;
      }
      const cb = e.target.closest("[data-cat]");
      if (cb) { cat = cb.dataset.cat; renderTabs(); apply(); }
    });
    document.addEventListener("world:change", () => { renderTabs(); apply(); });
    renderTabs();
    apply(false);
  }

  /* Project detail */
  const pd = $("[data-project-detail]");
  if (pd) {
    const slug = params.get("p") || PROJECTS[0].slug;
    const idx = Math.max(0, PROJECTS.findIndex((p) => p.slug === slug));
    const p = PROJECTS[idx];
    const next = PROJECTS[(idx + 1) % PROJECTS.length];
    document.title = `${p.title} | EE Studio`;
    if (!locked) setWorld(p.world.length === 1 ? p.world[0] : (store.get("ee-world") || p.world[0]), { persist: false, silent: true });
    const fill = (k, v) => $$(`[data-pd='${k}']`).forEach((el) => { el.innerHTML = v; });
    fill("title", esc(p.title));
    fill("lead", esc(p.lead));
    fill("client", esc(p.client));
    fill("year", esc(p.year));
    fill("services", esc(p.tags.join(", ")));
    fill("spor", p.world.map((w) => (w === "design" ? "Design" : "Foto")).join(" &amp; "));
    fill("intro", esc(p.intro));
    fill("challenge", esc(p.challenge));
    fill("solution", esc(p.solution));
    fill("tags", tagsHTML(p));
    fill("back", `<a href="arbeid.html?spor=${p.world[0]}">${p.world[0] === "design" ? "Design" : "Foto"}</a>`);
    const cover = $("[data-pd='cover']");
    cover.innerHTML = p.cover ? `<img src="${p.cover}" alt="${esc(p.title)}">` : phHTML(p);
    const gallery = $("[data-pd='gallery']");
    gallery.innerHTML = p.images.slice(p.cover ? 1 : 0).map((im) => `<figure class="${im.layout === "half" ? "is-half" : im.layout === "offset" ? "is-offset" : ""}" data-img-reveal>${im.src ? `<img src="${im.src}" alt="${esc(p.title)}" loading="lazy">` : phHTML(p, im.ph)}</figure>`).join("");
    const nx = $("[data-pd='next']");
    nx.href = `prosjekt.html?p=${next.slug}`;
    $("[data-pd='next-title']").textContent = next.title;
    $("[data-pd='next-img']").innerHTML = next.cover ? `<img src="${next.tall || next.cover}" alt="">` : phHTML(next);
  }

  /* ---------------------------------------------------------
     Split text into lines for masked reveals
     --------------------------------------------------------- */
  function splitLines(el) {
    if (!el.dataset.splitSrc) el.dataset.splitSrc = el.innerHTML;
    else el.innerHTML = el.dataset.splitSrc;
    const frag = [];
    Array.from(el.childNodes).forEach((n) => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach((t) => { if (t.trim()) frag.push({ t }); else if (t) frag.push({ space: true }); });
      } else if (n.nodeName === "BR") {
        frag.push({ br: true });
      } else if (n.nodeType === 1) {
        const words = n.textContent.split(/\s+/).filter(Boolean);
        words.forEach((w, i) => { const c = n.cloneNode(false); c.textContent = w; frag.push({ node: c }); if (i < words.length - 1) frag.push({ space: true }); });
      }
    });
    el.innerHTML = "";
    const words = [];
    frag.forEach((f) => {
      if (f.space) { el.appendChild(document.createTextNode(" ")); return; }
      if (f.br) { const br = document.createElement("br"); el.appendChild(br); words.push(br); return; }
      const s = document.createElement("span");
      s.style.display = "inline-block";
      if (f.node) s.appendChild(f.node); else s.textContent = f.t;
      el.appendChild(s);
      words.push(s);
    });
    const lines = [];
    let top = null;
    let cur = null;
    words.forEach((w) => {
      if (w.nodeName === "BR") { cur = null; top = null; return; }
      const t = w.offsetTop;
      if (cur === null || Math.abs(t - top) > 4) { cur = []; lines.push(cur); top = t; }
      cur.push(w);
    });
    el.innerHTML = "";
    lines.forEach((ln) => {
      const line = document.createElement("span");
      line.className = "line";
      const inner = document.createElement("span");
      inner.className = "line__in";
      ln.forEach((w, i) => { if (i) inner.appendChild(document.createTextNode(" ")); inner.appendChild(w); });
      line.appendChild(inner);
      el.appendChild(line);
    });
    return $$(".line__in", el);
  }

  /* ---------------------------------------------------------
     Reveals
     --------------------------------------------------------- */
  $$("[data-stagger]").forEach((wrap) => {
    Array.from(wrap.children).forEach((c, i) => { if (c.hasAttribute("data-reveal")) c.style.setProperty("--d", `${i * 80}ms`); });
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.01 });
  const observeReveals = () => $$("[data-reveal]:not(.is-in), [data-img-reveal]:not(.is-in)").forEach((el) => io.observe(el));

  function start() {
    body.classList.remove("is-loading");
    body.classList.add("is-ready");
    observeReveals();

    if (!hasGsap || reduced) return;

    // Headlines: masked line reveal
    $$("[data-split]").forEach((el) => {
      const lines = splitLines(el);
      const inHero = el.closest(".hero, .phero, .pd-hero, .ahero");
      gsap.from(lines, {
        yPercent: 115, duration: 1.25, ease: "expo.out", stagger: 0.09, delay: inHero ? 0.45 : 0,
        scrollTrigger: inHero ? null : { trigger: el, start: "top 88%", once: true }
      });
    });
    let lastW = window.innerWidth;
    window.addEventListener("resize", () => {
      if (Math.abs(window.innerWidth - lastW) < 40) return;
      lastW = window.innerWidth;
      $$("[data-split]").forEach((el) => { splitLines(el); });
      ScrollTrigger.refresh();
    });

    // Parallax
    $$("[data-parallax]").forEach((el) => {
      const amt = parseFloat(el.dataset.parallax) || 0.12;
      gsap.fromTo(el, { yPercent: -amt * 100 }, { yPercent: amt * 100, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });

    // Expanding frames: inset rounded -> full bleed
    $$("[data-expand]").forEach((el) => {
      gsap.fromTo(el, { clipPath: "inset(0% 5% 0% 5% round 32px)" }, {
        clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none",
        scrollTrigger: { trigger: el, start: "top 85%", end: "top 15%", scrub: true }
      });
      const img = $("img", el);
      img && gsap.fromTo(img, { scale: 1.18 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });

    // Photo stack: previous image settles back as the next covers it
    $$(".pstack__item").forEach((item, i, all) => {
      if (i === all.length - 1) return;
      gsap.to($("img", item), { scale: 0.9, opacity: 0.5, ease: "none", scrollTrigger: { trigger: all[i + 1], start: "top bottom", end: "top top", scrub: true } });
    });
  }

  /* ---------------------------------------------------------
     Hero: work teasers react to Design / Foto choice
     --------------------------------------------------------- */
  const stage = $("[data-stage]");
  if (stage) {
    const slides = $$(".stage__slide", stage);
    const nameEl = $("[data-stage-name]", stage);
    const tagEl = $("[data-stage-tag]", stage);
    const countEl = $("[data-stage-count]", stage);
    const bar = $(".stage__bar", stage);
    const choices = $$(".choice__item");
    let set = "all";
    let i = 0;
    let timer = null;
    const DUR = 2600;
    const pool = () => slides.filter((s) => set === "all" || s.dataset.set === set);
    function show(k) {
      const list = pool();
      i = (k + list.length) % list.length;
      slides.forEach((s) => s.classList.remove("is-on"));
      const s = list[i];
      s.classList.add("is-on");
      nameEl.textContent = s.dataset.name;
      tagEl.textContent = s.dataset.set === "design" ? "Design" : "Foto";
      countEl.textContent = `${String(i + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`;
      if (bar && !reduced) {
        bar.style.transition = "none"; bar.style.width = "0";
        void bar.offsetWidth;
        bar.style.transition = `width ${DUR}ms linear`; bar.style.width = "100%";
      }
    }
    function play() { clearInterval(timer); if (!reduced) timer = setInterval(() => show(i + 1), DUR); }
    function pick(newSet) {
      if (set === newSet) return;
      set = newSet;
      choices.forEach((c) => c.classList.toggle("is-active", c.dataset.choice === newSet));
      setWorld(newSet === "all" ? "" : newSet, { persist: false });
      show(0);
      play();
    }
    choices.forEach((c) => {
      c.addEventListener("mouseenter", () => pick(c.dataset.choice));
      c.addEventListener("focus", () => pick(c.dataset.choice));
    });
    const choiceWrap = $(".choice");
    choiceWrap && choiceWrap.addEventListener("mouseleave", () => pick("all"));
    show(0);
    play();
    document.addEventListener("visibilitychange", () => (document.hidden ? clearInterval(timer) : play()));
  }

  /* ---------------------------------------------------------
     Drop section: "visuell kommunikasjon" drops into each discipline
     --------------------------------------------------------- */
  const drop = $("[data-drop]");
  if (drop) {
    const words = $$(".drop__word", drop);
    const texts = $$(".drop__text", drop);
    const imgs = $$(".drop__img > *", drop);
    const steps = $$(".drop__step", drop);
    const n = words.length;
    let cur = -1;
    let st = null;
    function set(k, instant) {
      if (k === cur) return;
      const dir = k > cur ? 1 : -1;
      const anim = hasGsap && !instant && !reduced;
      words.forEach((w, j) => {
        if (!hasGsap) { w.style.transform = j === k ? "none" : "translateY(-110%)"; return; }
        if (j === k) anim ? gsap.fromTo(w, { yPercent: -110 * dir }, { yPercent: 0, duration: .9, ease: "expo.out", overwrite: true }) : gsap.set(w, { yPercent: 0, overwrite: true });
        else if (j === cur && anim) gsap.to(w, { yPercent: 110 * dir, duration: .7, ease: "expo.out", overwrite: true });
        else gsap.set(w, { yPercent: -110, overwrite: true });
      });
      texts.forEach((t, j) => t.classList.toggle("is-on", j === k));
      imgs.forEach((t, j) => t.classList.toggle("is-on", j === k));
      steps.forEach((t, j) => { t.classList.toggle("is-on", j === k); t.setAttribute("aria-pressed", String(j === k)); });
      cur = k;
    }
    set(0, true);
    steps.forEach((s, k) => s.addEventListener("click", () => {
      if (st) scrollToY(st.start + (st.end - st.start) * ((k + 0.5) / n));
      else set(k);
    }));
    if (hasGsap && !reduced) {
      const panel = $(".drop__panel", drop);
      gsap.fromTo(panel, { clipPath: "inset(0% 2.5% 0% 2.5% round 34px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none", scrollTrigger: { trigger: drop, start: "top 90%", end: "top top", scrub: true } });
      st = ScrollTrigger.create({
        trigger: drop, start: "top top", end: () => `+=${window.innerHeight * (n - 0.4) * 0.75}`, pin: panel, anticipatePin: 1,
        onUpdate: (self) => set(Math.min(n - 1, Math.floor(self.progress * n)))
      });
    }
  }

  /* ---------------------------------------------------------
     Horizontal rail (desktop pin, mobile native swipe)
     --------------------------------------------------------- */
  const rail = $("[data-rail]");
  if (rail && hasGsap && !reduced) {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", () => {
      const track = $(".rail__track", rail);
      const bar = $(".rail__progress span", rail);
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const tw = gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: rail, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (self) => { bar && (bar.style.transform = `scaleX(${self.progress})`); },
          onEnter: () => $$("[data-img-reveal]", track).forEach((el) => el.classList.add("is-in")) }
      });
      return () => tw.kill();
    });
  }

  /* ---------------------------------------------------------
     Segmented controls (Privat / Bedrift etc.)
     --------------------------------------------------------- */
  $$("[data-seg]").forEach((seg) => {
    const name = seg.dataset.seg;
    const btns = $$(".seg__btn", seg);
    seg.style.setProperty("--n", btns.length);
    function select(v) {
      btns.forEach((b, i) => { const on = b.dataset.value === v; b.setAttribute("aria-pressed", String(on)); if (on) seg.style.setProperty("--i", i); });
      $$(`[data-seg-target='${name}']`).forEach((el) => { el.hidden = el.dataset.show !== v; });
      document.dispatchEvent(new CustomEvent("seg:change", { detail: { name, value: v } }));
      hasGsap && ScrollTrigger.refresh();
    }
    btns.forEach((b) => b.addEventListener("click", () => select(b.dataset.value)));
    const initial = params.get(name) || (btns.find((b) => b.getAttribute("aria-pressed") === "true") || btns[0]).dataset.value;
    select(initial);
  });
  $$(".seg[data-world-seg]").forEach((seg) => seg.style.setProperty("--n", $$(".seg__btn", seg).length));
  syncWorldUI();

  /* ---------------------------------------------------------
     Photo service picker
     --------------------------------------------------------- */
  $$("[data-picker]").forEach((pk) => {
    function choose(btn) {
      const list = btn.closest("[role='tablist']");
      $$("[role='tab']", list).forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
      $$("[data-picker-panel]", pk).forEach((p) => { p.hidden = p.id !== btn.getAttribute("aria-controls"); });
      const panel = $(`#${btn.getAttribute("aria-controls")}`);
      if (panel && hasGsap && !reduced) gsap.fromTo(panel.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .06, ease: "expo.out" });
    }
    pk.addEventListener("click", (e) => { const b = e.target.closest("[role='tab']"); if (b) choose(b); });
    if (finePointer) pk.addEventListener("mouseover", (e) => { const b = e.target.closest("[role='tab']"); if (b && b.getAttribute("aria-selected") !== "true") choose(b); });
    document.addEventListener("seg:change", (e) => {
      const list = $(`[role='tablist'][data-show='${e.detail.value}']`, pk);
      if (list) choose($("[role='tab']", list));
    });
  });

  /* ---------------------------------------------------------
     Service accordion + hover image
     --------------------------------------------------------- */
  const hoverImg = $(".hover-img");
  $$(".svc__head").forEach((h) => {
    h.addEventListener("click", () => {
      const row = h.closest(".svc__row");
      const open = !row.classList.contains("is-open");
      row.classList.toggle("is-open", open);
      h.setAttribute("aria-expanded", String(open));
      setTimeout(() => hasGsap && ScrollTrigger.refresh(), 750);
    });
  });
  if (hoverImg && finePointer) {
    let hx = 0, hy = 0, tx = 0, ty = 0, raf = null;
    const loop = () => { hx += (tx - hx) * 0.14; hy += (ty - hy) * 0.14; hoverImg.style.transform = `translate(${hx}px, ${hy}px)`; raf = requestAnimationFrame(loop); };
    $$(".svc__row[data-img]").forEach((row) => {
      row.addEventListener("mouseenter", () => {
        hoverImg.innerHTML = row.dataset.img.startsWith("ph:") ? `<div class="ph"><span class="ph__name">${esc(row.dataset.img.slice(3))}</span></div>` : `<img src="${row.dataset.img}" alt="">`;
        hoverImg.classList.add("is-on");
        if (!raf) loop();
      });
      row.addEventListener("mouseleave", () => hoverImg.classList.remove("is-on"));
      row.addEventListener("mousemove", (e) => { tx = e.clientX + 30; ty = e.clientY - hoverImg.offsetHeight / 2; });
    });
  }

  /* ---------------------------------------------------------
     Cursor
     --------------------------------------------------------- */
  const cursor = $(".cursor");
  if (cursor && finePointer && !reduced) {
    const label = $(".cursor__label", cursor);
    let x = -100, y = -100, cx = -100, cy = -100;
    window.addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
    const tick = () => { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; cursor.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(tick); };
    tick();
    document.addEventListener("mouseover", (e) => {
      const c = e.target.closest("[data-cursor]");
      const l = e.target.closest("a, button, summary, label");
      cursor.classList.toggle("is-label", !!c);
      cursor.classList.toggle("is-link", !c && !!l);
      if (c) label.textContent = c.dataset.cursor;
    });
  }

  /* ---------------------------------------------------------
     Forms (prototype: no backend yet)
     --------------------------------------------------------- */
  $$("form[data-form]").forEach((f) => {
    const tema = params.get("tema");
    if (tema) { const r = $(`input[name='tema'][value='${tema}']`, f); if (r) r.checked = true; }
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      f.classList.add("is-sent");
      $(".form__ok", f).focus();
    });
  });

  /* Year */
  $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* Go */
  const ready = () => requestAnimationFrame(() => { start(); hasGsap && ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]).then(ready);
  else window.addEventListener("load", ready);
})();
