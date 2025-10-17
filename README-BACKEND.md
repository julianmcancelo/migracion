# 🚀 Backend Listo para Vercel

## ✅ Configuración Completada

Este proyecto está **100% listo** para deployar en Vercel con conexión a tu MySQL existente.

### 📦 Archivos de Configuración Creados

| Archivo | Descripción |
|---------|-------------|
| `vercel.json` | Configuración de deployment para Vercel |
| `.env.production.example` | Template de variables de entorno para producción |
| `lib/db-config.ts` | Cliente Prisma optimizado para Serverless |
| `app/api/health/route.ts` | Endpoint de health check |
| `scripts/test-db-connection.js` | Script para probar conexión MySQL |
| `DEPLOY-VERCEL.md` | Guía completa de deployment (LEER!) |
| `QUICK-START-VERCEL.md` | Guía rápida de 5 minutos |

### 🔧 Scripts Disponibles

```bash
# Desarrollo local
npm run dev                 # Iniciar servidor de desarrollo

# Testing
npm run test:db            # Probar conexión a MySQL

# Build & Deploy
npm run build              # Compilar para producción (incluye Prisma generate)
npm run vercel:deploy      # Deploy directo a producción

# Prisma
npm run prisma:generate    # Generar cliente Prisma
npm run prisma:studio      # Abrir Prisma Studio
```

### 🗄️ Configuración de Base de Datos

**Tus credenciales actuales (desde `conexion.php`):**

```
Host: localhost (⚠️ CAMBIAR para producción)
Usuario: transpo1_credenciales
Contraseña: feelthesky1
Base de datos: transpo1_credenciales
Puerto: 3306
```

**Para Vercel, necesitas:**

```env
# Cambiar "localhost" por IP pública o dominio
DATABASE_URL="mysql://transpo1_credenciales:feelthesky1@TU_HOST_PUBLICO:3306/transpo1_credenciales"
```

### 🔐 Variables de Entorno Requeridas

En Vercel, configura estas 3 variables:

1. **DATABASE_URL** - URL de conexión MySQL (⚠️ usar host público)
2. **JWT_SECRET** - Secret para tokens (generar uno nuevo y seguro)
3. **NEXT_PUBLIC_APP_URL** - URL de tu app en Vercel

### 🏗️ Arquitectura Backend

```
Backend API Routes:
├── /api/auth/login       → POST - Iniciar sesión
├── /api/auth/logout      → POST - Cerrar sesión
├── /api/auth/session     → GET  - Obtener sesión actual
└── /api/health           → GET  - Health check de BD

Database Layer:
├── lib/db.ts             → Cliente Prisma principal
├── lib/db-config.ts      → Configuración optimizada para Vercel
└── lib/auth.ts           → Lógica de autenticación JWT

Prisma Schema:
└── prisma/schema.prisma  → Modelo de la tabla 'admin'
```

### 🎯 Endpoints de API

#### 1. Health Check
```bash
GET /api/health

Response:
{
  "status": "healthy",
  "database": {
    "status": "connected",
    "message": "Conexión exitosa a MySQL"
  },
  "system": {
    "timestamp": "2025-10-17T12:00:00.000Z",
    "environment": "production",
    "nodeVersion": "v20.x.x"
  }
}
```

#### 2. Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@lanus.gob.ar",
  "password": "tu-contraseña"
}

Response:
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "user": {
    "id": 1,
    "nombre": "Admin User",
    "email": "admin@lanus.gob.ar",
    "rol": "administrador"
  }
}
```

#### 3. Logout
```bash
POST /api/auth/logout

Response:
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

#### 4. Obtener Sesión
```bash
GET /api/auth/session

Response:
{
  "success": true,
  "user": {
    "userId": 1,
    "email": "admin@lanus.gob.ar",
    "nombre": "Admin User",
    "rol": "administrador"
  }
}
```

### 🔒 Seguridad Implementada

✅ **Contraseñas hasheadas** con bcrypt  
✅ **JWT en cookies HTTP-only** (no accesibles desde JS)  
✅ **Middleware de protección** de rutas  
✅ **Validación de datos** con Zod  
✅ **CSRF protection** integrado en Next.js  
✅ **Variables de entorno** para secretos  

### 📊 Optimizaciones para Vercel

✅ **Connection pooling** automático de Prisma  
✅ **Singleton pattern** para evitar múltiples conexiones  
✅ **Timeout handling** para Serverless Functions  
✅ **Build optimizado** con tree-shaking  
✅ **Edge-ready** para despliegue global  

---

## 🚀 Cómo Deployar

### Opción 1: Rápida (5 minutos)
Lee: `QUICK-START-VERCEL.md`

### Opción 2: Completa (con detalles)
Lee: `DEPLOY-VERCEL.md`

### Opción 3: CLI Rápida

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Configurar variables de entorno cuando te lo pida
```

---

## ⚡ Testing Local Antes de Deploy

### 1. Probar conexión a MySQL:
```bash
npm run test:db
```

### 2. Iniciar servidor local:
```bash
npm run dev
```

### 3. Probar health check:
```
http://localhost:3000/api/health
```

### 4. Probar login:
```
http://localhost:3000/login
```

---

## 📝 Checklist Pre-Deploy

Antes de deployar a Vercel, verifica:

- [ ] MySQL acepta conexiones remotas
- [ ] Tienes el host público de MySQL (no localhost)
- [ ] `npm run test:db` funciona con el host público
- [ ] Creaste una cuenta en Vercel
- [ ] Subiste el código a GitHub/GitLab
- [ ] Generaste un JWT_SECRET nuevo y seguro
- [ ] Leíste `DEPLOY-VERCEL.md` o `QUICK-START-VERCEL.md`

---

## 🆘 Soporte

### Problemas Comunes:

**"Can't connect to MySQL"**
- Verifica que MySQL acepte conexiones remotas
- Cambia `localhost` por IP pública
- Verifica firewall y puerto 3306

**"PrismaClient is unable to run in Vercel"**
- Asegúrate que `postinstall` script esté en package.json
- Verifica que build command sea: `prisma generate && next build`

**"Access denied for user"**
- Crea usuario con acceso remoto: `user@'%'`
- Verifica contraseña en DATABASE_URL

### Logs en Vercel:

```bash
# Ver logs en tiempo real
vercel logs --follow

# Ver logs de una función específica
vercel logs /api/health
```

---

## 🎉 ¡Todo Listo!

Tu backend está configurado y listo para Vercel. El siguiente paso es:

1. **Configurar MySQL para acceso remoto** (si aún no lo hiciste)
2. **Subir a GitHub**
3. **Conectar con Vercel**
4. **Configurar variables de entorno**
5. **Deploy!**

**Tiempo estimado:** 10-15 minutos

---

**Documentación adicional:**
- Vercel Docs: https://vercel.com/docs
- Prisma + Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- Next.js Deployment: https://nextjs.org/docs/deployment
