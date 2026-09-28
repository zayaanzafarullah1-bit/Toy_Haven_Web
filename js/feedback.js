/* ==========================================================================
   feedback.js
   Validates and stores the feedback form, and powers the accessible FAQ
   accordion (single-open-at-a-time, animated height, ARIA state).
   ========================================================================== */

function initFeedbackForm() {
  const form = document.getElementById("feedback-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    const name = form.querySelector("#fb-name").value;
    if (!validateNotEmpty(name)) { setFieldValid("field-fb-name", false); valid = false; }
    else setFieldValid("field-fb-name", true);

    const email = form.querySelector("#fb-email").value;
    if (!validateEmail(email)) { setFieldValid("field-fb-email", false); valid = false; }
    else setFieldValid("field-fb-email", true);

    const message = form.querySelector("#fb-message").value;
    if (message.trim().length < 10) { setFieldValid("field-fb-message", false); valid = false; }
    else setFieldValid("field-fb-message", true);

    const messageEl = document.getElementById("feedback-message");

    if (!valid) {
      messageEl.textContent = "Please fix the highlighted fields.";
      messageEl.className = "form-message is-error";
      return;
    }

    const entry = {
      name: name.trim(),
      email: email.trim(),
      rating: Number(form.querySelector("#fb-rating").value),
      message: message.trim(),
      date: new Date().toISOString()
    };

    const all = safeGet(LS_FEEDBACK, []);
    all.push(entry);
    safeSet(LS_FEEDBACK, all);

    messageEl.textContent = "Thank you! Your feedback has been recorded.";
    messageEl.className = "form-message is-success";
    form.reset();
  });
}

function initFaqAccordion() {
  const triggers = document.querySelectorAll(".accordion-trigger");
  if (!triggers.length) return;

  triggers.forEach((trigger) => {
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    panel.style.maxHeight = "0px";

    trigger.addEventListener("click", () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";

      // Close every other panel so only one is open at a time
      triggers.forEach((other) => {
        if (other === trigger) return;
        other.setAttribute("aria-expanded", "false");
        document.getElementById(other.getAttribute("aria-controls")).style.maxHeight = "0px";
      });

      trigger.setAttribute("aria-expanded", String(!isOpen));
      panel.style.maxHeight = isOpen ? "0px" : `${panel.scrollHeight}px`;
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initFeedbackForm();
  initFaqAccordion();
});
