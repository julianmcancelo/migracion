# 🚀 Desarrollo Local y Remoto

Guía para trabajar con el proyecto tanto en local como en Vercel.

## 📋 Requisitos

- Node.js 18+ 
- npm o yarn
- Acceso a la base de datos MySQL

---

## 🏠 Configuración Local (Primera Vez)

### 1. Clonar e Instalar

```bash
git clone https://github.com/julianmcancelo/migracion.git
cd migracion
npm install
```

### 2. Configurar Variables de Entorno

```bash
# Copiar ejemplo
cp .env.example .env

# Editar .env con tus valores
# DATABASE_URL="mysql://user:pass@host:port/database"
# JWT_SECRET="tu-secreto-aqui"
```

### 3. Setup Automático

```bash
npm run setup
```

Este comando:
- ✅ Verifica que existe `.env`
- ✅ Limpia cache de Prisma
- ✅ Regenera Prisma Client con relaciones
- ✅ Verifica conexión a BD

### 4. Iniciar Desarrollo

```bash
npm run dev
```

Abre: http://localhost:3000

---

## 🔄 Desarrollo Día a Día

### Iniciar Servidor

```bash
# Inicio normal
npm run dev

# Inicio con limpieza (si hay problemas con Prisma)
npm run dev:clean
```

### Comandos Útiles

```bash
# Ver base de datos con interfaz visual
npm run prisma:studio

# Regenerar Prisma Client (después de cambios en schema)
npm run prisma:generate

# Limpiar cache y regenerar
npm run prisma:clean

# Verificar conexión a BD
npm run test:db
```

---

## 🐛 Solución de Problemas Locales

### Error: `EPERM: operation not permitted`

**Causa:** El servidor dev está usando archivos de Prisma

**Solución:**
```bash
# 1. Detener servidor (Ctrl+C)
# 2. Limpiar y regenerar
npm run prisma:clean
# 3. Reiniciar
npm run dev
```

### Error: `address already in use :::3000`

**Causa:** Ya hay un servidor corriendo en puerto 3000

**Solución:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [numero_proceso] /F

# O usa otro puerto
PORT=3001 npm run dev
```

### Error: Relaciones de Prisma no funcionan

**Solución:**
```bash
npm run dev:clean
```

---

## ☁️ Deploy en Vercel

### Automático (Recomendado)

1. Hacer commit de cambios:
```bash
git add .
git commit -m "tu mensaje"
git push
```

2. Vercel detecta el push y redeploya automáticamente

3. Monitorear en: https://vercel.com/dashboard

### Manual

```bash
npm run vercel:deploy
```

---

## 📊 Variables de Entorno

### Local (.env)
```env
DATABASE_URL="mysql://user:pass@localhost:3306/dbname"
JWT_SECRET="local-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Vercel (Configurado en Dashboard)
```env
DATABASE_URL="mysql://user:pass@167.250.5.55:3306/transpo1_credenciales"
JWT_SECRET="production-secret-key"
NEXT_PUBLIC_APP_URL="https://migracionnext.vercel.app"
```

---

## 🔍 Verificar que Todo Funciona

### Local

1. **Login:** http://localhost:3000/login
   - Email: tu-email@lanus.gob.ar
   - Password: tu-password

2. **Dashboard:** http://localhost:3000/dashboard
   - Debe mostrar KPIs

3. **Habilitaciones:** http://localhost:3000/habilitaciones
   - Debe mostrar lista con titular, chofer, vehículos

### Remoto

1. **Login:** https://migracionnext.vercel.app/login
2. **Dashboard:** https://migracionnext.vercel.app/dashboard
3. **Habilitaciones:** https://migracionnext.vercel.app/habilitaciones

---

## 🛠️ Workflow Recomendado

### Para Features Nuevas

```bash
# 1. Asegurarte de estar actualizado
git pull

# 2. Instalar dependencias (si hay cambios)
npm install

# 3. Regenerar Prisma (si cambió schema)
npm run prisma:generate

# 4. Desarrollar
npm run dev

# 5. Probar localmente

# 6. Commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push

# 7. Verificar deploy en Vercel
```

### Para Bugs

```bash
# 1. Reproducir localmente
npm run dev

# 2. Revisar logs
# Ver consola del navegador (F12)
# Ver terminal de Next.js

# 3. Fix y test

# 4. Deploy
git add .
git commit -m "fix: descripción del bug"
git push
```

---

## 📝 Logs y Debugging

### Ver Logs Locales
- **Terminal:** Logs de servidor Next.js
- **Navegador (F12):** Consola de JavaScript
- **Network (F12):** Requests/responses de API

### Ver Logs en Vercel
1. Dashboard → Tu proyecto
2. Deployments → Click en deployment
3. Ver "Function Logs" y "Build Logs"

### Ruta de Debug
- Local: http://localhost:3000/api/habilitaciones/debug
- Remoto: https://migracionnext.vercel.app/api/habilitaciones/debug

---

## 🎯 Checklist Antes de Deploy

- [ ] `npm run lint` sin errores
- [ ] Funciona en local (`npm run dev`)
- [ ] Variables de entorno actualizadas en Vercel
- [ ] Schema de Prisma sincronizado
- [ ] Commit message descriptivo
- [ ] Push a master

---

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Proyecto en Vercel](https://vercel.com/julianmcancelo/migracion)

---

**¿Problemas?** Ejecuta `npm run setup` y revisa los logs.
