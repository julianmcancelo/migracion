# 🚀 GUÍA DE DEPLOYMENT SEGURO

**Última actualización:** 19 de Noviembre de 2025

---

## ⚠️ ANTES DE PUBLICAR - CHECKLIST CRÍTICO

### 🔴 Paso 1: Rotar TODAS las Credenciales

**NUNCA uses las credenciales del repositorio en producción.**

```bash
# Generar nuevos secretos
node scripts/generate-secrets.js
```

Esto generará:
- ✅ JWT_SECRET nuevo
- ✅ ENCRYPTION_KEY nuevo
- ✅ SESSION_SECRET nuevo
- ✅ API_TOKEN nuevo

---

### 🔴 Paso 2: Configurar Base de Datos

#### Cambiar Contraseña de MySQL

```sql
-- Conectar a MySQL como root
mysql -u root -p

-- Cambiar contraseña del usuario
ALTER USER 'transpo1_credenciales'@'%' IDENTIFIED BY 'NUEVA_PASSWORD_SUPER_FUERTE';
FLUSH PRIVILEGES;
```

#### Restringir Acceso por IP

```sql
-- Eliminar acceso desde cualquier IP
DROP USER 'transpo1_credenciales'@'%';

-- Crear usuario solo para IPs específicas
CREATE USER 'transpo1_credenciales'@'IP_DEL_SERVIDOR' IDENTIFIED BY 'PASSWORD_FUERTE';
GRANT ALL PRIVILEGES ON transpo1_credenciales.* TO 'transpo1_credenciales'@'IP_DEL_SERVIDOR';
FLUSH PRIVILEGES;
```

#### Configurar Firewall de MySQL

```bash
# En el servidor de MySQL
sudo ufw allow from IP_DEL_SERVIDOR to any port 3306
sudo ufw deny 3306
```

---

### 🔴 Paso 3: Regenerar API Keys

#### Google Maps API

1. Ir a: https://console.cloud.google.com/
2. Crear nueva API Key
3. **RESTRINGIR por dominio:**
   ```
   https://lanus.digital/*
   https://credenciales.transportelanus.com.ar/*
   ```
4. **RESTRINGIR APIs permitidas:**
   - Maps JavaScript API
   - Geocoding API
   - Places API

#### Google Gemini API

1. Ir a: https://aistudio.google.com/app/apikey
2. Crear nueva API Key
3. **RESTRINGIR por IP del servidor**
4. Configurar cuota de uso

---

### 🔴 Paso 4: Configurar Variables de Entorno en Producción

#### Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Configurar variables
vercel env add JWT_SECRET production
vercel env add DATABASE_URL production
vercel env add GOOGLE_MAPS_API_KEY production
vercel env add GEMINI_API_KEY production
vercel env add EMAIL_HOST production
vercel env add EMAIL_PORT production
vercel env add EMAIL_USER production
vercel env add EMAIL_PASS production
```

#### Render

1. Ir a Dashboard → Environment
2. Agregar variables una por una
3. Marcar como "Secret" las sensibles

#### Variables Requeridas

```env
# Base de datos
DATABASE_URL="mysql://usuario:PASSWORD_NUEVA@IP_PRIVADA:3306/db_prod"

# Seguridad
JWT_SECRET="SECRET_GENERADO_CON_SCRIPT"
ENCRYPTION_KEY="KEY_GENERADA_CON_SCRIPT"

# URLs
NEXT_PUBLIC_APP_URL="https://lanus.digital"

# APIs
GOOGLE_MAPS_API_KEY="KEY_RESTRINGIDA_POR_DOMINIO"
GEMINI_API_KEY="KEY_RESTRINGIDA_POR_IP"

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="transportepublicolanus@gmail.com"
EMAIL_PASS="APP_PASSWORD_DE_GMAIL"

# Opcional: Rate Limiting
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Opcional: Monitoring
SENTRY_DSN="https://..."
```

---

### 🔴 Paso 5: Configurar Email

#### Gmail App Password

1. Ir a: https://myaccount.google.com/apppasswords
2. Crear "App Password" para "Mail"
3. Copiar el password de 16 caracteres
4. Usar en `EMAIL_PASS`

**NO usar la contraseña normal de Gmail**

---

### 🔴 Paso 6: Verificar .gitignore

```bash
# Verificar que estos archivos NO están en Git
git status

# Si aparece .env.local, eliminarlo del historial
git rm --cached .env.local
git commit -m "🔒 Eliminar credenciales del repositorio"
git push
```

**Archivos que NUNCA deben estar en Git:**
- `.env`
- `.env.local`
- `.env.production`
- `.env.development`
- `*.backup`

---

### 🔴 Paso 7: Configurar HTTPS/SSL

#### Vercel
✅ Automático - Vercel configura SSL gratis

#### Render
✅ Automático - Render configura SSL gratis

#### Servidor Propio

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d lanus.digital -d www.lanus.digital

# Renovación automática
sudo certbot renew --dry-run
```

---

### 🔴 Paso 8: Configurar Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Denegar todo lo demás
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

---

### 🔴 Paso 9: Configurar Rate Limiting (Opcional pero Recomendado)

#### Opción A: Upstash Redis (Recomendado)

1. Crear cuenta en: https://upstash.com/
2. Crear Redis database
3. Copiar credenciales
4. Instalar dependencia:

```bash
npm install @upstash/ratelimit @upstash/redis
```

5. Configurar en `.env`:

