// Fiche produit
import { PRODUCTS, SIZES, byId, catLabel, gallery, img } from "../data.js";
import { addToCart, isWished, toggleWish } from "../store.js";
import { productCard, icon, price, stars, esc, badge, sizeGuide, addBusinessDays, formatDay, $, $$ } from "../ui.js";
import notFound from "./notfound.js";

export default {
  title: (params) => `${byId(params[0])?.name ?? "Produit"} — ÉLAN`,

  render({ params }) {
    const p = byId(params[0]);
    if (!p) return notFound.render();
    const views = gallery(p);
    const related = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id)
      .concat(PRODUCTS.filter((x) => x.category !== p.category && x.id !== p.id))
      .slice(0, 4);
    const eta = formatDay(addBusinessDays(new Date().getHours() < 14 ? 2 : 3));
    const save = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    const cta = p.limited ? "Précommander" : "Ajouter au panier";

    return `
    <nav class="crumbs" aria-label="Fil d'Ariane">
      <a href="#/">Accueil</a><span>/</span><a href="#/boutique">Boutique</a><span>/</span>
      <a href="#/boutique?cat=${p.category}">${catLabel(p.category)}</a><span>/</span><span aria-current="page">${esc(p.name)}</span>
    </nav>

    <section class="pdp">
      <div class="pdp-gallery">
        <div class="pdp-thumbs" role="tablist" aria-label="Vues du produit">
          ${views.map((src, i) => `
            <button type="button" class="thumb ${i ? "" : "is-active"}" data-view="${i}" role="tab" aria-selected="${!i}" aria-label="Vue ${i + 1}">
              <img src="${src.replace("w=1100", "w=200").replace("h=1375", "h=250")}" alt="" loading="lazy">
            </button>`).join("")}
        </div>
        <div class="pdp-main" data-zoom>
          <img src="${views[0]}" alt="${esc(p.name)} — ${esc(p.color)}" data-main>
          ${badge(p.badge)}
          <span class="pdp-counter"><span data-counter>01</span> / 0${views.length}</span>
          <div class="pdp-arrows">
            <button type="button" class="round-btn round-btn-light" data-step="-1" aria-label="Vue précédente">${icon("arrowLeft")}</button>
            <button type="button" class="round-btn round-btn-light" data-step="1" aria-label="Vue suivante">${icon("arrow")}</button>
          </div>
        </div>
      </div>

      <div class="pdp-info">
        <div>
          <p class="eyebrow">${catLabel(p.category)} · Réf. ${p.ref}</p>
          <h1 class="pdp-title">${esc(p.name)}</h1>
          <p class="pdp-tagline">${esc(p.tagline)}</p>
        </div>
        <div class="pdp-rating">${stars(p.rating)}<span><strong>${String(p.rating).replace(".", ",")}</strong> · ${p.reviews.toLocaleString("fr-FR")} avis</span></div>
        <div class="pdp-price">
          <strong>${price(p.price)}</strong>
          ${p.oldPrice ? `<s>${price(p.oldPrice)}</s><span class="save">−${save} %</span>` : ""}
          <small>TTC</small>
        </div>
        <div class="pdp-color"><span class="dot" style="--c:${p.hex}"></span>Coloris : <strong>${esc(p.color)}</strong></div>

        <div class="pdp-sizes">
          <div class="pdp-row">
            <span id="size-label">Choisis ta pointure (EU)</span>
            <button type="button" class="link" data-size-guide>${icon("ruler")} Guide des tailles</button>
          </div>
          <div class="size-grid" role="radiogroup" aria-labelledby="size-label">
            ${SIZES.map((s) => {
              const out = p.soldOut.includes(s);
              return `<button type="button" class="size" role="radio" aria-checked="false" data-pick="${s}" ${out ? 'disabled aria-label="' + s + ' — épuisée"' : ""}>${s}</button>`;
            }).join("")}
          </div>
          <p class="size-error" data-size-error hidden>${icon("ruler")} Sélectionne ta pointure pour continuer.</p>
          ${p.soldOut.length ? `<p class="size-note">Pointures barrées : épuisées. Réassort prévu sous 3 semaines.</p>` : ""}
        </div>

        <div class="pdp-buy">
          <button type="button" class="btn btn-dark btn-lg btn-block" data-add>${icon("bag")} ${cta} · ${price(p.price)}</button>
          <button type="button" class="wish-lg ${isWished(p.id) ? "is-on" : ""}" data-wish aria-pressed="${isWished(p.id)}" aria-label="Ajouter aux favoris">${icon("heart")}</button>
        </div>
        <p class="pdp-delivery">${icon("truck")}<span>Commande avant 14 h, livrée dès <strong>${eta}</strong></span></p>

        <ul class="perks">
          <li>${icon("truck")}<span>Livraison offerte<small>dès 120 €</small></span></li>
          <li>${icon("returns")}<span>Retours gratuits<small>sous 30 jours</small></span></li>
          <li>${icon("shield")}<span>Paiement sécurisé<small>3-D Secure</small></span></li>
        </ul>

        <div class="accordions">
          <details open>
            <summary>Description ${icon("chevron")}</summary>
            <div class="acc-body"><p>${esc(p.description)}</p><ul class="ticks">${p.features.map((f) => `<li>${icon("check")}${esc(f)}</li>`).join("")}</ul></div>
          </details>
          <details>
            <summary>Fiche technique ${icon("chevron")}</summary>
            <div class="acc-body"><dl class="specs">
              <div><dt>Poids</dt><dd>${p.specs.poids}</dd></div>
              <div><dt>Drop</dt><dd>${p.specs.drop}</dd></div>
              <div><dt>Amorti</dt><dd>${p.specs.amorti}</dd></div>
              <div><dt>Usage</dt><dd>${p.specs.usage}</dd></div>
            </dl></div>
          </details>
          <details>
            <summary>Livraison & retours ${icon("chevron")}</summary>
            <div class="acc-body"><p>Standard 3 à 5 jours ouvrés (offerte dès 120 €), Express 24–48 h (9,90 €) ou point relais (offert). Tu as 30 jours pour changer d'avis : l'étiquette retour est incluse dans le colis.</p></div>
          </details>
        </div>
      </div>
    </section>

    <section class="section">
      <header class="sec-head"><div class="reveal"><p class="eyebrow">Sélection</p><h2 class="h2">Tu vas aussi<br>les aimer</h2></div></header>
      <div class="grid grid-4">${related.map((r, i) => productCard(r, { delay: i * 0.06 })).join("")}</div>
    </section>

    <div class="sticky-buy" data-sticky>
      <img src="${img(p.photo, 100, 100)}" alt="">
      <span><strong>${esc(p.name)}</strong><small data-sticky-size>Choisis ta pointure</small></span>
      <button type="button" class="btn btn-dark" data-add>${price(p.price)} ${icon("bag")}</button>
    </div>`;
  },

  mount(root, { params, app }) {
    const p = byId(params[0]);
    if (!p) return;
    const views = gallery(p);
    let index = 0;
    let size = null;
    const main = $("[data-main]", root);
    const stage = $("[data-zoom]", root);
    views.slice(1).forEach((src) => (new Image().src = src)); // préchargement des vues

    const show = (i) => {
      index = (i + views.length) % views.length;
      stage.classList.remove("is-zoomed");
      main.classList.add("is-swapping");
      setTimeout(() => {
        const done = () => main.classList.remove("is-swapping");
        main.onload = done;
        main.src = views[index];
        if (main.complete) done();
        setTimeout(done, 1500); // filet de sécurité si le réseau est lent
      }, 160);
      $("[data-counter]", root).textContent = String(index + 1).padStart(2, "0");
      $$(".thumb", root).forEach((t, k) => {
        t.classList.toggle("is-active", k === index);
        t.setAttribute("aria-selected", k === index);
      });
    };

    // Zoom au clic, suivi du pointeur
    stage.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      stage.classList.toggle("is-zoomed");
    });
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      stage.style.setProperty("--zx", `${((e.clientX - r.left) / r.width) * 100}%`);
      stage.style.setProperty("--zy", `${((e.clientY - r.top) / r.height) * 100}%`);
    });

    root.addEventListener("click", (e) => {
      const t = e.target.closest("button");
      if (!t || !root.contains(t)) return;
      if (t.dataset.view) show(Number(t.dataset.view));
      else if (t.dataset.step) show(index + Number(t.dataset.step));
      else if (t.dataset.pick) {
        size = Number(t.dataset.pick);
        $$("[data-pick]", root).forEach((b) => {
          b.classList.toggle("is-active", b === t);
          b.setAttribute("aria-checked", b === t);
        });
        $("[data-size-error]", root).hidden = true;
        $("[data-sticky-size]", root).textContent = `Pointure EU ${size}`;
      } else if (t.hasAttribute("data-size-guide")) sizeGuide();
      else if (t.hasAttribute("data-wish")) {
        const on = toggleWish(p.id);
        t.classList.toggle("is-on", on);
        t.setAttribute("aria-pressed", on);
      } else if (t.hasAttribute("data-add")) {
        if (!size) {
          const err = $("[data-size-error]", root);
          err.hidden = false;
          const grid = $(".pdp-sizes", root);
          grid.classList.remove("shake");
          void grid.offsetWidth;
          grid.classList.add("shake");
          grid.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
        addToCart(p.id, size, 1);
        flyToCart(main);
        setTimeout(() => app.openCart(), 420);
      }
    });

    // Barre d'achat mobile : visible quand le bouton principal sort de l'écran
    const sticky = $("[data-sticky]", root);
    const mainBtn = $(".pdp-buy [data-add]", root);
    const io = new IntersectionObserver(([e]) => sticky.classList.toggle("is-visible", !e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(mainBtn);
    return () => io.disconnect();
  },
};

/** Petite animation : le visuel « vole » jusqu'au bouton panier. */
function flyToCart(source) {
  const target = document.querySelector(".cart-btn");
  if (!target || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const a = source.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const ghost = source.cloneNode();
  ghost.className = "fly";
  Object.assign(ghost.style, { left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px` });
  document.body.append(ghost);
  requestAnimationFrame(() => {
    ghost.style.transform = `translate(${b.left + b.width / 2 - a.left - a.width / 2}px, ${b.top + b.height / 2 - a.top - a.height / 2}px) scale(.06)`;
    ghost.style.opacity = ".4";
  });
  setTimeout(() => ghost.remove(), 700);
}
