// Confirmation de commande
import { getOrder } from "../store.js";
import { img } from "../data.js";
import { icon, price, esc, formatDay, reducedMotion } from "../ui.js";

export default {
  title: "Commande confirmée — ÉLAN",

  render({ params }) {
    const o = getOrder(params[0]);
    if (!o) {
      return `
      <section class="empty empty-lg">
        <span class="empty-icon">${icon("box")}</span>
        <h1 class="display-l">Commande<br>introuvable</h1>
        <p class="muted">Ce numéro de commande n'existe pas dans ce navigateur.</p>
        <a class="btn btn-dark btn-lg" href="#/boutique">Retour à la boutique ${icon("arrow")}</a>
      </section>`;
    }
    const c = o.customer;
    const delivery = formatDay(new Date(o.shipping.delivery));
    const t = o.totals;
    const pay = o.payment;

    return `
    <section class="confirm">
      <div class="confirm-hero">
        <div class="check-anim" aria-hidden="true">
          <svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="36"/><path d="m24 41 11 11 22-24"/></svg>
        </div>
        <p class="eyebrow eyebrow-dark">Commande ${esc(o.id)}</p>
        <h1 class="confirm-title">Merci ${esc(c.firstName)},<br>c'est <em>validé</em>.</h1>
        <p class="confirm-lead">Un e-mail de confirmation (simulé) a été envoyé à <strong>${esc(c.email)}</strong>. Livraison prévue <strong>${delivery}</strong>.</p>
        <ol class="timeline">
          <li class="is-done"><span></span>Confirmée<small>À l'instant</small></li>
          <li class="is-current"><span></span>En préparation<small>Sous 24 h</small></li>
          <li><span></span>Expédiée<small>${esc(o.shipping.label)}</small></li>
          <li><span></span>Livrée<small>${delivery}</small></li>
        </ol>
      </div>

      <div class="confirm-grid">
        <div class="panel">
          <h2 class="panel-title">Articles</h2>
          <div class="sum-items">
            ${o.items.map((i) => `
              <div class="sum-item">
                <span class="sum-img"><img src="${img(i.photo, 160)}" alt=""><b>${i.qty}</b></span>
                <span><strong>${esc(i.name)}</strong><small>${esc(i.color)} · EU ${i.size}</small></span>
                <span>${price(i.price * i.qty)}</span>
              </div>`).join("")}
          </div>
          <div class="sum-rows">
            <div class="sum-row"><span>Sous-total</span><span>${price(t.subtotal)}</span></div>
            ${t.discount ? `<div class="sum-row sum-discount"><span>Remise ${esc(t.promo)}</span><span>−${price(t.discount)}</span></div>` : ""}
            <div class="sum-row"><span>${esc(o.shipping.label)}</span><span>${t.shipping ? price(t.shipping) : "Offerte"}</span></div>
            <div class="sum-row sum-total"><span>Total payé <small>TTC</small></span><span>${price(t.total)}</span></div>
          </div>
        </div>
        <div class="panel-stack">
          <div class="panel">
            <h2 class="panel-title">${icon("pin")} Livraison</h2>
            <p>${esc(c.firstName)} ${esc(c.lastName)}<br>${esc(c.address)}${c.address2 ? `<br>${esc(c.address2)}` : ""}<br>${esc(c.zip)} ${esc(c.city)}, ${esc(c.country)}</p>
            <p class="muted">${esc(o.shipping.label)} · ${esc(o.shipping.eta)}</p>
          </div>
          <div class="panel">
            <h2 class="panel-title">${icon("card")} Paiement</h2>
            <p>${esc(pay.brand)} •••• ${esc(pay.last4)}${pay.secure ? ` <span class="tag">${icon("shield")} 3-D Secure</span>` : ""}</p>
            ${pay.plan ? `<ul class="plan">${pay.plan.map((p, i) => `<li><span>${i ? new Date(p.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" }) : "Aujourd'hui"}</span><strong>${price(p.amount)}</strong></li>`).join("")}</ul>` : `<p class="muted">Débité le ${new Date(o.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>`}
          </div>
        </div>
      </div>

      <div class="confirm-ctas">
        <a class="btn btn-dark btn-lg" href="#/boutique">Continuer mes achats ${icon("arrow")}</a>
        <button type="button" class="btn btn-outline btn-lg" data-print>Imprimer le reçu</button>
      </div>
      <canvas class="confetti" data-confetti aria-hidden="true"></canvas>
    </section>`;
  },

  mount(root) {
    root.querySelector("[data-print]")?.addEventListener("click", () => print());
    const canvas = root.querySelector("[data-confetti]");
    if (!canvas || reducedMotion()) return;
    return confetti(canvas);
  },
};

function confetti(canvas) {
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
  };
  resize();
  const colors = ["#d4ff3f", "#0e0e0e", "#ff4b2b", "#f2f0ea", "#2f7cf6"];
  const parts = Array.from({ length: 160 }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 200,
    y: innerHeight * 0.35,
    vx: (Math.random() - 0.5) * 16,
    vy: -Math.random() * 16 - 6,
    w: 6 + Math.random() * 8,
    h: 8 + Math.random() * 10,
    r: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    c: colors[(Math.random() * colors.length) | 0],
  }));
  let raf;
  const start = performance.now();
  const frame = (now) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of parts) {
      p.vy += 0.35;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      ctx.save();
      ctx.translate(p.x * dpr, p.y * dpr);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.fillRect((-p.w / 2) * dpr, (-p.h / 2) * dpr, p.w * dpr, p.h * dpr * Math.abs(Math.cos(p.r * 2)));
      ctx.restore();
    }
    if (now - start < 4000) raf = requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  raf = requestAnimationFrame(frame);
  addEventListener("resize", resize);
  return () => {
    cancelAnimationFrame(raf);
    removeEventListener("resize", resize);
  };
}
