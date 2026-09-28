/* ==========================================================================
   main.js
   Shared logic loaded on EVERY page: navigation, storage helpers, cart/
   wishlist helpers, image fallback, and homepage-only widgets guarded by
   element checks so this file is safe to include everywhere.
   ========================================================================== */

/* --------------------------------------------------------------------------
   localStorage keys (single source of truth, per assignment spec)
   -------------------------------------------------------------------------- */
const LS_CART = "toyHavenCart";
const LS_WISHLIST = "toyHavenWishlist";
const LS_ORDERS = "toyHavenOrders";
const LS_FEEDBACK = "toyHavenFeedback";
const LS_NEWSLETTER = "toyHavenNewsletter";

/* --------------------------------------------------------------------------
   Safe localStorage helpers (never let a corrupt value crash the page)
   -------------------------------------------------------------------------- */
function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`Could not read "${key}" from storage:`, err);
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Could not save "${key}" to storage:`, err);
    return false;
  }
}

/* --------------------------------------------------------------------------
   Cart helpers (reused by products.js, cart.js, checkout.js)
   Cart item shape: { id, name, price, image, qty }
   -------------------------------------------------------------------------- */
function getCart() {
  return safeGet(LS_CART, []);
}

function saveCart(cart) {
  safeSet(LS_CART, cart);
  updateCartCount();
}

function addToCart(product, qty = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty
    });
  }
  saveCart(cart);
}

function removeFromCart(id) {
  const cart = getCart().filter((item) => item.id !== id);
  saveCart(cart);
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = count;
    el.classList.toggle("is-hidden", count === 0);
  });
}

/* --------------------------------------------------------------------------
   Wishlist helpers (reused by products.js, wishlist.js)
   Wishlist item shape: { id, name, price, image, status }
   status is one of: "interested" | "owned" | "not-interested"
   -------------------------------------------------------------------------- */
function getWishlist() {
  return safeGet(LS_WISHLIST, []);
}

function saveWishlist(list) {
  safeSet(LS_WISHLIST, list);
  updateWishlistCount();
}

function addToWishlist(product, status = "interested") {
  const list = getWishlist();
  const existing = list.find((item) => item.id === product.id);
  if (existing) {
    existing.status = status;
  } else {
    list.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      status
    });
  }
  saveWishlist(list);
}

function removeFromWishlist(id) {
  const list = getWishlist().filter((item) => item.id !== id);
  saveWishlist(list);
}

function updateWishlistCount() {
  const count = getWishlist().length;
  document.querySelectorAll("[data-wishlist-count]").forEach((el) => {
    el.textContent = count;
    el.classList.toggle("is-hidden", count === 0);
  });
}

/* --------------------------------------------------------------------------
   Validation helpers (reused by checkout.js and feedback.js)
   -------------------------------------------------------------------------- */
function validateEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(String(email).trim());
}

function validateNotEmpty(value) {
  return String(value).trim().length > 0;
}

/* Toggles the shared .is-invalid state + inline error message on a .field wrapper.
   Reused by checkout.js and feedback.js so validation UI stays consistent. */
function setFieldValid(fieldId, isValid) {
  const field = document.getElementById(fieldId);
  if (field) field.classList.toggle("is-invalid", !isValid);
}

/* --------------------------------------------------------------------------
   Image fallback: swap in a placeholder if a product image fails to load.
   Usage: <img src="..." onerror="handleImageError(this)">
   -------------------------------------------------------------------------- */
function handleImageError(imgEl) {
  imgEl.onerror = null; // prevent infinite loop if the fallback also fails
  imgEl.src = buildPlaceholder(imgEl.dataset.name || imgEl.alt || "Toy Haven");
}

function buildPlaceholder(label) {
  const initials = label
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
    <rect width="100%" height="100%" fill="#E4F0FA"/>
    <text x="50%" y="50%" font-family="Fredoka, sans-serif" font-size="64" font-weight="700"
      fill="#145DA0" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  </svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
}

/* --------------------------------------------------------------------------
   Navigation: hamburger menu + active link + shrink-on-scroll header
   -------------------------------------------------------------------------- */
function initNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");
  const header = document.querySelector(".site-header");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close the menu whenever a link inside it is chosen (mobile UX)
    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (header) {
    window.addEventListener("scroll", () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    });
  }

  // Mark the current page's nav link as active for orientation
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-menu a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === current) link.setAttribute("aria-current", "page");
  });
}

/* --------------------------------------------------------------------------
   Hero image slider (home page only)
   -------------------------------------------------------------------------- */
function initHeroSlider() {
  const slider = document.querySelector(".hero-slider");
  if (!slider) return;

  const slides = slider.querySelectorAll(".hero-slide");
  const dotsWrap = slider.querySelector(".hero-slider-dots");
  let index = 0;
  let timer;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "hero-slider-dot";
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = dotsWrap.querySelectorAll(".hero-slider-dot");

  function render() {
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    render();
    resetTimer();
  }

  function next() {
    goTo(index + 1);
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(next, 5000);
  }

  render();
  resetTimer();
}

/* --------------------------------------------------------------------------
   Product of the Day (home page only) - deterministic per calendar day
   -------------------------------------------------------------------------- */
function initProductOfTheDay() {
  const wrap = document.querySelector("[data-potd]");
  if (!wrap || typeof PRODUCTS === "undefined") return;

  const dayIndex = Math.floor(Date.now() / 86400000) % PRODUCTS.length;
  const product = PRODUCTS[dayIndex];

  wrap.querySelector("[data-potd-image]").src = product.image;
  wrap.querySelector("[data-potd-image]").dataset.name = product.name;
  wrap.querySelector("[data-potd-name]").textContent = product.name;
  wrap.querySelector("[data-potd-desc]").textContent = product.description;
  wrap.querySelector("[data-potd-price]").textContent = `$${product.price.toFixed(2)}`;

  const addBtn = wrap.querySelector("[data-potd-add]");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      addToCart(product);
      announce(`${product.name} added to your cart`);
    });
  }
}

/* --------------------------------------------------------------------------
   Newsletter sign-up (home page only) - stores emails in localStorage
   -------------------------------------------------------------------------- */
function initNewsletter() {
  const form = document.querySelector("#newsletter-form");
  if (!form) return;

  const input = form.querySelector("input[type='email']");
  const message = form.querySelector("[data-newsletter-message]");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = input.value;

    if (!validateEmail(email)) {
      message.textContent = "Please enter a valid email address.";
      message.className = "form-message is-error";
      return;
    }

    const list = safeGet(LS_NEWSLETTER, []);
    if (list.includes(email.toLowerCase())) {
      message.textContent = "You're already on the list — thank you!";
      message.className = "form-message is-success";
    } else {
      list.push(email.toLowerCase());
      safeSet(LS_NEWSLETTER, list);
      message.textContent = "Subscribed! Watch your inbox for new arrivals.";
      message.className = "form-message is-success";
    }
    form.reset();
  });
}

/* --------------------------------------------------------------------------
   Reveal-on-scroll using IntersectionObserver (used across pages)
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll("[data-reveal]");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------------
   Small accessible "toast" announcer, reused by cart/wishlist actions
   -------------------------------------------------------------------------- */
function announce(text) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add("is-visible");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

/* --------------------------------------------------------------------------
   Footer year stamp
   -------------------------------------------------------------------------- */
function initFooterYear() {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

/* --------------------------------------------------------------------------
   Boot sequence common to every page
   -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  updateCartCount();
  updateWishlistCount();
  initFooterYear();
  initScrollReveal();
  initHeroSlider();
  initProductOfTheDay();
  initNewsletter();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch((err) => {
      console.warn("Service worker registration failed:", err);
    });
  }
});
