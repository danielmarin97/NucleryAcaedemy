/**
 * NUCLERI ACADEMY — Shared Auth Module
 * Mismo login/registro/forgot en todas las páginas
 * Incluir DESPUÉS de nucleri.js
 */

(function () {
  'use strict';

  // ── Inject auth overlay HTML into every page ─────────────────
  function injectAuthOverlay() {
    if (document.getElementById('nucleriAuthOverlay')) return;

    const html = `
<div class="auth-overlay" id="nucleriAuthOverlay">
  <div class="auth-modal" id="nucleriAuthModal">

    <div class="auth-header">
      <div class="auth-logo-text">Nucle<span>ri</span></div>
      <button class="auth-close" onclick="NucleriAuth.close()">✕</button>
    </div>

    <div class="auth-tabs">
      <button class="auth-tab active" id="nucleri-tab-login" onclick="NucleriAuth.switchTab('login')">Iniciar sesión</button>
      <button class="auth-tab" id="nucleri-tab-register" onclick="NucleriAuth.switchTab('register')">Crear cuenta</button>
    </div>

    <div class="auth-body">

      <!-- ── LOGIN ── -->
      <div class="auth-panel active" id="nucleri-panel-login">
        <div class="auth-alert" id="nucleri-login-alert"></div>
        <div class="auth-field">
          <label>Email o usuario</label>
          <input type="email" id="nucleri-login-email" placeholder="correo@email.com" autocomplete="email">
        </div>
        <div class="auth-field">
          <label>Contraseña</label>
          <input type="password" id="nucleri-login-pass" placeholder="••••••••" autocomplete="current-password"
            onkeydown="if(event.key==='Enter')NucleriAuth.doLogin()">
        </div>
        <a class="forgot-link" onclick="NucleriAuth.switchTab('forgot')">¿Olvidaste tu contraseña?</a>
        <button class="btn-auth" id="nucleri-login-btn" onclick="NucleriAuth.doLogin()">Iniciar sesión</button>
        <div class="auth-switch">¿No tienes cuenta? <a onclick="NucleriAuth.switchTab('register')">Regístrate gratis</a></div>
        <div class="auth-footer-text">
          Al continuar, aceptas nuestros <a href="#">Términos</a> y <a href="#">Política de Privacidad</a>
        </div>
      </div>

      <!-- ── REGISTER ── -->
      <div class="auth-panel" id="nucleri-panel-register">
        <div class="auth-alert" id="nucleri-register-alert"></div>
        <div class="auth-row">
          <div class="auth-field">
            <label>Nombre</label>
            <input type="text" id="nucleri-reg-name" placeholder="Tu nombre" autocomplete="given-name">
          </div>
          <div class="auth-field">
            <label>Apellido</label>
            <input type="text" id="nucleri-reg-lastname" placeholder="Tu apellido" autocomplete="family-name">
          </div>
        </div>
        <div class="auth-field">
          <label>Email</label>
          <input type="email" id="nucleri-reg-email" placeholder="correo@email.com" autocomplete="email">
        </div>
        <div class="auth-field">
          <label>Teléfono (WhatsApp)</label>
          <input type="tel" id="nucleri-reg-phone" placeholder="+51 999 999 999" autocomplete="tel">
        </div>
        <div class="auth-field">
          <label>Contraseña</label>
          <input type="password" id="nucleri-reg-pass" placeholder="Mínimo 6 caracteres" autocomplete="new-password">
        </div>
        <div class="auth-field">
          <label>Confirmar contraseña</label>
          <input type="password" id="nucleri-reg-pass2" placeholder="Repite tu contraseña"
            onkeydown="if(event.key==='Enter')NucleriAuth.doRegister()">
        </div>
        <button class="btn-auth" id="nucleri-register-btn" onclick="NucleriAuth.doRegister()">Crear cuenta gratis</button>
        <div class="auth-switch">¿Ya tienes cuenta? <a onclick="NucleriAuth.switchTab('login')">Inicia sesión</a></div>
        <div class="auth-footer-text">
          Al registrarte, aceptas nuestros <a href="#">Términos</a> y <a href="#">Política de Privacidad</a>
        </div>
      </div>

      <!-- ── FORGOT PASSWORD ── -->
      <div class="auth-panel" id="nucleri-panel-forgot">
        <div style="margin-bottom:1.25rem">
          <div style="font-family:var(--font-display);font-size:1.15rem;font-weight:800;color:var(--white);margin-bottom:0.4rem">Recupera tu contraseña</div>
          <div style="font-size:0.85rem;color:var(--text-muted);line-height:1.6">Te enviaremos instrucciones a tu correo registrado.</div>
        </div>
        <div class="auth-alert" id="nucleri-forgot-alert"></div>
        <div class="auth-field">
          <label>Tu email registrado</label>
          <input type="email" id="nucleri-forgot-email" placeholder="correo@email.com"
            onkeydown="if(event.key==='Enter')NucleriAuth.doForgot()">
        </div>
        <button class="btn-auth" onclick="NucleriAuth.doForgot()">Enviar instrucciones</button>
        <div class="auth-switch" style="margin-top:1rem">
          <a onclick="NucleriAuth.switchTab('login')">← Volver al inicio de sesión</a>
        </div>
      </div>

      <!-- ── SUCCESS ── -->
      <div class="auth-panel" id="nucleri-panel-success" style="text-align:center;padding:1rem 0">
        <div style="font-size:3rem;margin-bottom:1rem">🎉</div>
        <div style="font-family:var(--font-display);font-size:1.3rem;font-weight:800;color:var(--white);margin-bottom:0.5rem" id="nucleri-success-title">¡Bienvenido!</div>
        <p style="color:var(--text-muted);font-size:0.875rem;margin-bottom:0;line-height:1.6" id="nucleri-success-msg"></p>
        <button class="btn-auth" style="margin-top:1.5rem" onclick="NucleriAuth.close()">Explorar cursos →</button>
      </div>

    </div>
  </div>
</div>`;

    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div.firstElementChild);

    // Close on overlay click
    document.getElementById('nucleriAuthOverlay').addEventListener('click', function (e) {
      if (e.target === this) NucleriAuth.close();
    });
    // Close on ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.getElementById('nucleriAuthOverlay').classList.contains('open')) {
        NucleriAuth.close();
      }
    });
  }

  // ── API helpers ───────────────────────────────────────────────
  async function apiPost(path, body) {
    const res = await fetch('/api' + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Error ' + res.status);
    return data;
  }

  async function apiGet(path) {
    const res = await fetch('/api' + path, { credentials: 'include' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Error ' + res.status);
    return data;
  }

  // ── Alert helper ─────────────────────────────────────────────
  function showAlert(id, msg, type = 'error') {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.className = 'auth-alert ' + type;
  }
  function clearAlert(id) {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.className = 'auth-alert'; }
  }

  // ── Session management ────────────────────────────────────────
  let _session = null;

  function getSession() {
    if (_session) return _session;
    try { _session = JSON.parse(localStorage.getItem('nucleri_session') || 'null'); } catch { _session = null; }
    return _session;
  }

  function setSession(user) {
    _session = user;
    if (user) localStorage.setItem('nucleri_session', JSON.stringify(user));
    else localStorage.removeItem('nucleri_session');
    updateNavUI();
    if (typeof window.onNucleriLogin === 'function') window.onNucleriLogin(user);
  }

  // ── Nav UI update ─────────────────────────────────────────────
  function updateNavUI() {
    const user = getSession();
    const ctaEl = document.querySelector('.nav-cta');
    if (!ctaEl) return;

    if (user) {
      const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      ctaEl.innerHTML = `
        <span style="color:var(--text-muted);font-size:.85rem">Hola, <strong style="color:var(--white)">${user.name.split(' ')[0]}</strong></span>
        ${user.role === 'admin' ? `<a href="/admin" class="btn-ghost" style="font-size:.82rem">⚙️ Admin</a>` : ''}
        <a href="/cursos" class="btn-ghost" style="font-size:.82rem">Mis cursos</a>
        <button class="btn-ghost" onclick="NucleriAuth.logout()" style="font-size:.82rem;cursor:pointer">Salir</button>`;
    } else {
      ctaEl.innerHTML = `
        <button class="btn-ghost" onclick="NucleriAuth.open('login')">Iniciar sesión</button>
        <button class="btn-primary" onclick="NucleriAuth.open('register')">Comenzar gratis</button>`;
    }
  }

  // ── Public API ────────────────────────────────────────────────
  window.NucleriAuth = {

    open(tab = 'login') {
      injectAuthOverlay();
      document.getElementById('nucleriAuthOverlay').classList.add('open');
      document.body.style.overflow = 'hidden';
      this.switchTab(tab);
    },

    close() {
      const overlay = document.getElementById('nucleriAuthOverlay');
      if (overlay) overlay.classList.remove('open');
      document.body.style.overflow = '';
    },

    switchTab(tab) {
      injectAuthOverlay();
      // Clear all panels & tabs
      document.querySelectorAll('#nucleriAuthModal .auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('#nucleriAuthModal .auth-panel').forEach(p => p.classList.remove('active'));
      // Activate target
      const tabEl = document.getElementById('nucleri-tab-' + tab);
      if (tabEl) tabEl.classList.add('active');
      const panelEl = document.getElementById('nucleri-panel-' + tab);
      if (panelEl) panelEl.classList.add('active');
      // Clear alerts
      ['nucleri-login-alert', 'nucleri-register-alert', 'nucleri-forgot-alert'].forEach(clearAlert);
    },

    async doLogin() {
      const email = document.getElementById('nucleri-login-email').value.trim();
      const pass = document.getElementById('nucleri-login-pass').value;
      clearAlert('nucleri-login-alert');
      if (!email || !pass) { showAlert('nucleri-login-alert', 'Completa todos los campos.'); return; }

      const btn = document.getElementById('nucleri-login-btn');
      btn.disabled = true; btn.textContent = 'Ingresando...';
      try {
        const data = await apiPost('/auth/login', { email, password: pass });
        setSession(data.user);
        this.close();
        NucleriToast.show('👋 ¡Bienvenido de nuevo, ' + data.user.name.split(' ')[0] + '!', 'success');
        if (data.user.role === 'admin') setTimeout(() => window.location.href = '/admin', 800);
      } catch (e) {
        showAlert('nucleri-login-alert', e.message || 'Credenciales incorrectas.');
      } finally {
        btn.disabled = false; btn.textContent = 'Iniciar sesión';
      }
    },

    async doRegister() {
      const name = document.getElementById('nucleri-reg-name').value.trim();
      const lastname = document.getElementById('nucleri-reg-lastname').value.trim();
      const email = document.getElementById('nucleri-reg-email').value.trim();
      const phone = document.getElementById('nucleri-reg-phone').value.trim();
      const pass = document.getElementById('nucleri-reg-pass').value;
      const pass2 = document.getElementById('nucleri-reg-pass2').value;
      clearAlert('nucleri-register-alert');

      if (!name || !email || !pass) { showAlert('nucleri-register-alert', 'Nombre, email y contraseña son requeridos.'); return; }
      if (pass !== pass2) { showAlert('nucleri-register-alert', 'Las contraseñas no coinciden.'); return; }
      if (pass.length < 6) { showAlert('nucleri-register-alert', 'La contraseña debe tener mínimo 6 caracteres.'); return; }

      const btn = document.getElementById('nucleri-register-btn');
      btn.disabled = true; btn.textContent = 'Creando cuenta...';
      try {
        const fullName = lastname ? name + ' ' + lastname : name;
        const data = await apiPost('/auth/register', { name: fullName, email, password: pass, phone });
        setSession(data.user);
        this.switchTab('success');
        document.getElementById('nucleri-success-title').textContent = '¡Bienvenido, ' + name + '!';
        document.getElementById('nucleri-success-msg').textContent = 'Tu cuenta fue creada exitosamente. Ya puedes inscribirte en cualquier curso.';
        NucleriToast.show('🎉 ¡Cuenta creada! Bienvenido a Nucleri Academy.', 'success');
      } catch (e) {
        showAlert('nucleri-register-alert', e.message || 'Error al crear la cuenta.');
      } finally {
        btn.disabled = false; btn.textContent = 'Crear cuenta gratis';
      }
    },

    async doForgot() {
      const email = document.getElementById('nucleri-forgot-email').value.trim();
      clearAlert('nucleri-forgot-alert');
      if (!email) { showAlert('nucleri-forgot-alert', 'Ingresa tu correo.'); return; }
      // Simulate (no email server in demo)
      showAlert('nucleri-forgot-alert', '✓ Si existe una cuenta con ese correo, recibirás instrucciones en los próximos minutos.', 'success');
    },

    async logout() {
      try { await apiPost('/auth/logout', {}); } catch {}
      setSession(null);
      NucleriToast.show('Sesión cerrada. ¡Hasta pronto!');
      setTimeout(() => window.location.href = '/', 500);
    },

    getSession,
    updateNavUI,
    isLoggedIn() { return !!getSession(); },
    isAdmin() { const u = getSession(); return u && u.role === 'admin'; },
  };

  // ── Toast module ──────────────────────────────────────────────
  window.NucleriToast = {
    _el: null,
    _timer: null,
    show(msg, type = '') {
      if (!this._el) {
        this._el = document.createElement('div');
        this._el.className = 'nucleri-toast';
        document.body.appendChild(this._el);
      }
      this._el.textContent = msg;
      this._el.className = 'nucleri-toast ' + type;
      this._el.classList.add('show');
      clearTimeout(this._timer);
      this._timer = setTimeout(() => this._el.classList.remove('show'), 3500);
    }
  };

  // ── Init on DOM ready ─────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    injectAuthOverlay();
    updateNavUI();

    // Check server session
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(user => { if (user) setSession(user); })
      .catch(() => {});

    // Wire existing nav buttons if they use openAuth() convention
    window.openAuth = (tab) => NucleriAuth.open(tab);
    window.closeAuth = () => NucleriAuth.close();
  });

})();
