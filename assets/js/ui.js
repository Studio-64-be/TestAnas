// Composants et utilitaires d'interface partagés
import { img, zoom, catLabel, SIZES } from "./data.js";
import { isWished } from "./store.js";

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
export const price = (n) => euro.format(n).replace(/,00(?=\s?€)/, "");

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ESC[c]);

export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Icônes ---------- */
const PATHS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  bag: '<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  arrowUpRight: '<path d="M7 17 17 7M8 7h9v9"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" fill="currentColor" stroke="none"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
  returns: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  leaf: '<path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15"/><path d="m5 19 8-8"/>',
  bolt: '<path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z"/>',
  menu: '<path d="M4 8h16M4 16h16"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/>',
  pin: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  ruler: '<path d="M3 17 17 3l4 4L7 21l-4-4Z"/><path d="m7 13 2 2M10 10l2 2M13 7l2 2"/>',
};

export const icon = (name, cls = "") =>
  `<svg class="i ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name] ?? ""}</svg>`;

export const stars = (rating) => {
  const full = Math.round(rating);
  return `<span class="stars" aria-label="Note ${String(rating).replace(".", ",")} sur 5">${Array.from(
    { length: 5 },
    (_, i) => `<span class="${i < full ? "on" : ""}">${icon("star")}</span>`
  ).join("")}</span>`;
};

const BADGE_CLASS = { "Nouveau": "badge-accent", "Best-seller": "badge-light", "Drop": "badge-dark", "Édition limitée": "badge-dark" };
export const badge = (label) =>
  label ? `<span class="badge ${BADGE_CLASS[label] ?? "badge-hot"}">${esc(label)}</span>` : "";

/* ---------- Carte produit ---------- */
export function productCard(p, { delay = 0 } = {}) {
  const quick = [40, 41, 42, 43, 44]
    .map((s) => {
      const out = p.soldOut.includes(s);
      return `<button type="button" data-action="quick-add" data-id="${p.id}" data-size="${s}" ${out ? 'disabled aria-label="Pointure ' + s + ' épuisée"' : 'aria-label="Ajouter en pointure ' + s + '"'}>${s}</button>`;
    })
    .join("");
  return `
  <article class="card reveal" style="--d:${delay}s">
    <div class="card-visual">
      <a class="card-media" href="#/produit/${p.id}" data-cursor="Voir" aria-label="${esc(p.name)}, ${price(p.price)}">
        <img class="img-main" src="${img(p.photo, 720)}" alt="${esc(p.name)} — ${esc(p.color)}" loading="lazy" decoding="async">
        <img class="img-alt" src="${zoom(p.photo, 720, 900, p.fp[0], p.fp[1], 1.7)}" alt="" loading="lazy" decoding="async">
        ${badge(p.badge)}
      </a>
      <button type="button" class="card-wish ${isWished(p.id) ? "is-on" : ""}" data-action="wish" data-id="${p.id}" aria-pressed="${isWished(p.id)}" aria-label="Ajouter ${esc(p.name)} aux favoris">${icon("heart")}</button>
      <div class="card-quick">
        <p>Ajout rapide · EU</p>
        <div class="quick-sizes">${quick}</div>
      </div>
    </div>
    <a class="card-info" href="#/produit/${p.id}" tabindex="-1">
      <div>
        <h3 class="card-name">${esc(p.name)}</h3>
        <p class="card-meta">${catLabel(p.category)} · ${esc(p.color)}</p>
      </div>
      <p class="card-price">${p.oldPrice ? `<s>${price(p.oldPrice)}</s>` : ""}${price(p.price)}</p>
    </a>
  </article>`;
}

/* ---------- Ligne de panier ---------- */
export function cartLine(item, { compact = false } = {}) {
  const p = item.product;
  return `
  <div class="line" data-key="${item.key}">
    <a href="#/produit/${p.id}" class="line-img"><img src="${img(p.photo, 240)}" alt="${esc(p.name)}" loading="lazy"></a>
    <div class="line-body">
      <h4><a href="#/produit/${p.id}">${esc(p.name)}</a></h4>
      <p>${esc(p.color)} · EU ${item.size}</p>
      <div class="stepper" role="group" aria-label="Quantité">
        <button type="button" data-action="qty" data-key="${item.key}" data-delta="-1" aria-label="Retirer un">${icon("minus")}</button>
        <span aria-live="polite">${item.qty}</span>
        <button type="button" data-action="qty" data-key="${item.key}" data-delta="1" aria-label="Ajouter un" ${item.qty >= 10 ? "disabled" : ""}>${icon("plus")}</button>
      </div>
    </div>
    <div class="line-right">
      <strong>${price(p.price * item.qty)}</strong>
      ${compact ? "" : `<span class="line-unit">${price(p.price)} / paire</span>`}
      <button type="button" class="line-remove" data-action="remove" data-key="${item.key}">Retirer</button>
    </div>
  </div>`;
}

