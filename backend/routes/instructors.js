const express = require('express');
const { getDb, nextId, now } = require('../db/schema');
const { adminMiddleware } = require('../middleware/auth');
const router = express.Router();

// GET /api/instructors
router.get('/', (req, res) => {
  const db = getDb();
  res.json(db.get('instructors').value());
});

// POST /api/instructors (admin)
router.post('/', adminMiddleware, (req, res) => {
  const db = getDb();
  if (!req.body.name) return res.status(400).json({ error: 'El nombre es requerido' });
  const id = nextId(db, 'instructors');
  const instructor = { id, ...req.body, created_at: now() };
  db.get('instructors').push(instructor).write();
  res.json({ success: true, id, instructor });
});

// PUT /api/instructors/:id (admin)
router.put('/:id', adminMiddleware, (req, res) => {
  const db = getDb();
  const id = parseInt(req.params.id);
  if (!db.get('instructors').find({ id }).value()) return res.status(404).json({ error: 'Instructor no encontrado' });
  db.get('instructors').find({ id }).assign(req.body).write();
  res.json({ success: true });
});

// DELETE /api/instructors/:id (admin)
router.delete('/:id', adminMiddleware, (req, res) => {
  const db = getDb();
  db.get('instructors').remove({ id: parseInt(req.params.id) }).write();
  res.json({ success: true });
});

module.exports = router;
