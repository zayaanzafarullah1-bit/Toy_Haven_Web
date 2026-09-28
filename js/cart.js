/* ==========================================================================
   cart.js
   Renders cart items with quantity controls and keeps the order summary
   (subtotal / delivery / grand total) in sync with localStorage.
   ========================================================================== */

function renderCartItem(item) {
  return `
    <div class="cart-item" data-id="${item.id}">
      <img src="${item.image}" alt="${item.name}" data-name="${item.name}" onerror="handleImageError(this)" />
      <div>
        <h3 style="font-size:0.95rem;">${item.name}</h3>
        <span class="price">$${item.price.toFixed(2)}</span>
        <div class="qty-stepper">
          <button type="button" data-action="dec" aria-label="Decrease quantity of ${item.name}">−</button>
          <input type="number" min="1" value="${item.qty}" data-action="qty" aria-label="Quantity of ${item.name}" />
          <button type="button" data-action="inc" aria-label="Increase quantity of ${item.name}">+</button>
        </div>
      </div>
      <div style="text-align:right;">
        <p class="price">$${(item.price * item.qty).toFixed(2)}</p>
        <button class="remove-btn" data-action="remove" aria-label="Remove ${item.name} from cart">Remove</button>
      </div>
    </div>`;
}

function renderCartPage() {
  const wrap = document.getElementById("cart-items");
  if (!wrap) return; // not on cart.html

  const cart = getCart();
  const itemsCard = document.getElementById("cart-items-card");
  const emptyState = document.getElementById("cart-empty");
  const actions = document.getElementById("cart-actions");
  const summary = document.getElementById("cart-summary");
  const checkoutLink = document.getElementById("checkout-link");

  if (cart.length === 0) {
    itemsCard.classList.add("is-hidden");
    summary.classList.add("is-hidden");
    emptyState.classList.remove("is-hidden");
    return;
  }

  itemsCard.classList.remove("is-hidden");
  summary.classList.remove("is-hidden");
  emptyState.classList.add("is-hidden");
  actions.style.display = "flex";

  wrap.innerHTML = cart.map(renderCartItem).join("");

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;

  document.getElementById("summary-subtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("summary-delivery").textContent = delivery === 0 ? "Free" : `$${delivery.toFixed(2)}`;
  document.getElementById("summary-total").textContent = `$${total.toFixed(2)}`;

  const note = document.getElementById("summary-note");
  if (subtotal < FREE_DELIVERY_THRESHOLD) {
    const remaining = (FREE_DELIVERY_THRESHOLD - subtotal).toFixed(2);
    note.textContent = `Add $${remaining} more to unlock free delivery.`;
  } else {
    note.textContent = "You've unlocked free delivery on this order.";
  }

  checkoutLink.classList.toggle("is-hidden", cart.length === 0);
}

function initCartPage() {
  const wrap = document.getElementById("cart-items");
  if (!wrap) return;

  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const row = btn.closest(".cart-item");
    const id = Number(row.dataset.id);
    const cart = getCart();
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    if (btn.dataset.action === "inc") item.qty += 1;
    if (btn.dataset.action === "dec") item.qty = Math.max(1, item.qty - 1);
    if (btn.dataset.action === "remove") {
      removeFromCart(id);
      announce(`${item.name} removed from cart`);
      renderCartPage();
      return;
    }

    saveCart(cart);
    renderCartPage();
  });

  wrap.addEventListener("change", (e) => {
    if (e.target.dataset.action !== "qty") return;
    const row = e.target.closest(".cart-item");
    const id = Number(row.dataset.id);
    const cart = getCart();
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    item.qty = Math.max(1, Number(e.target.value) || 1);
    saveCart(cart);
    renderCartPage();
  });

  document.getElementById("clear-cart-btn").addEventListener("click", () => {
    saveCart([]);
    renderCartPage();
    announce("Cart cleared");
  });

  renderCartPage();
}

document.addEventListener("DOMContentLoaded", initCartPage);
