const express = require('express');
const { getDb, nextId, now } = require('../db/schema');
const { adminMiddleware } = require('../middleware/auth');
const router = express.Router();

// ── CONTACTS ──────────────────────────────────────────────────────
router.post('/contacts', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Nombre, email y mensaje son requeridos' });
  const db = getDb();
  db.get('contacts').push({ id: nextId(db,'contacts'), ...req.body, status: 'new', created_at: now() }).write();
  res.json({ success: true, message: 'Mensaje enviado correctamente. Te contactaremos pronto.' });
});

router.get('/contacts', adminMiddleware, (req, res) => {
  const db = getDb();
  res.json(db.get('contacts').sortBy('id').reverse().value());
});

router.patch('/contacts/:id/status', adminMiddleware, (req, res) => {
  const db = getDb();
  db.get('contacts').find({ id: parseInt(req.params.id) }).assign({ status: req.body.status }).write();
  res.json({ success: true });
});

// ── NEWSLETTER ────────────────────────────────────────────────────
router.post('/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido' });
  const db = getDb();
  if (db.get('newsletter').find({ email }).value()) return res.status(409).json({ error: 'Este email ya está suscrito' });
  db.get('newsletter').push({ id: nextId(db,'newsletter'), email, created_at: now() }).write();
  res.json({ success: true, message: '¡Suscripción exitosa! Bienvenido a Nucleri.' });
});

router.get('/newsletter', adminMiddleware, (req, res) => {
  const db = getDb();
  res.json(db.get('newsletter').sortBy('id').reverse().value());
});

// ── WHATSAPP CONFIG ───────────────────────────────────────────────
// GET /api/whatsapp-config
router.get('/whatsapp-config', (req, res) => {
  const db = getDb();
  const rec = db.get('site_settings').find({ key: 'whatsapp_config' }).value();
  res.json(rec ? rec.value : { number: '', message: 'Hola! Me interesa el curso: {curso}. ¿Me pueden dar más información?' });
});

// PUT /api/whatsapp-config (admin)
router.put('/whatsapp-config', adminMiddleware, (req, res) => {
  const db = getDb();
  const { number, message } = req.body;
  const exists = db.get('site_settings').find({ key: 'whatsapp_config' }).value();
  if (exists) db.get('site_settings').find({ key: 'whatsapp_config' }).assign({ value: { number, message }, updated_at: now() }).write();
  else db.get('site_settings').push({ key: 'whatsapp_config', value: { number, message }, updated_at: now() }).write();
  res.json({ success: true });
});

// ── ADMIN STATS ───────────────────────────────────────────────────
router.get('/admin/stats', adminMiddleware, (req, res) => {
  const db = getDb();
  const totalStudents = db.get('users').filter({ role: 'student' }).value().length;
  const totalCourses = db.get('courses').filter({ published: 1 }).value().length;
  const totalEnrollments = db.get('enrollments').value().length;
  const newContacts = db.get('contacts').filter({ status: 'new' }).value().length;
  const enrollments = db.get('enrollments').value();
  const courses = db.get('courses').value();
  const revenue = enrollments.reduce((sum, e) => { const c = courses.find(x=>x.id===e.course_id); return sum + (c ? c.price : 0); }, 0);
  const users = db.get('users').value();

  const recentEnrollments = enrollments.slice(-10).reverse().map(e => {
    const u = users.find(x=>x.id===e.user_id);
    const c = courses.find(x=>x.id===e.course_id);
    return { name: u?.name||'', email: u?.email||'', course: c?.title||'', enrolled_at: e.enrolled_at };
  });

  const popularCourses = courses.map(c => ({
    title: c.title, category: c.category, price: c.price,
    enrollments: enrollments.filter(e=>e.course_id===c.id).length
  })).sort((a,b)=>b.enrollments-a.enrollments).slice(0,5);

  res.json({ totalStudents, totalCourses, totalEnrollments, newContacts, revenue, recentEnrollments, popularCourses });
});

// GET /api/admin/users (alias for users route)
router.get('/admin/users', adminMiddleware, (req, res) => {
  const db = getDb();
  const enrollments = db.get('enrollments').value();
  const users = db.get('users').value().map(u => {
    const { password, ...safe } = u;
    return { ...safe, courses_count: enrollments.filter(e=>e.user_id===u.id).length };
  }).sort((a,b)=>b.id-a.id);
  res.json(users);
});

module.exports = router;
