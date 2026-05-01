const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'nucleri-db.json');
let _db = null;

function getDb() {
  if (_db) return _db;
  const adapter = new FileSync(DB_PATH);
  _db = low(adapter);
  _db.defaults({ users:[], courses:[], course_learns:[], course_requires:[], course_modules:[], module_lessons:[], enrollments:[], blog_posts:[], contacts:[], newsletter:[], _counters:{} }).write();
  return _db;
}

function nextId(db, table) {
  const n = (db.get('_counters').value()[table] || 0) + 1;
  db.set(`_counters.${table}`, n).write();
  return n;
}

function now() { return new Date().toISOString().replace('T',' ').slice(0,19); }

function initDb() { return getDb(); }

function seed() {
  const db = getDb();

  if (!db.get('users').find({email:'admin@nucleri.com'}).value()) {
    db.get('users').push({ id: nextId(db,'users'), name:'Admin Nucleri', email:'admin@nucleri.com', password: bcrypt.hashSync('admin123',10), role:'admin', created_at: now() }).write();
  }
  if (!db.get('users').find({email:'maria@email.com'}).value()) {
    db.get('users').push({ id: nextId(db,'users'), name:'María García', email:'maria@email.com', password: bcrypt.hashSync('student123',10), role:'student', created_at: now() }).write();
  }

  const courses = [
    { title:'BPM & HACCP: Sistemas de inocuidad alimentaria desde cero', slug:'bpm-haccp-inocuidad-alimentaria', category:'Inocuidad Alimentaria', emoji:'🛡️', description:'Domina BPM y HACCP desde la teoría hasta la implementación real en planta.', instructor:'Ing. Ana Morales', instructor_role:'Especialista en Inocuidad', avatar_initials:'AM', price:89, price_old:150, hours:'18 horas', lessons_count:42, difficulty:2, diff_label:'Intermedio', rating:4.9, rating_count:2847, gradient:'linear-gradient(135deg, #001020, #0041CC, #1A6FFF)', published:1, learns:['Implementarás un plan HACCP completo desde cero.','Diseñarás y auditarás programas de BPM.','Identificarás puntos críticos de control en líneas de producción.','Elaborarás documentación técnica exigida por reguladores.','Prepararás tu planta para auditorías externas.'], requires:['Conocimientos básicos de microbiología.','Acceso a planta o empresa alimentaria (recomendado).','Interés en gestión de calidad.'], modules:[{title:'Fundamentos de inocuidad',lessons:[['Introducción a BPM','5m 20s'],['Marco regulatorio','6m 10s']]},{title:'Buenas Prácticas de Manufactura',lessons:[['Instalaciones y equipos','8m 30s'],['Higiene del personal','7m 45s'],['Control de plagas','6m 15s']]},{title:'Sistema HACCP',lessons:[['Los 7 principios HACCP','9m 40s'],['Análisis de peligros','8m 20s'],['Determinación de PCC','7m 55s']]},{title:'Documentación y auditorías',lessons:[['Registros obligatorios','6m 10s'],['Simulacro de auditoría','10m 30s']]}] },
    { title:'Finanzas para emprendedores de la industria alimentaria', slug:'finanzas-emprendedores-alimentaria', category:'Finanzas', emoji:'💰', description:'Controla los números de tu negocio alimentario sin necesitar ser contador.', instructor:'Carlos Mendoza', instructor_role:'MBA & Consultor Financiero', avatar_initials:'CM', price:79, price_old:130, hours:'15 horas', lessons_count:35, difficulty:2, diff_label:'Básico-Intermedio', rating:4.8, rating_count:1923, gradient:'linear-gradient(135deg, #001830, #003080, #0057FF)', published:1, learns:['Calcularás costos de producción con precisión.','Definirás precios rentables y competitivos.','Leerás estados financieros básicos.','Controlarás el flujo de caja mensual.','Identificarás indicadores clave de tu negocio.'], requires:['No se requieren conocimientos contables previos.','Manejo básico de Excel.','Tener un negocio o idea de emprendimiento.'], modules:[{title:'Costos y precios',lessons:[['Estructura de costos','6m 40s'],['Margen de contribución','5m 55s']]},{title:'Estados financieros',lessons:[['Estado de resultados','7m 20s'],['Balance general simplificado','6m 10s']]},{title:'Flujo de caja',lessons:[['Proyección mensual','8m 30s'],['Gestión de cartera','5m 45s']]}] },
    { title:'Elaboración y comercialización de yogurt artesanal e industrial', slug:'yogurt-artesanal-industrial', category:'Industria Láctea', emoji:'🥛', description:'Desde la fermentación láctica hasta los canales de venta.', instructor:'Dr. Marco Salas', instructor_role:'Ing. Alimentario Senior', avatar_initials:'MS', price:99, price_old:180, hours:'22 horas', lessons_count:56, difficulty:2, diff_label:'Básico-Intermedio', rating:4.9, rating_count:3100, gradient:'linear-gradient(135deg, #001830, #0041CC, #1A6FFF)', published:1, learns:['Dominarás los procesos de fermentación láctica.','Formularás yogurt natural, griego, frutado y bebible.','Conocerás normas sanitarias para derivados lácteos.','Diseñarás etiquetas cumpliendo la normativa.','Calcularás costos de producción y precio de venta.'], requires:['Conocimientos básicos de biología o química.','Acceso a cocina o pequeño laboratorio.','Interés en industria alimentaria.'], modules:[{title:'Ciencia de la fermentación',lessons:[['Microbiología básica','6m 30s'],['Cultivos iniciadores','7m 10s']]},{title:'Proceso de elaboración',lessons:[['Pasteurización','8m 20s'],['Inoculación e incubación','7m 45s'],['Batido y texturizado','6m 15s']]},{title:'Formulaciones',lessons:[['Yogurt griego','8m 40s'],['Adición de frutas','5m 55s'],['Yogurt bebible y probióticos','7m 20s']]},{title:'Comercialización',lessons:[['Etiquetado nutricional','6m 10s'],['Canales de distribución','8m 30s'],['Certificaciones HACCP','9m 15s']]}] },
    { title:'Marketing para marcas de alimentos saludables y orgánicos', slug:'marketing-alimentos-saludables', category:'Alimentos Naturales', emoji:'🍃', description:'Construye una presencia digital poderosa para tu marca de alimentos saludables.', instructor:'Sofía Ríos', instructor_role:'Brand Strategist', avatar_initials:'SR', price:69, price_old:110, hours:'12 horas', lessons_count:30, difficulty:2, diff_label:'Básico-Intermedio', rating:4.7, rating_count:1400, gradient:'linear-gradient(135deg, #001a2e, #004080, #0066cc)', published:1, learns:['Definirás el posicionamiento de tu marca.','Crearás contenido para Instagram, TikTok y Pinterest.','Comunicarás los beneficios de tus productos persuasivamente.','Diseñarás estrategia de influencer marketing.','Implementarás campañas con presupuesto limitado.'], requires:['Tener o estar desarrollando una marca de alimentos.','Perfil activo en al menos una red social.','Ganas de aprender marketing digital.'], modules:[{title:'Posicionamiento',lessons:[['Propuesta de valor única','5m 40s'],['Arquetipos de marca','4m 55s']]},{title:'Contenido y redes',lessons:[['Fotografía de alimentos','7m 20s'],['Storytelling','6m 10s'],['Calendarios de contenido','5m 45s']]},{title:'Estrategia digital',lessons:[['Email marketing','6m 30s'],['Meta Ads para food brands','7m 50s']]}] },
    { title:'Construye una marca poderosa para tu negocio alimentario', slug:'marca-negocio-alimentario', category:'Branding', emoji:'🎯', description:'De la identidad visual al packaging: diferénciate en el supermercado.', instructor:'Luis Guerrero', instructor_role:'Director Creativo', avatar_initials:'LG', price:85, price_old:140, hours:'16 horas', lessons_count:38, difficulty:2, diff_label:'Intermedio', rating:4.8, rating_count:2000, gradient:'linear-gradient(135deg, #001050, #0033a0, #0057FF)', published:1, learns:['Crearás un manual de identidad de marca completo.','Desarrollarás el naming y la historia de origen.','Diseñarás packaging que comunique los valores.','Aprenderás a diferenciarte en el supermercado.','Construirás lineamientos para todos los canales.'], requires:['No se requieren conocimientos de diseño previos.','Tener un negocio alimentario o idea definida.','Acceso a Canva (gratuito).'], modules:[{title:'Fundamentos de branding',lessons:[['¿Qué hace memorable una marca?','5m 30s'],['Análisis de marcas exitosas','6m 45s']]},{title:'Identidad visual',lessons:[['Psicología del color','7m 10s'],['Tipografía y jerarquía','5m 55s'],['Logo y símbolo','8m 40s']]},{title:'Packaging',lessons:[['Diseño de empaque','9m 20s'],['Normativa de etiquetado','6m 15s']]},{title:'Lanzamiento',lessons:[['Estrategia de entrada','7m 30s'],['PR y medios','5m 40s']]}] },
    { title:'Plan de negocios y modelo financiero para PYMES alimentarias', slug:'plan-negocios-pymes-alimentarias', category:'Estrategia', emoji:'📊', description:'Estructura, proyecta y financia tu empresa alimentaria.', instructor:'Patricia Vega', instructor_role:'Consultora Senior', avatar_initials:'PV', price:109, price_old:200, hours:'20 horas', lessons_count:48, difficulty:3, diff_label:'Intermedio-Avanzado', rating:4.9, rating_count:1600, gradient:'linear-gradient(135deg, #00102e, #002b80, #0047d4)', published:1, learns:['Elaborarás un plan de negocios completo.','Construirás un modelo financiero con proyecciones a 3 años.','Identificarás las fuentes de financiamiento adecuadas.','Calcularás el TIR y VPN de tu inversión.','Presentarás tu plan ante inversores.'], requires:['Manejo básico de Excel.','Tener un negocio en operación o planificación.','Conocimientos básicos de administración.'], modules:[{title:'Diagnóstico estratégico',lessons:[['Análisis FODA','6m 20s'],['Canvas de modelo de negocio','7m 45s']]},{title:'Plan de negocios',lessons:[['Estructura del plan','5m 30s'],['Estudio de mercado','8m 10s'],['Operaciones y producción','7m 20s']]},{title:'Modelo financiero',lessons:[['Proyecciones de ingresos','9m 40s'],['Flujo de caja','8m 15s'],['TIR, VPN y sensibilidad','7m 30s']]},{title:'Financiamiento',lessons:[['Fuentes de capital','6m 40s'],['Pitch deck','8m 20s']]}] },
  ];

  for (const c of courses) {
    if (db.get('courses').find({slug:c.slug}).value()) continue;
    const cid = nextId(db,'courses');
    const { learns, requires, modules, ...rest } = c;
    db.get('courses').push({ id:cid, ...rest, created_at:now() }).write();
    learns.forEach((item,i) => { db.get('course_learns').push({id:nextId(db,'course_learns'),course_id:cid,item,sort:i}).write(); });
    requires.forEach((item,i) => { db.get('course_requires').push({id:nextId(db,'course_requires'),course_id:cid,item,sort:i}).write(); });
    modules.forEach((mod,mi) => {
      const mid = nextId(db,'course_modules');
      db.get('course_modules').push({id:mid,course_id:cid,title:mod.title,sort:mi}).write();
      mod.lessons.forEach(([title,duration],li) => { db.get('module_lessons').push({id:nextId(db,'module_lessons'),module_id:mid,title,duration,sort:li}).write(); });
    });
  }

  const posts = [
    { title:'Los 5 errores más costosos en inocuidad alimentaria', slug:'errores-inocuidad-alimentaria', excerpt:'Las fallas en inocuidad no solo generan retiros de producto; pueden destruir una marca en horas.', content:'', category:'Inocuidad', author:'Ing. Ana Morales', author_role:'Especialista en Inocuidad', read_time:'8 min lectura' },
    { title:'Tendencias 2025: el futuro de los alimentos funcionales en América Latina', slug:'tendencias-alimentos-funcionales-2025', excerpt:'Probióticos, adaptógenos y proteínas alternativas lideran el mercado en la región.', content:'', category:'Tendencias', author:'Dr. Marco Salas', author_role:'Ing. Alimentario Senior', read_time:'6 min lectura' },
    { title:'Cómo calcular el precio justo para tu producto alimentario', slug:'calcular-precio-producto-alimentario', excerpt:'El precio no es solo un número: es el reflejo de tu propuesta de valor.', content:'', category:'Finanzas', author:'Carlos Mendoza', author_role:'MBA & Consultor Financiero', read_time:'10 min lectura' },
    { title:'De cocina a supermercado: formaliza tu emprendimiento', slug:'cocina-a-supermercado-formalizar', excerpt:'Registros sanitarios, etiquetado, código de barras y distribución.', content:'', category:'Emprendimiento', author:'Patricia Vega', author_role:'Consultora Senior', read_time:'12 min lectura' },
  ];

  for (const p of posts) {
    if (db.get('blog_posts').find({slug:p.slug}).value()) continue;
    db.get('blog_posts').push({id:nextId(db,'blog_posts'),...p,published:1,created_at:now()}).write();
  }

  console.log('✅ Seed completo: usuarios, cursos, blog posts');
}

module.exports = { getDb, nextId, now, initDb, seed };

// Called at startup to ensure new collections exist
function migrateDb() {
  const db = getDb();
  const defaults = {
    instructors: [],
    site_settings: [],   // key-value for homepage/about settings
  };
  let changed = false;
  for (const [k, v] of Object.entries(defaults)) {
    if (!db.has(k).value()) { db.set(k, v).write(); changed = true; }
    if (!db.get('_counters').value()[k]) { db.set(`_counters.${k}`, 0).write(); }
  }
  if (changed) console.log('✅ DB migrada con nuevas colecciones');
}

module.exports = Object.assign(module.exports, { migrateDb });
