// Page introuvable
import { icon } from "../ui.js";

export default {
  title: "Page introuvable — ÉLAN",
  render() {
    return `
    <section class="notfound">
      <p class="eyebrow">Erreur 404</p>
      <h1 class="display-xl">Hors<br>piste.</h1>
      <p class="lead">Cette page a pris un peu trop d'élan. Revenons sur le bon chemin.</p>
      <div class="hero-ctas">
        <a class="btn btn-dark btn-lg" href="#/">Retour à l'accueil</a>
        <a class="btn btn-outline btn-lg" href="#/boutique">Voir la boutique ${icon("arrow")}</a>
      </div>
    </section>`;
  },
};
