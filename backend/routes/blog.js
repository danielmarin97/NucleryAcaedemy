const express = require('express');
const { getDb, nextId, now } = require('../db/schema');
const { adminMiddleware } = require('../middleware/auth');
const router = express.Router();

// GET /api/blog
router.get('/', (req, res) => {
  const { category, page = 1, limit = 6 } = req.query;
  const db = getDb();
  let posts = db.get('blog_posts').filter({ published: 1 }).value();
  if (category) posts = posts.filter(p => p.category === category);
  posts = posts.sort((a,b) => b.id - a.id);
  const total = posts.length;
  const off = (parseInt(page)-1)*parseInt(limit);
  res.json({ posts: posts.slice(off, off+parseInt(limit)), total, page: parseInt(page), pages: Math.ceil(total/parseInt(limit)) });
});

// GET /api/blog/:slug
router.get('/:slug', (req, res) => {
  const db = getDb();
  const post = db.get('blog_posts').find({ slug: req.params.slug, published: 1 }).value();
  if (!post) return res.status(404).json({ error: 'Post no encontrado' });
  res.json(post);
});

// POST /api/blog (admin)
router.post('/', adminMiddleware, (req, res) => {
  const db = getDb();
  const id = nextId(db, 'blog_posts');
  db.get('blog_posts').push({ id, ...req.body, published: 1, created_at: now() }).write();
  res.json({ success: true, id });
});

// DELETE /api/blog/:id (admin)
router.delete('/:id', adminMiddleware, (req, res) => {
  const db = getDb();
  db.get('blog_posts').remove({ id: parseInt(req.params.id) }).write();
  res.json({ success: true });
});

module.exports = router;
