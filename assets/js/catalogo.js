/* =========================================================
   EQUITORQ · Catálogo
   Nivel 1: tarjetas por serie (filtros + buscador)
   Nivel 2: ventana de detalle de la serie (galería, descripción,
            características y tabla de modelos)
   Nivel 3: ficha técnica de cada modelo
   Datos en assets/data/ (catalogo.js + fichas/<SERIE>.js).
   Las fichas se cargan solo al abrir cada serie.
   ========================================================= */
(() => {
  "use strict";
  const CAT = window.EQ_CAT;
  if (!CAT) return;

  const VERSION = "20261125g";
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const short = (code, serie) => (code.startsWith(serie + "-") ? code.slice(serie.length + 1) : code);
  const bySerie = new Map(CAT.series.map((s) => [s.c, s]));
  CAT.series.forEach((s) => { s._q = norm([s.t, s.c, s.sub, s.cat, s.d, s.m.join(" ")].join(" ")); });

  /* ---------------------------------------------------------
     Lista de cotización (compartida con el formulario)
     --------------------------------------------------------- */
  const Quote = (() => {
    let items = [];
    const subs = [];
    try { items = JSON.parse(sessionStorage.getItem("eq-quote") || "[]"); } catch (e) { items = []; }
    const save = () => {
      try { sessionStorage.setItem("eq-quote", JSON.stringify(items)); } catch (e) { /* sin almacenamiento: solo en memoria */ }
      subs.forEach((f) => f());
    };
    return {
      list: () => items.slice(),
      has: (id) => items.some((i) => i.id === id),
      add(it) { if (!this.has(it.id)) { items.push(it); save(); } },
      remove(id) { items = items.filter((i) => i.id !== id); save(); },
      toggle(it) { this.has(it.id) ? this.remove(it.id) : this.add(it); },
      clear() { items = []; save(); },
      on(fn) { subs.push(fn); },
      /* Líneas listas para el mensaje de WhatsApp / correo */
      lines() {
        const out = [];
        const fam = items.filter((i) => i.kind === "familia").map((i) => i.label);
        if (fam.length) out.push(`Familias: ${fam.join(", ")}`);
        const ser = items.filter((i) => i.kind === "serie").map((i) => i.serie);
        if (ser.length) out.push(`Series completas: ${ser.join(", ")}`);
        const groups = new Map();
        items.filter((i) => i.kind === "modelo").forEach((i) => {
          if (!groups.has(i.serie)) groups.set(i.serie, []);
          groups.get(i.serie).push(short(i.label, i.serie));
        });
        groups.forEach((list, serie) => out.push(`${serie}: ${list.join(", ")}`));
        return out;
      },
    };
  })();
  window.EQQuote = Quote;

  const famItem = (name) => ({ id: "fam:" + name, kind: "familia", label: name });
  const serItem = (s) => ({ id: "ser:" + s.c, kind: "serie", serie: s.c, label: s.c });
  const modItem = (code, serie) => ({ id: "mod:" + code, kind: "modelo", serie, label: code });

  /* ---------------------------------------------------------
     Nivel 1 · Tarjetas, filtros y buscador
     --------------------------------------------------------- */
  const grid = $("#cat-grid");
  const catsBox = $("#cat-cats");
  const subsBox = $("#cat-subs");
  const countEl = $("#cat-count");
  const moreBtn = $("#cat-more");
  const searchEl = $("#cat-q");
  const STEP = 12;
  const state = { cat: "", sub: "", q: "", limit: STEP };

  function buildFilters() {
    const counts = {};
    CAT.series.forEach((s) => { counts[s.cat] = (counts[s.cat] || 0) + 1; });
    const btn = (label, attr, active) =>
      `<button type="button" class="filter${active ? " is-active" : ""}" ${attr} aria-pressed="${active}">${esc(label)}</button>`;
    catsBox.innerHTML =
      btn(`Todos (${CAT.series.length})`, 'data-fcat=""', !state.cat) +
      CAT.cats.map((c) => btn(`${c.n} (${counts[c.n]})`, `data-fcat="${esc(c.n)}"`, state.cat === c.n)).join("");
    const cat = CAT.cats.find((c) => c.n === state.cat);
    if (cat && cat.subs.length > 1) {
      subsBox.hidden = false;
      subsBox.innerHTML =
        btn("Todas", 'data-fsub=""', !state.sub) +
        cat.subs.map((n) => btn(n, `data-fsub="${esc(n)}"`, state.sub === n)).join("");
    } else {
      subsBox.hidden = true;
      subsBox.innerHTML = "";
    }
  }

  function matches() {
    const q = norm(state.q.trim());
    return CAT.series.filter((s) =>
      (!state.cat || s.cat === state.cat) &&
      (!state.sub || s.sub === state.sub) &&
      (!q || q.split(/\s+/).every((w) => s._q.includes(w)))
    );
  }

  function cardHTML(s) {
    const media = s.i
      ? `<img src="${s.i}" alt="${esc(s.t)}" width="388" height="300" loading="lazy" decoding="async">`
      : `<div class="cat-noimg" aria-hidden="true">${esc(s.c)}</div>`;
    return `<article class="cat-card">
      <div class="cat-media" data-open="${s.c}">${media}</div>
      <div class="cat-body">
        <p class="product-tag">${esc(s.sub)}</p>
        <h3>${esc(s.t)}</h3>
        <p class="cat-serie">SERIE <strong>${esc(s.c)}</strong> · ${plural(s.m.length, "modelo", "modelos")}</p>
        <p class="cat-desc">${esc(s.d)}</p>
        <button type="button" class="btn btn-outline btn-block" data-open="${s.c}">Ver detalle</button>
      </div>
    </article>`;
  }

  function renderGrid() {
    const list = matches();
    const limited = !state.cat && !state.sub && !state.q.trim();
    const shown = limited ? list.slice(0, state.limit) : list;
    grid.innerHTML = shown.length
      ? shown.map(cardHTML).join("")
      : `<p class="cat-empty">No encontramos equipos con ese criterio. Pruebe con otra palabra o escríbanos y le ayudamos a elegir.</p>`;
    countEl.textContent = list.length
      ? `Mostrando ${shown.length} de ${plural(list.length, "serie", "series")}`
      : "";
    moreBtn.hidden = !(limited && shown.length < list.length);
    moreBtn.textContent = `Ver más equipos (${list.length - shown.length} restantes)`;
  }

  function setFilter(cat, sub) {
    state.cat = cat || "";
    state.sub = sub || "";
    state.limit = STEP;
    buildFilters();
    renderGrid();
  }

  catsBox.addEventListener("click", (e) => {
    const b = e.target.closest("[data-fcat]");
    if (b) setFilter(b.dataset.fcat, "");
  });
  subsBox.addEventListener("click", (e) => {
    const b = e.target.closest("[data-fsub]");
    if (b) setFilter(state.cat, b.dataset.fsub);
  });
  searchEl.addEventListener("input", () => { state.q = searchEl.value; renderGrid(); });
  moreBtn.addEventListener("click", () => { state.limit += STEP; renderGrid(); });
  grid.addEventListener("click", (e) => {
    const o = e.target.closest("[data-open]");
    if (o) openSeries(o.dataset.open, o);
  });
  /* Los enlaces del hero preseleccionan la familia */
  document.querySelectorAll("a[data-cat]").forEach((a) =>
    a.addEventListener("click", () => { searchEl.value = ""; state.q = ""; setFilter(a.dataset.cat, ""); })
  );

  /* ---------------------------------------------------------
     Ventana (nivel 2 y 3)
     --------------------------------------------------------- */
  const modal = $("#cat-modal");
  const body = $("#cm-body");
  const backBtn = $("#cm-back");
  const codeEl = $("#cm-code");
  const foot = $("#cm-foot");
  const footN = $("#cm-foot-n");
  let current = null;       // { s, f }
  let detailScroll = 0;
  let lastTrigger = null;
  let view = "detail";

  const unitText = (u) => (u && u !== "M" && u !== "pulg" ? " " + u : "");
  const val = (v, u) => esc(v) + (v === "" || v == null ? "—" : esc(unitText(u)));

  function loadFicha(code) {
    return new Promise((resolve, reject) => {
      if (window.EQ_FICHAS && window.EQ_FICHAS[code]) return resolve(window.EQ_FICHAS[code]);
      const sc = document.createElement("script");
      sc.src = `assets/data/fichas/${code}.js?v=${VERSION}`;
      sc.onload = () => (window.EQ_FICHAS && window.EQ_FICHAS[code] ? resolve(window.EQ_FICHAS[code]) : reject(new Error("vacío")));
      sc.onerror = () => reject(new Error("no cargó"));
      document.head.appendChild(sc);
    });
  }

  function openModal() {
    if (!modal.open) {
      modal.showModal();
      document.documentElement.classList.add("modal-open");
    }
  }
  function closeModal() {
    if (modal.open) modal.close();
  }
  modal.addEventListener("close", () => {
    document.documentElement.classList.remove("modal-open");
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
  });
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  $("#cm-close").addEventListener("click", closeModal);
  $("#cm-foot-go").addEventListener("click", closeModal);
  backBtn.addEventListener("click", () => { if (current) showDetail(true); });

  async function openSeries(code, trigger) {
    const s = bySerie.get(code);
    if (!s) return;
    lastTrigger = trigger || lastTrigger;
    current = { s, f: null };
    codeEl.textContent = `Serie ${s.c}`;
    backBtn.hidden = true;
    body.innerHTML = `<p class="cm-loading">Cargando…</p>`;
    openModal();
    syncQuoteUI();
    try {
      current.f = await loadFicha(code);
      showDetail(false);
    } catch (err) {
      body.innerHTML = `<p class="cat-empty">No se pudo cargar la información de esta serie. Escríbanos por <a href="https://wa.me/59177970987">WhatsApp</a> y se la enviamos.</p>`;
    }
  }

  /* ----- Nivel 2: detalle de la serie ----- */
  function showDetail(restore) {
    const { s, f } = current;
    view = "detail";
    backBtn.hidden = true;
    codeEl.textContent = `Serie ${s.c}`;
    const gallery = [s.i, ...s.g].filter(Boolean);
    const main = gallery.length
      ? `<button type="button" class="cm-main" id="cm-main" aria-label="Ampliar imagen"><img id="cm-img" src="${gallery[0]}" alt="${esc(s.t)}"></button>`
      : `<div class="cm-main cm-main-empty"><span>${esc(s.c)}</span><small>Imagen no disponible por ahora</small></div>`;
    const thumbs = gallery.length > 1
      ? `<div class="cm-thumbs" role="group" aria-label="Imágenes de la serie">${gallery.map((g, i) =>
          `<button type="button" class="cm-thumb${i === 0 ? " is-active" : ""}" data-img="${g}" aria-label="Ver imagen ${i + 1} de ${gallery.length}"><img src="${g}" alt="" loading="lazy"></button>`).join("")}</div>`
      : "";
    const dk = Object.keys(f.dk).slice(0, 4);
    const head = `<tr><th scope="col" class="col-pick"><span class="sr-only">Elegir</span></th><th scope="col">Modelo</th>${dk.map((k) =>
      `<th scope="col">${esc(f.dk[k][0])}${f.dk[k][1] && unitText(f.dk[k][1]) ? ` <small>(${esc(f.dk[k][1])})</small>` : ""}</th>`).join("")}<th scope="col" class="col-act"><span class="sr-only">Ficha</span></th></tr>`;
    const rows = f.m.map((m) =>
      `<tr><td class="col-pick"><input type="checkbox" data-mod="${esc(m.c)}" aria-label="Agregar ${esc(m.c)} a mi cotización"></td>
       <th scope="row">${esc(m.c)}</th>${dk.map((k) => `<td>${esc(m.d[k] ?? "—")}</td>`).join("")}
       <td class="col-act"><button type="button" class="link-btn" data-ficha="${esc(m.c)}">Ficha técnica</button></td></tr>`).join("");

    body.innerHTML = `
      <div class="cm-top">
        <div class="cm-gallery">${main}${thumbs}</div>
        <div class="cm-info">
          <p class="product-tag">${esc(s.sub)} · ${esc(s.cat)}</p>
          <h3 id="cm-title">${esc(s.t)}</h3>
          <p class="cm-serie">SERIE <strong>${esc(s.c)}</strong> · ${plural(s.m.length, "modelo", "modelos")}</p>
          <p class="cm-lead">${esc(s.dl)}</p>
          <h4>Características generales</h4>
          <ul class="cm-feat">${s.f.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
          <button type="button" class="btn btn-primary" data-quote-serie>Agregar la serie a mi cotización</button>
        </div>
      </div>
      <h4 class="cm-h">Modelos de la serie</h4>
      <p class="small cm-note">Marque los modelos que le interesan y continúe a la cotización, o abra la ficha técnica de cada uno.</p>
      <div class="cm-tablewrap"><table class="cm-table"><thead>${head}</thead><tbody>${rows}</tbody></table></div>`;
    syncQuoteUI();
    if (restore) $(".cm-body").scrollTop = detailScroll; else $(".cm-body").scrollTop = 0;
  }

  /* ----- Nivel 3: ficha técnica del modelo ----- */
  function showFicha(code) {
    const { s, f } = current;
    const idx = f.m.findIndex((m) => m.c === code);
    const m = f.m[idx];
    if (!m) return;
    if (view === "detail") detailScroll = $(".cm-body").scrollTop;
    view = "ficha";
    backBtn.hidden = false;
    codeEl.textContent = `Serie ${s.c}`;

    const tiles = (keys, meta, data) => keys.filter((k) => data[k] !== undefined && data[k] !== "")
      .map((k) => `<div class="fi-tile"><dt>${esc(meta[k][0])}</dt><dd>${val(data[k], meta[k][1])}</dd></div>`).join("");
    const key = tiles(Object.keys(f.dk), f.dk, m.d);
    const cot = tiles(Object.keys(f.ck), f.ck, m.o);
    const draw = s.k.length
      ? `<section class="fi-sec"><h4>Dibujo de dimensiones</h4>
          <div class="fi-imgs">${s.k.map((k, i) => `<figure><img src="${k}" alt="Dibujo de dimensiones de la serie ${esc(s.c)} (${i + 1})" loading="lazy"></figure>`).join("")}</div>
          <p class="small">Dibujo de referencia de la serie. Las letras corresponden a las cotas de abajo.</p></section>`
      : "";
    let vari = "";
    if (m.v && m.v.length) {
      const vk = Object.keys(f.vk);
      vari = `<h5>Variantes del modelo</h5><div class="cm-tablewrap"><table class="cm-table"><thead><tr>${vk.map((k) =>
        `<th scope="col">${esc(f.vk[k][0])}${unitText(f.vk[k][1]) ? ` <small>(${esc(f.vk[k][1])})</small>` : ""}</th>`).join("")}</tr></thead><tbody>${m.v.map((r) =>
        `<tr>${vk.map((k) => `<td>${esc(r[k] ?? "—")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    }
    const cotSec = cot || vari
      ? `<section class="fi-sec"><h4>Cotas del modelo</h4>${cot ? `<dl class="fi-grid fi-grid-sm">${cot}</dl>` : ""}${vari}</section>`
      : "";
    const prev = f.m[idx - 1], next = f.m[idx + 1];

    body.innerHTML = `
      <header class="fi-head">
        <p class="product-tag">Ficha técnica · ${esc(s.t)}</p>
        <h3 id="cm-title">${esc(m.c)}</h3>
      </header>
      <section class="fi-sec"><h4>Datos principales</h4><dl class="fi-grid">${key}</dl></section>
      ${draw}
      ${cotSec}
      <div class="fi-actions">
        <button type="button" class="btn btn-primary" data-quote-model="${esc(m.c)}"></button>
        <span class="fi-nav">
          <button type="button" class="btn btn-outline" data-ficha="${prev ? esc(prev.c) : ""}" ${prev ? "" : "disabled"}>&larr; Anterior</button>
          <button type="button" class="btn btn-outline" data-ficha="${next ? esc(next.c) : ""}" ${next ? "" : "disabled"}>Siguiente &rarr;</button>
        </span>
      </div>`;
    $(".cm-body").scrollTop = 0;
    syncQuoteUI();
  }

  body.addEventListener("click", (e) => {
    const t = e.target;
    const fb = t.closest("[data-ficha]");
    if (fb && fb.dataset.ficha) return showFicha(fb.dataset.ficha);
    const th = t.closest("[data-img]");
    if (th) {
      $("#cm-img").src = th.dataset.img;
      body.querySelectorAll(".cm-thumb").forEach((b) => b.classList.toggle("is-active", b === th));
      return;
    }
    if (t.closest("#cm-main")) return zoom($("#cm-img").src);
    if (t.closest("[data-quote-serie]")) return Quote.toggle(serItem(current.s));
    const qm = t.closest("[data-quote-model]");
    if (qm) return Quote.toggle(modItem(qm.dataset.quoteModel, current.s.c));
  });
  body.addEventListener("change", (e) => {
    const c = e.target.closest("[data-mod]");
    if (c) Quote.toggle(modItem(c.dataset.mod, current.s.c));
  });

  /* Ampliar imagen */
  function zoom(src) {
    let z = $("#cat-zoom");
    if (!z) {
      z = document.createElement("dialog");
      z.id = "cat-zoom";
      z.className = "cat-zoom";
      z.innerHTML = `<button type="button" class="cm-close" aria-label="Cerrar imagen">&times;</button><img alt="">`;
      z.addEventListener("click", () => z.close());
      document.body.appendChild(z);
    }
    $("img", z).src = src;
    z.showModal();
  }

  /* ---------------------------------------------------------
     Sincronía de la lista de cotización
     --------------------------------------------------------- */
  const pill = document.createElement("a");
  pill.className = "quote-pill";
  pill.href = "#contacto";
  pill.hidden = true;
  document.body.appendChild(pill);

  const picked = $("#eq-picked");
  const famChecks = [];
  if (picked) picked.addEventListener("click", (e) => {
    const b = e.target.closest("[data-rm]");
    if (b) Quote.remove(b.dataset.rm);
  });

  /* ---------- Desplegable de equipos del formulario (búsqueda + selección múltiple) ---------- */
  const combo = $("#eq-combo");
  const trigger = $("#eq-trigger");
  const panel = $("#eq-panel");
  const search = $("#eq-search");
  const list = $("#eq-list");
  const MAX_MODELS = 60;

  function comboRender() {
    const q = norm(search.value.trim());
    const words = q ? q.split(/\s+/) : [];
    let html = "";
    let lastCat = "";
    let modelsShown = 0, modelsMore = false;
    CAT.series.forEach((s) => {
      if (words.length && !words.every((w) => s._q.includes(w))) return;
      if (s.cat !== lastCat) { lastCat = s.cat; html += `<p class="eq-group">${esc(s.cat)}</p>`; }
      const sid = "ser:" + s.c;
      html += `<label class="eq-opt"><input type="checkbox" data-id="${esc(sid)}" data-kind="serie" data-serie="${esc(s.c)}"${Quote.has(sid) ? " checked" : ""}>
        <span><strong>${esc(s.t)}</strong><small>Serie ${esc(s.c)} · ${esc(s.sub)} · ${plural(s.m.length, "modelo", "modelos")} (serie completa)</small></span></label>`;
      if (words.length) {
        s.m.forEach((m) => {
          if (!words.every((w) => norm(m).includes(w))) return;
          if (modelsShown >= MAX_MODELS) { modelsMore = true; return; }
          modelsShown++;
          const mid = "mod:" + m;
          html += `<label class="eq-opt eq-opt-model"><input type="checkbox" data-id="${esc(mid)}" data-kind="modelo" data-serie="${esc(s.c)}" data-label="${esc(m)}"${Quote.has(mid) ? " checked" : ""}>
            <span><strong>${esc(s.t)}</strong><small>Modelo ${esc(m)} · serie ${esc(s.c)}</small></span></label>`;
        });
      }
    });
    if (!html) html = `<p class="eq-none">No hay equipos con ese criterio. Pruebe con otra palabra o déjelo en blanco y le asesoramos.</p>`;
    if (modelsMore) html += `<p class="eq-none">Hay más modelos: escriba el código completo para verlos.</p>`;
    list.innerHTML = html;
  }
  function comboOpen(open) {
    panel.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
    if (open) { comboRender(); setTimeout(() => search.focus({ preventScroll: true }), 0); }
  }
  trigger.addEventListener("click", () => comboOpen(panel.hidden));
  $("#eq-done").addEventListener("click", () => { comboOpen(false); trigger.focus(); });
  search.addEventListener("input", comboRender);
  list.addEventListener("change", (e) => {
    const c = e.target.closest("input[data-id]");
    if (!c) return;
    const s = bySerie.get(c.dataset.serie);
    Quote.toggle(c.dataset.kind === "serie" ? serItem(s) : modItem(c.dataset.label, s.c));
  });
  document.addEventListener("click", (e) => { if (!panel.hidden && !combo.contains(e.target)) comboOpen(false); });
  combo.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) { e.stopPropagation(); comboOpen(false); trigger.focus(); } });

  function syncQuoteUI() {
    const n = Quote.list().length;
    pill.hidden = n === 0;
    pill.textContent = `Mi cotización (${n})`;
    foot.hidden = n === 0;
    footN.textContent = plural(n, "elemento elegido", "elementos elegidos");
    const total = Quote.list().length;
    $("#eq-trigger-text").textContent = total
      ? plural(total, "equipo seleccionado", "equipos seleccionados")
      : "Necesito asesoría (sin elegir equipo)";
    $("#eq-panel-n").textContent = total ? plural(total, "elegido", "elegidos") : "Ninguno elegido";
    list.querySelectorAll("input[data-id]").forEach((c) => { c.checked = Quote.has(c.dataset.id); });
    if (picked) {
      const specific = Quote.list().filter((i) => i.kind !== "familia");
      picked.innerHTML = specific.length
        ? specific.map((i) => `<span class="eq-chip">${i.kind === "serie" ? "Serie " : ""}${esc(i.label)}<button type="button" data-rm="${esc(i.id)}" aria-label="Quitar ${esc(i.label)}">&times;</button></span>`).join("")
        : "";
    }
    if (modal.open && current) {
      body.querySelectorAll("[data-mod]").forEach((c) => { c.checked = Quote.has("mod:" + c.dataset.mod); });
      const qs = $("[data-quote-serie]", body);
      if (qs) {
        const on = Quote.has("ser:" + current.s.c);
        qs.textContent = on ? "Quitar la serie de mi cotización" : "Agregar la serie a mi cotización";
        qs.classList.toggle("is-on", on);
      }
      const qm = $("[data-quote-model]", body);
      if (qm) {
        const on = Quote.has("mod:" + qm.dataset.quoteModel);
        qm.textContent = on ? "Quitar de mi cotización" : "Agregar a mi cotización";
        qm.classList.toggle("is-on", on);
      }
    }
  }
  Quote.on(syncQuoteUI);

  /* Inicio */
  buildFilters();
  renderGrid();
  syncQuoteUI();
})();
