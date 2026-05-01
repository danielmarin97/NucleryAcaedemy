const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb, nextId, now } = require('../db/schema');
const { signToken, authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.post('/register', (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
  if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  const db = getDb();
  if (db.get('users').find({ email }).value()) return res.status(409).json({ error: 'El email ya está registrado' });
  const id = nextId(db, 'users');
  const user = { id, name, email, phone: phone || '', password: bcrypt.hashSync(password, 10), role: 'student', created_at: now() };
  db.get('users').push(user).write();
  const token = signToken({ id, name, email, role: 'student' });
  res.cookie('token', token, { httpOnly: true, maxAge: 7*24*60*60*1000, sameSite: 'lax' });
  res.json({ success: true, user: { id, name, email, phone: phone || '', role: 'student' }, token });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });
  const db = getDb();
  const user = db.get('users').find({ email }).value();
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Credenciales incorrectas' });
  const token = signToken({ id: user.id, name: user.name, email: user.email, role: user.role });
  res.cookie('token', token, { httpOnly: true, maxAge: 7*24*60*60*1000, sameSite: 'lax' });
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone || '', role: user.role }, token });
});

router.post('/logout', (req, res) => { res.clearCookie('token'); res.json({ success: true }); });

router.get('/me', authMiddleware, (req, res) => {
  const db = getDb();
  const user = db.get('users').find({ id: req.user.id }).value();
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const { password, ...safe } = user;
  res.json(safe);
});

// PATCH /api/auth/profile — update own profile
router.patch('/profile', authMiddleware, (req, res) => {
  const db = getDb();
  const allowed = ['name', 'phone'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  if (req.body.password) {
    if (req.body.password.length < 6) return res.status(400).json({ error: 'Contraseña mínimo 6 caracteres' });
    updates.password = bcrypt.hashSync(req.body.password, 10);
  }
  db.get('users').find({ id: req.user.id }).assign(updates).write();
  res.json({ success: true });
});

module.exports = router;
