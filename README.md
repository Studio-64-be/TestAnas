# ÉLAN — boutique de sneakers (démo)

Site e-commerce complet pour une marque de sneakers fictive, avec un tunnel de paiement **simulé** (aucun paiement réel, aucune donnée envoyée).

## Lancer le site

Aucune dépendance à installer, il suffit de Node.js :

```bash
node server.mjs
```

Puis ouvrir http://localhost:4800 (le port se change avec `PORT=5000 node server.mjs`).

## Ce qu'il y a dedans

- **Accueil** : hero animé, nouveautés en carrousel, univers en bento, drop limité avec compte à rebours, technologie, best-sellers, avis, communauté, newsletter.
- **Boutique** : 19 modèles, filtres (catégorie, prix, pointure, couleur, nouveautés, promos), tri, recherche, favoris.
- **Fiche produit** : galerie avec zoom, choix de pointure, guide des tailles, ajout au panier animé.
- **Panier** : panier latéral et page panier, quantités, barre de livraison offerte, codes promo.
- **Paiement** : 3 étapes (coordonnées, livraison, paiement), validation des champs, carte bancaire en 3D qui se met à jour en direct, paiement en 3× sans frais, 3-D Secure simulé, page de confirmation.

## Données de test

| Carte | Résultat |
|---|---|
| `4242 4242 4242 4242` | Paiement accepté |
| `4000 0000 0000 3220` | Demande un code 3-D Secure : `123456` |
| `4000 0000 0000 0002` | Carte refusée |
| `4000 0000 0000 9995` | Fonds insuffisants |
| `5555 5555 5555 4444` | Mastercard acceptée |

Date d'expiration future et cryptogramme au choix.

Codes promo : `ELAN10` (−10 %) et `ELAN20` (−20 € dès 150 €).

## Structure

```
index.html              coquille de la page (en-tête, pied de page, panier, recherche, menu)
server.mjs              petit serveur statique Node
assets/css/styles.css   tout le design
assets/js/app.js        routeur et composants globaux
assets/js/data.js       catalogue produits
assets/js/store.js      panier, favoris, commandes (localStorage)
assets/js/ui.js         composants partagés
assets/js/views/        une vue par page
```

## À savoir

Les photos viennent d'Unsplash et sont chargées depuis leur CDN : il faut une connexion internet. Plusieurs montrent des logos de vraies marques. Remplace-les par tes propres visuels avant toute mise en ligne publique.