```env
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

#### Opción B: Cloudflare (Gratis)

1. Agregar dominio a Cloudflare
2. Activar "Rate Limiting" en dashboard
3. Configurar reglas:
   - `/api/auth/login`: 5 requests/minuto
   - `/api/ai/*`: 10 requests/minuto

---

### 🔴 Paso 10: Configurar Monitoring

#### Sentry (Recomendado)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Configurar en `.env`:
```env
SENTRY_DSN="https://..."
```

---

## 📋 CHECKLIST PRE-DEPLOYMENT

Marca cada item antes de publicar:

### Seguridad
- [ ] Rotadas TODAS las credenciales
- [ ] JWT_SECRET nuevo y fuerte (mínimo 64 bytes)
- [ ] Contraseña de MySQL cambiada
- [ ] API Keys regeneradas y restringidas
- [ ] .env.local eliminado del repositorio
- [ ] .gitignore actualizado
- [ ] Variables de entorno configuradas en servidor

### Base de Datos
- [ ] Firewall de MySQL configurado
- [ ] Usuario de BD con IP restringida
- [ ] Backup de base de datos realizado
- [ ] Conexión SSL habilitada (si es posible)

### APIs
- [ ] Google Maps API restringida por dominio
- [ ] Gemini API restringida por IP
- [ ] Cuotas de uso configuradas
- [ ] Billing alerts activadas

### Servidor
- [ ] HTTPS/SSL configurado
- [ ] Firewall activado
- [ ] Headers de seguridad configurados
- [ ] Rate limiting implementado
- [ ] Logs configurados
- [ ] Monitoring activado

### Código
- [ ] TypeScript sin errores (`npm run type-check`)
- [ ] ESLint sin errores (`npm run lint`)
- [ ] Build exitoso (`npm run build`)
- [ ] Tests pasando (si existen)

### Email
- [ ] Gmail App Password configurado
- [ ] Email de prueba enviado
- [ ] Respuestas funcionando

---

## 🚀 PROCESO DE DEPLOYMENT

### Vercel (Recomendado para Next.js)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Configurar variables de entorno
vercel env add JWT_SECRET production
# ... agregar todas las variables

# 4. Deploy
vercel --prod

# 5. Verificar
curl https://lanus.digital/api/health
```

### Render

```bash
# 1. Conectar repositorio en Render Dashboard
# 2. Configurar variables de entorno
# 3. Deploy automático desde main branch
```

### Servidor Propio (PM2)

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-repo/migracion.git
cd migracion

# 2. Instalar dependencias
npm install

# 3. Configurar .env
cp .env.example .env
nano .env  # Editar con credenciales

# 4. Build
npm run build

# 5. Instalar PM2
npm install -g pm2

# 6. Iniciar con PM2
pm2 start npm --name "lanus-digital" -- start

# 7. Configurar inicio automático
pm2 startup
pm2 save

# 8. Configurar Nginx como reverse proxy
sudo nano /etc/nginx/sites-available/lanus.digital
```

Configuración de Nginx:

```nginx
server {
    listen 80;
    server_name lanus.digital www.lanus.digital;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔍 VERIFICACIÓN POST-DEPLOYMENT

### 1. Verificar HTTPS

```bash
curl -I https://lanus.digital
# Debe retornar: HTTP/2 200
```

### 2. Verificar Headers de Seguridad

```bash
curl -I https://lanus.digital | grep -E "X-Frame-Options|X-Content-Type-Options|Strict-Transport-Security"
```

Debe mostrar:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### 3. Verificar Autenticación

```bash
# Debe retornar 401 sin autenticación
curl https://lanus.digital/api/habilitaciones
```

### 4. Test de Login

```bash
curl -X POST https://lanus.digital/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'
# Debe retornar error de credenciales
```

### 5. Verificar Rate Limiting

```bash
# Hacer 10 requests rápidos
for i in {1..10}; do
  curl -X POST https://lanus.digital/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test","password":"test"}'
done
# Debe retornar 429 después de varios intentos
```

---

## 🔒 MANTENIMIENTO DE SEGURIDAD

### Mensual
- [ ] Revisar logs de acceso
- [ ] Verificar intentos de login fallidos
- [ ] Actualizar dependencias: `npm audit fix`
- [ ] Revisar uso de APIs

### Trimestral
- [ ] Rotar JWT_SECRET
- [ ] Rotar API Keys
- [ ] Auditoría de seguridad completa
- [ ] Backup de base de datos

### Anual
- [ ] Cambiar contraseña de MySQL
- [ ] Renovar certificados SSL (si no es automático)
- [ ] Revisión de permisos de usuarios
- [ ] Penetration testing

---

## 🆘 PROCEDIMIENTO DE EMERGENCIA

### Si se Comprometen las Credenciales

1. **INMEDIATO:**
   ```bash
   # Rotar JWT_SECRET
   node scripts/generate-secrets.js
   # Actualizar en servidor
   vercel env add JWT_SECRET production
   ```

2. **Cambiar contraseña de MySQL**
3. **Regenerar API Keys**
4. **Revisar logs de acceso**
5. **Notificar al equipo**
6. **Documentar el incidente**

### Si Hay un Ataque

1. **Activar Cloudflare "Under Attack Mode"**
2. **Revisar logs:** `pm2 logs`
3. **Bloquear IPs maliciosas en firewall**
4. **Contactar a hosting provider**
5. **Documentar el ataque**

---

## 📞 CONTACTOS DE EMERGENCIA

- **Seguridad:** seguridad@lanus.gob.ar
- **DevOps:** devops@lanus.gob.ar
- **Soporte Vercel:** https://vercel.com/support
- **Soporte Render:** https://render.com/support

---

## 📚 RECURSOS ADICIONALES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Auditoría de Seguridad](./AUDITORIA_SEGURIDAD.md)

---

**¡Sistema listo para producción segura!** 🚀🔒
