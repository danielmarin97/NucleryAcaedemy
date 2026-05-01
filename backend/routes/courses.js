const express = require('express');
const { getDb, nextId, now } = require('../db/schema');
const { authMiddleware, adminMiddleware, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// GET /api/courses
router.get('/', optionalAuth, (req, res) => {
  const { category, q, sort = 'rating', page = 1, limit = 12 } = req.query;
  const db = getDb();
  let courses = db.get('courses').filter({ published: 1 }).value();
  if (category && category !== 'todos') courses = courses.filter(c => c.category === category);
  if (q) { const ql = q.toLowerCase(); courses = courses.filter(c => c.title.toLowerCase().includes(ql) || c.instructor.toLowerCase().includes(ql) || c.category.toLowerCase().includes(ql)); }
  if (sort === 'price_asc') courses.sort((a,b) => a.price - b.price);
  else if (sort === 'price_desc') courses.sort((a,b) => b.price - a.price);
  else if (sort === 'newest') courses.sort((a,b) => b.id - a.id);
  else courses.sort((a,b) => b.rating - a.rating);
  const total = courses.length;
  const off = (parseInt(page)-1) * parseInt(limit);
  const page_courses = courses.slice(off, off + parseInt(limit));
  let enrolled = new Set();
  if (req.user) {
    db.get('enrollments').filter({ user_id: req.user.id }).value().forEach(e => enrolled.add(e.course_id));
  }
  const result = page_courses.map(c => {
    const learns = db.get('course_learns').filter({ course_id: c.id }).sortBy('sort').value().slice(0,3).map(l=>l.item);
    return { ...c, learns_preview: learns.join('||'), enrolled: enrolled.has(c.id) };
  });
  res.json({ courses: result, total, page: parseInt(page), pages: Math.ceil(total/parseInt(limit)) });
});

// GET /api/courses/categories
router.get('/categories', (req, res) => {
  const db = getDb();
  const cats = {};
  db.get('courses').filter({ published: 1 }).value().forEach(c => { cats[c.category] = (cats[c.category]||0)+1; });
  res.json(Object.entries(cats).map(([category, count]) => ({ category, count })).sort((a,b) => b.count-a.count));
});

// GET /api/courses/admin/all
router.get('/admin/all', adminMiddleware, (req, res) => {
  const db = getDb();
  const courses = db.get('courses').sortBy('id').reverse().value().map(c => ({
    ...c,
    enrollments: db.get('enrollments').filter({ course_id: c.id }).value().length
  }));
  res.json(courses);
});

// GET /api/courses/user/enrollments
router.get('/user/enrollments', authMiddleware, (req, res) => {
  const db = getDb();
  const enrs = db.get('enrollments').filter({ user_id: req.user.id }).value();
  const courses = enrs.map(e => {
    const c = db.get('courses').find({ id: e.course_id }).value();
    return c ? { ...c, enrolled_at: e.enrolled_at, progress: e.progress } : null;
  }).filter(Boolean);
  res.json(courses);
});

// GET /api/courses/:slug  (must be after specific routes)
router.get('/:slug', optionalAuth, (req, res) => {
  const db = getDb();
  // Try by slug first, then by id
  let course = db.get('courses').find({ slug: req.params.slug, published: 1 }).value();
  if (!course) course = db.get('courses').find({ id: parseInt(req.params.slug), published: 1 }).value();
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
  const learns = db.get('course_learns').filter({ course_id: course.id }).sortBy('sort').value().map(r=>r.item);
  const requires = db.get('course_requires').filter({ course_id: course.id }).sortBy('sort').value().map(r=>r.item);
  const modules = db.get('course_modules').filter({ course_id: course.id }).sortBy('sort').value().map(mod => ({
    ...mod, lessons: db.get('module_lessons').filter({ module_id: mod.id }).sortBy('sort').value()
  }));
  let enrolled = false;
  if (req.user) enrolled = !!db.get('enrollments').find({ user_id: req.user.id, course_id: course.id }).value();
  res.json({ ...course, learns, requires, modules, enrolled });
});

// POST /api/courses/:id/enroll
router.post('/:id/enroll', authMiddleware, (req, res) => {
  const db = getDb();
  const cid = parseInt(req.params.id);
  if (!db.get('courses').find({ id: cid }).value()) return res.status(404).json({ error: 'Curso no encontrado' });
  if (db.get('enrollments').find({ user_id: req.user.id, course_id: cid }).value()) return res.status(409).json({ error: 'Ya estás inscrito en este curso' });
  db.get('enrollments').push({ id: nextId(db,'enrollments'), user_id: req.user.id, course_id: cid, enrolled_at: now(), progress: 0 }).write();
  res.json({ success: true, message: 'Inscripción exitosa' });
});

// POST /api/courses (admin create)
router.post('/', adminMiddleware, (req, res) => {
  const db = getDb();
  const id = nextId(db, 'courses');
  const course = { id, ...req.body, created_at: now() };
  db.get('courses').push(course).write();
  res.json({ success: true, id });
});

// PUT /api/courses/:id (admin update)
router.put('/:id', adminMiddleware, (req, res) => {
  const db = getDb();
  const id = parseInt(req.params.id);
  const allowed = ['title','category','emoji','description','instructor','price','price_old','published','rating','gradient','diff_label','difficulty','hours','lessons_count','instructor_role','avatar_initials','slug'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  db.get('courses').find({ id }).assign(updates).write();
  res.json({ success: true });
});

// DELETE /api/courses/:id (admin)
router.delete('/:id', adminMiddleware, (req, res) => {
  const db = getDb();
  db.get('courses').remove({ id: parseInt(req.params.id) }).write();
  res.json({ success: true });
});

module.exports = router;
