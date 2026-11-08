// Catalogue ÉLAN — produits, catégories et visuels (photos Unsplash, chargées à la volée)

const BASE = "https://images.unsplash.com/photo-";

/** URL d'une photo recadrée à la taille voulue. */
export const img = (id, w = 900, h = Math.round(w * 1.25), extra = "") =>
  `${BASE}${id}?auto=format&fit=crop&w=${w}&h=${h}&q=78${extra}`;

/** Même photo, zoomée sur un point focal (vues « détail »). */
export const zoom = (id, w, h, x = 0.5, y = 0.5, z = 1.8) =>
  img(id, w, h, `&crop=focalpoint&fp-x=${clamp(x)}&fp-y=${clamp(y)}&fp-z=${z}`);

const clamp = (n) => Math.min(0.95, Math.max(0.05, n)).toFixed(2);

export const SIZES = [38, 39, 40, 41, 42, 43, 44, 45, 46];

export const CATEGORIES = [
  { id: "running", label: "Running", blurb: "Légères, réactives, prêtes pour ton prochain record.", photo: "1514989940723-e8e51635b782" },
  { id: "lifestyle", label: "Lifestyle", blurb: "Le confort d'une running, l'allure d'une pièce de créateur.", photo: "1460353581641-37baddab0fa2" },
  { id: "court", label: "Court", blurb: "Les classiques du court, réinventés pour la rue.", photo: "1600185365926-3a2ce3cdb9eb" },
  { id: "basket", label: "Basket", blurb: "Maintien total, amorti maximal, style sans compromis.", photo: "1552346154-21d32810aba3" },
  { id: "trail", label: "Trail", blurb: "Une accroche qui ne lâche rien, sur tous les terrains.", photo: "1562183241-b937e95585b6" },
];

export const COLOR_FAMILIES = [
  { id: "noir", label: "Noir", hex: "#141414" },
  { id: "blanc", label: "Blanc", hex: "#f6f5f1" },
  { id: "neutre", label: "Neutre", hex: "#c9b89c" },
  { id: "rouge", label: "Rouge", hex: "#d4271c" },
  { id: "rose", label: "Rose", hex: "#f2a6a0" },
  { id: "jaune", label: "Jaune", hex: "#f2c21b" },
  { id: "vert", label: "Vert", hex: "#6f7a3a" },
  { id: "bleu", label: "Bleu", hex: "#2f7cf6" },
  { id: "multi", label: "Multi", hex: "conic-gradient(#f2c21b, #d4271c, #2f7cf6, #6f7a3a, #f2c21b)" },
];

const SPECS = {
  running: { poids: "212 g", drop: "8 mm", amorti: "Kinetic Foam™ réactif", usage: "Route, 5 km au marathon" },
  lifestyle: { poids: "340 g", drop: "10 mm", amorti: "Cloud EVA double densité", usage: "Ville, au quotidien" },
  court: { poids: "380 g", drop: "6 mm", amorti: "Semelle cupsole cousue", usage: "Ville, look intemporel" },
  basket: { poids: "420 g", drop: "9 mm", amorti: "Kinetic Foam™ + air pods", usage: "Parquet, playground" },
  trail: { poids: "296 g", drop: "6 mm", amorti: "Kinetic Foam™ + plaque rock-guard", usage: "Sentiers, boue, roche" },
};

const P = (o) => ({
  isNew: false,
  oldPrice: null,
  badge: null,
  soldOut: [],
  fp: [0.5, 0.55],
  ...o,
  specs: SPECS[o.category],
});

