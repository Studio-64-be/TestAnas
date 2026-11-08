// Boutique : catalogue filtrable
import { PRODUCTS, CATEGORIES, COLOR_FAMILIES, SIZES, catLabel } from "../data.js";
import { productCard, icon, esc, initReveal, $, $$ } from "../ui.js";
import { isWished } from "../store.js";

const SORTS = [
  ["pertinence", "Pertinence"],
  ["nouveautes", "Nouveautés"],
  ["prix-asc", "Prix croissant"],
  ["prix-desc", "Prix décroissant"],
  ["note", "Mieux notées"],
];

const MAX_PRICE = 220;
const normalize = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function headline(state) {
  if (state.fav) return { title: "Favoris", blurb: "Les paires que tu as mises de côté. Elles n'attendent que toi." };
  if (state.q) return { title: "Recherche", blurb: `Résultats pour « ${esc(state.q)} »` };
  const c = CATEGORIES.find((c) => c.id === state.cat);
  return c ? { title: c.label, blurb: c.blurb } : { title: "La collection", blurb: "Toutes nos sneakers, dessinées à Paris et conçues pour durer." };
}

export default {
  title: "Boutique — ÉLAN",

  render({ query }) {
    const cat = CATEGORIES.some((c) => c.id === query.get("cat")) ? query.get("cat") : "tous";
    const sort = SORTS.some(([k]) => k === query.get("sort")) ? query.get("sort") : "pertinence";
    const q = query.get("q") || "";
    const h = headline({ cat, q, fav: query.get("fav") === "1" });

    return `
    <section class="shop-hero">
      <p class="eyebrow">Boutique · <span data-total>${PRODUCTS.length}</span> modèles</p>
      <h1 class="display-xl" data-title>${h.title}</h1>
      <p class="lead" data-blurb>${h.blurb}</p>
    </section>

    <div class="shop-toolbar">
      <div class="chips" role="group" aria-label="Catégories">
        ${[{ id: "tous", label: "Tout" }, ...CATEGORIES].map((c) => `
          <button type="button" class="chip ${c.id === cat ? "is-active" : ""}" data-cat="${c.id}" aria-pressed="${c.id === cat}">
            ${c.label}<sup>${c.id === "tous" ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === c.id).length}</sup>
          </button>`).join("")}
      </div>
      <div class="toolbar-right">
        <button type="button" class="btn btn-outline btn-sm filter-toggle" data-filters-open>${icon("filter")} Filtres <span data-filter-count></span></button>
        <label class="sort">
          <span>Trier</span>
          <select data-sort aria-label="Trier les produits">
            ${SORTS.map(([k, l]) => `<option value="${k}" ${k === sort ? "selected" : ""}>${l}</option>`).join("")}
          </select>
          ${icon("chevron")}
        </label>
      </div>
    </div>

    <div class="shop-layout">
      <aside class="filters" data-filters aria-label="Filtres">
        <div class="filters-head">
          <strong>Filtres</strong>
          <button type="button" class="btn-icon" data-filters-close aria-label="Fermer les filtres">${icon("close")}</button>
        </div>
        ${q ? `<div class="filter-search">Recherche : <strong>${esc(q)}</strong><button type="button" data-clear-q aria-label="Effacer la recherche">${icon("close")}</button></div>` : ""}
        <fieldset>
          <legend>Prix maximum <output data-price-out>${MAX_PRICE} €</output></legend>
          <input type="range" min="90" max="${MAX_PRICE}" step="5" value="${MAX_PRICE}" data-price aria-label="Prix maximum">
          <div class="range-scale"><span>90 €</span><span>${MAX_PRICE} €</span></div>
        </fieldset>
        <fieldset>
          <legend>Pointure (EU)</legend>
          <div class="size-grid size-grid-sm">${SIZES.map((s) => `<button type="button" class="size" data-size="${s}" aria-pressed="false">${s}</button>`).join("")}</div>
        </fieldset>
        <fieldset>
          <legend>Couleur</legend>
          <div class="swatches">${COLOR_FAMILIES.map((c) => `<button type="button" class="swatch" style="--c:${c.hex}" data-color="${c.id}" aria-pressed="false" title="${c.label}" aria-label="${c.label}"></button>`).join("")}</div>
        </fieldset>
        <fieldset>
          <legend>Sélection</legend>
          <label class="check"><input type="checkbox" data-only-new> Nouveautés</label>
          <label class="check"><input type="checkbox" data-only-sale> En promotion</label>
        </fieldset>
        <div class="filters-actions">
          <button type="button" class="btn btn-outline btn-block" data-reset>Réinitialiser</button>
          <button type="button" class="btn btn-dark btn-block filters-apply" data-filters-close>Voir les <span data-apply-count></span> modèles</button>
        </div>
      </aside>
      <div class="shop-results">
        <div class="grid grid-3" data-grid></div>
      </div>
    </div>`;
  },

  mount(root, { query }) {
    const state = {
      cat: $(".chip.is-active", root)?.dataset.cat ?? "tous",
      sort: $("[data-sort]", root).value,
      q: query.get("q") || "",
      fav: query.get("fav") === "1",
      maxPrice: MAX_PRICE,
      sizes: new Set(),
      colors: new Set(),
      onlyNew: false,
      onlySale: false,
    };
    const grid = $("[data-grid]", root);
    const filtersPanel = $("[data-filters]", root);

    const syncUrl = () => {
      const params = new URLSearchParams();
      if (state.cat !== "tous") params.set("cat", state.cat);
      if (state.q) params.set("q", state.q);
      if (state.fav) params.set("fav", "1");
      if (state.sort !== "pertinence") params.set("sort", state.sort);
      const qs = params.toString();
      history.replaceState(null, "", `#/boutique${qs ? `?${qs}` : ""}`);
      const current = `#/boutique${state.cat !== "tous" ? `?cat=${state.cat}` : ""}`;
      $$(".nav a, .menu-nav a").forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === current));
      const h = headline(state);
      $("[data-title]", root).textContent = h.title;
      $("[data-blurb]", root).innerHTML = h.blurb;
    };

    const results = () => {
      const q = normalize(state.q);
      let list = PRODUCTS.filter((p) => {
        if (state.fav && !isWished(p.id)) return false;
        if (state.cat !== "tous" && p.category !== state.cat) return false;
        if (q && !normalize(`${p.name} ${p.color} ${catLabel(p.category)} ${p.tagline}`).includes(q)) return false;
        if (p.price > state.maxPrice) return false;
        if (state.sizes.size && ![...state.sizes].some((s) => !p.soldOut.includes(s))) return false;
        if (state.colors.size && !state.colors.has(p.family)) return false;
        if (state.onlyNew && !p.isNew) return false;
        if (state.onlySale && !p.oldPrice) return false;
        return true;
      });
      const sorters = {
        "prix-asc": (a, b) => a.price - b.price,
        "prix-desc": (a, b) => b.price - a.price,
        nouveautes: (a, b) => Number(b.isNew) - Number(a.isNew),
        note: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
      };
      if (sorters[state.sort]) list = [...list].sort(sorters[state.sort]);
      return list;
    };

    const activeFilters = () =>
      state.sizes.size + state.colors.size + (state.maxPrice < MAX_PRICE) + state.onlyNew + state.onlySale;

    const update = () => {
      const list = results();
      grid.innerHTML = list.length
        ? list.map((p, i) => productCard(p, { delay: Math.min(i, 6) * 0.04 })).join("")
        : `<div class="empty">
             <p class="empty-title">Aucune paire ne correspond.</p>
             <p class="muted">Essaie d'élargir tes filtres — ta prochaine paire n'est pas loin.</p>
             <button type="button" class="btn btn-dark" data-reset>Réinitialiser les filtres</button>
           </div>`;
      $("[data-total]", root).textContent = list.length;
      $("[data-apply-count]", root).textContent = list.length;
      const n = activeFilters();
      $("[data-filter-count]", root).textContent = n ? `(${n})` : "";
      initReveal(grid);
    };

    const reset = () => {
      Object.assign(state, { maxPrice: MAX_PRICE, onlyNew: false, onlySale: false, q: "", fav: false });
      state.sizes.clear();
      state.colors.clear();
      $("[data-price]", root).value = MAX_PRICE;
      $("[data-price-out]", root).textContent = `${MAX_PRICE} €`;
      $$("[data-size],[data-color]", root).forEach((b) => b.classList.remove("is-active") || b.setAttribute("aria-pressed", "false"));
      $("[data-only-new]", root).checked = false;
      $("[data-only-sale]", root).checked = false;
      $(".filter-search", root)?.remove();
      syncUrl();
      update();
    };

    const toggleIn = (set, value, btn) => {
      set.has(value) ? set.delete(value) : set.add(value);
      btn.classList.toggle("is-active", set.has(value));
      btn.setAttribute("aria-pressed", set.has(value));
      update();
    };

    root.addEventListener("click", (e) => {
      const t = e.target.closest("button");
      if (!t || !root.contains(t)) return;
      if (t.dataset.cat) {
        state.cat = t.dataset.cat;
        $$(".chip", root).forEach((c) => {
          c.classList.toggle("is-active", c === t);
          c.setAttribute("aria-pressed", c === t);
        });
        syncUrl();
        update();
      } else if (t.dataset.size) toggleIn(state.sizes, Number(t.dataset.size), t);
      else if (t.dataset.color) toggleIn(state.colors, t.dataset.color, t);
      else if (t.hasAttribute("data-reset")) reset();
      else if (t.hasAttribute("data-clear-q")) {
        state.q = "";
        t.parentElement.remove();
        syncUrl();
        update();
      } else if (t.hasAttribute("data-filters-open")) {
        filtersPanel.classList.add("is-open");
        document.body.classList.add("no-scroll");
      } else if (t.hasAttribute("data-filters-close")) {
        filtersPanel.classList.remove("is-open");
        document.body.classList.remove("no-scroll");
      }
    });

    $("[data-sort]", root).addEventListener("change", (e) => {
      state.sort = e.target.value;
      syncUrl();
      update();
    });
    $("[data-price]", root).addEventListener("input", (e) => {
      state.maxPrice = Number(e.target.value);
      $("[data-price-out]", root).textContent = `${state.maxPrice} €`;
      update();
    });
    $("[data-only-new]", root).addEventListener("change", (e) => ((state.onlyNew = e.target.checked), update()));
    $("[data-only-sale]", root).addEventListener("change", (e) => ((state.onlySale = e.target.checked), update()));

    update();
    return () => document.body.classList.remove("no-scroll");
  },
};
