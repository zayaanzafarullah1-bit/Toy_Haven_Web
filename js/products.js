/* ==========================================================================
   products.js
   Product card rendering (shared with index.html), the product modal, and
   the full search / filter / sort experience on products.html.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Card markup — a single source of truth so the homepage and the products
   page always render identical cards.
   -------------------------------------------------------------------------- */
function renderProductCard(product) {
  const wishlist = getWishlist();
  const inWishlist = wishlist.some((item) => item.id === product.id);
  const stars = "★".repeat(Math.round(product.rating)) + "☆".repeat(5 - Math.round(product.rating));

  return `
    <article class="product-card" data-id="${product.id}">
      ${product.badge ? `<span class="badge">${product.badge}</span>` : ""}
      <button
        class="btn-icon wishlist-btn ${inWishlist ? "is-active" : ""}"
        data-action="wishlist"
        data-id="${product.id}"
        aria-pressed="${inWishlist}"
        aria-label="${inWishlist ? "Remove from wishlist" : "Add to wishlist"}"
      >♥</button>
      <button class="product-thumb" data-action="open-modal" data-id="${product.id}" aria-label="View ${product.name} details" style="border:none;padding:0;width:100%;">
        <img src="${product.image}" alt="${product.name}" data-name="${product.name}" onerror="handleImageError(this)" loading="lazy" />
      </button>
      <div class="product-body">
        <span class="category-tag">${CATEGORY_LABELS[product.category]}</span>
        <h3><button data-action="open-modal" data-id="${product.id}" style="background:none;border:none;padding:0;text-align:left;font:inherit;color:inherit;">${product.name}</button></h3>
        <p class="rating" aria-label="Rated ${product.rating} out of 5">${stars} <span>(${product.rating})</span></p>
        <div class="product-footer">
          <span class="price">$${product.price.toFixed(2)}</span>
          ${
            product.stock
              ? `<button class="btn btn-primary btn-sm" data-action="add-cart" data-id="${product.id}">Add to cart</button>`
              : `<span class="stock-out">Out of stock</span>`
          }
        </div>
      </div>
    </article>`;
}

/* --------------------------------------------------------------------------
   Event delegation for any container of product cards (grid or featured list)
   -------------------------------------------------------------------------- */
function attachProductCardEvents(container) {
  container.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) return;

    if (btn.dataset.action === "add-cart") {
      addToCart(product);
      announce(`${product.name} added to your cart`);
    }

    if (btn.dataset.action === "wishlist") {
      const already = getWishlist().some((item) => item.id === id);
      if (already) {
        removeFromWishlist(id);
        btn.classList.remove("is-active");
        btn.setAttribute("aria-pressed", "false");
        btn.setAttribute("aria-label", "Add to wishlist");
        announce(`${product.name} removed from wishlist`);
      } else {
        addToWishlist(product, "interested");
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        btn.setAttribute("aria-label", "Remove from wishlist");
        announce(`${product.name} added to wishlist`);
      }
    }

    if (btn.dataset.action === "open-modal") {
      openProductModal(product);
    }
  });
}

/* --------------------------------------------------------------------------
   Accessible product modal — built once, reused for every product
   -------------------------------------------------------------------------- */
let modalEl = null;

function ensureModal() {
  if (modalEl) return modalEl;

  modalEl = document.createElement("div");
  modalEl.className = "modal-overlay";
  modalEl.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" style="position:relative;">
      <button class="btn-icon modal-close" aria-label="Close dialog">✕</button>
      <div class="modal-grid">
        <div class="product-thumb">
          <img id="modal-image" src="" alt="" onerror="handleImageError(this)" />
        </div>
        <div>
          <span class="category-tag" id="modal-category"></span>
          <h3 id="modal-title" style="margin-top:0.5rem;"></h3>
          <p class="rating" id="modal-rating"></p>
          <p id="modal-desc"></p>
          <p class="price" id="modal-price" style="font-size:1.4rem;margin-top:0.75rem;"></p>
          <p id="modal-stock" class="stock-out" style="display:none;">Currently out of stock</p>
          <div class="modal-actions">
            <div class="qty-stepper">
              <button type="button" id="modal-qty-minus" aria-label="Decrease quantity">−</button>
              <input id="modal-qty" type="number" min="1" value="1" aria-label="Quantity" />
              <button type="button" id="modal-qty-plus" aria-label="Increase quantity">+</button>
            </div>
            <button class="btn btn-primary" id="modal-add-cart">Add to cart</button>
            <button class="btn btn-ghost" id="modal-add-wishlist">Add to wishlist</button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modalEl);

  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) closeProductModal();
  });
  modalEl.querySelector(".modal-close").addEventListener("click", closeProductModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalEl.classList.contains("is-open")) closeProductModal();
  });

  modalEl.querySelector("#modal-qty-minus").addEventListener("click", () => {
    const input = modalEl.querySelector("#modal-qty");
    input.value = Math.max(1, Number(input.value) - 1);
  });
  modalEl.querySelector("#modal-qty-plus").addEventListener("click", () => {
    const input = modalEl.querySelector("#modal-qty");
    input.value = Number(input.value) + 1;
  });

  return modalEl;
}