export const PRODUCTS = [
  P({
    id: "rouge-vitesse", ref: "EL-001", name: "Rouge Vitesse", category: "running", price: 149,
    color: "Rouge feu", hex: "#d8261c", family: "rouge", photo: "1542291026-7eec264c27ff",
    rating: 4.9, reviews: 1284, badge: "Best-seller", soldOut: [38, 46], fp: [0.5, 0.5],
    tagline: "Notre runner signature. Pour courir vite, et longtemps.",
    description: "Une tige en mesh technique ultra-respirant, un talon sculpté qui verrouille le pied et notre mousse Kinetic Foam™ qui te renvoie l'énergie de chaque foulée. Pensée pour le 10 km du dimanche comme pour le métro du lundi.",
    features: ["Mesh respirant 100 % recyclé", "Semelle Kinetic Foam™ +32 % de retour d'énergie", "Languette chaussette sans couture", "Réfléchissants 360° pour la nuit"],
  }),
  P({
    id: "neon-volt", ref: "EL-002", name: "Néon Volt", category: "running", price: 139,
    color: "Citron électrique", hex: "#c8f03c", family: "vert", photo: "1606107557195-0e29a4b5b4aa",
    rating: 4.8, reviews: 612, badge: "Nouveau", isNew: true, soldOut: [45],
    tagline: "Le fractionné n'a jamais été aussi lumineux.",
    description: "Conçue pour les séances explosives : tige ajustée, avant-pied dynamique et semelle crantée pour des relances instantanées. Impossible de passer inaperçu.",
    features: ["Tige knit ajustée", "Avant-pied rocker pour les relances", "Semelle crantée multi-surfaces", "Poids plume : 198 g"],
  }),
  P({
    id: "ombre-knit", ref: "EL-003", name: "Ombre Knit", category: "running", price: 159,
    color: "Graphite", hex: "#3a3b3f", family: "noir", photo: "1491553895911-0055eca6402d",
    rating: 4.7, reviews: 431, fp: [0.5, 0.45],
    tagline: "Le confort d'une chaussette, la tenue d'une running.",
    description: "Une tige tricotée d'une seule pièce qui épouse ton pied comme une seconde peau. Discrète, minimaliste, redoutablement confortable — de la piste au bureau.",
    features: ["Tige tricotée monobloc", "Col chaussette stretch", "Amorti Kinetic Foam™", "Lavable en machine à 30 °C"],
  }),
  P({
    id: "azur-flow", ref: "EL-004", name: "Azur Flow", category: "running", price: 128, oldPrice: 160,
    color: "Bleu azur", hex: "#2f7cf6", family: "bleu", photo: "1515955656352-a1fa3ffcd111",
    rating: 4.6, reviews: 289, badge: "-20 %", soldOut: [39, 40],
    tagline: "Fluide, aérienne, faite pour les sorties longues.",
    description: "Un amorti généreux sur toute la longueur et un drop doux pour enchaîner les kilomètres sans y penser. Sa teinte azur est un hommage aux matins sur la côte.",
    features: ["Amorti maximal pleine longueur", "Mesh engineered aéré", "Contrefort talon renforcé", "Semelle caoutchouc carbone"],
  }),
  P({
    id: "marathon-42", ref: "EL-005", name: "Marathon 42", category: "running", price: 169,
    color: "Acier & azur", hex: "#6b8299", family: "bleu", photo: "1637437757614-6491c8e915b5",
    rating: 4.9, reviews: 377,
    tagline: "42,195 km. Zéro compromis.",
    description: "Notre modèle le plus technique : plaque de propulsion en nylon, double densité de mousse et tige ultra-légère. Elle a été testée sur plus de 10 000 km par notre club de coureurs.",
    features: ["Plaque de propulsion nylon", "Double densité Kinetic Foam™", "Tige monofilament ultra-légère", "Validée sur 10 000 km"],
  }),
  P({
    id: "aube-pastel", ref: "EL-006", name: "Aube Pastel", category: "lifestyle", price: 119,
    color: "Lilas & pêche", hex: "#c9b8f0", family: "rose", photo: "1595950653106-6c9ebd614d3a",
    rating: 4.8, reviews: 524, badge: "Nouveau", isNew: true,
    tagline: "Des couleurs de lever de soleil, au quotidien.",
    description: "Une silhouette basse aux tons pastel, cuir velours et toile mêlés. Douce à porter, facile à assortir, elle illumine les tenues les plus simples.",
    features: ["Cuir velours & toile", "Semelle Cloud EVA", "Doublure respirante", "Lacets coton bio"],
  }),
  P({
    id: "sahara-daim", ref: "EL-007", name: "Sahara Daim", category: "lifestyle", price: 135,
    color: "Camel", hex: "#b9823d", family: "neutre", photo: "1549298916-b41d501d3772",
    rating: 4.7, reviews: 318, soldOut: [44],
    tagline: "Le daim camel qui se patine avec toi.",
    description: "Un daim italien pleine fleur, une semelle gomme naturelle et des finitions cousues main. Une sneaker qui vieillit bien — et qui gagne en caractère à chaque sortie.",
    features: ["Daim italien pleine fleur", "Semelle gomme naturelle", "Finitions cousues main", "Traitement déperlant"],
  }),
  P({
    id: "prisme", ref: "EL-008", name: "Prisme", category: "lifestyle", price: 145,
    color: "Multicolore", hex: "#e9a23b", family: "multi", photo: "1595341888016-a392ef81b7de",
    rating: 4.6, reviews: 207, fp: [0.5, 0.6],
    tagline: "Une chunky qui ose toutes les couleurs.",
    description: "Superposition de matières, semelle sculptée XXL et palette audacieuse : Prisme est la pièce forte de ta collection. Elle ne se porte pas, elle s'affiche.",
    features: ["Semelle chunky sculptée", "Superposition mesh, cuir et suède", "Rembourrage col XXL", "Semelle Cloud EVA"],
  }),
  P({
    id: "corail", ref: "EL-009", name: "Corail", category: "lifestyle", price: 125,
    color: "Rose corail", hex: "#f2a28f", family: "rose", photo: "1608667508764-33cf0726b13a",
    rating: 4.7, reviews: 266, soldOut: [45, 46],
    tagline: "La touche douce d'une silhouette affirmée.",
    description: "Une semelle ondulée inspirée des archives running des années 90 et une tige rose corail, nuancée de blanc cassé. Le rétro, version 2026.",
    features: ["Design inspiré des archives 90's", "Semelle ondulée Cloud EVA", "Empiècements suède", "Talon renforcé"],
  }),
  P({
    id: "beton", ref: "EL-010", name: "Béton", category: "lifestyle", price: 129,
    color: "Gris ciment", hex: "#8d8f93", family: "neutre", photo: "1588361861040-ac9b1018f6d5",
    rating: 4.5, reviews: 198,
    tagline: "Monochrome, brute, urbaine.",
    description: "Un ton sur ton gris ciment, de la tige à la semelle. Béton est la sneaker caméléon par excellence : elle se fond dans toutes tes tenues, du lundi au dimanche.",
    features: ["Total look monochrome", "Tige nubuck & mesh", "Semelle Cloud EVA", "Semelle intérieure amovible"],
  }),
  P({
    id: "court-absolu", ref: "EL-011", name: "Court Absolu", category: "court", price: 109,
    color: "Blanc pur", hex: "#f4f4f2", family: "blanc", photo: "1608231387042-66d1773070a5",
    rating: 4.9, reviews: 2016, badge: "Best-seller", fp: [0.5, 0.5],
    tagline: "La sneaker blanche parfaite. Point.",
    description: "Cuir pleine fleur, semelle cupsole cousue et ligne épurée : notre best-seller absolu. Celle qu'on porte avec un costume comme avec un jogging.",
    features: ["Cuir pleine fleur", "Semelle cupsole cousue", "Doublure cuir", "Fabriquée au Portugal"],
  }),
  P({
    id: "terracotta", ref: "EL-012", name: "Terracotta", category: "court", price: 115,
    color: "Craie & sable", hex: "#e7d8c2", family: "neutre", photo: "1603808033192-082d6919d3e1",
    rating: 4.6, reviews: 174,
    tagline: "Les tons chauds du Sud, sur une ligne court.",
    description: "Une base craie relevée d'accents sable, sur une semelle gomme écrue. Une sneaker solaire, inspirée des courts de terre battue.",
    features: ["Cuir & suède mêlés", "Semelle gomme écrue", "Œillets métal mat", "Semelle intérieure liège"],
  }),
  P({
    id: "soleil-low", ref: "EL-013", name: "Soleil Low", category: "court", price: 119,
    color: "Jaune soleil", hex: "#f4c021", family: "jaune", photo: "1628253747716-0c4f5c90fdda",
    rating: 4.8, reviews: 143, badge: "Édition limitée", soldOut: [38, 39, 46],
    tagline: "Un rayon de soleil, en édition limitée.",
    description: "Un jaune franc, éclatant, sur notre ligne court iconique. Produite à 1 500 exemplaires seulement — quand c'est fini, c'est fini.",
    features: ["Édition limitée à 1 500 paires", "Cuir verni & mat", "Semelle cupsole cousue", "Boîte collector"],
  }),
  P({
    id: "orbit-pro", ref: "EL-014", name: "Orbit Pro", category: "basket", price: 179,
    color: "Noir onyx", hex: "#1b1b1d", family: "noir", photo: "1605348532760-6753d2c43329",
    rating: 4.8, reviews: 356, isNew: true, badge: "Nouveau",
    tagline: "Décolle. Atterris. Recommence.",
    description: "Conçue avec des joueurs de playground : maintien latéral renforcé, amorti réactif à l'avant-pied et accroche chevrons pour les changements d'appui les plus vifs.",
    features: ["Maintien latéral renforcé", "Amorti avant-pied réactif", "Semelle à chevrons", "Col rembourré mémoire de forme"],
  }),
  P({
    id: "rubis-hi", ref: "EL-015", name: "Rubis Hi", category: "basket", price: 159,
    color: "Rouge rubis", hex: "#c3122f", family: "rouge", photo: "1575537302964-96cd47c06b1b",
    rating: 4.7, reviews: 289, soldOut: [40],
    tagline: "La montante qui ne passe pas inaperçue.",
    description: "Un rouge rubis profond, une tige montante en cuir grainé et une silhouette héritée des parquets des années 80. Une icône instantanée.",
    features: ["Cuir grainé premium", "Tige montante maintien cheville", "Semelle cupsole", "Détails ton sur ton"],
  }),
  P({
    id: "kaki-trail", ref: "EL-016", name: "Kaki Trail", category: "trail", price: 155,
    color: "Vert olive", hex: "#6f7546", family: "vert", photo: "1539185441755-769473a23570",
    rating: 4.9, reviews: 402,
    tagline: "Testée sur 40 km de sentiers alpins.",
    description: "Crampons de 5 mm, plaque rock-guard et tige déperlante : Kaki Trail est taillée pour les sentiers techniques, sans sacrifier le style une fois redescendu en ville.",
    features: ["Crampons multidirectionnels 5 mm", "Plaque rock-guard", "Tige déperlante", "Pare-pierres renforcé"],
  }),
  P({
    id: "lagon", ref: "EL-017", name: "Lagon", category: "trail", price: 165,
    color: "Bleu lagon", hex: "#2a9bb5", family: "bleu", photo: "1520256862855-398228c41684",
    rating: 4.7, reviews: 118, isNew: true, badge: "Nouveau",
    tagline: "Du bitume aux crêtes, sans changer de paire.",
    description: "Une trail hybride : assez souple pour la route, assez accrocheuse pour les chemins. Son coloris lagon a été pensé pour les sorties au bord de l'eau.",
    features: ["Semelle hybride route & chemins", "Drainage rapide", "Laçage rapide à cordon", "Kinetic Foam™"],
  }),
  P({
    id: "foret", ref: "EL-018", name: "Forêt", category: "trail", price: 140, oldPrice: 175,
    color: "Vert forêt", hex: "#4a4a33", family: "vert", photo: "1576672843344-f01907a9d40c",
    rating: 4.6, reviews: 231, badge: "-20 %",
    tagline: "Robuste, sobre, increvable.",
    description: "Une trail en suède huilé qui ne craint ni la boue ni la pluie. Son profil bas et ses tons forêt la rendent aussi crédible en randonnée qu'en terrasse.",
    features: ["Suède huilé imperméable", "Semelle crantée gomme", "Doublure respirante", "Contrefort anti-torsion"],
  }),
  P({
    id: "nocturne-01", ref: "EL-019", name: "Nocturne 01", category: "lifestyle", price: 219,
    color: "Noir nuit", hex: "#111111", family: "noir", photo: "1518002171953-a080ee817e1f",
    rating: 5.0, reviews: 64, isNew: true, badge: "Drop", limited: true, soldOut: [41, 42], fp: [0.5, 0.5],
    tagline: "Drop 004 — 500 paires numérotées. Pas une de plus.",
    description: "Notre drop le plus ambitieux : une tige en nubuck noir profond, des détails réfléchissants qui s'allument la nuit et une semelle translucide. Chaque paire est numérotée et livrée dans un coffret signé.",
    features: ["500 paires numérotées", "Nubuck noir & détails réfléchissants", "Semelle translucide", "Coffret collector signé"],
  }),
];

export const byId = (id) => PRODUCTS.find((p) => p.id === id);
export const catLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

/** 4 vues produit : plan large + 3 détails zoomés. */
export function gallery(p, w = 1100) {
  const h = Math.round(w * 1.25);
  const [x, y] = p.fp;
  return [
    img(p.photo, w, h),
    zoom(p.photo, w, h, x, y, 1.6),
    zoom(p.photo, w, h, x - 0.18, y + 0.05, 2.4),
    zoom(p.photo, w, h, x + 0.18, y - 0.02, 2.4),
  ];
}

export const PHOTOS = {
  hero: "1542291026-7eec264c27ff",
  drop: "1518002171953-a080ee817e1f",
  tech: "1604671801908-6f0c6a092c05",
  lookbook: [
    "1556906781-9a412961c28c",
    "1516478177764-9fe5bd7e9717",
    "1600181516264-3ea807ff44b9",
    "1551107696-a4b0c5a0d9a2",
    "1611510338559-2f463335092c",
  ],
};
