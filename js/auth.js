/* ═══════════════════════════════════
   AUTH — Equilibrium Neuro
   ═══════════════════════════════════ */

const AUTH_KEY = "equilibrium_auth_v2";
const AUTH_USER_KEY = "equilibrium_auth_user_v2";

// TODO: mover para backend quando possível
const USERS = [
  { id: "1", label: "Admin",     password: "3639" },
  { id: "2", label: "Natalia",   password: "0000" },
  { id: "3", label: "Usuário 3", password: "3333" },
  { id: "4", label: "Usuário 4", password: "4444" },
];

function getUsers() { return USERS; }

function setAuth(userId) {
  sessionStorage.setItem(AUTH_KEY, "true");
  sessionStorage.setItem(AUTH_USER_KEY, userId);
}

function clearAuth() {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
}

function isAuthed() {
  return sessionStorage.getItem(AUTH_KEY) === "true";
}

function getAuthUser() {
  const id = sessionStorage.getItem(AUTH_USER_KEY);
  return USERS.find(u => u.id === id) || null;
}

function doLogin(userId, password) {
  const pwd = String(password || "").trim();
  if (!userId) return { ok: false, message: "Selecione um usuário." };

  const user = USERS.find(u => u.id === String(userId));
  if (!user) return { ok: false, message: "Usuário inválido." };
  if (pwd !== String(user.password)) return { ok: false, message: "Senha inválida." };

  setAuth(userId);
  return { ok: true, user };
}

function doLogout() {
  clearAuth();
  location.reload();
}

// Expor globalmente
window.doLogout = doLogout;
