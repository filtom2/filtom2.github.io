// Shared helpers loaded on every page.

// Keep the copyright year current without manual edits.
document.querySelectorAll('[data-year]').forEach(function (el) {
  el.textContent = new Date().getFullYear();
});
