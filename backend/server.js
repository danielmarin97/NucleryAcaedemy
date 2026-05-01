const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { initDb, seed } = require('./db/schema');

const app = express();
const PORT = process.env.PORT || 3000;

initDb();
seed();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static Assets
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));

// API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/instructors', require('./routes/instructors'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/users', require('./routes/users'));
app.use('/api', require('./routes/misc'));

const pagesDir = path.join(__dirname, '../frontend/pages');

const routes = {
  '/': 'index.html',
  '/index': 'index.html',
  '/cursos': 'cursos.html',
  '/blog': 'blog.html',
  '/sobre-nosotros': 'sobre-nosotros.html',
  '/admin': 'admin.html'
};

Object.entries(routes).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(pagesDir, file));
  });
});

// health check
app.get('/health', (req,res)=>{
  res.json({status:'ok'});
});

// fallback
app.use((req,res)=>{
  if(req.path.startsWith('/api')){
    return res.status(404).json({error:'API endpoint no encontrado'});
  }
  res.sendFile(path.join(pagesDir,'index.html'));
});

app.listen(PORT, ()=>{
  console.log(`Nucleri Academy running on port ${PORT}`);
});
