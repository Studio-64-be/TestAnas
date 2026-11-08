// Point d'entrée : routeur, en-tête, panier latéral, recherche, menu mobile
import { PRODUCTS, byId, img, catLabel } from "./data.js";
import { subscribe, cartItems, cartCount, totals, addToCart, setQty, removeItem, toggleWish, wishCount, FREE_SHIPPING } from "./store.js";
import { $, $$, icon, price, esc, cartLine, toast, initReveal, initCursor } from "./ui.js";
import home from "./views/home.js";
import shop from "./views/shop.js";
import product from "./views/product.js";
import cart from "./views/cart.js";
import checkout from "./views/checkout.js";
import confirmation from "./views/confirmation.js";
import notFound from "./views/notfound.js";

const ROUTES = [
  [/^$/, home],
  [/^boutique$/, shop],
  [/^produit\/([\w-]+)$/, product],
  [/^panier$/, cart],
  [/^paiement$/, checkout],
  [/^confirmation\/([\w-]+)$/, confirmation],
];

const app = $("#app");
let cleanup = null;

/* ---------- Overlays ---------- */
const overlay = $("#overlay");
const drawer = $("#drawer");
const search = $("#search");
const menu = $("#menu");

function lock(on) {
  document.body.classList.toggle("no-scroll", on);
}

function openCart() {
  closeAll();
  renderDrawer();
  drawer.classList.add("is-open");
  overlay.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  drawer.inert = false;
  lock(true);
  setTimeout(() => $(".drawer-close", drawer).focus(), 300);
}

function openSearch() {
  closeAll();
  search.classList.add("is-open");
  overlay.classList.add("is-open");
  search.inert = false;
  lock(true);
  renderSearch("");
  setTimeout(() => $("input", search).focus(), 250);
}

function openMenu() {
  closeAll();
  menu.classList.add("is-open");
  menu.inert = false;
  lock(true);
}

function closeAll() {
  [drawer, search, menu].forEach((el) => {
    el.classList.remove("is-open");
    el.inert = true;
  });
  drawer.setAttribute("aria-hidden", "true");
  overlay.classList.remove("is-open");
  lock(false);
}

/* ---------- Panier latéral ---------- */
function renderDrawer() {
  const items = cartItems();
  const t = totals();
  $("[data-drawer-count]").textContent = t.count ? `(${t.count})` : "";
  const body = $(".drawer-body", drawer);
  const foot = $(".drawer-foot", drawer);
  const progress = $(".ship-progress", drawer);

  if (!items.length) {
    progress.hidden = true;
    foot.hidden = true;
    body.innerHTML = `
      <div class="drawer-empty">
        <span class="empty-icon">${icon("bag")}</span>
        <p class="empty-title">Ton panier est vide</p>
        <p class="muted">Découvre nos nouveautés et trouve la paire qui te donnera de l'élan.</p>
        <a class="btn btn-dark" href="#/boutique">Explorer la boutique ${icon("arrow")}</a>
      </div>`;
    return;
  }
  progress.hidden = false;
  foot.hidden = false;
  const pct = Math.min(100, (t.afterDiscount / FREE_SHIPPING) * 100);
  progress.innerHTML = `
    <p>${t.toFreeShipping > 0 ? `Plus que <strong>${price(t.toFreeShipping)}</strong> pour la livraison offerte` : `${icon("check")} Livraison standard <strong>offerte</strong>`}</p>
    <div class="bar"><i style="--p:${pct}%"></i></div>`;
  body.innerHTML = items.map((i) => cartLine(i, { compact: true })).join("");
  foot.innerHTML = `
    ${t.discount ? `<div class="sum-row sum-discount"><span>Remise ${t.promo}</span><span>−${price(t.discount)}</span></div>` : ""}
    <div class="sum-row sum-total"><span>Sous-total</span><span>${price(t.afterDiscount)}</span></div>
    <p class="muted small">Livraison et codes promo calculés à l'étape suivante.</p>
    <a class="btn btn-accent btn-lg btn-block" href="#/paiement">${icon("lock")} Passer au paiement</a>
    <a class="btn btn-outline btn-block" href="#/panier">Voir le panier</a>`;
}

