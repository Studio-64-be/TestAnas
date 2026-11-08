// Tunnel de paiement (simulation — aucun paiement réel)
import { cartItems, totals, subscribe, clearCart, saveOrder, SHIPPING } from "../store.js";
import { icon, price, esc, openModal, addBusinessDays, formatDay, $, $$ } from "../ui.js";
import { img } from "../data.js";
import { summaryRows, promoBlock, bindPromo } from "./cart.js";

/* ---------- Cartes de test ---------- */
const TEST_CARDS = [
  { number: "4242 4242 4242 4242", label: "Paiement accepté" },
  { number: "4000 0000 0000 3220", label: "Validation 3-D Secure" },
  { number: "4000 0000 0000 0002", label: "Carte refusée" },
  { number: "4000 0000 0000 9995", label: "Fonds insuffisants" },
  { number: "5555 5555 5555 4444", label: "Mastercard acceptée" },
];
const OUTCOMES = {
  "4000000000003220": "3ds",
  "4000000000000002": "declined",
  "4000000000009995": "funds",
};
const OTP = "123456";

/* ---------- Carte bancaire : détection, format, contrôle ---------- */
const digits = (v) => String(v).replace(/\D/g, "");

function brandOf(d) {
  if (/^3[47]/.test(d)) return "amex";
  if (/^4/.test(d)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "mastercard";
  return "generic";
}

const BRAND_LABEL = { visa: "Visa", mastercard: "Mastercard", amex: "American Express", generic: "Carte" };

function formatCard(d) {
  if (brandOf(d) === "amex") return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(" ");
  return d.slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function luhn(num) {
  let sum = 0;
  let double = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = Number(num[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

const RULES = {
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Adresse e-mail invalide.",
  firstName: (v) => v.length >= 2 || "Indique ton prénom.",
  lastName: (v) => v.length >= 2 || "Indique ton nom.",
  address: (v) => v.length >= 5 || "Indique ton adresse complète.",
  zip: (v) => /^\d{4,5}$/.test(v) || "Code postal invalide.",
  city: (v) => v.length >= 2 || "Indique ta ville.",
  phone: (v) => /^\+?\d[\d\s.-]{8,}$/.test(v) || "Numéro de téléphone invalide.",
  ccNumber: (v) => {
    const d = digits(v);
    const len = brandOf(d) === "amex" ? 15 : 16;
    if (d.length !== len) return "Numéro de carte incomplet.";
    return luhn(d) || "Numéro de carte invalide.";
  },
  ccName: (v) => v.length >= 3 || "Nom du titulaire requis.",
  ccExp: (v) => {
    const m = v.match(/^(\d{2})\/(\d{2})$/);
    if (!m) return "Format attendu : MM/AA.";
    const mm = Number(m[1]);
    const yy = 2000 + Number(m[2]);
    if (mm < 1 || mm > 12) return "Mois invalide.";
    const now = new Date();
    if (yy < now.getFullYear() || (yy === now.getFullYear() && mm < now.getMonth() + 1)) return "Cette carte est expirée.";
    return true;
  },
  ccCvc: (v, form) => {
    const amex = brandOf(digits(form.elements.ccNumber.value)) === "amex";
    return new RegExp(`^\\d{${amex ? 4 : 3}}$`).test(v) || `Cryptogramme à ${amex ? 4 : 3} chiffres.`;
  },
};

const field = (name, label, { type = "text", auto = "off", full = false, mode = "", max = "", value = "" } = {}) => `
  <div class="field ${full ? "full" : ""}" data-field="${name}">
    <input id="f-${name}" name="${name}" type="${type}" placeholder=" " autocomplete="${auto}" ${mode ? `inputmode="${mode}"` : ""} ${max ? `maxlength="${max}"` : ""} value="${esc(value)}" aria-describedby="e-${name}">
    <label for="f-${name}">${label}</label>
    <span class="field-error" id="e-${name}" hidden></span>
  </div>`;

const STEPS = ["Coordonnées", "Livraison", "Paiement"];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- Paiement en 3 fois ---------- */
function splitPlan(total) {
  const part = Math.floor((total / 3) * 100) / 100;
  const first = Math.round((total - part * 2) * 100) / 100;
  const dates = [new Date(), new Date(Date.now() + 30 * 864e5), new Date(Date.now() + 60 * 864e5)];
  return [first, part, part].map((amount, i) => ({ amount, date: dates[i] }));
}

export default {
  title: "Paiement sécurisé — ÉLAN",
  checkout: true,

  render() {
    if (!cartItems().length) {
      return `
      <section class="empty empty-lg">
        <span class="empty-icon">${icon("bag")}</span>
        <h1 class="display-l">Rien à<br>payer ici</h1>
        <p class="muted">Ton panier est vide. Ajoute une paire pour accéder au paiement.</p>
        <a class="btn btn-dark btn-lg" href="#/boutique">Voir la boutique ${icon("arrow")}</a>
      </section>`;
    }

    return `
    <section class="checkout">
      <div class="co-main">
        <a class="back-link" href="#/panier">${icon("arrowLeft")} Retour au panier</a>
        <h1 class="display-l">Paiement</h1>
        <ol class="co-progress" aria-label="Étapes">${STEPS.map((s, i) => `<li data-progress="${i + 1}"><span>0${i + 1}</span>${s}</li>`).join("")}</ol>

        <div class="demo-banner" role="note">
          ${icon("shield")}
          <p><strong>Mode démonstration.</strong> Aucun paiement réel n'est effectué et aucune donnée n'est envoyée : tout reste dans ton navigateur.</p>
        </div>

        <form class="co-form" data-form novalidate>
          <section class="co-step" data-step="1" aria-labelledby="st1">
            <header class="co-step-head">
              <span class="co-num">1</span>
              <div><h2 class="co-step-title" id="st1">Coordonnées</h2><p class="co-step-summary" data-summary="1"></p></div>
              <button type="button" class="co-edit" data-edit="1">Modifier</button>
            </header>
            <div class="co-step-body">
              <div class="fields">
                ${field("email", "Adresse e-mail", { type: "email", auto: "email", full: true })}
                ${field("firstName", "Prénom", { auto: "given-name" })}
                ${field("lastName", "Nom", { auto: "family-name" })}
                ${field("address", "Adresse", { auto: "address-line1", full: true })}
                ${field("address2", "Appartement, étage, digicode (facultatif)", { auto: "address-line2", full: true })}
                ${field("zip", "Code postal", { auto: "postal-code", mode: "numeric", max: 5 })}
                ${field("city", "Ville", { auto: "address-level2" })}
                <div class="field" data-field="country">
                  <select id="f-country" name="country" autocomplete="country-name">
                    <option>France</option><option>Belgique</option><option>Suisse</option><option>Luxembourg</option><option>Monaco</option>
                  </select>
                  <label for="f-country">Pays</label>
                  ${icon("chevron", "select-chevron")}
                </div>
                ${field("phone", "Téléphone (pour le livreur)", { type: "tel", auto: "tel", mode: "tel" })}
              </div>
              <button type="button" class="btn btn-dark btn-lg co-next" data-next="1">Continuer vers la livraison ${icon("arrow")}</button>
            </div>
          </section>

          <section class="co-step" data-step="2" aria-labelledby="st2">
            <header class="co-step-head">
              <span class="co-num">2</span>
              <div><h2 class="co-step-title" id="st2">Livraison</h2><p class="co-step-summary" data-summary="2"></p></div>
              <button type="button" class="co-edit" data-edit="2">Modifier</button>
            </header>
            <div class="co-step-body">
              <div class="opts" data-ship-opts></div>
              <button type="button" class="btn btn-dark btn-lg co-next" data-next="2">Continuer vers le paiement ${icon("arrow")}</button>
            </div>
          </section>

          <section class="co-step" data-step="3" aria-labelledby="st3">
            <header class="co-step-head">
              <span class="co-num">3</span>
              <div><h2 class="co-step-title" id="st3">Paiement</h2><p class="co-step-summary">Toutes les transactions sont chiffrées.</p></div>
            </header>
            <div class="co-step-body">
              <div class="opts opts-2" role="radiogroup" aria-label="Mode de paiement">
                <label class="opt"><input type="radio" name="mode" value="card" checked>${icon("card")}<span>Carte bancaire<small>Débit immédiat</small></span></label>
                <label class="opt" data-split-opt><input type="radio" name="mode" value="split">${icon("sparkle")}<span>3× sans frais<small data-split-hint></small></span></label>
              </div>
              <div class="split-plan" data-split-plan hidden></div>

              <div class="pay-grid">
                <div class="card3d" data-card3d data-brand="generic" aria-hidden="true">
                  <div class="card3d-inner">
                    <div class="card-face card-front">
                      <div class="card-top"><span class="card-chip"></span><span class="card-brand" data-cbrand></span></div>
                      <div class="card-number" data-cnum>•••• •••• •••• ••••</div>
                      <div class="card-row">
                        <div><small>Titulaire</small><span data-cname>PRÉNOM NOM</span></div>
                        <div><small>Expire</small><span data-cexp>MM/AA</span></div>
                      </div>
                    </div>
                    <div class="card-face card-back">
                      <div class="card-stripe"></div>
                      <div class="card-sign"><span></span><b data-ccvc>•••</b></div>
                      <p class="card-legal">Carte de démonstration · aucun débit réel</p>
                    </div>
                  </div>
                </div>

                <div class="fields">
                  <div class="field full field-card" data-field="ccNumber">
                    <input id="f-ccNumber" name="ccNumber" placeholder=" " inputmode="numeric" autocomplete="off" maxlength="19" aria-describedby="e-ccNumber">
                    <label for="f-ccNumber">Numéro de carte</label>
                    <span class="card-tag" data-ctag>${icon("card")}</span>
                    <span class="field-error" id="e-ccNumber" hidden></span>
                  </div>
                  ${field("ccName", "Nom du titulaire", { full: true })}
                  ${field("ccExp", "MM/AA", { mode: "numeric", max: 5 })}
                  ${field("ccCvc", "CVC", { mode: "numeric", max: 4 })}
                </div>
              </div>

              <details class="testcards">
                <summary>${icon("bolt")} Cartes de test <small>clique pour remplir</small>${icon("chevron")}</summary>
                <div class="testcards-list">
                  ${TEST_CARDS.map((c) => `<button type="button" data-fill="${c.number}"><code>${c.number}</code><span>${c.label}</span></button>`).join("")}
                  <p>Expiration future et cryptogramme au choix. Code 3-D Secure : <strong>${OTP}</strong>.</p>
                </div>
              </details>

              <label class="check check-cgv" data-field="cgv">
                <input type="checkbox" name="cgv">
                <span>J'accepte les <a href="#/paiement" data-cgv>conditions générales de vente</a> et la politique de retour.</span>
              </label>
              <p class="field-error" data-cgv-error hidden>Merci d'accepter les conditions pour finaliser.</p>
              <div class="pay-error" data-pay-error role="alert" hidden></div>

              <button type="submit" class="btn btn-accent btn-xl btn-block" data-pay>${icon("lock")} <span data-pay-label></span></button>
              <p class="secure-note">${icon("shield")} Paiement chiffré TLS · Authentification forte 3-D Secure</p>
            </div>
          </section>
        </form>
      </div>

      <aside class="co-summary" data-co-summary aria-label="Récapitulatif de commande"></aside>
    </section>`;
  },

  mount(root) {
    const form = $("[data-form]", root);
    if (!form) return;
    const summary = $("[data-co-summary]", root);
    const state = { step: 1, done: new Set(), ship: "standard", mode: "card", busy: false };

    /* ----- Validation ----- */
    const setError = (name, msg) => {
      const f = $(`[data-field="${name}"]`, form);
      const err = $(".field-error", f);
      f.classList.toggle("has-error", !!msg);
      err.hidden = !msg;
      err.textContent = msg || "";
      f.querySelector("input")?.setAttribute("aria-invalid", !!msg);
    };
    const check = (name) => {
      const input = form.elements[name];
      const rule = RULES[name];
      if (!input || !rule) return true;
      const res = rule(input.value.trim(), form);
      setError(name, res === true ? "" : res);
      return res === true;
    };
    const validate = (names) => {
      const results = names.map(check);
      const firstBad = names[results.indexOf(false)];
      if (firstBad) form.elements[firstBad].focus();
      return !firstBad;
    };
    form.addEventListener("blur", (e) => {
      const name = e.target.name;
      if (RULES[name] && e.target.value) check(name);
    }, true);
    form.addEventListener("input", (e) => {
      const f = e.target.closest(".field.has-error");
      if (f) check(e.target.name);
    });

    /* ----- Étapes ----- */
    const openStep = (n, { scroll = true } = {}) => {
      state.step = n;
      $$(".co-step", form).forEach((s) => {
        const k = Number(s.dataset.step);
        s.classList.toggle("is-open", k === n);
        s.classList.toggle("is-done", state.done.has(k) && k !== n);
      });
      $$("[data-progress]", root).forEach((li) => {
        const k = Number(li.dataset.progress);
        li.classList.toggle("is-active", k === n);
        li.classList.toggle("is-done", state.done.has(k) && k !== n);
      });
      const step = $(`[data-step="${n}"]`, form);
      if (scroll) step.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => step.querySelector(".co-step-body input:not([type=radio])")?.focus({ preventScroll: true }), 350);
    };

    const STEP_FIELDS = {
      1: ["email", "firstName", "lastName", "address", "zip", "city", "phone"],
      3: ["ccNumber", "ccName", "ccExp", "ccCvc"],
    };

    const v = (n) => form.elements[n].value.trim();
    const summarize = () => {
      $('[data-summary="1"]', form).textContent = state.done.has(1)
        ? `${v("firstName")} ${v("lastName")} · ${v("address")}, ${v("zip")} ${v("city")}`
        : "";
      const m = SHIPPING[state.ship];
      const t = totals(state.ship);
      $('[data-summary="2"]', form).textContent = state.done.has(2) ? `${m.label} · ${t.shipping ? price(t.shipping) : "Offerte"}` : "";
    };

    /* ----- Livraison ----- */
    const drawShipping = () => {
      $("[data-ship-opts]", form).innerHTML = Object.values(SHIPPING).map((m) => {
        const t = totals(m.id);
        const date = formatDay(addBusinessDays(m.days));
        return `
          <label class="opt">
            <input type="radio" name="ship" value="${m.id}" ${m.id === state.ship ? "checked" : ""}>
            ${icon(m.id === "relay" ? "pin" : m.id === "express" ? "bolt" : "truck")}
            <span>${m.label}<small>${m.eta} · dès ${date}</small></span>
            <strong class="opt-price">${t.shipping ? price(t.shipping) : "Offerte"}</strong>
          </label>`;
      }).join("");
    };

    /* ----- Récapitulatif ----- */
    const drawSummary = () => {
      const items = cartItems();
      if (!items.length) return;
      const t = totals(state.ship);
      summary.innerHTML = `
        <h2 class="summary-title">Ta commande</h2>
        <div class="sum-items">
          ${items.map((i) => `
            <div class="sum-item">
              <span class="sum-img"><img src="${img(i.product.photo, 160)}" alt=""><b>${i.qty}</b></span>
              <span><strong>${esc(i.product.name)}</strong><small>${esc(i.product.color)} · EU ${i.size}</small></span>
              <span>${price(i.product.price * i.qty)}</span>
            </div>`).join("")}
        </div>
        ${promoBlock(t)}
        <div class="sum-rows">${summaryRows(t, { shippingLabel: SHIPPING[state.ship].label, showShippingHint: state.ship === "standard" })}</div>
        <ul class="guarantees">
          <li>${icon("returns")} Retours gratuits sous 30 jours</li>
          <li>${icon("box")} Expédié depuis Paris</li>
        </ul>`;
      drawPayLabel();
    };

    const drawPayLabel = () => {
      const t = totals(state.ship);
      const plan = splitPlan(t.total);
      const canSplit = t.total >= 90;
      const splitOpt = $("[data-split-opt]", form);
      splitOpt.classList.toggle("is-disabled", !canSplit);
      splitOpt.querySelector("input").disabled = !canSplit;
      $("[data-split-hint]", form).textContent = canSplit ? `3 × ${price(plan[1].amount)}` : "Dès 90 € d'achat";
      if (!canSplit && state.mode === "split") {
        state.mode = "card";
        form.elements.mode.value = "card";
      }
      const box = $("[data-split-plan]", form);
      box.hidden = state.mode !== "split";
      box.innerHTML = plan.map((p, i) => `
        <div><span>${i ? `Le ${p.date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}` : "Aujourd'hui"}</span><strong>${price(p.amount)}</strong></div>`).join("");
      $("[data-pay-label]", form).textContent =
        state.mode === "split" ? `Payer ${price(plan[0].amount)} aujourd'hui` : `Payer ${price(t.total)}`;
    };

    /* ----- Carte : aperçu en direct ----- */
    const card3d = $("[data-card3d]", form);
    const drawCard = () => {
      const d = digits(form.elements.ccNumber.value);
      const brand = brandOf(d);
      const amex = brand === "amex";
      const mask = amex ? "•••• •••••• •••••" : "•••• •••• •••• ••••";
      const shown = formatCard(d);
      card3d.dataset.brand = brand;
      $("[data-cnum]", card3d).textContent = shown + mask.slice(shown.length);
      $("[data-cname]", card3d).textContent = form.elements.ccName.value.trim().toUpperCase() || "PRÉNOM NOM";
      $("[data-cexp]", card3d).textContent = form.elements.ccExp.value || "MM/AA";
      $("[data-ccvc]", card3d).textContent = form.elements.ccCvc.value.replace(/./g, "•") || (amex ? "••••" : "•••");
      $("[data-cbrand]", card3d).innerHTML =
        brand === "mastercard" ? `<span class="mc"><i></i><i></i></span>` : brand === "generic" ? "" : BRAND_LABEL[brand].toUpperCase().replace("AMERICAN EXPRESS", "AMEX");
      $("[data-ctag]", form).innerHTML = brand === "generic" ? icon("card") : `<em>${BRAND_LABEL[brand]}</em>`;
      form.elements.ccNumber.maxLength = amex ? 17 : 19;
      form.elements.ccCvc.maxLength = amex ? 4 : 3;
    };

    form.addEventListener("input", (e) => {
      const t = e.target;
      if (t.name === "ccNumber") {
        const pos = t.selectionStart;
        const before = t.value.length;
        t.value = formatCard(digits(t.value));
        const delta = t.value.length - before;
        t.setSelectionRange(pos + delta, pos + delta);
      } else if (t.name === "ccExp") {
        let d = digits(t.value).slice(0, 4);
        if (d.length === 1 && Number(d) > 1) d = `0${d}`;
        t.value = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
      } else if (t.name === "ccCvc" || t.name === "zip") {
        t.value = digits(t.value);
      }
      if (t.name?.startsWith("cc")) drawCard();
    });
    form.elements.ccCvc.addEventListener("focus", () => card3d.classList.add("is-flipped"));
    form.elements.ccCvc.addEventListener("blur", () => card3d.classList.remove("is-flipped"));

    form.addEventListener("change", (e) => {
      if (e.target.name === "ship") {
        state.ship = e.target.value;
        drawSummary();
        summarize();
      }
      if (e.target.name === "mode") {
        state.mode = e.target.value;
        drawPayLabel();
      }
      if (e.target.name === "cgv" && e.target.checked) $("[data-cgv-error]", form).hidden = true;
    });

    /* ----- Navigation entre étapes ----- */
    form.addEventListener("click", (e) => {
      const t = e.target.closest("button, a");
      if (!t) return;
      if (t.dataset.next) {
        const n = Number(t.dataset.next);
        if (STEP_FIELDS[n] && !validate(STEP_FIELDS[n])) return;
        state.done.add(n);
        summarize();
        openStep(n + 1);
      } else if (t.dataset.edit) {
        openStep(Number(t.dataset.edit));
      } else if (t.dataset.fill) {
        form.elements.ccNumber.value = t.dataset.fill;
        if (!form.elements.ccName.value) form.elements.ccName.value = `${v("firstName")} ${v("lastName")}`.trim() || "Alex Martin";
        const y = (new Date().getFullYear() + 3) % 100;
        form.elements.ccExp.value = `12/${String(y).padStart(2, "0")}`;
        form.elements.ccCvc.value = "123";
        STEP_FIELDS[3].forEach((n) => setError(n, ""));
        drawCard();
        $(".testcards", form).open = false;
        $("[data-pay-error]", form).hidden = true;
      } else if (t.hasAttribute("data-cgv")) {
        e.preventDefault();
        openModal(`<p class="eyebrow">Démo</p><h2 class="modal-title">Conditions générales</h2>
          <p class="muted">ÉLAN est une boutique de démonstration. Aucune commande n'est expédiée et aucun paiement n'est encaissé. Les données saisies restent dans ton navigateur (stockage local) et ne sont transmises à aucun serveur.</p>`, { label: "Conditions générales" });
      }
    });

    /* ----- Paiement ----- */
    const payError = (msg) => {
      const box = $("[data-pay-error]", form);
      box.hidden = false;
      box.innerHTML = `${icon("close")}<span>${msg}</span>`;
      box.classList.remove("shake");
      void box.offsetWidth;
      box.classList.add("shake");
      box.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (state.busy) return;
      if (!state.done.has(1)) return openStep(1);
      if (!state.done.has(2)) return openStep(2);
      if (!validate(STEP_FIELDS[3])) return;
      if (!form.elements.cgv.checked) {
        $("[data-cgv-error]", form).hidden = false;
        return;
      }
      $("[data-pay-error]", form).hidden = true;
      state.busy = true;

      const number = digits(form.elements.ccNumber.value);
      const outcome = OUTCOMES[number] ?? "ok";
      const t = totals(state.ship);
      const charged = state.mode === "split" ? splitPlan(t.total)[0].amount : t.total;
      const proc = processing();

      try {
        await proc.run(["Connexion sécurisée à ta banque", "Vérification de la carte"]);
        if (outcome === "3ds") {
          proc.hide();
          const ok = await threeDS(charged, number.slice(-4));
          if (!ok) {
            proc.close();
            return payError("Authentification 3-D Secure échouée ou annulée. Aucun montant n'a été débité.");
          }
          proc.show();
        }
        await proc.run(["Autorisation du paiement"]);
        if (outcome === "declined" || outcome === "funds") {
          proc.close();
          return payError(outcome === "declined"
            ? "Paiement refusé par ta banque. Vérifie tes informations ou essaie une autre carte."
            : "Paiement refusé : fonds insuffisants. Essaie une autre carte ou le paiement en 3×.");
        }
        await proc.success();

        const method = SHIPPING[state.ship];
        const order = {
          id: `ELN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          date: new Date().toISOString(),
          customer: {
            email: v("email"), firstName: v("firstName"), lastName: v("lastName"),
            address: v("address"), address2: v("address2"), zip: v("zip"), city: v("city"),
            country: form.elements.country.value, phone: v("phone"),
          },
          shipping: { id: method.id, label: method.label, eta: method.eta, delivery: addBusinessDays(method.days).toISOString() },
          items: cartItems().map((i) => ({ id: i.id, name: i.product.name, color: i.product.color, photo: i.product.photo, size: i.size, qty: i.qty, price: i.product.price })),
          totals: t,
          payment: {
            brand: BRAND_LABEL[brandOf(number)], last4: number.slice(-4), mode: state.mode,
            plan: state.mode === "split" ? splitPlan(t.total).map((p) => ({ amount: p.amount, date: p.date.toISOString() })) : null,
            secure: outcome === "3ds",
          },
        };
        saveOrder(order);
        clearCart();
        proc.close();
        location.hash = `#/confirmation/${order.id}`;
      } finally {
        state.busy = false;
      }
    });

    bindPromo(summary);
    drawShipping();
    drawSummary();
    drawCard();
    openStep(1, { scroll: false });
    const unsub = subscribe((type) => {
      if (type !== "cart" || !cartItems().length) return;
      drawShipping();
      drawSummary();
      summarize();
    });
    return () => {
      unsub();
      $(".processing")?.remove();
    };
  },
};

/* ---------- Écran de traitement ---------- */
function processing() {
  const el = document.createElement("div");
  el.className = "processing";
  el.setAttribute("role", "status");
  el.innerHTML = `
    <div class="proc-card">
      <div class="proc-visual"><div class="spinner"></div></div>
      <p class="proc-title">Paiement en cours</p>
      <ul class="proc-steps"></ul>
      <p class="proc-note">${icon("lock")} Ne ferme pas cette page</p>
    </div>`;
  document.body.append(el);
  document.body.classList.add("no-scroll");
  const list = $(".proc-steps", el);
  return {
    async run(steps) {
      for (const s of steps) {
        const li = document.createElement("li");
        li.innerHTML = `<span class="proc-dot"></span>${s}…`;
        list.append(li);
        await wait(850);
        li.classList.add("is-done");
        li.querySelector(".proc-dot").innerHTML = icon("check");
      }
    },
    hide: () => (el.hidden = true),
    show: () => (el.hidden = false),
    async success() {
      el.classList.add("is-success");
      $(".proc-visual", el).innerHTML = `<div class="proc-ok">${icon("check")}</div>`;
      $(".proc-title", el).textContent = "Paiement accepté";
      $(".proc-note", el).textContent = "Redirection vers ta confirmation…";
      await wait(1100);
    },
    close() {
      el.classList.add("is-out");
      document.body.classList.remove("no-scroll");
      setTimeout(() => el.remove(), 300);
    },
  };
}

/* ---------- Authentification forte simulée ---------- */
function threeDS(amount, last4) {
  return new Promise((resolve) => {
    let tries = 0;
    let result = false;
    const modal = openModal(`
      <div class="tds">
        <div class="tds-head"><span>${icon("shield")} Ta banque · Démo</span><span class="tds-badge">3-D Secure</span></div>
        <h2 class="modal-title">Confirme ton paiement</h2>
        <p class="muted">Un code de validation a été envoyé par SMS au <strong>•• •• •• 42 18</strong>.</p>
        <dl class="tds-recap">
          <div><dt>Marchand</dt><dd>ÉLAN Paris</dd></div>
          <div><dt>Montant</dt><dd>${price(amount)}</dd></div>
          <div><dt>Carte</dt><dd>•••• ${last4}</dd></div>
        </dl>
        <form data-tds novalidate>
          <label class="tds-label" for="otp">Code de validation</label>
          <input id="otp" class="otp" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="••••••">
          <p class="field-error" data-otp-err hidden></p>
          <p class="hint">${icon("bolt")} Mode démo : le code est <strong>${OTP}</strong>.</p>
          <button class="btn btn-dark btn-lg btn-block" type="submit">Valider le paiement</button>
          <button class="btn btn-plain btn-block" type="button" data-modal-close>Annuler</button>
        </form>
      </div>`, { label: "Authentification 3-D Secure", className: "modal-tds", onClose: () => resolve(result) });

    const input = $(".otp", modal.el);
    input.addEventListener("input", () => (input.value = digits(input.value)));
    $("[data-tds]", modal.el).addEventListener("submit", (e) => {
      e.preventDefault();
      const err = $("[data-otp-err]", modal.el);
      if (input.value === OTP) {
        result = true;
        return modal.close();
      }
      tries++;
      if (tries >= 3) return modal.close();
      err.hidden = false;
      err.textContent = `Code incorrect. Il te reste ${3 - tries} essai${3 - tries > 1 ? "s" : ""}.`;
      input.select();
    });
  });
}