/* ---------- Toasts ---------- */
export function toast(html, { timeout = 3800 } = {}) {
  const box = $("#toasts");
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "status");
  el.innerHTML = html;
  box.append(el);
  const close = () => {
    el.classList.add("is-out");
    setTimeout(() => el.remove(), 350);
  };
  el.addEventListener("click", (e) => e.target.closest("a,button") && close());
  setTimeout(close, timeout);
}

/* ---------- Modale ---------- */
export function openModal(html, { label = "Fenêtre", className = "", onClose } = {}) {
  const wrap = document.createElement("div");
  wrap.className = `modal ${className}`;
  wrap.setAttribute("role", "dialog");
  wrap.setAttribute("aria-modal", "true");
  wrap.setAttribute("aria-label", label);
  wrap.innerHTML = `<div class="modal-card"><button type="button" class="btn-icon modal-close" data-modal-close aria-label="Fermer">${icon("close")}</button>${html}</div>`;
  const previous = document.activeElement;
  document.body.append(wrap);
  document.body.classList.add("no-scroll");
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    onClose?.();
    wrap.classList.add("is-out");
    document.removeEventListener("keydown", onKey);
    setTimeout(() => {
      wrap.remove();
      if (!$(".modal")) document.body.classList.remove("no-scroll");
      previous?.focus?.();
    }, 250);
  };
  const onKey = (e) => e.key === "Escape" && close();
  document.addEventListener("keydown", onKey);
  wrap.addEventListener("click", (e) => {
    if (e.target === wrap || e.target.closest("[data-modal-close]")) close();
  });
  setTimeout(() => ($("input", wrap) || $(".modal-close", wrap))?.focus(), 50);
  return { el: wrap, close };
}

export function sizeGuide() {
  const rows = SIZES.map((s) => {
    const us = (s - 33).toFixed(1).replace(".0", "");
    const uk = (s - 33.5).toFixed(1).replace(".0", "");
    const cm = (s * 0.667 - 1.5).toFixed(1).replace(".", ",");
    return `<tr><td>${s}</td><td>${us}</td><td>${uk}</td><td>${cm}</td></tr>`;
  }).join("");
  openModal(
    `<p class="eyebrow">Guide des tailles</p>
     <h2 class="modal-title">Trouve ta pointure</h2>
     <p class="muted">Nos modèles taillent normalement. Entre deux tailles ? Prends la plus grande pour le running, la plus petite pour le lifestyle.</p>
     <table class="size-table"><thead><tr><th>EU</th><th>US</th><th>UK</th><th>Longueur pied</th></tr></thead><tbody>${rows}</tbody></table>
     <p class="hint">${icon("ruler")} Mesure ton pied le soir, talon contre un mur, du talon au bout du gros orteil.</p>`,
    { label: "Guide des tailles" }
  );
}

/* ---------- Apparition au scroll ---------- */
let io;
export function initReveal(root = document) {
  const els = $$(".reveal:not(.is-in)", root);
  if (reducedMotion() || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-in"));
    return;
  }
  io ??= new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      }),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  els.forEach((el) => io.observe(el));
}

/* ---------- Curseur « Voir » sur les visuels produits ---------- */
export function initCursor() {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const el = $("#cursor");
  const label = $("span", el);
  let x = -100, y = -100, cx = -100, cy = -100;
  addEventListener("pointermove", (e) => {
    x = e.clientX;
    y = e.clientY;
    const target = e.target.closest?.("[data-cursor]");
    el.classList.toggle("is-on", !!target);
    if (target) label.textContent = target.dataset.cursor;
  }, { passive: true });
  document.addEventListener("pointerleave", () => el.classList.remove("is-on"));
  const tick = () => {
    cx += (x - cx) * 0.2;
    cy += (y - cy) * 0.2;
    el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    requestAnimationFrame(tick);
  };
  tick();
}

/* ---------- Dates de livraison ---------- */
export function addBusinessDays(days, from = new Date()) {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) added++;
  }
  return d;
}

export const formatDay = (d) =>
  d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