/* ---------- Recherche ---------- */
const normalize = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function renderSearch(q) {
  const results = $(".search-results", search);
  const n = normalize(q.trim());
  const list = n
    ? PRODUCTS.filter((p) => normalize(`${p.name} ${p.color} ${catLabel(p.category)}`).includes(n)).slice(0, 6)
    : PRODUCTS.filter((p) => p.badge === "Best-seller" || p.isNew).slice(0, 6);
  $(".search-label", search).textContent = n ? `${list.length} résultat${list.length > 1 ? "s" : ""}` : "Tendances du moment";
  results.innerHTML = list.length
    ? list.map((p) => `
        <a class="sr-item" href="#/produit/${p.id}">
          <img src="${img(p.photo, 300, 300)}" alt="" loading="lazy">
          <strong>${esc(p.name)}</strong><span>${price(p.price)}</span>
        </a>`).join("")
    : `<p class="muted">Aucun modèle ne correspond à « ${esc(q)} ». Essaie « running », « blanc » ou « trail ».</p>`;
}

$("input", search).addEventListener("input", (e) => renderSearch(e.target.value));
$("form", search).addEventListener("submit", (e) => {
  e.preventDefault();
  const q = $("input", search).value.trim();
  location.hash = `#/boutique${q ? `?q=${encodeURIComponent(q)}` : ""}`;
});

/* ---------- Badges ---------- */
function updateBadges(bump = false) {
  const n = cartCount();
  $$("[data-cart-count]").forEach((el) => {
    el.textContent = n;
    el.hidden = n === 0;
    if (bump) {
      el.classList.remove("bump");
      void el.offsetWidth;
      el.classList.add("bump");
    }
  });
  const w = wishCount();
  $$("[data-wish-count]").forEach((el) => {
    el.textContent = w;
    el.hidden = w === 0;
  });
}

let lastCount = cartCount();
subscribe((type) => {
  const n = cartCount();
  updateBadges(type === "cart" && n > lastCount);
  lastCount = n;
  if (type === "cart" && drawer.classList.contains("is-open")) renderDrawer();
});

/* ---------- Actions globales (délégation) ---------- */
document.addEventListener("click", (e) => {
  if (e.target.closest('a[href^="#/"]')) closeAll();
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const { action, id, key } = el.dataset;
  switch (action) {
    case "open-cart":
      return openCart();
    case "open-search":
      return openSearch();
    case "open-menu":
      return openMenu();
    case "close":
      return closeAll();
    case "skip":
      e.preventDefault();
      return app.focus();
    case "quick-add": {
      const p = byId(id);
      addToCart(id, Number(el.dataset.size));
      toast(`<img src="${img(p.photo, 120, 120)}" alt=""><span><strong>${esc(p.name)}</strong> ajoutée<br><small>Pointure EU ${el.dataset.size}</small></span><button type="button" class="toast-act" data-action="open-cart">Voir le panier</button>`);
      return;
    }
    case "wish": {
      const on = toggleWish(id);
      $$(`[data-action="wish"][data-id="${id}"]`).forEach((b) => {
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", on);
      });
      toast(`${icon("heart")}<span>${on ? "Ajoutée à tes favoris" : "Retirée de tes favoris"}</span>`, { timeout: 2200 });
      return;
    }
    case "qty": {
      const item = cartItems().find((i) => i.key === key);
      if (item) setQty(key, item.qty + Number(el.dataset.delta));
      return;
    }
    case "remove":
      return removeItem(key);
  }
});

overlay.addEventListener("click", closeAll);
document.addEventListener("keydown", (e) => e.key === "Escape" && closeAll());

const header = $("#header");
addEventListener("scroll", () => header.classList.toggle("is-scrolled", scrollY > 8), { passive: true });

/* ---------- Routeur ---------- */
function parse() {
  const raw = location.hash.replace(/^#\/?/, "");
  const [path, qs] = raw.split("?");
  return { path: path.replace(/\/$/, ""), query: new URLSearchParams(qs || "") };
}

function route() {
  const { path, query } = parse();
  let view = notFound;
  let params = [];
  for (const [re, v] of ROUTES) {
    const m = path.match(re);
    if (m) {
      view = v;
      params = m.slice(1);
      break;
    }
  }
  closeAll();
  cleanup?.();
  cleanup = null;
  document.body.classList.toggle("is-checkout", !!view.checkout);
  app.innerHTML = view.render({ params, query });
  document.title = typeof view.title === "function" ? view.title(params) : view.title;
  app.classList.remove("page-in");
  void app.offsetWidth;
  app.classList.add("page-in");
  window.scrollTo({ top: 0, behavior: "instant" });
  cleanup = view.mount?.(app, { params, query, app: { openCart } }) || null;
  initReveal(app);

  // Lien actif dans la navigation
  const current = `#/${path}${query.get("cat") ? `?cat=${query.get("cat")}` : ""}`;
  $$(".nav a, .menu-nav a").forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === current));
}

addEventListener("hashchange", route);
updateBadges();
initCursor();
route();
