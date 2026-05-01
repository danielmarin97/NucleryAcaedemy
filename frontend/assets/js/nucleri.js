/**
 * Nucleri — API Client & Auth Utilities
 * Incluido en todas las páginas via <script src="/assets/js/nucleri.js">
 */

const Nucleri = (() => {
  // ─── API base ───────────────────────────────────────────────────
  const BASE = '/api';

  async function api(method, path, body) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(BASE + path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || 'Error'), { status: res.status, data });
    return data;
  }

  const get  = (p) => api('GET', p);
  const post = (p, b) => api('POST', p, b);
  const put  = (p, b) => api('PUT', p, b);
  const del  = (p) => api('DELETE', p);
  const patch = (p, b) => api('PATCH', p, b);

  // ─── Auth ────────────────────────────────────────────────────────
  let _currentUser = null;

  async function getMe() {
    if (_currentUser) return _currentUser;
    try {
      _currentUser = await get('/auth/me');
      return _currentUser;
    } catch { return null; }
  }

  async function login(email, password) {
    const data = await post('/auth/login', { email, password });
    _currentUser = data.user;
    return data;
  }

  async function register(name, email, password) {
    const data = await post('/auth/register', { name, email, password });
    _currentUser = data.user;
    return data;
  }

  async function logout() {
    await post('/auth/logout');
    _currentUser = null;
    window.location.href = '/';
  }

  // ─── Nav: inyectar estado de auth ──────────────────────────────
  async function initNav() {
    const user = await getMe();

    // Marcar enlace activo
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.classList.toggle('active', a.pathname === location.pathname);
    });

    // Actualizar botones CTA
    const ctaContainer = document.querySelector('.nav-cta');
    if (!ctaContainer) return;

    if (user) {
      ctaContainer.innerHTML = `
        <span style="color:var(--text-muted);font-size:.85rem">Hola, <strong style="color:var(--white)">${user.name.split(' ')[0]}</strong></span>
        ${user.role === 'admin' ? `<a href="/admin" class="btn-ghost">Admin</a>` : ''}
        <a href="/cursos" class="btn-ghost">Mis cursos</a>
        <button class="btn-ghost" onclick="Nucleri.logout()" style="cursor:pointer">Salir</button>
      `;
    } else {
      ctaContainer.innerHTML = `
        <button class="btn-ghost" onclick="Nucleri.openLogin()">Iniciar sesión</button>
        <button class="btn-primary" onclick="Nucleri.openRegister()">Comenzar gratis</button>
      `;
    }
  }

  // ─── Auth Modal ──────────────────────────────────────────────────
  function injectAuthModal() {
    if (document.getElementById('nucleri-auth-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'nucleri-auth-modal';
    modal.innerHTML = `
      <div class="nauth-overlay" id="nauthOverlay" onclick="Nucleri.closeAuthModal()"></div>
      <div class="nauth-box">
        <button class="nauth-close" onclick="Nucleri.closeAuthModal()">✕</button>

        <div id="nauth-login">
          <div class="nauth-logo">Nucle<span>ri</span></div>
          <h2 class="nauth-title">Bienvenido de nuevo</h2>
          <p class="nauth-sub">Accede a tus cursos y continúa aprendiendo</p>
          <div class="nauth-field">
            <label>Email</label>
            <input type="email" id="nauth-login-email" placeholder="tu@email.com" autocomplete="email">
          </div>
          <div class="nauth-field">
            <label>Contraseña</label>
            <input type="password" id="nauth-login-pass" placeholder="••••••••" autocomplete="current-password">
          </div>
          <div class="nauth-error" id="nauth-login-error"></div>
          <button class="nauth-btn" id="nauth-login-btn" onclick="Nucleri._doLogin()">Iniciar sesión</button>
          <p class="nauth-switch">¿No tienes cuenta? <a onclick="Nucleri._switchToRegister()">Regístrate gratis</a></p>
        </div>

        <div id="nauth-register" style="display:none">
          <div class="nauth-logo">Nucle<span>ri</span></div>
          <h2 class="nauth-title">Crea tu cuenta</h2>
          <p class="nauth-sub">Únete a más de 12,000 profesionales alimentarios</p>
          <div class="nauth-field">
            <label>Nombre completo</label>
            <input type="text" id="nauth-reg-name" placeholder="Tu nombre" autocomplete="name">
          </div>
          <div class="nauth-field">
            <label>Email</label>
            <input type="email" id="nauth-reg-email" placeholder="tu@email.com" autocomplete="email">
          </div>
          <div class="nauth-field">
            <label>Contraseña</label>
            <input type="password" id="nauth-reg-pass" placeholder="Mínimo 6 caracteres" autocomplete="new-password">
          </div>
          <div class="nauth-error" id="nauth-reg-error"></div>
          <button class="nauth-btn" id="nauth-reg-btn" onclick="Nucleri._doRegister()">Crear cuenta</button>
          <p class="nauth-switch">¿Ya tienes cuenta? <a onclick="Nucleri._switchToLogin()">Inicia sesión</a></p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Styles
    const style = document.createElement('style');
    style.textContent = `
      #nucleri-auth-modal { position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center; }
      #nucleri-auth-modal.open { display:flex; }
      .nauth-overlay { position:absolute;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(8px); }
      .nauth-box {
        position:relative;z-index:1;background:#060D20;border:1px solid rgba(0,87,255,.25);
        border-radius:20px;padding:2.5rem;width:min(420px,90vw);box-shadow:0 0 60px rgba(0,87,255,.2);
      }
      .nauth-close { position:absolute;top:1rem;right:1rem;background:none;border:none;color:#7A90C0;font-size:1.2rem;cursor:pointer; }
      .nauth-logo { font-family:'Outfit',sans-serif;font-size:1.4rem;font-weight:800;color:#fff;margin-bottom:1.5rem; }
      .nauth-logo span { color:#0057FF; }
      .nauth-title { font-family:'Outfit',sans-serif;font-size:1.5rem;font-weight:700;color:#fff;margin-bottom:.4rem; }
      .nauth-sub { color:#7A90C0;font-size:.875rem;margin-bottom:1.75rem; }
      .nauth-field { margin-bottom:1rem; }
      .nauth-field label { display:block;font-size:.8rem;font-weight:600;color:#7A90C0;margin-bottom:.4rem;text-transform:uppercase;letter-spacing:.06em; }
      .nauth-field input {
        width:100%;padding:.65rem 1rem;background:#0A1530;border:1px solid rgba(0,87,255,.2);
        border-radius:10px;color:#E8EEFF;font-size:.9rem;outline:none;font-family:'Inter',sans-serif;
        transition:border .2s;
      }
      .nauth-field input:focus { border-color:#0057FF; }
      .nauth-error { color:#FF4444;font-size:.82rem;min-height:1.2rem;margin:.25rem 0; }
      .nauth-btn {
        width:100%;padding:.75rem;background:#0057FF;border:none;border-radius:10px;
        color:#fff;font-size:.9rem;font-weight:600;cursor:pointer;margin-top:.5rem;
        font-family:'Inter',sans-serif;transition:all .2s;box-shadow:0 0 20px rgba(0,87,255,.35);
      }
      .nauth-btn:hover { background:#1A6FFF;box-shadow:0 0 30px rgba(0,87,255,.55); }
      .nauth-btn:disabled { opacity:.6;cursor:not-allowed; }
      .nauth-switch { color:#7A90C0;font-size:.85rem;text-align:center;margin-top:1.25rem; }
      .nauth-switch a { color:#0057FF;cursor:pointer;text-decoration:underline; }
    `;
    document.head.appendChild(style);
  }

  function openLogin() {
    injectAuthModal();
    document.getElementById('nucleri-auth-modal').classList.add('open');
    document.getElementById('nauth-login').style.display = 'block';
    document.getElementById('nauth-register').style.display = 'none';
  }

  function openRegister() {
    injectAuthModal();
    document.getElementById('nucleri-auth-modal').classList.add('open');
    document.getElementById('nauth-login').style.display = 'none';
    document.getElementById('nauth-register').style.display = 'block';
  }

  function closeAuthModal() {
    const m = document.getElementById('nucleri-auth-modal');
    if (m) m.classList.remove('open');
  }

  function _switchToRegister() {
    document.getElementById('nauth-login').style.display = 'none';
    document.getElementById('nauth-register').style.display = 'block';
  }

  function _switchToLogin() {
    document.getElementById('nauth-register').style.display = 'none';
    document.getElementById('nauth-login').style.display = 'block';
  }

  async function _doLogin() {
    const email = document.getElementById('nauth-login-email').value.trim();
    const pass  = document.getElementById('nauth-login-pass').value;
    const errEl = document.getElementById('nauth-login-error');
    const btn   = document.getElementById('nauth-login-btn');
    errEl.textContent = '';
    btn.disabled = true; btn.textContent = 'Entrando...';
    try {
      const data = await login(email, pass);
      closeAuthModal();
      window.location.reload();
    } catch (e) {
      errEl.textContent = e.message;
    } finally {
      btn.disabled = false; btn.textContent = 'Iniciar sesión';
    }
  }

  async function _doRegister() {
    const name  = document.getElementById('nauth-reg-name').value.trim();
    const email = document.getElementById('nauth-reg-email').value.trim();
    const pass  = document.getElementById('nauth-reg-pass').value;
    const errEl = document.getElementById('nauth-reg-error');
    const btn   = document.getElementById('nauth-reg-btn');
    errEl.textContent = '';
    btn.disabled = true; btn.textContent = 'Creando cuenta...';
    try {
      await register(name, email, pass);
      closeAuthModal();
      window.location.reload();
    } catch (e) {
      errEl.textContent = e.message;
    } finally {
      btn.disabled = false; btn.textContent = 'Crear cuenta';
    }
  }

  // ─── Toast notifications ──────────────────────────────────────
  function toast(msg, type = 'success') {
    let el = document.getElementById('nucleri-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'nucleri-toast';
      Object.assign(el.style, {
        position:'fixed', bottom:'1.5rem', right:'1.5rem', zIndex:'99999',
        padding:'.85rem 1.4rem', borderRadius:'12px', fontFamily:'Inter,sans-serif',
        fontSize:'.875rem', fontWeight:'500', transform:'translateY(80px)',
        transition:'transform .3s', maxWidth:'320px',
      });
      document.body.appendChild(el);
      const sty = document.createElement('style');
      sty.textContent = `#nucleri-toast.show { transform:translateY(0)!important; }`;
      document.head.appendChild(sty);
    }
    el.textContent = msg;
    el.style.background = type === 'error' ? '#1a0a0a' : '#081226';
    el.style.color = type === 'error' ? '#FF6666' : '#00D4FF';
    el.style.border = `1px solid ${type === 'error' ? 'rgba(255,68,68,.3)' : 'rgba(0,87,255,.3)'}`;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 3500);
  }

  // ─── Formatters ──────────────────────────────────────────────
  function formatPrice(p) {
    return '$' + parseFloat(p).toFixed(0);
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('es', { year:'numeric', month:'long', day:'numeric' });
  }

  // ─── Enroll flow ─────────────────────────────────────────────
  async function enrollInCourse(courseId) {
    const user = await getMe();
    if (!user) { openLogin(); return; }
    try {
      await post(`/courses/${courseId}/enroll`);
      toast('🎉 ¡Inscripción exitosa! Ya puedes acceder al curso.');
      return true;
    } catch (e) {
      toast(e.message, 'error');
      return false;
    }
  }

  // ─── Auto-init ───────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', initNav);

  return {
    get, post, put, del, patch,
    getMe, login, register, logout,
    openLogin, openRegister, closeAuthModal,
    _doLogin, _doRegister, _switchToLogin, _switchToRegister,
    enrollInCourse, toast, formatPrice, formatDate,
    initNav,
  };
})();
