/* ═══════════════════════════════════
   APP — Controller principal
   ═══════════════════════════════════ */

let currentPage = "dashboard";

// ─── Inicialização ───
document.addEventListener("DOMContentLoaded", () => {
  if (isAuthed()) {
    showApp();
  } else {
    showLogin();
  }
});

// ═══════════════════════════════════
// LOGIN
// ═══════════════════════════════════
function showLogin() {
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("appShell").style.display = "none";

  // Popular select de usuários
  const sel = document.getElementById("loginUser");
  const users = getUsers();
  sel.innerHTML = `<option value="" selected disabled>Selecione um usuário...</option>`
    + users.map(u => `<option value="${u.id}">${u.label}</option>`).join("");

  // Botão login
  document.getElementById("btnLogin").addEventListener("click", handleLogin);

  // Enter no campo senha
  document.getElementById("loginPass").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleLogin();
  });
}

function handleLogin() {
  const userId = document.getElementById("loginUser").value;
  const password = document.getElementById("loginPass").value;
  const errorEl = document.getElementById("loginError");

  errorEl.textContent = "";
  const result = doLogin(userId, password);

  if (!result.ok) {
    errorEl.textContent = result.message;
    return;
  }

  showApp();
}

// ═══════════════════════════════════
// APP
// ═══════════════════════════════════
function showApp() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("appShell").style.display = "flex";

  // Atualizar info do usuário na sidebar
  const user = getAuthUser();
  if (user) {
    document.getElementById("userName").textContent = user.label;
    document.getElementById("userAvatar").textContent = user.label[0].toUpperCase();
  }

  // Setup navegação
  setupNavigation();

  // Renderizar página inicial
  navigateTo("dashboard");
}

// ═══════════════════════════════════
// NAVEGAÇÃO
// ═══════════════════════════════════
function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const page = item.dataset.page;
      if (page) navigateTo(page);
    });
  });
}

function navigateTo(pageId) {
  const page = PAGE_REGISTRY[pageId];
  if (!page) return;

  currentPage = pageId;

  // Atualizar sidebar
  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.page === pageId);
  });

  // Atualizar header
  document.getElementById("pageTitle").textContent = page.title;
  document.getElementById("pageSubtitle").textContent = page.subtitle;

  // Renderizar conteúdo
  document.getElementById("pageBody").innerHTML = page.render();

  // Scroll to top
  window.scrollTo(0, 0);
}

// Expor globalmente
window.navigateTo = navigateTo;
