// Page panier
import { cartItems, totals, subscribe, applyPromo, removePromo, FREE_SHIPPING } from "../store.js";
import { cartLine, icon, price, $ } from "../ui.js";
import { PRODUCTS } from "../data.js";
import { productCard, initReveal } from "../ui.js";

export function summaryRows(t, { shippingLabel = "Livraison", showShippingHint = true } = {}) {
  return `
    <div class="sum-row"><span>Sous-total (${t.count} article${t.count > 1 ? "s" : ""})</span><span>${price(t.subtotal)}</span></div>
    ${t.discount ? `<div class="sum-row sum-discount"><span>Remise ${t.promo}</span><span>−${price(t.discount)}</span></div>` : ""}
    <div class="sum-row"><span>${shippingLabel}</span><span>${t.shipping ? price(t.shipping) : "Offerte"}</span></div>
    ${showShippingHint && t.toFreeShipping > 0 ? `<p class="sum-hint">Plus que ${price(t.toFreeShipping)} pour la livraison standard offerte.</p>` : ""}
    <div class="sum-row sum-total"><span>Total <small>TTC</small></span><span>${price(t.total)}</span></div>`;
}

export function promoBlock(t) {
  return t.promo
    ? `<div class="promo-applied">${icon("check")}<span>Code <strong>${t.promo}</strong> appliqué</span><button type="button" data-promo-remove>Retirer</button></div>`
    : `<form class="promo" data-promo novalidate>
         <label class="sr-only" for="promo-code">Code promo</label>
         <input id="promo-code" placeholder="Code promo" autocomplete="off" spellcheck="false">
         <button type="submit" class="btn btn-outline">Appliquer</button>
       </form>
       <p class="promo-msg" data-promo-msg hidden></p>`;
}

/** Branche le formulaire de code promo dans `root`. */
export function bindPromo(root) {
  root.addEventListener("submit", (e) => {
    const form = e.target.closest("[data-promo]");
    if (!form) return;
    e.preventDefault();
    const res = applyPromo(form.querySelector("input").value);
    if (!res.ok) {
      const msg = root.querySelector("[data-promo-msg]");
      msg.hidden = false;
      msg.textContent = res.msg;
    }
  });
  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-promo-remove]")) removePromo();
  });
}

export default {
  title: "Panier — ÉLAN",

  render() {
    return `<section class="cart-page" data-cart-page></section>`;
  },

  mount(root) {
    const host = $("[data-cart-page]", root);
    const draw = () => {
      const items = cartItems();
      const t = totals();
      if (!items.length) {
        const picks = PRODUCTS.filter((p) => p.badge === "Best-seller" || p.isNew).slice(0, 4);
        host.innerHTML = `
          <div class="empty empty-lg">
            <span class="empty-icon">${icon("bag")}</span>
            <h1 class="display-l">Ton panier<br>est vide</h1>
            <p class="muted">Il n'attend que ta prochaine paire.</p>
            <a class="btn btn-dark btn-lg" href="#/boutique">Explorer la collection ${icon("arrow")}</a>
          </div>
          <div class="section section-tight">
            <header class="sec-head"><div><p class="eyebrow">Inspiration</p><h2 class="h2">Pour bien<br>commencer</h2></div></header>
            <div class="grid grid-4">${picks.map((p) => productCard(p)).join("")}</div>
          </div>`;
        initReveal(host);
        return;
      }
      const pct = Math.min(100, (t.afterDiscount / FREE_SHIPPING) * 100);
      host.innerHTML = `
        <header class="cart-head">
          <h1 class="display-l">Panier <sup>${t.count}</sup></h1>
          <a class="link-arrow" href="#/boutique">Continuer mes achats ${icon("arrow")}</a>
        </header>
        <div class="cart-layout">
          <div>
            <div class="ship-progress ship-progress-card">
              <p>${t.toFreeShipping > 0 ? `Plus que <strong>${price(t.toFreeShipping)}</strong> pour la livraison offerte` : `${icon("check")} <strong>Livraison standard offerte</strong> sur ta commande`}</p>
              <div class="bar"><i style="--p:${pct}%"></i></div>
            </div>
            <div class="lines">${items.map((i) => cartLine(i)).join("")}</div>
          </div>
          <aside class="summary">
            <h2 class="summary-title">Récapitulatif</h2>
            ${promoBlock(t)}
            <div class="sum-rows">${summaryRows(t, { shippingLabel: "Livraison standard", showShippingHint: false })}</div>
            <a class="btn btn-accent btn-lg btn-block" href="#/paiement">${icon("lock")} Passer au paiement</a>
            <ul class="guarantees">
              <li>${icon("returns")} Retours gratuits sous 30 jours</li>
              <li>${icon("shield")} Paiement sécurisé 3-D Secure</li>
              <li>${icon("leaf")} Colis 100 % recyclé</li>
            </ul>
            <p class="cards-accepted"><span>CB</span><span>VISA</span><span>Mastercard</span><span>AMEX</span></p>
          </aside>
        </div>`;
    };
    bindPromo(host);
    draw();
    return subscribe((type) => type === "cart" && draw());
  },
};
