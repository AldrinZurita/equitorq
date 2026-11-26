/* =========================================================
   EQUITORQ · Interacciones de la landing
   Sin dependencias. Si este archivo no carga, la página
   sigue funcionando: menú visible por anclas, todos los
   productos visibles y los enlaces de contacto directos.
   ========================================================= */

// ---------- Configuración editable ----------
const CONFIG = {
  whatsapp: "59177970987",        // número sin "+" ni espacios
  email: "info@equitorq.com",
};

document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initForm();
  initActiveSection();
  initScrollEffects();
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});

// ---------- Menú móvil ----------
function initMenu() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("menu");
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    nav.classList.toggle("is-open", open);
  };

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
}

// ---------- Formulario: arma el mensaje y abre WhatsApp o el correo ----------
function initForm() {
  const form = document.getElementById("quote-form");
  if (!form) return;
  const error = document.getElementById("form-error");
  let channel = "whatsapp";

  form.querySelectorAll("button[type=submit]").forEach((b) =>
    b.addEventListener("click", () => { channel = b.dataset.channel; })
  );

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const required = [...form.querySelectorAll("[required]")];
    let ok = true;
    required.forEach((f) => {
      const valid = f.value.trim() !== "";
      f.setAttribute("aria-invalid", String(!valid));
      if (!valid) ok = false;
    });
    error.hidden = ok;
    if (!ok) { required.find((f) => f.getAttribute("aria-invalid") === "true")?.focus(); return; }

    const d = Object.fromEntries(new FormData(form));
    const picked = window.EQQuote ? window.EQQuote.lines() : [];
    const equipoLines = picked.length
      ? ["Equipos de interés:", ...picked.map((l) => `• ${l}`)]
      : ["Equipos de interés: necesito asesoría"];
    const lines = [
      "Hola Equitorq, quisiera una cotización.",
      `Nombre: ${d.nombre}`,
      d.empresa ? `Empresa: ${d.empresa}` : null,
      d.correo ? `Correo: ${d.correo}` : null,
      `País: ${d.pais}`,
      `Ciudad: ${d.ciudad}`,
      ...equipoLines,
      `Aplicación: ${d.mensaje}`,
    ].filter(Boolean);
    const text = lines.join("\n");

    if (channel === "email") {
      const subject = picked.length ? "Cotización Equitorq - equipos seleccionados" : "Consulta Equitorq - asesoría";
      window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    } else {
      window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    }
  });
}

// ---------- Resalta en el menú la sección visible ----------
function initActiveSection() {
  const links = [...document.querySelectorAll(".main-nav ul a")];
  if (!("IntersectionObserver" in window) || !links.length) return;
  const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.remove("is-current"));
      map.get(en.target.id)?.classList.add("is-current");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}


// ---------- Animaciones sutiles al desplazarse ----------
// Mejora progresiva: solo se activan si el navegador lo permite y el usuario no pidió menos movimiento.
function initScrollEffects() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header con sombra + barra de progreso de lectura (un solo listener, con requestAnimationFrame)
  const header = document.querySelector(".site-header");
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
    header?.classList.toggle("is-scrolled", window.scrollY > 8);
    ticking = false;
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();

  if (reduce || !("IntersectionObserver" in window)) return;

  // Aparición de bloques (fade + subida leve), una sola vez por elemento
  document.documentElement.classList.add("js-anim");
  const groups = [
    ".section-head", ".compare-card", ".complements", ".steps li", ".apl-list li", ".apl-tile",
    ".backing-band", ".hero-panel", ".why-card", ".faq details",
    ".contact-info", ".contact-form", ".cat-toolbar",
  ];
  const targets = [];
  groups.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el, i, all) => {
      if (el.closest(".hero")) return;
      el.classList.add("reveal");
      // Escalonado: pequeño retardo entre hermanos del mismo grupo (máx. 4 pasos)
      el.style.setProperty("--d", `${(i % 4) * 80}ms`);
      targets.push(el);
    });
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add("is-visible");
      io.unobserve(el);
      // Al terminar, se retira la clase para dejar el elemento en su estado normal
      setTimeout(() => { el.classList.remove("reveal", "is-visible"); el.style.removeProperty("--d"); }, 1200);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  targets.forEach((el) => io.observe(el));

  initCounters();
}

// Contadores de las cifras del hero (los valores salen del catálogo; solo se anima la cuenta)
function initCounters() {
  const nums = document.querySelectorAll("[data-count]");
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const end = Number(en.target.dataset.count);
      const t0 = performance.now(), dur = 1200;
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        en.target.textContent = fmt(Math.round(end * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  nums.forEach((n) => io.observe(n));
}
