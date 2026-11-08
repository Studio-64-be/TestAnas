// Accueil
import { PRODUCTS, CATEGORIES, PHOTOS, img, byId } from "../data.js";
import { productCard, icon, price, stars, esc, toast, reducedMotion } from "../ui.js";

const REVIEWS = [
  { name: "Inès M.", city: "Lyon", product: "rouge-vitesse", rating: 5, color: "#d8261c",
    text: "J'ai couru mon premier semi avec. Zéro ampoule, et cette sensation de rebond à chaque foulée… je ne reviens pas en arrière." },
  { name: "Yanis B.", city: "Paris", product: "court-absolu", rating: 5, color: "#0e0e0e",
    text: "Le blanc parfait. Je les porte avec tout, du costume au jogging. Livrées en 36 h, emballage ultra soigné." },
  { name: "Camille R.", city: "Bordeaux", product: "aube-pastel", rating: 4, color: "#9b7fe0",
    text: "Les couleurs sont encore plus belles en vrai. Elles taillent normalement, j'ai pris ma pointure habituelle." },
  { name: "Léo D.", city: "Annecy", product: "kaki-trail", rating: 5, color: "#6f7546",
    text: "Testées sur 40 km de sentiers autour du lac. L'accroche est bluffante, même sur la roche mouillée." },
];

const WORDS = ["Running", "Lifestyle", "Court", "Basket", "Trail"];

/** Prochain samedi 10 h — date du drop. */
function nextDrop() {
  const now = new Date();
  const t = new Date(now);
  t.setHours(10, 0, 0, 0);
  t.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7));
  if (t <= now) t.setDate(t.getDate() + 7);
  return t;
}

