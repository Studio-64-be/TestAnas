// État de la boutique : panier, favoris, commandes — persistés dans le navigateur
import { byId } from "./data.js";

const KEYS = { cart: "elan.cart.v1", wish: "elan.wish.v1", orders: "elan.orders.v1" };
const memory = {}; // repli si le stockage du navigateur est indisponible

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return memory[key] ?? fallback;
}

function save(key, value) {
  memory[key] = value;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const round = (n) => Math.round(n * 100) / 100;

/* ---------- Abonnements ---------- */
const listeners = new Set();
export const subscribe = (fn) => (listeners.add(fn), () => listeners.delete(fn));
const emit = (type) => listeners.forEach((fn) => fn(type));

/* ---------- Panier ---------- */
let cart = load(KEYS.cart, { items: [], promo: null });
cart.items = (cart.items || []).filter((i) => byId(i.id) && i.qty > 0);

function commitCart() {
  save(KEYS.cart, cart);
  emit("cart");
}

export const MAX_QTY = 10;
export const FREE_SHIPPING = 120;

export const cartItems = () => cart.items.map((i) => ({ ...i, product: byId(i.id) }));
export const cartCount = () => cart.items.reduce((n, i) => n + i.qty, 0);

export function addToCart(id, size, qty = 1) {
  const key = `${id}:${size}`;
  const existing = cart.items.find((i) => i.key === key);
  if (existing) existing.qty = Math.min(existing.qty + qty, MAX_QTY);
  else cart.items.push({ key, id, size, qty });
  commitCart();
}

export function setQty(key, qty) {
  const item = cart.items.find((i) => i.key === key);
  if (!item) return;
  if (qty <= 0) return removeItem(key);
  item.qty = Math.min(qty, MAX_QTY);
  commitCart();
}

export function removeItem(key) {
  cart.items = cart.items.filter((i) => i.key !== key);
  if (!cart.items.length) cart.promo = null;
  commitCart();
}

export function clearCart() {
  cart = { items: [], promo: null };
  commitCart();
}

/* ---------- Codes promo ---------- */
export const PROMOS = {
  ELAN10: { type: "percent", value: 10, label: "−10 % de bienvenue" },
  ELAN20: { type: "amount", value: 20, min: 150, label: "−20 € dès 150 € d'achat" },
};

const subtotal = () => round(cartItems().reduce((s, i) => s + i.product.price * i.qty, 0));

export function applyPromo(raw) {
  const code = String(raw || "").trim().toUpperCase();
  const promo = PROMOS[code];
  if (!code) return { ok: false, msg: "Saisis un code promo." };
  if (!promo) return { ok: false, msg: "Ce code n'existe pas ou a expiré." };
  if (promo.min && subtotal() < promo.min)
    return { ok: false, msg: `Ce code est valable dès ${promo.min} € d'achat.` };
  cart.promo = code;
  commitCart();
  return { ok: true, msg: `Code ${code} appliqué : ${promo.label}` };
}

export function removePromo() {
  cart.promo = null;
  commitCart();
}

/* ---------- Livraison & totaux ---------- */
export const SHIPPING = {
  standard: { id: "standard", label: "Livraison standard", eta: "3 à 5 jours ouvrés", days: 5, price: (s) => (s >= FREE_SHIPPING ? 0 : 4.9) },
  express: { id: "express", label: "Express", eta: "24 à 48 h", days: 2, price: () => 9.9 },
  relay: { id: "relay", label: "Point relais", eta: "3 à 4 jours ouvrés", days: 4, price: () => 0 },
};

export function totals(shippingId = "standard") {
  const sub = subtotal();
  const promo = cart.promo ? PROMOS[cart.promo] : null;
  let discount = 0;
  if (promo?.type === "percent") discount = round((sub * promo.value) / 100);
  if (promo?.type === "amount" && sub >= promo.min) discount = promo.value;
  const afterDiscount = round(sub - discount);
  const method = SHIPPING[shippingId] || SHIPPING.standard;
  const shipping = cart.items.length ? method.price(afterDiscount) : 0;
  return {
    count: cartCount(),
    subtotal: sub,
    discount,
    promo: discount > 0 ? cart.promo : null,
    afterDiscount,
    shipping,
    total: round(afterDiscount + shipping),
    toFreeShipping: Math.max(0, round(FREE_SHIPPING - afterDiscount)),
  };
}

/* ---------- Favoris ---------- */
let wish = new Set(load(KEYS.wish, []));

export const isWished = (id) => wish.has(id);
export const wishCount = () => wish.size;

export function toggleWish(id) {
  wish.has(id) ? wish.delete(id) : wish.add(id);
  save(KEYS.wish, [...wish]);
  emit("wish");
  return wish.has(id);
}

/* ---------- Commandes ---------- */
export function saveOrder(order) {
  const orders = load(KEYS.orders, {});
  orders[order.id] = order;
  save(KEYS.orders, orders);
}

export const getOrder = (id) => load(KEYS.orders, {})[id] ?? null;
