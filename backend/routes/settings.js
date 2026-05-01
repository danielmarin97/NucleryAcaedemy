const express = require('express');
const { getDb } = require('../db/schema');
const { adminMiddleware } = require('../middleware/auth');
const router = express.Router();

function getSetting(db, key, fallback = null) {
  const rec = db.get('site_settings').find({ key }).value();
  return rec ? rec.value : fallback;
}

function setSetting(db, key, value) {
  const exists = db.get('site_settings').find({ key }).value();
  if (exists) db.get('site_settings').find({ key }).assign({ value, updated_at: new Date().toISOString() }).write();
  else db.get('site_settings').push({ key, value, updated_at: new Date().toISOString() }).write();
}

// GET /api/settings/:section  (homepage | about | general)
router.get('/:section', (req, res) => {
  const db = getDb();
  const { section } = req.params;

  const defaults = {
    homepage: {
      heroBadge: '🎯 Nuevo · Plan de negocios para PYMES disponible',
      heroTitle: 'Aprende. Crece. Lidera.',
      heroSubtitleEm: 'Tu negocio',
      heroDesc: 'Plataforma de formación y consultoría especializada en marketing digital, industria alimentaria y finanzas empresariales.',
      heroBtn1: 'Explorar cursos →', heroBtn2: 'Conocer más',
      stat1Val: '12K+', stat1Label: 'Estudiantes', stat1Icon: '👥',
      stat2Val: '45+', stat2Label: 'Cursos', stat2Icon: '🎓',
      stat3Val: '4.9★', stat3Label: 'Calificación', stat3Icon: '⭐',
      ctaTitle: '¿Listo para impulsar tu negocio?',
      ctaDesc: 'Explora nuestros cursos, solicita una consultoría o contáctanos directamente.',
      ctaBtn1: 'Ver cursos →', ctaBtn2: 'Solicitar consultoría',
      footerDesc: 'Plataforma líder de formación empresarial en LATAM.',
      copyright: `© ${new Date().getFullYear()} Nucleri. Todos los derechos reservados.`,
      socialLi: '', socialIg: '', socialYt: '', socialTw: '',
    },
    about: {
      title: 'Somos Nucleri Academy',
      desc: 'Nacimos para democratizar el conocimiento empresarial de calidad en América Latina.',
      mission: 'Empoderar a emprendedores y profesionales de LATAM con formación práctica y accesible.',
      vision: 'Ser la plataforma de referencia para el desarrollo empresarial en América Latina.',
      values: [
        { icon: '🎯', title: 'Excelencia', desc: 'Contenido de máxima calidad, sin compromisos.' },
        { icon: '🌎', title: 'Comunidad', desc: 'Red de profesionales activos en toda la región.' },
        { icon: '💡', title: 'Innovación', desc: 'Metodologías actualizadas y prácticas reales.' },
      ],
      whyUs: [
        { icon: '🎓', title: 'Formación práctica', desc: 'Contenido aplicable desde el primer día.' },
        { icon: '🏭', title: 'Expertos del sector', desc: 'Instructores con experiencia real en industrias.' },
        { icon: '🤝', title: 'Acompañamiento real', desc: 'Consultoría directa con los expertos.' },
      ],
    },
  };

  const stored = getSetting(db, `section_${section}`);
  const merged = { ...(defaults[section] || {}), ...(stored || {}) };
  res.json(merged);
});

// PUT /api/settings/:section (admin)
router.put('/:section', adminMiddleware, (req, res) => {
  const db = getDb();
  setSetting(db, `section_${req.params.section}`, req.body);
  res.json({ success: true });
});

module.exports = router;
