/* ==========================================================================
   checkout.js
   Renders the read-only order summary, validates the delivery form, and on
   success stores the order in localStorage, clears the cart, and shows an
   animated confirmation panel.
   ========================================================================== */

function renderCheckoutSummary() {
  const wrap = document.getElementById("checkout-items");
  if (!wrap) return;

  const cart = getCart();
  const view = document.getElementById("checkout-view");
  const emptyState = document.getElementById("checkout-empty");

  if (cart.length === 0) {
    view.classList.add("is-hidden");
    emptyState.classList.remove("is-hidden");
    return;
  }

  view.classList.remove("is-hidden");
  emptyState.classList.add("is-hidden");

  wrap.innerHTML = cart
    .map(
      (item) => `
      <div class="summary-row">
        <span>${item.name} × ${item.qty}</span>
        <span>$${(item.price * item.qty).toFixed(2)}</span>
      </div>`
    )
    .join("");

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;

  document.getElementById("checkout-subtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("checkout-delivery").textContent = delivery === 0 ? "Free" : `$${delivery.toFixed(2)}`;
  document.getElementById("checkout-total").textContent = `$${total.toFixed(2)}`;

  return { subtotal, delivery, total };
}

/* Generates a readable, random order number like TH-83291-KX */
function generateOrderNumber() {
  const digits = Math.floor(10000 + Math.random() * 89999);
  const letters = Array.from({ length: 2 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join("");
  return `TH-${digits}-${letters}`;
}

function validateCheckoutForm(form) {
  let valid = true;

  const name = form.querySelector("#cust-name").value;
  if (!validateNotEmpty(name)) { setFieldValid("field-name", false); valid = false; }
  else setFieldValid("field-name", true);

  const email = form.querySelector("#cust-email").value;
  if (!validateEmail(email)) { setFieldValid("field-email", false); valid = false; }
  else setFieldValid("field-email", true);

  const address = form.querySelector("#cust-address").value;
  if (!validateNotEmpty(address)) { setFieldValid("field-address", false); valid = false; }
  else setFieldValid("field-address", true);

  const payment = form.querySelector("input[name='payment']:checked");
  if (!payment) { setFieldValid("field-payment", false); valid = false; }
  else setFieldValid("field-payment", true);

  return valid;
}

function initCheckoutPage() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  const totals = renderCheckoutSummary();
  if (!totals) return; // cart is empty, nothing else to wire up

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateCheckoutForm(form)) {
      announce("Please fix the highlighted fields");
      return;
    }

    const currentTotals = renderCheckoutSummary();
    const order = {
      orderNumber: generateOrderNumber(),
      date: new Date().toISOString(),
      name: form.querySelector("#cust-name").value.trim(),
      email: form.querySelector("#cust-email").value.trim(),
      address: form.querySelector("#cust-address").value.trim(),
      payment: form.querySelector("input[name='payment']:checked").value,
      items: getCart(),
      subtotal: currentTotals.subtotal,
      delivery: currentTotals.delivery,
      total: currentTotals.total
    };

    const orders = safeGet(LS_ORDERS, []);
    orders.push(order);
    safeSet(LS_ORDERS, orders);

    saveCart([]);

    document.getElementById("checkout-view").classList.add("is-hidden");
    document.getElementById("checkout-empty").classList.add("is-hidden");

    const successPanel = document.getElementById("checkout-success");
    document.getElementById("order-number").textContent = order.orderNumber;
    document.getElementById("order-email").textContent = order.email;
    successPanel.classList.remove("is-hidden");
    successPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

document.addEventListener("DOMContentLoaded", initCheckoutPage);
