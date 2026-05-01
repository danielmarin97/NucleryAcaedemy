# 🚀 Nucleri Academy — Backend

Plataforma completa de cursos y consultoría para la industria alimentaria.

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Servidor | Node.js + Express |
| Base de datos | LowDB (JSON, sin configuración) |
| Auth | JWT + Cookies httpOnly |
| Frontend | HTML/CSS/JS vanilla (tus páginas originales) |

## Estructura del proyecto

```
nucleri/
├── backend/
│   ├── server.js           ← Punto de entrada principal
│   ├── db/
│   │   ├── schema.js       ← DB + seed inicial
│   │   └── nucleri-db.json ← Base de datos (se auto-crea)
│   ├── middleware/
│   │   └── auth.js         ← JWT + middlewares de auth
│   └── routes/
│       ├── auth.js         ← Login, registro, logout, /me
│       ├── courses.js      ← CRUD de cursos + inscripciones
│       ├── blog.js         ← CRUD de blog posts
│       └── misc.js         ← Contactos, newsletter, stats admin
├── frontend/
│   ├── pages/
│   │   ├── index.html
│   │   ├── cursos.html
│   │   ├── blog.html
│   │   ├── sobre-nosotros.html
│   │   └── admin.html
│   └── assets/
│       └── js/
│           └── nucleri.js  ← Cliente API compartido + auth modal
└── package.json
```

## Instalación y uso

```bash
# 1. Instalar dependencias
npm install --ignore-scripts

# 2. Arrancar el servidor
npm start
# o en modo desarrollo (con recarga automática):
npm run dev
```

El servidor arranca en **http://localhost:3000**

## Credenciales por defecto

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@nucleri.com | admin123 |
| Estudiante | maria@email.com | student123 |

## API Endpoints

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/register` | Registrarse |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/auth/me` | Usuario actual |

### Cursos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/courses` | Listar cursos (filtros: category, q, sort, page) |
| GET | `/api/courses/categories` | Categorías disponibles |
| GET | `/api/courses/:slug` | Detalle de un curso |
| POST | `/api/courses/:id/enroll` | Inscribirse (auth requerida) |
| GET | `/api/courses/user/enrollments` | Mis cursos (auth) |
| GET | `/api/courses/admin/all` | Todos los cursos (admin) |
| POST | `/api/courses` | Crear curso (admin) |
| PUT | `/api/courses/:id` | Editar curso (admin) |
| DELETE | `/api/courses/:id` | Eliminar curso (admin) |

### Blog
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/blog` | Listar posts (filtros: category, page) |
| GET | `/api/blog/:slug` | Leer un post |
| POST | `/api/blog` | Crear post (admin) |
| DELETE | `/api/blog/:id` | Eliminar post (admin) |

### Varios
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/contacts` | Enviar mensaje de contacto |
| POST | `/api/newsletter` | Suscribirse al newsletter |
| GET | `/api/admin/stats` | Estadísticas del dashboard (admin) |
| GET | `/api/admin/users` | Lista de usuarios (admin) |

## Páginas

| Ruta | Archivo |
|------|---------|
| `/` | index.html — Landing page |
| `/cursos` | cursos.html — Catálogo de cursos |
| `/blog` | blog.html — Blog |
| `/sobre-nosotros` | sobre-nosotros.html — Nosotros |
| `/admin` | admin.html — Panel de administración |

## Variables de entorno (opcionales)

```env
PORT=3000
JWT_SECRET=tu_secreto_seguro_aqui
```

## Producción

Para producción se recomienda:
1. Cambiar `JWT_SECRET` a un valor seguro
2. Migrar la DB de LowDB a PostgreSQL o MySQL
3. Usar un proxy inverso (nginx) delante de Node.js
4. Servir los archivos estáticos desde un CDN
