/* EE Studio v2, interactions. GSAP + ScrollTrigger + Lenis.
   Every page reads fine without JS; motion is an enhancement. */
(() => {
  "use strict";
  const doc = document.documentElement;
  const body = document.body;
  doc.classList.add("js");
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const G = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const params = new URLSearchParams(location.search);
  const P = window.EE_PROJECTS || [];
  const bySlug = (s) => P.find((p) => p.slug === s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const worldName = (w) => (w === "design" ? "Design" : "Foto");
  if (G) gsap.registerPlugin(ScrollTrigger);

  /* Smooth scroll */
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09 });
    if (G) { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const r = (t) => { lenis.raf(t); requestAnimationFrame(r); }; requestAnimationFrame(r); }
  }

  /* Page transitions */
  const go = (href) => { if (reduced) { location.href = href; return; } body.classList.add("is-leaving"); setTimeout(() => { location.href = href; }, 460); };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || !/\.html$|\/$/.test(u.pathname)) return;
    if (u.pathname === location.pathname && u.search === location.search) return;
    e.preventDefault(); closeMenu(); go(u.href);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) body.classList.remove("is-leaving"); });

  /* Header */
  const hdr = $("[data-hdr]");
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    hdr.classList.toggle("is-solid", y > 40 && body.dataset.theme !== "dark");
    if (y > lastY + 4 && y > 300 && !body.classList.contains("menu-open")) hdr.classList.add("is-hidden");
    else if (y < lastY - 4 || y < 300) hdr.classList.remove("is-hidden");
    lastY = y;
    const mid = 30;
    const dark = $$("[data-dark]").some((el) => { const r = el.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
    hdr.classList.toggle("on-dark", dark);
  };
  addEventListener("scroll", onScroll, { passive: true });

  /* Menu */
  const burger = $(".burger");
  const menu = $("#menu");
  function closeMenu() {
    if (!body.classList.contains("menu-open")) return;
    body.classList.remove("menu-open"); burger.setAttribute("aria-expanded", "false"); burger.textContent = "Meny"; menu.setAttribute("aria-hidden", "true"); lenis && lenis.start();
  }
  burger.addEventListener("click", () => {
    if (body.classList.contains("menu-open")) return closeMenu();
    body.classList.add("menu-open"); burger.setAttribute("aria-expanded", "true"); burger.textContent = "Lukk"; menu.setAttribute("aria-hidden", "false"); lenis && lenis.stop();
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  /* Cursor label */
  const cursor = $(".cursor");
  if (cursor && fine && !reduced) {
    const lab = $("span", cursor);
    let x = -200, y = -200, cx = x, cy = y;
    addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
    const tick = () => { cx += (x - cx) * 0.18; cy += (y - cy) * 0.18; cursor.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(tick); };
    tick();
    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest("[data-cursor]");
      cursor.classList.toggle("is-on", !!t);
      if (t) lab.textContent = t.dataset.cursor;
    });
  }

  /* ---------------------------------------------------------
     Renderers
     --------------------------------------------------------- */
  const href = (p) => `prosjekt.html?p=${p.slug}`;

  // Typographic index (landing + arbeid)
  $$("[data-index]").forEach((list) => {
    const slugs = list.dataset.index ? list.dataset.index.split(",") : P.map((p) => p.slug);
    list.innerHTML = slugs.map(bySlug).filter(Boolean).map((p) => {
      const th = p.images.slice(1, 3).map((im) => `<span class="ix__thumb" style="--ar:${(im.w / im.h).toFixed(3)}"><img src="${im.s}" alt="" loading="lazy" decoding="async"></span>`).join("");
      return `<a class="ix" href="${href(p)}" data-world="${p.world}" data-cat="${esc(p.cat)}" data-cover="${p.images[0].s}" data-reveal>
        <span class="ix__meta">${worldName(p.world)}<br>${esc(p.cat)}</span>${esc(p.title)}${th}</a>`;
    }).join("");
  });

  // Card grid (design page)
  $$("[data-grid]").forEach((grid) => {
    const w = grid.dataset.grid;
    grid.innerHTML = P.filter((p) => p.world === w).map((p) => {
      const im = p.images[0];
      return `<a class="card" href="${href(p)}" data-cat="${esc(p.cat)}" data-cursor="Se">
        <div class="card__img" data-clip><img src="${im.src}" width="${im.w}" height="${im.h}" alt="${esc(p.title)}" loading="lazy" decoding="async"></div>
        <div class="card__row"><b>${esc(p.title)}</b><span class="muted">${esc(p.cat)}</span></div></a>`;
    }).join("");
  });

  // Album rail (foto page)
  $$("[data-albums]").forEach((track) => {
    track.innerHTML = P.filter((p) => p.world === "foto").map((p, i) => {
      const im = p.images[0];
      return `<a class="album" href="${href(p)}" data-i="${i}" data-name="${esc(p.title)}" data-cursor="Åpne">
        <div class="album__img"><img src="${im.s}" alt="${esc(p.title)}" loading="lazy" decoding="async"></div>
        <div class="album__cap"><span>${esc(p.cat)}</span><span>${pad(p.images.length)} bilder</span></div></a>`;
    }).join("");
  });

  // Filters (arbeid + design grid)
  $$("[data-filter]").forEach((bar) => {
    const target = $(bar.dataset.filter);
    const key = bar.dataset.key || "cat";
    const items = () => $$(".ix, .card", target);
    const values = Array.from(new Set(items().map((el) => el.dataset[key])));
    if (bar.dataset.auto !== undefined) {
      bar.innerHTML = `<button type="button" data-v="" aria-pressed="true">Alle</button>` + values.map((v) => `<button type="button" data-v="${esc(v)}" aria-pressed="false">${esc(v)}</button>`).join("");
    }
    const count = $("[data-count]");
    const apply = (v) => {
      $$("button", bar).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === v)));
      let n = 0;
      items().forEach((el) => { const ok = !v || el.dataset[key] === v; el.hidden = !ok; if (ok) n++; });
      if (count) count.textContent = `${n} prosjekter`;
      G && ScrollTrigger.refresh();
    };
    bar.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) apply(b.dataset.v); });
    apply(params.get(key === "world" ? "spor" : key) || "");
  });

  // Hover preview for index rows
  const preview = $(".preview");
  if (preview && fine) {
    const img = $("img", preview);
    let x = 0, y = 0, px = 0, py = 0, raf = 0;
    const loop = () => { px += (x - px) * 0.15; py += (y - py) * 0.15; preview.style.transform = `translate(${px}px, ${py}px)`; raf = requestAnimationFrame(loop); };
    $$(".ix").forEach((row) => {
      row.addEventListener("mouseenter", () => { img.src = row.dataset.cover; preview.classList.add("is-on"); if (!raf) loop(); });
      row.addEventListener("mouseleave", () => preview.classList.remove("is-on"));
      row.addEventListener("mousemove", (e) => { x = e.clientX + 24; y = e.clientY - preview.offsetHeight / 2; });
    });
  }

  // Album / project page
  const ap = $("[data-ap]");
  if (ap) {
    const p = bySlug(params.get("p")) || P[0];
    const list = P.filter((q) => q.world === p.world);
    const next = list[(list.indexOf(p) + 1) % list.length];
    document.title = `${p.title} | EE Studio`;
    body.dataset.theme = p.world === "foto" ? "dark" : "light";
    const set = (k, v) => $$(`[data-ap-${k}]`).forEach((el) => { el.innerHTML = v; });
    set("title", esc(p.title)); set("desc", esc(p.desc)); set("client", esc(p.client)); set("cat", esc(p.cat)); set("year", esc(p.year));
    set("world", worldName(p.world)); set("total", pad(p.images.length));
    $$("[data-ap-back]").forEach((a) => { a.href = p.world === "foto" ? "foto.html" : "design.html"; a.innerHTML = `${worldName(p.world)}`; });
    $("[data-ap-col]").innerHTML = p.images.map((im, i) => `<figure data-n="${i}"><img src="${im.src}" width="${im.w}" height="${im.h}" alt="${esc(p.title)}, bilde ${i + 1}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async"></figure>`).join("");
    $("[data-ap-side]").innerHTML = p.images.map((im, i) => `<button type="button" data-n="${i}" aria-label="Bilde ${i + 1}"><img src="${im.s}" alt=""></button>`).join("");
    const nx = $("[data-ap-next]"); nx.href = href(next); $("[data-ap-next-title]").textContent = next.title;
    const cur = $("[data-ap-cur]");
    const figs = $$("[data-ap-col] figure");
    const thumbs = $$("[data-ap-side] button");
    const io2 = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (!en.isIntersecting) return;
      const n = +en.target.dataset.n;
      cur.textContent = pad(n + 1);
      thumbs.forEach((t, i) => t.classList.toggle("is-on", i === n));
    }), { rootMargin: "-45% 0px -45% 0px" });
    figs.forEach((f) => io2.observe(f));
    thumbs.forEach((t) => t.addEventListener("click", () => {
      const f = figs[+t.dataset.n]; const y = f.getBoundingClientRect().top + scrollY - innerHeight * 0.2;
      lenis ? lenis.scrollTo(y, { duration: 1.2 }) : scrollTo({ top: y, behavior: "smooth" });
    }));
  }

  /* ---------------------------------------------------------
     Landing hero slideshow (Design / Foto hover teasers)
     --------------------------------------------------------- */
  const hero = $("[data-hero]");
  if (hero) {
    const slides = $$(".hero__slide", hero);
    const cap = $("[data-hero-cap]");
    const num = $("[data-hero-num]");
    const links = $$("[data-hero-set]");
    let set = "all", i = 0, timer = 0;
    const pool = () => slides.filter((s) => set === "all" || s.dataset.set === set);
    const show = (k) => {
      const list = pool(); i = (k + list.length) % list.length;
      slides.forEach((s) => s.classList.toggle("is-on", s === list[i]));
      cap.textContent = list[i].dataset.name;
      num.textContent = `${pad(i + 1)} / ${pad(list.length)}`;
    };
    const play = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => show(i + 1), 3600); };
    links.forEach((a) => {
      const on = () => { if (set === a.dataset.heroSet) return; set = a.dataset.heroSet; links.forEach((l) => l.classList.toggle("is-on", l === a)); show(0); play(); };
      a.addEventListener("mouseenter", on); a.addEventListener("focus", on);
    });
    $(".hero__paths").addEventListener("mouseleave", () => { set = "all"; links.forEach((l) => l.classList.remove("is-on")); play(); });
    show(0); play();
  }

  /* Paths: hover swaps image */
  $$("[data-paths]").forEach((wrap) => {
    const rows = $$(".paths__row, .svc__row", wrap);
    const imgs = $$("[data-paths-img] img", wrap);
    const on = (r) => { const n = rows.indexOf(r); rows.forEach((x) => x.classList.toggle("is-on", x === r)); imgs.forEach((im, j) => im.classList.toggle("is-on", j === n)); };
    rows.forEach((r) => { r.addEventListener("mouseenter", () => on(r)); r.addEventListener("focus", () => on(r)); if (r.tagName === "BUTTON") r.addEventListener("click", () => on(r)); });
    on(rows[0]);
  });

  /* Bio tabs (about) */
  $$("[data-bio]").forEach((wrap) => {
    const btns = $$(".tabs button", wrap);
    const select = (v) => { btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === v))); $$("[data-bio-v]", wrap).forEach((el) => { el.hidden = el.dataset.bioV !== v; }); };
    btns.forEach((b) => b.addEventListener("click", () => select(b.dataset.v)));
    select(params.get("spor") === "design" ? "design" : "foto");
  });

  /* Form (prototype: no backend yet) */
  $$("form[data-form]").forEach((f) => {
    const t = params.get("tema"); if (t) { const r = $(`input[value='${t}']`, f); if (r) r.checked = true; }
    f.addEventListener("submit", (e) => { e.preventDefault(); if (!f.checkValidity()) { f.reportValidity(); return; } f.classList.add("is-sent"); });
  });

  /* ---------------------------------------------------------
     Reveal + scroll choreography
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

  const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });

  function start() {
    body.classList.remove("is-loading"); body.classList.add("is-ready");
    onScroll();
    $$("[data-stagger]").forEach((w) => Array.from(w.children).forEach((c, i) => c.style.setProperty("--d", `${i * 90}ms`)));
    $$("[data-reveal], [data-clip]").forEach((el) => io.observe(el));
    if (!G || reduced) { $$(".statement__text .w").forEach((w) => w.classList.add("is-lit")); return; }

    // Headlines
    $$("[data-split]").forEach((el) => {
      const lines = splitLines(el);
      const top = el.getBoundingClientRect().top < innerHeight;
      gsap.from(lines, { yPercent: 115, duration: 1.3, ease: "expo.out", stagger: 0.08, delay: top ? 0.35 : 0, scrollTrigger: top ? null : { trigger: el, start: "top 88%", once: true } });
    });

    // Hero: frame opens to full bleed, wordmark drifts
    const frame = $(".hero__frame");
    if (frame) {
      gsap.to(frame, { marginLeft: 0, marginRight: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero__mark", { yPercent: 40, opacity: 0.2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.from(".hero__mark .wordmark", { yPercent: 60, opacity: 0, duration: 1.6, ease: "expo.out", delay: 0.2 });
    }

    // Statement: words light up as you read
    const st = $(".statement__text");
    if (st && !st.dataset.done) {
      st.dataset.done = 1;
      st.innerHTML = st.textContent.trim().split(/\s+/).map((w) => `<span class="w">${esc(w)}</span>`).join(" ");
      const ws = $$(".w", st);
      ScrollTrigger.create({ trigger: st, start: "top 80%", end: "bottom 45%", scrub: true, onUpdate: (s) => { const n = Math.round(s.progress * ws.length); ws.forEach((w, i) => w.classList.toggle("is-lit", i < n)); } });
      $$(".floater").forEach((f, i) => gsap.fromTo(f, { y: 80 * (i + 1) }, { y: -80 * (i + 1), ease: "none", scrollTrigger: { trigger: ".statement", start: "top bottom", end: "bottom top", scrub: true } }));
    }

    // Stacked showcase: previous card recedes as the next covers it
    const stack = $$(".stack__item");
    stack.forEach((it, i) => {
      if (i === stack.length - 1) return;
      gsap.to($(".stack__card", it), { scale: 0.9, opacity: 0.35, ease: "none", scrollTrigger: { trigger: stack[i + 1], start: "top bottom", end: "top top", scrub: true } });
    });
    stack.forEach((it) => gsap.fromTo($("img", it), { scale: 1.15 }, { scale: 1, ease: "none", scrollTrigger: { trigger: it, start: "top bottom", end: "top top", scrub: true } }));

    // Full-bleed frames open up
    $$(".bleed__frame").forEach((f) => {
      gsap.fromTo(f, { clipPath: "inset(12% 8% 12% 8%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: f, start: "top 95%", end: "top 25%", scrub: true } });
      gsap.fromTo($("img", f), { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: { trigger: f, start: "top bottom", end: "bottom top", scrub: true } });
    });

    // Foto hero: fanned photos spread out on load and on scroll
    const fan = $$(".fhero__fan figure");
    if (fan.length) {
      const spots = [[-34, -18, -9], [30, -24, 7], [-26, 24, 5], [34, 20, -6], [4, 33, 3]];
      fan.forEach((f, i) => {
        const [x, y, r] = spots[i % spots.length];
        gsap.fromTo(f, { xPercent: 0, yPercent: 0, rotate: 0, scale: 0.8, opacity: 0 }, { x: () => innerWidth * x / 100, y: () => innerHeight * y / 100, rotate: r, scale: 1, opacity: 1, duration: 1.8, ease: "expo.out", delay: 0.25 + i * 0.07 });
        gsap.to(f, { y: () => innerHeight * y / 100 - 160 * (i % 2 ? 1 : 1.6), ease: "none", scrollTrigger: { trigger: ".fhero", start: "top top", end: "bottom top", scrub: true } });
      });
    }

    // Foto albums: horizontal travel + readout
    const albums = $("[data-albums-wrap]");
    if (albums) {
      const track = $(".albums__track", albums);
      const cards = $$(".album", track);
      const num = $("[data-readout-num]"); const name = $("[data-readout-name]");
      const setOn = (n) => { cards.forEach((c, j) => c.classList.toggle("is-on", j === n)); num.textContent = pad(n + 1); name.textContent = cards[n].dataset.name; };
      setOn(0);
      cards.forEach((c, j) => c.addEventListener("mouseenter", () => setOn(j)));
      gsap.matchMedia().add("(min-width: 901px)", () => {
        const dist = () => Math.max(0, track.scrollWidth - innerWidth);
        const tw = gsap.to(track, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: albums, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true, onUpdate: (s) => setOn(Math.min(cards.length - 1, Math.round(s.progress * (cards.length - 1)))) } });
        return () => tw.kill();
      });
    }
  }

  const ready = () => requestAnimationFrame(() => { start(); G && ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]).then(ready);
  else addEventListener("load", ready);
})();
