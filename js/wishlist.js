/* ==========================================================================
   wishlist.js
   Renders wishlist items with a status filter (Interested / Owned /
   Not interested), lets the shopper change status, move an item to the
   cart, or remove it entirely.
   ========================================================================== */

const STATUS_LABELS = {
  interested: "Interested",
  owned: "Owned",
  "not-interested": "Not interested"
};

function renderWishlistCard(item) {
  return `
    <article class="product-card" data-id="${item.id}">
      <span class="status-pill ${item.status}" style="position:absolute;top:0.8rem;left:0.8rem;z-index:1;">${STATUS_LABELS[item.status]}</span>
      <div class="product-thumb">
        <img src="${item.image}" alt="${item.name}" data-name="${item.name}" onerror="handleImageError(this)" />
      </div>
      <div class="product-body">
        <h3>${item.name}</h3>
        <p class="price">$${item.price.toFixed(2)}</p>

        <label class="visually-hidden" for="status-${item.id}">Change status for ${item.name}</label>
        <select id="status-${item.id}" class="select-field" data-action="set-status">
          <option value="interested" ${item.status === "interested" ? "selected" : ""}>Interested</option>
          <option value="owned" ${item.status === "owned" ? "selected" : ""}>Owned</option>
          <option value="not-interested" ${item.status === "not-interested" ? "selected" : ""}>Not interested</option>
        </select>

        <div class="product-footer">
          <button class="btn btn-primary btn-sm" data-action="move-cart">Move to cart</button>
          <button class="btn btn-ghost btn-sm" data-action="remove">Remove</button>
        </div>
      </div>
    </article>`;
}

function initWishlistPage() {
  const grid = document.getElementById("wishlist-grid");
  if (!grid) return;

  const chips = document.querySelectorAll(".chip[data-status]");
  const emptyState = document.getElementById("wishlist-empty");
  let currentFilter = "all";

  function render() {
    const list = getWishlist();
    const filtered = currentFilter === "all" ? list : list.filter((i) => i.status === currentFilter);

    grid.innerHTML = filtered.map(renderWishlistCard).join("");
    grid.classList.toggle("is-hidden", list.length === 0);
    emptyState.classList.toggle("is-hidden", list.length !== 0);
  }

  chips.forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.status === currentFilter);
    chip.addEventListener("click", () => {
      currentFilter = chip.dataset.status;
      chips.forEach((c) => c.classList.toggle("is-active", c === chip));
      render();
    });
  });

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const id = Number(btn.closest(".product-card").dataset.id);
    const list = getWishlist();
    const item = list.find((i) => i.id === id);
    if (!item) return;

    if (btn.dataset.action === "move-cart") {
      addToCart(item, 1);
      removeFromWishlist(id);
      announce(`${item.name} moved to your cart`);
      render();
    }

    if (btn.dataset.action === "remove") {
      removeFromWishlist(id);
      announce(`${item.name} removed from wishlist`);
      render();
    }
  });

  grid.addEventListener("change", (e) => {
    if (e.target.dataset.action !== "set-status") return;
    const id = Number(e.target.closest(".product-card").dataset.id);
    const list = getWishlist();
    const item = list.find((i) => i.id === id);
    if (!item) return;
    item.status = e.target.value;
    saveWishlist(list);
    render();
  });

  render();
}

document.addEventListener("DOMContentLoaded", initWishlistPage);
