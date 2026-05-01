const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb, nextId, now } = require('../db/schema');
const { adminMiddleware } = require('../middleware/auth');
const router = express.Router();

// GET /api/users  (admin — full list)
router.get('/', adminMiddleware, (req, res) => {
  const db = getDb();
  const enrollments = db.get('enrollments').value();
  const users = db.get('users').value().map(u => {
    const { password, ...safe } = u;
    return { ...safe, courses_count: enrollments.filter(e => e.user_id === u.id).length };
  }).sort((a, b) => b.id - a.id);
  res.json(users);
});

// GET /api/users/:id (admin)
router.get('/:id', adminMiddleware, (req, res) => {
  const db = getDb();
  const user = db.get('users').find({ id: parseInt(req.params.id) }).value();
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const { password, ...safe } = user;
  const enrollments = db.get('enrollments').filter({ user_id: user.id }).value().map(e => {
    const course = db.get('courses').find({ id: e.course_id }).value();
    return { ...e, course_title: course?.title, course_price: course?.price };
  });
  res.json({ ...safe, enrollments });
});

// POST /api/users (admin — create user manually)
router.post('/', adminMiddleware, (req, res) => {
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
  const db = getDb();
  if (db.get('users').find({ email }).value()) return res.status(409).json({ error: 'El email ya está registrado' });
  const id = nextId(db, 'users');
  db.get('users').push({ id, name, email, phone: phone || '', password: bcrypt.hashSync(password, 10), role: role || 'student', created_at: now() }).write();
  res.json({ success: true, id });
});

// PUT /api/users/:id (admin — edit user)
router.put('/:id', adminMiddleware, (req, res) => {
  const db = getDb();
  const id = parseInt(req.params.id);
  const allowed = ['name', 'email', 'phone', 'role'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  if (req.body.password) updates.password = bcrypt.hashSync(req.body.password, 10);
  db.get('users').find({ id }).assign(updates).write();
  res.json({ success: true });
});

// DELETE /api/users/:id (admin)
router.delete('/:id', adminMiddleware, (req, res) => {
  const db = getDb();
  const id = parseInt(req.params.id);
  // Don't allow self-delete
  db.get('users').remove({ id }).write();
  db.get('enrollments').remove({ user_id: id }).write();
  res.json({ success: true });
});

// GET /api/users/stats/summary (admin)
router.get('/stats/summary', adminMiddleware, (req, res) => {
  const db = getDb();
  const users = db.get('users').value();
  const enrollments = db.get('enrollments').value();
  const courses = db.get('courses').value();
  res.json({
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    admins: users.filter(u => u.role === 'admin').length,
    totalEnrollments: enrollments.length,
    revenue: enrollments.reduce((s, e) => {
      const c = courses.find(x => x.id === e.course_id);
      return s + (c ? c.price : 0);
    }, 0),
    recent: users.slice(-5).reverse().map(u => { const { password, ...safe } = u; return safe; }),
  });
});

module.exports = router;
