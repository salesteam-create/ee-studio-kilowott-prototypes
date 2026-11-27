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
  const EN = doc.lang === "en";
  const BASE = doc.dataset.base || "";
  const T = (no, en) => (EN ? en : no);
  const L = (p, k) => (EN && p[k + "_en"]) || p[k];
  const U = (src) => BASE + src;
  const worldName = (w) => (w === "design" ? "Design" : T("Foto", "Photo"));
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
    body.classList.remove("menu-open"); burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", T("Åpne meny", "Open menu")); menu.setAttribute("aria-hidden", "true"); lenis && lenis.start();
  }
  burger.addEventListener("click", () => {
    if (body.classList.contains("menu-open")) return closeMenu();
    body.classList.add("menu-open"); burger.setAttribute("aria-expanded", "true"); burger.setAttribute("aria-label", T("Lukk meny", "Close menu")); menu.setAttribute("aria-hidden", "false"); lenis && lenis.stop();
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
      const th = p.images.slice(1, 3).map((im) => `<span class="ix__thumb" style="--ar:${(im.w / im.h).toFixed(3)}"><img src="${U(im.s)}" alt="" loading="lazy" decoding="async"></span>`).join("");
      return `<a class="ix" href="${href(p)}" data-world="${p.world}" data-cat="${esc(p.cat)}" data-cover="${U(p.images[0].s)}" data-reveal>
        <span class="ix__meta">${worldName(p.world)}<br>${esc(L(p, "cat"))}</span>${esc(L(p, "title"))}${th}</a>`;
    }).join("");
  });

  // Card grid (design page)
  $$("[data-grid]").forEach((grid) => {
    const w = grid.dataset.grid;
    grid.innerHTML = P.filter((p) => w === "all" || p.world === w).map((p) => {
      const im = p.images[0];
      return `<a class="card" href="${href(p)}" data-cat="${esc(L(p, "cat"))}" data-world="${p.world}" data-cursor="${T("Se", "View")}">
        <div class="card__img" data-clip><img src="${U(im.src)}" width="${im.w}" height="${im.h}" alt="${esc(L(p, "title"))}" loading="lazy" decoding="async"></div>
        <div class="card__row"><b>${esc(L(p, "title"))}</b><span class="muted">${w === "all" ? worldName(p.world) + ", " : ""}${esc(L(p, "cat"))}</span></div></a>`;
    }).join("");
  });

  // Album rail (foto page)
  $$("[data-albums]").forEach((track) => {
    track.innerHTML = P.filter((p) => p.world === "foto").map((p, i) => {
      const im = p.images[0];
      return `<a class="album" href="${href(p)}" data-i="${i}" data-name="${esc(L(p, "title"))}" data-cursor="${T("Åpne", "Open")}">
        <div class="album__img"><img src="${U(im.s)}" alt="${esc(L(p, "title"))}" loading="lazy" decoding="async"></div>
        <div class="album__cap"><span>${esc(L(p, "cat"))}</span><span>${pad(p.images.length)} ${T("bilder", "images")}</span></div></a>`;
    }).join("");
  });

  // Horizontal gallery (landing)
  $$("[data-hgal-list]").forEach((track) => {
    const list = track.dataset.hgalList.split(",").map(bySlug).filter(Boolean);
    track.innerHTML = list.map((p, i) => {
      const im = p.images[0];
      return `<a class="hg" href="${href(p)}" data-cursor="${T("Se", "View")}">
        <div class="hg__img" style="--ar:${(im.w / im.h).toFixed(3)}"><img src="${U(im.src)}" alt="${esc(L(p, "title"))}" loading="lazy" decoding="async"></div>
        <div class="hg__cap"><span class="hg__n">${pad(i + 1)}</span><span class="t-md">${esc(L(p, "title"))}</span><span class="small">${worldName(p.world)}, ${esc(L(p, "cat"))}</span></div></a>`;
    }).join("") + `<a class="hg hg--end" href="arbeid.html"><span class="link link--accent t-md">${T("Alt arbeid", "All work")} <span class="arrow" aria-hidden="true"></span></span></a>`;
    const tot = $("[data-hgal-total]"); if (tot) tot.textContent = pad(list.length);
  });

  // Filters (arbeid + design grid). Bars that target the same grid share state, so path + category combine.
  const fstate = new Map();
  $$("[data-filter]").forEach((bar) => {
    const target = $(bar.dataset.filter);
    if (!target) return;
    const key = bar.dataset.key || "cat";
    const items = () => $$(".ix, .card", target);
    if (!fstate.has(target)) fstate.set(target, { state: {}, bars: [] });
    const F = fstate.get(target);
    F.bars.push({ bar, key });
    if (bar.dataset.auto !== undefined) {
      const values = Array.from(new Set(items().map((el) => el.dataset[key])));
      bar.innerHTML = `<button type="button" data-v="" aria-pressed="true">${T("Alle", "All")}</button>` + values.map((v) => `<button type="button" data-v="${esc(v)}" aria-pressed="false">${esc(v)}</button>`).join("");
    }
    const apply = () => {
      let n = 0;
      items().forEach((el) => {
        const ok = Object.entries(F.state).every(([k, v]) => !v || el.dataset[k] === v);
        el.hidden = !ok; if (ok) n++;
      });
      F.bars.forEach(({ bar: b, key: k }) => {
        // hide category buttons that have no match in the current path
        $$("button", b).forEach((btn) => {
          btn.setAttribute("aria-pressed", String((F.state[k] || "") === btn.dataset.v));
          if (k === "cat" && btn.dataset.v) btn.hidden = !items().some((el) => el.dataset.cat === btn.dataset.v && (!F.state.world || el.dataset.world === F.state.world));
        });
      });
      const count = $("[data-count]");
      if (count) count.textContent = `${n} ${T("prosjekter", "projects")}`;
      G && ScrollTrigger.refresh();
    };
    bar.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      F.state[key] = b.dataset.v;
      if (key === "world") F.state.cat = "";
      apply();
    });
    const init = params.get(key === "world" ? "spor" : key);
    if (init) F.state[key] = init;
    apply();
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
    document.title = `${L(p, "title")} | EE Studio`;
    body.dataset.theme = p.world === "foto" ? "dark" : "light";
    const set = (k, v) => $$(`[data-ap-${k}]`).forEach((el) => { el.innerHTML = v; });
    set("title", esc(L(p, "title"))); set("desc", esc(L(p, "desc"))); set("client", esc(L(p, "client"))); set("cat", esc(L(p, "cat"))); set("year", esc(p.year));
    $$("[data-ap-cta]").forEach((a) => { a.href = `kontakt.html?tema=${p.world}`; });
    set("world", worldName(p.world)); set("total", pad(p.images.length));
    $$("[data-ap-back]").forEach((a) => { a.href = p.world === "foto" ? "foto.html" : "design.html"; a.innerHTML = `${worldName(p.world)}`; });
    $("[data-ap-col]").innerHTML = p.images.map((im, i) => `<figure data-n="${i}"><img src="${U(im.src)}" width="${im.w}" height="${im.h}" alt="${esc(L(p, "title"))}, ${T("bilde", "image")} ${i + 1}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async"></figure>`).join("");
    $("[data-ap-side]").innerHTML = p.images.map((im, i) => `<button type="button" data-n="${i}" aria-label="${T("Bilde", "Image")} ${i + 1}"><img src="${U(im.s)}" alt=""></button>`).join("");
    const nx = $("[data-ap-next]"); nx.href = href(next); $("[data-ap-next-title]").textContent = L(next, "title");
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
    const slides = $$(".lhero__slide", hero);
    const cap = $("[data-hero-cap]", hero);
    const barsEl = $("[data-hero-bars]", hero);
    const links = $$("[data-hero-set]", hero);
    const DUR = 4200;
    let set = "all", i = 0, timer = 0;
    const pool = () => slides.filter((s) => set === "all" || s.dataset.set === set);
    const show = (k) => {
      const list = pool(); i = (k + list.length) % list.length;
      const prev = slides.find((s) => s.classList.contains("is-on"));
      slides.forEach((s) => s.classList.remove("is-prev", "is-on"));
      if (prev) prev.classList.add("is-prev");
      list[i].classList.add("is-on");
      cap.textContent = list[i].dataset.name;
      barsEl.innerHTML = list.map((_, j) => `<i class="${j < i ? "is-done" : j === i ? "is-on" : ""}" style="--dur:${DUR}ms"></i>`).join("");
    };
    const play = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => show(i + 1), DUR); };
    links.forEach((a) => {
      const on = () => { if (set === a.dataset.heroSet) return; set = a.dataset.heroSet; links.forEach((l) => l.classList.toggle("is-on", l === a)); show(0); play(); };
      a.addEventListener("mouseenter", on); a.addEventListener("focus", on);
    });
    const nav = $(".lhero__choices", hero);
    if (nav && links.length) nav.addEventListener("mouseleave", () => { set = "all"; links.forEach((l) => l.classList.remove("is-on")); show(0); play(); });
    show(0); play();
    document.addEventListener("visibilitychange", () => (document.hidden ? clearInterval(timer) : play()));
  }

  /* Paths: hover swaps image */
  $$("[data-paths]").forEach((wrap) => {
    const rows = $$(".paths__row, .svc__row", wrap);
    const imgs = $$("[data-paths-img] img", wrap);
    const on = (r) => { const n = rows.indexOf(r); rows.forEach((x) => x.classList.toggle("is-on", x === r)); imgs.forEach((im, j) => im.classList.toggle("is-on", j === n)); };
    rows.forEach((r) => { r.addEventListener("mouseenter", () => on(r)); r.addEventListener("focus", () => on(r)); if (r.tagName === "BUTTON") r.addEventListener("click", () => on(r)); });
    on(rows[0]);
  });

  /* Remember the chosen path (design / foto) so About can follow the hero choice */
  const remember = (w) => { try { localStorage.setItem("ee-path", w); } catch (e) { /* private mode */ } };
  if (body.dataset.page === "tjenester") remember(location.pathname.includes("foto") ? "foto" : "design");
  $$("[data-hero-set]").forEach((a) => a.addEventListener("click", () => remember(a.dataset.heroSet)));
  const remembered = () => { try { return localStorage.getItem("ee-path"); } catch (e) { return null; } };

  /* Bio tabs (about) */
  $$("[data-bio]").forEach((wrap) => {
    const btns = $$(".tabs button", wrap);
    const select = (v) => { btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === v))); $$("[data-bio-v]", wrap).forEach((el) => { el.hidden = el.dataset.bioV !== v; }); };
    btns.forEach((b) => b.addEventListener("click", () => select(b.dataset.v)));
    const pick = params.get("spor") || remembered();
    select(pick === "design" ? "design" : "foto");
  });

  /* Foto service picker: Bedrift / Privat */
  $$("[data-picker]").forEach((pk) => {
    const segBtns = $$(".seg2 button", pk);
    const choose = (btn) => {
      const list = btn.closest("[role='tablist']");
      $$("[role='tab']", list).forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
      $$("[data-picker-panel]", pk).forEach((p) => { p.hidden = p.id !== btn.getAttribute("aria-controls"); });
      const panel = $(`#${btn.getAttribute("aria-controls")}`);
      if (panel && G && !reduced) gsap.fromTo(panel.children, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .06, ease: "expo.out", clearProps: "transform,opacity" });
    };
    const group = (g) => {
      segBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.grp === g)));
      $$(".picker__list", pk).forEach((l) => { l.hidden = l.dataset.show !== g; });
      const list = $(`.picker__list[data-show='${g}']`, pk);
      choose($("[role='tab']", list));
    };
    segBtns.forEach((b) => b.addEventListener("click", () => group(b.dataset.grp)));
    pk.addEventListener("click", (e) => { const b = e.target.closest("[role='tab']"); if (b) choose(b); });
    if (fine) pk.addEventListener("mouseover", (e) => { const b = e.target.closest("[role='tab']"); if (b && b.getAttribute("aria-selected") !== "true") choose(b); });
    $$("[data-grp-link]").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault(); group(a.dataset.grpLink);
      const y = pk.getBoundingClientRect().top + scrollY - 70;
      lenis ? lenis.scrollTo(y, { duration: 1.2 }) : scrollTo({ top: y, behavior: "smooth" });
    }));
    if (params.get("kunde") === "privat") group("privat");
  });

  /* Drop section: "visuell kommunikasjon" drops into each discipline */
  const drop = $("[data-drop]");
  if (drop) {
    const words = $$(".drop__word", drop), texts = $$(".drop__text", drop), imgs = $$(".drop__img img", drop), steps = $$(".drop__step", drop);
    const n = words.length; let cur = -1; let st = null;
    const set = (k) => {
      if (k === cur) return;
      const dir = k > cur ? 1 : -1, anim = G && !reduced && cur >= 0;
      words.forEach((w, j) => {
        if (!G) { w.style.transform = j === k ? "none" : "translateY(-140%)"; return; }
        if (j === k) anim ? gsap.fromTo(w, { yPercent: -140 * dir }, { yPercent: 0, duration: .9, ease: "expo.out", overwrite: true }) : gsap.set(w, { yPercent: 0 });
        else if (j === cur && anim) gsap.to(w, { yPercent: 140 * dir, duration: .7, ease: "expo.out", overwrite: true });
        else gsap.set(w, { yPercent: -140, overwrite: true });
      });
      imgs.forEach((im, j) => { im.classList.toggle("was", j === cur); im.classList.toggle("is-on", j === k); });
      texts.forEach((t, j) => t.classList.toggle("is-on", j === k));
      steps.forEach((t, j) => { t.classList.toggle("is-on", j === k); t.setAttribute("aria-pressed", String(j === k)); });
      cur = k;
    };
    set(0);
    steps.forEach((b, k) => b.addEventListener("click", () => {
      if (st) { const y = st.start + (st.end - st.start) * ((k + 0.5) / n); lenis ? lenis.scrollTo(y, { duration: 1 }) : scrollTo({ top: y }); }
      else set(k);
    }));
    if (G && !reduced) {
      st = ScrollTrigger.create({ trigger: drop, start: "top top", end: () => `+=${innerHeight * (n - 1) * 0.7}`, pin: $(".drop__pin", drop), anticipatePin: 1,
        onUpdate: (self) => set(Math.min(n - 1, Math.floor(self.progress * n))) });
    }
  }

  /* Form (prototype: no backend yet) */
  $$("form[data-form]").forEach((f) => {
    const t = params.get("tema"); if (t) { const r = $(`input[name='tema'][value='${t}']`, f); if (r) r.checked = true; }
    // Inline inputs grow with their content
    $$("[data-grow]", f).forEach((inp) => {
      const fit = () => { if (matchMedia("(max-width: 900px)").matches) { inp.style.width = ""; return; } const n = Math.max(inp.value.length, inp.placeholder.length * 0.92, 6); inp.style.width = `${n + 1}ch`; };
      inp.addEventListener("input", fit); fit();
    });
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      const nm = (f.elements.navn && f.elements.navn.value.trim().split(" ")[0]) || "";
      const out = $("[data-thanks-name]", f); if (out && nm) out.textContent = `, ${nm}`;
      f.classList.add("is-sent");
      const ok = $(".madlib__ok, .form__ok", f); ok && ok.focus();
    });
  });

  /* Back button: real history when we came from this site, otherwise the parent page */
  $$("[data-back]").forEach((a) => a.addEventListener("click", (e) => {
    let same = false;
    try { same = document.referrer && new URL(document.referrer).origin === location.origin; } catch (err) { same = false; }
    if (same && history.length > 1) { e.preventDefault(); e.stopPropagation(); body.classList.add("is-leaving"); setTimeout(() => history.back(), reduced ? 0 : 380); }
  }, true));

  /* Language switch keeps the current query (project, filters) */
  $$("[data-lang]").forEach((a) => { if (location.search) a.href = a.getAttribute("href") + location.search; });

  /* Price tabs */
  $$("[data-tabs]").forEach((wrap) => {
    const tabs = $$("[data-tab]", wrap);
    const select = (v) => {
      tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.tab === v)));
      $$("[data-panel]", wrap).forEach((p) => { p.hidden = p.dataset.panel !== v; });
      const vis = $(`[data-panel='${v}']`, wrap);
      if (vis && G && !reduced) gsap.fromTo($$(".pkg", vis), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .08, ease: "expo.out", clearProps: "transform,opacity" });
      G && ScrollTrigger.refresh();
    };
    tabs.forEach((t) => t.addEventListener("click", () => select(t.dataset.tab)));
    const spor = params.get("spor"), kunde = params.get("kunde");
    select(spor === "design" ? "design" : kunde === "privat" ? "foto-privat" : "foto-bedrift");
  });

  /* Drag to scroll (reviews) */
  $$("[data-drag]").forEach((el) => {
    let down = false, sx = 0, sl = 0, moved = false;
    el.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl = el.scrollLeft; el.classList.add("is-drag"); });
    addEventListener("pointermove", (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; el.scrollLeft = sl - dx; });
    addEventListener("pointerup", () => { down = false; el.classList.remove("is-drag"); });
    el.addEventListener("click", (e) => { if (moved) e.preventDefault(); }, true);
  });

  /* Magnetic CTA buttons */
  if (fine && !reduced) $$("[data-magnet]").forEach((b) => {
    b.addEventListener("mousemove", (e) => { const r = b.getBoundingClientRect(); const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; b.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`; });
    b.addEventListener("mouseleave", () => { b.style.transform = ""; });
  });

  /* Year */
  $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

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

    // Hero: image drifts slower than the page, copy lifts away
    if ($(".lhero")) {
      gsap.to(".lhero__slides", { yPercent: 18, ease: "none", scrollTrigger: { trigger: ".lhero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".lhero__body, .lhero__top", { y: -60, opacity: 0, ease: "none", scrollTrigger: { trigger: ".lhero", start: "30% top", end: "90% top", scrub: true } });
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

    // Stacked showcase: each card slides over the previous one, no fading
    const stack = $$(".stack__item");
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

    // Horizontal gallery: vertical scroll drives sideways travel, images parallax inside their frames
    const hgal = $("[data-hgal]");
    if (hgal) {
      const track = $(".hgal__track", hgal);
      const items = $$(".hg:not(.hg--end)", track);
      const cur = $("[data-hgal-cur]", hgal);
      const bar = $(".hgal__bar span", hgal);
      gsap.matchMedia().add("(min-width: 901px)", () => {
        const dist = () => Math.max(0, track.scrollWidth - innerWidth);
        const tl = gsap.to(track, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: hgal, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true,
          onUpdate: (st) => { bar.style.transform = `scaleX(${st.progress})`; cur.textContent = pad(Math.min(items.length, 1 + Math.floor(st.progress * items.length))); } } });
        const par = items.map((it) => gsap.fromTo($("img", it), { xPercent: 5 }, { xPercent: -5, ease: "none", scrollTrigger: { trigger: it, containerAnimation: tl, start: "left right", end: "right left", scrub: true } }));
        return () => { tl.kill(); par.forEach((x) => x.kill()); };
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
