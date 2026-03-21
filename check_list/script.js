/* ═══════════════════════════════════
   CHECKLIST — Lógica
   Mesmo comportamento do original:
   - Navegação de abas
   - Destaque visual ao marcar checkbox
   ═══════════════════════════════════ */

document.addEventListener("DOMContentLoaded", function () {

  // --- Navegação das Abas ---
  var tabBtns = document.querySelectorAll(".tab-btn");
  var tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      // Desativa todas
      tabBtns.forEach(function (b) { b.classList.remove("active"); });
      tabContents.forEach(function (c) { c.classList.remove("active"); });

      // Ativa a clicada
      btn.classList.add("active");
      var targetId = btn.getAttribute("data-target");
      document.getElementById(targetId).classList.add("active");
    });
  });

  // --- Checkbox: destaque visual na linha ---
  var checkboxes = document.querySelectorAll(".check-teste");

  checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      var tr = this.closest("tr");

      if (this.checked) {
        tr.style.backgroundColor = "rgba(26, 86, 219, 0.04)";
      } else {
        tr.style.backgroundColor = "";
      }
    });
  });

});
