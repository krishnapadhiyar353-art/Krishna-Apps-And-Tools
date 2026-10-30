// ── Helpers ────────────────────────────────────────────────────────────────
function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ── Users ───────────────────────────────────────────────────────────────────
function getUsers() {
  return JSON.parse(localStorage.getItem('mas_users') || '[]');
}
function saveUsers(u) {
  localStorage.setItem('mas_users', JSON.stringify(u));
}
function getSession() {
  return JSON.parse(localStorage.getItem('mas_session') || 'null');
}
function setSession(user) {
  localStorage.setItem('mas_session', JSON.stringify(user));
}
function logout() {
  localStorage.removeItem('mas_session');
  location.href = 'index.html';
}

function register(username, email, password) {
  const users = getUsers();
  if (users.find(u => u.email === email)) return { error: 'Email already registered.' };
  if (users.find(u => u.username === username)) return { error: 'Username taken.' };
  const isFirst = users.length === 0;
  const user = { id: uid(), username, email, password, role: isFirst ? 'admin' : 'user' };
  users.push(user);
  saveUsers(users);
  setSession(user);
  return { user };
}

function login(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return { error: 'Invalid email or password.' };
  setSession(user);
  return { user };
}

// ── Apps ────────────────────────────────────────────────────────────────────
function getApps() {
  return JSON.parse(localStorage.getItem('mas_apps') || '[]');
}
function saveApps(apps) {
  localStorage.setItem('mas_apps', JSON.stringify(apps));
}
function getAppById(id) {
  return getApps().find(a => a.id === id) || null;
}
function addApp(app) {
  const apps = getApps();
  app.id = uid();
  app.createdAt = new Date().toISOString();
  app.downloads = 0;
  apps.unshift(app);
  saveApps(apps);
  return app;
}
function deleteApp(id) {
  saveApps(getApps().filter(a => a.id !== id));
}
function incrementDownload(id) {
  const apps = getApps();
  const app = apps.find(a => a.id === id);
  if (app) { app.downloads = (app.downloads || 0) + 1; saveApps(apps); }
}

// ── Nav helper ──────────────────────────────────────────────────────────────
function initNav() {
  const session = getSession();
  if (session) {
    document.getElementById('nav-auth').style.display = 'none';
    document.getElementById('nav-user').style.display = 'inline';
    document.getElementById('nav-username').textContent = session.username;
    if (session.role === 'admin') {
      document.getElementById('nav-admin').style.display = 'inline';
    }
  }
}

function requireLogin() {
  if (!getSession()) { location.href = 'login.html'; return null; }
  return getSession();
}
function requireAdmin() {
  const s = requireLogin();
  if (s && s.role !== 'admin') { location.href = 'index.html'; return null; }
  return s;
}