let activeModalProduct = null;
let lastFocusedEl = null;

function openProductModal(product) {
  const modal = ensureModal();
  activeModalProduct = product;

  modal.querySelector("#modal-image").src = product.image;
  modal.querySelector("#modal-image").dataset.name = product.name;
  modal.querySelector("#modal-category").textContent = CATEGORY_LABELS[product.category];
  modal.querySelector("#modal-title").textContent = product.name;
  const stars = "★".repeat(Math.round(product.rating)) + "☆".repeat(5 - Math.round(product.rating));
  modal.querySelector("#modal-rating").innerHTML = `${stars} <span>(${product.rating})</span>`;
  modal.querySelector("#modal-desc").textContent = product.description;
  modal.querySelector("#modal-price").textContent = `$${product.price.toFixed(2)}`;
  modal.querySelector("#modal-qty").value = 1;

  const stockMsg = modal.querySelector("#modal-stock");
  const addBtn = modal.querySelector("#modal-add-cart");
  stockMsg.style.display = product.stock ? "none" : "block";
  addBtn.disabled = !product.stock;

  addBtn.onclick = () => {
    const qty = Number(modal.querySelector("#modal-qty").value) || 1;
    addToCart(product, qty);
    announce(`${qty} × ${product.name} added to your cart`);
  };

  modal.querySelector("#modal-add-wishlist").onclick = () => {
    addToWishlist(product, "interested");
    announce(`${product.name} added to wishlist`);
  };

  lastFocusedEl = document.activeElement;
  modal.classList.add("is-open");
  modal.querySelector(".modal-close").focus();
  document.body.style.overflow = "hidden";
}

function closeProductModal() {
  if (!modalEl) return;
  modalEl.classList.remove("is-open");
  document.body.style.overflow = "";
  if (lastFocusedEl) lastFocusedEl.focus();
}

/* --------------------------------------------------------------------------
   Products page: search + category filter + sort
   Guarded so this file can also load harmlessly on other pages.
   -------------------------------------------------------------------------- */
function initProductsPage() {
  const grid = document.getElementById("product-grid");
  if (!grid) return; // not on products.html

  const searchInput = document.getElementById("product-search");
  const chips = document.querySelectorAll(".chip[data-category]");
  const sortSelect = document.getElementById("sort-select");
  const resultCount = document.getElementById("result-count");
  const emptyState = document.getElementById("empty-state");

  const params = new URLSearchParams(location.search);
  let state = {
    query: "",
    category: params.get("category") || "all",
    sort: "default"
  };

  function applyState() {
    let list = PRODUCTS.filter((p) => {
      const matchesQuery = p.name.toLowerCase().includes(state.query.toLowerCase());
      const matchesCategory = state.category === "all" || p.category === state.category;
      return matchesQuery && matchesCategory;
    });

    switch (state.sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "rating-desc": list.sort((a, b) => b.rating - a.rating); break;
      case "name-asc": list.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }

    grid.innerHTML = list.map(renderProductCard).join("");
    resultCount.textContent = `${list.length} product${list.length === 1 ? "" : "s"}`;
    emptyState.classList.toggle("is-hidden", list.length !== 0);
    grid.classList.toggle("is-hidden", list.length === 0);
  }

  chips.forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.category === state.category);
    chip.addEventListener("click", () => {
      state.category = chip.dataset.category;
      chips.forEach((c) => c.classList.toggle("is-active", c === chip));
      applyState();
    });
  });

  searchInput.addEventListener("input", (e) => {
    state.query = e.target.value;
    applyState();
  });

  sortSelect.addEventListener("change", (e) => {
    state.sort = e.target.value;
    applyState();
  });

  attachProductCardEvents(grid);
  applyState();
}

document.addEventListener("DOMContentLoaded", initProductsPage);