export default {
  title: "ÉLAN — Sneakers pour prendre de l'élan",

  render() {
    const hero = byId("rouge-vitesse");
    const drop = byId("nocturne-01");
    const fresh = [...PRODUCTS.filter((p) => p.isNew && p.id !== "nocturne-01"), ...PRODUCTS.filter((p) => !p.isNew)].slice(0, 8);
    const best = ["court-absolu", "rouge-vitesse", "kaki-trail", "sahara-daim"].map(byId);
    const counts = Object.fromEntries(CATEGORIES.map((c) => [c.id, PRODUCTS.filter((p) => p.category === c.id).length]));
    const marquee = Array.from({ length: 2 }, () =>
      WORDS.map((w, i) => `<span class="band-word ${i % 2 ? "is-outline" : ""}">${w}</span><span class="band-star">✦</span>`).join("")
    ).join("");
    const dropDate = nextDrop().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

    return `
    <section class="hero">
      <div class="hero-copy">
        <p class="pill pill-dark reveal"><span class="pulse"></span>Collection Automne–Hiver 26 · disponible</p>
        <h1 class="hero-title" aria-label="Prends de l'élan.">
          <span class="line"><span>Prends</span></span>
          <span class="line"><span>de l'</span></span>
          <span class="line"><span><em>élan</em>.</span></span>
        </h1>
        <div class="hero-bottom">
          <p class="hero-lead reveal" style="--d:.5s">Des sneakers dessinées à Paris, façonnées pour bouger. Amorti Kinetic Foam™, matières recyclées, style intemporel.</p>
          <div class="hero-ctas reveal" style="--d:.6s">
            <a class="btn btn-accent btn-lg" href="#/boutique">Découvrir la collection ${icon("arrow")}</a>
            <a class="btn btn-ghost-dark btn-lg" href="#/produit/nocturne-01">Le drop Nocturne</a>
          </div>
          <dl class="hero-stats reveal" style="--d:.7s">
            <div><dt>4,9<small>/5</small></dt><dd>12 486 avis vérifiés</dd></div>
            <div><dt>48<small>h</small></dt><dd>Livraison express</dd></div>
            <div><dt>30<small>j</small></dt><dd>Retours offerts</dd></div>
          </dl>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hero-frame" data-tilt>
          <img src="${img(PHOTOS.hero, 1100, 1300)}" alt="Rouge Vitesse, la runner rouge signature ÉLAN" fetchpriority="high">
          <span class="hero-tag">N°001 — ${esc(hero.name)}</span>
        </div>
        <svg class="hero-badge" viewBox="0 0 120 120" aria-hidden="true">
          <defs><path id="badge-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"/></defs>
          <circle cx="60" cy="60" r="59" fill="var(--accent)"/>
          <g class="spin"><text><textPath href="#badge-circle" textLength="272">NOUVELLE COLLECTION • ÉLAN • 2026 •</textPath></text></g>
          <path d="M50 70 70 50M54 50h16v16" fill="none" stroke="#0e0e0e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <a class="hero-chip" href="#/produit/${hero.id}">
          <img src="${img(hero.photo, 120, 120)}" alt="">
          <span><strong>${esc(hero.name)}</strong><small>${hero.reviews.toLocaleString("fr-FR")} avis · ${price(hero.price)}</small></span>
          <span class="chip-go">${icon("arrow")}</span>
        </a>
      </div>
    </section>

    <section class="band" aria-label="Nos univers"><div class="marquee">${marquee}</div></section>

    <section class="section">
      <header class="sec-head">
        <div class="reveal"><p class="eyebrow">01 — Nouveautés</p><h2 class="h2">Fraîchement<br>débarquées</h2></div>
        <div class="sec-actions reveal">
          <button type="button" class="round-btn" data-rail-prev aria-label="Précédent">${icon("arrowLeft")}</button>
          <button type="button" class="round-btn" data-rail-next aria-label="Suivant">${icon("arrow")}</button>
          <a class="link-arrow" href="#/boutique?sort=nouveautes">Tout voir ${icon("arrow")}</a>
        </div>
      </header>
      <div class="rail" data-rail>${fresh.map((p, i) => productCard(p, { delay: Math.min(i, 4) * 0.06 })).join("")}</div>
    </section>

    <section class="section">
      <header class="sec-head">
        <div class="reveal"><p class="eyebrow">02 — Univers</p><h2 class="h2">Trouve<br>ta foulée</h2></div>
        <p class="sec-lead reveal">Cinq familles, une même obsession : que chaque pas te donne envie du suivant.</p>
      </header>
      <div class="bento">
        ${CATEGORIES.map((c, i) => `
          <a class="tile tile-${i + 1} reveal" style="--d:${i * 0.07}s" href="#/boutique?cat=${c.id}">
            <img src="${img(c.photo, i === 0 ? 1200 : 700, i === 0 ? 1200 : 560)}" alt="" loading="lazy">
            <span class="tile-go">${icon("arrowUpRight")}</span>
            <span class="tile-count">${counts[c.id]} modèles</span>
            <h3>${c.label}</h3>
            ${i === 0 ? `<p>${c.blurb}</p>` : ""}
          </a>`).join("")}
      </div>
    </section>

    <section class="drop" aria-labelledby="drop-title">
      <div class="drop-media">
        <img src="${img(PHOTOS.drop, 1100, 1200)}" alt="Nocturne 01, sneaker noire édition limitée" loading="lazy">
        <span class="drop-stamp">500<small>paires<br>numérotées</small></span>
      </div>
      <div class="drop-body">
        <p class="eyebrow eyebrow-dark reveal">03 — Drop 004 · Édition limitée</p>
        <h2 class="drop-title reveal" id="drop-title">Nocturne<br><em>01</em></h2>
        <p class="drop-text reveal">${esc(drop.description)}</p>
        <div class="countdown reveal" data-countdown="${nextDrop().toISOString()}" aria-live="off">
          <div><strong data-u="d">00</strong><span>Jours</span></div>
          <div><strong data-u="h">00</strong><span>Heures</span></div>
          <div><strong data-u="m">00</strong><span>Min</span></div>
          <div><strong data-u="s">00</strong><span>Sec</span></div>
        </div>
        <p class="drop-date reveal">Expédition le ${dropDate}, 10 h · Précommande ouverte</p>
        <div class="drop-ctas reveal">
          <a class="btn btn-accent btn-lg" href="#/produit/${drop.id}">Précommander · ${price(drop.price)} ${icon("arrow")}</a>
        </div>
      </div>
    </section>

    <section class="section tech">
      <div class="tech-copy">
        <p class="eyebrow reveal">04 — Technologie</p>
        <h2 class="h2 reveal">Kinetic<br>Foam™</h2>
        <p class="sec-lead reveal">Notre mousse brevetée, développée pendant trois ans avec des coureurs et des ingénieurs matériaux. Plus légère, plus réactive, plus durable.</p>
        <div class="stats">
          <div class="stat reveal"><strong><span data-count="32">0</span>%</strong><span>de retour d'énergie en plus</span></div>
          <div class="stat reveal" style="--d:.08s"><strong><span data-count="198">0</span>g</strong><span>pour notre modèle le plus léger</span></div>
          <div class="stat reveal" style="--d:.16s"><strong><span data-count="61">0</span>%</strong><span>de matières recyclées en moyenne</span></div>
          <div class="stat reveal" style="--d:.24s"><strong><span data-count="800">0</span>km</strong><span>de durée de vie testée</span></div>
        </div>
      </div>
      <div class="tech-media reveal">
        <img src="${img(PHOTOS.tech, 1000, 1250)}" alt="Sneaker en mouvement sous des lumières néon" loading="lazy">
        <div class="tech-chip">${icon("bolt")}<span><strong>+32 %</strong> d'énergie restituée vs EVA standard</span></div>
      </div>
    </section>

    <section class="section">
      <header class="sec-head">
        <div class="reveal"><p class="eyebrow">05 — Les incontournables</p><h2 class="h2">Nos<br>best-sellers</h2></div>
        <a class="link-arrow reveal" href="#/boutique?sort=note">Voir toute la boutique ${icon("arrow")}</a>
      </header>
      <div class="grid grid-4">${best.map((p, i) => productCard(p, { delay: i * 0.06 })).join("")}</div>
    </section>

    <section class="section">
      <header class="sec-head">
        <div class="reveal"><p class="eyebrow">06 — Avis clients</p><h2 class="h2">Ils ont pris<br>de l'élan</h2></div>
        <div class="score reveal"><strong>4,9</strong><div>${stars(4.9)}<p class="score-label">12 486 avis vérifiés</p></div></div>
      </header>
      <div class="reviews">
        ${REVIEWS.map((r, i) => {
          const p = byId(r.product);
          return `
          <figure class="review reveal" style="--d:${i * 0.07}s">
            ${stars(r.rating)}
            <blockquote>« ${esc(r.text)} »</blockquote>
            <figcaption>
              <span class="avatar" style="--c:${r.color}">${r.name[0]}</span>
              <span><strong>${esc(r.name)}</strong><small>${esc(r.city)} · Achat vérifié</small></span>
              <a href="#/produit/${p.id}" class="review-product" title="${esc(p.name)}"><img src="${img(p.photo, 120, 120)}" alt="${esc(p.name)}" loading="lazy"></a>
            </figcaption>
          </figure>`;
        }).join("")}
      </div>
    </section>

    <section class="section">
      <header class="sec-head">
        <div class="reveal"><p class="eyebrow">07 — Communauté</p><h2 class="h2">#PrendsTon<br>Élan</h2></div>
        <p class="sec-lead reveal">Partage tes sorties avec le hashtag : chaque mois, on offre une paire à notre photo préférée.</p>
      </header>
      <div class="lookbook">
        ${PHOTOS.lookbook.map((id, i) => `<figure class="look reveal" style="--d:${i * 0.06}s"><img src="${img(id, 600, 800)}" alt="Photo de la communauté ÉLAN" loading="lazy"><figcaption>@elan.crew</figcaption></figure>`).join("")}
      </div>
    </section>

    <section class="newsletter reveal">
      <div>
        <p class="eyebrow eyebrow-ink">Club ÉLAN</p>
        <h2 class="nl-title">−10 % sur<br>ta première paire</h2>
      </div>
      <div class="nl-side">
        <p>Accès anticipé aux drops, invitations aux runs du club et 10 % offerts dès l'inscription. Zéro spam, promis.</p>
        <form class="nl-form" data-newsletter novalidate>
          <label class="sr-only" for="nl-email">Adresse e-mail</label>
          <input id="nl-email" type="email" placeholder="ton@email.fr" autocomplete="email" required>
          <button class="btn btn-dark" type="submit">Je m'inscris</button>
        </form>
        <p class="nl-msg" data-nl-msg hidden></p>
      </div>
    </section>`;
  },

  mount(root) {
    const timers = [];

    // Compte à rebours du drop
    const cd = root.querySelector("[data-countdown]");
    if (cd) {
      const target = new Date(cd.dataset.countdown).getTime();
      const units = Object.fromEntries([...cd.querySelectorAll("[data-u]")].map((el) => [el.dataset.u, el]));
      const tick = () => {
        let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
        const vals = { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
        for (const k in vals) units[k].textContent = String(vals[k]).padStart(2, "0");
      };
      tick();
      timers.push(setInterval(tick, 1000));
    }

    // Carrousel des nouveautés
    const rail = root.querySelector("[data-rail]");
    const step = () => (rail.querySelector(".card")?.offsetWidth ?? 300) + 16;
    root.querySelector("[data-rail-prev]")?.addEventListener("click", () => rail.scrollBy({ left: -step() * 2, behavior: "smooth" }));
    root.querySelector("[data-rail-next]")?.addEventListener("click", () => rail.scrollBy({ left: step() * 2, behavior: "smooth" }));

    // Inclinaison 3D du visuel hero
    const frame = root.querySelector("[data-tilt]");
    const hero = root.querySelector(".hero");
    const onMove = (e) => {
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      frame.style.setProperty("--ry", `${px * 8}deg`);
      frame.style.setProperty("--rx", `${-py * 8}deg`);
      frame.style.setProperty("--mx", `${-px * 18}px`);
      frame.style.setProperty("--my", `${-py * 18}px`);
    };
    const onLeave = () => ["--rx", "--ry", "--mx", "--my"].forEach((v) => frame.style.removeProperty(v));
    if (!reducedMotion() && matchMedia("(pointer: fine)").matches) {
      hero.addEventListener("pointermove", onMove);
      hero.addEventListener("pointerleave", onLeave);
    }

    // Compteurs animés
    const counters = root.querySelectorAll("[data-count]");
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const end = Number(el.dataset.count);
        const t0 = performance.now();
        const dur = reducedMotion() ? 0 : 1400;
        const run = (t) => {
          const k = dur ? Math.min(1, (t - t0) / dur) : 1;
          el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(run);
        };
        requestAnimationFrame(run);
        countIO.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => countIO.observe(c));

    // Newsletter
    const form = root.querySelector("[data-newsletter]");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      const msg = root.querySelector("[data-nl-msg]");
      msg.hidden = false;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())) {
        msg.textContent = "Oups, cette adresse e-mail ne semble pas valide.";
        msg.classList.add("is-error");
        input.focus();
        return;
      }
      msg.classList.remove("is-error");
      msg.innerHTML = `Bienvenue au club ! Ton code : <strong>ELAN10</strong> — à saisir au panier.`;
      form.reset();
      toast(`${icon("check")}<span>Inscription confirmée. Code <strong>ELAN10</strong> envoyé.</span>`);
    });

    return () => {
      timers.forEach(clearInterval);
      countIO.disconnect();
    };
  },
};
