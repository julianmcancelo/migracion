# 🚀 Deploy en Render - Guía Completa

## 🎯 **¿Por qué Render?**

- ✅ **Más estable** que Vercel para aplicaciones complejas
- ✅ **Base de datos incluida** - PostgreSQL gratuito
- ✅ **Builds más confiables** - Menos errores inesperados
- ✅ **Variables de entorno** más fáciles de manejar
- ✅ **Logs detallados** para debugging

---

## 📋 **Pasos para Deploy**

### **1. Preparar el Repositorio**

```bash
# Ya está listo ✅
git add .
git commit -m "feat: configuracion para deploy en Render"
git push
```

### **2. Crear Cuenta en Render**

1. Ve a [render.com](https://render.com)
2. Regístrate con GitHub
3. Conecta tu repositorio `migracion`

### **3. Configurar Web Service**

```yaml
# Configuración automática con render.yaml
Name: credenciales-lanus
Environment: Node
Build Command: npm install && npm run build
Start Command: npm start
```

### **4. Variables de Entorno**

```bash
# Obligatorias
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_SECRET=tu_secret_aqui
NEXTAUTH_URL=https://credenciales-lanus.onrender.com
JWT_SECRET=otro_secret_aqui
NEXT_PUBLIC_APP_URL=https://credenciales-lanus.onrender.com

# Para emails
GMAIL_USER=tu_email@gmail.com
GMAIL_APP_PASSWORD=tu_app_password
```

---

## 🗄️ **Base de Datos**

### **Opción 1: PostgreSQL en Render (Recomendado)**

```bash
# Render creará automáticamente:
- PostgreSQL 15
- 1GB storage (gratis)
- Backups automáticos
- SSL habilitado
```

### **Opción 2: Mantener MySQL Actual**

```bash
# Usar la misma BD de Vercel
DATABASE_URL=mysql://user:pass@167.250.5.55:3306/transpo1_credenciales
```

---

## 🔧 **Configuración del Proyecto**

### **1. Actualizar package.json**

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "start": "next start",
    "postinstall": "prisma generate"
  }
}
```

### **2. Configurar Prisma para PostgreSQL** (si cambias de BD)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // Cambiar de mysql
  url      = env("DATABASE_URL")
}
```

### **3. Migrar Base de Datos** (si cambias a PostgreSQL)

```bash
# Exportar datos de MySQL
mysqldump -h 167.250.5.55 -u user -p transpo1_credenciales > backup.sql

# Convertir a PostgreSQL
# Usar herramienta como pgloader o manual

# Aplicar migraciones
npx prisma db push
```

---

## 🚀 **Proceso de Deploy**

### **Paso a Paso:**

1. **Conectar Repositorio**

   ```
   Render Dashboard → New → Web Service
   → Connect GitHub → Seleccionar "migracion"
   ```

2. **Configuración Automática**

   ```
   Render detectará render.yaml
   → Configuración automática
   → Variables de entorno
   ```

3. **Deploy Inicial**

   ```
   ⏳ Installing dependencies...
   ⏳ Running build...
   ⏳ Starting application...
   ✅ Deploy successful!
   ```

4. **URL Final**
   ```
   https://credenciales-lanus.onrender.com
   ```

---

## 🔍 **Ventajas vs Vercel**

| Aspecto           | Vercel                  | Render                     |
| ----------------- | ----------------------- | -------------------------- |
| **Builds**        | Rápidos pero inestables | Más lentos pero confiables |
| **Base de Datos** | Externa (PlanetScale)   | Incluida (PostgreSQL)      |
| **Variables ENV** | Interfaz compleja       | Más simple                 |
| **Logs**          | Limitados               | Completos                  |
| **Precio**        | Gratis limitado         | Gratis generoso            |
| **Uptime**        | 99.9%                   | 99.9%                      |

---

## 🛠️ **Configuración Específica**

### **Variables de Entorno en Render:**

```bash
# Automáticas (render.yaml)
NODE_ENV=production
NEXTAUTH_URL=https://credenciales-lanus.onrender.com
NEXT_PUBLIC_APP_URL=https://credenciales-lanus.onrender.com

# Manuales (Dashboard)
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=random_secret_32_chars
JWT_SECRET=another_random_secret
GMAIL_USER=transportepublicolanus@gmail.com
GMAIL_APP_PASSWORD=app_specific_password
```

### **Build Settings:**

```yaml
Build Command: npm install && npm run build
Start Command: npm start
Node Version: 18.x
Auto-Deploy: Yes (on git push)
```

---

## 🔄 **Migración desde Vercel**

### **1. Backup de Datos**

```bash
# Exportar desde MySQL actual
mysqldump -h 167.250.5.55 -u user -p transpo1_credenciales > backup.sql
```

### **2. Configurar Render**

```bash
# Crear servicio en Render
# Configurar variables de entorno
# Hacer primer deploy
```

### **3. Migrar Base de Datos**

```bash
# Opción A: Mantener MySQL
DATABASE_URL=mysql://user:pass@167.250.5.55:3306/transpo1_credenciales

# Opción B: Migrar a PostgreSQL
# Importar backup.sql convertido
```

### **4. Actualizar DNS** (opcional)

```bash
# Si tienes dominio personalizado
# Cambiar CNAME de Vercel a Render
```

---

## 📊 **Monitoreo y Logs**

### **Logs en Tiempo Real:**

```bash
# Render Dashboard → Service → Logs
# Ver builds, errores, requests
# Mejor que Vercel para debugging
```

### **Métricas:**

```bash
# CPU, RAM, Response Time
# Uptime monitoring
# Error tracking
```

---

## 🚨 **Troubleshooting**

### **Errores Comunes:**

1. **Build Failed**

   ```bash
   # Verificar package.json
   # Revisar dependencias
   # Logs detallados en Dashboard
   ```

2. **Database Connection**

   ```bash
   # Verificar DATABASE_URL
   # Prisma generate
   # SSL settings
   ```

3. **Environment Variables**
   ```bash
   # Verificar todas las variables
   # Secrets vs Public
   # Restart service después de cambios
   ```

---

## ⚡ **Optimizaciones**

### **Performance:**

```bash
# Render optimiza automáticamente:
- Gzip compression
- Static file caching
- CDN global
- HTTP/2
```

### **Scaling:**

```bash
# Plan gratuito:
- 512MB RAM
- 0.1 CPU
- 100GB bandwidth/mes

# Upgrade disponible si necesario
```

---

## 🎯 **Próximos Pasos**

1. **Crear cuenta en Render** ✅
2. **Conectar repositorio** ✅
3. **Configurar variables** ✅
4. **Hacer primer deploy** ⏳
5. **Probar funcionalidades** ⏳
6. **Migrar datos si necesario** ⏳

---

## 📞 **Soporte**

- **Documentación:** [render.com/docs](https://render.com/docs)
- **Community:** Discord oficial
- **Support:** Email support (plan pago)

---

**🚀 ¿Listo para migrar a Render? Es mucho más estable que Vercel para aplicaciones complejas como esta!**
