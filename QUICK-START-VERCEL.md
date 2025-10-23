# ⚡ Quick Start - Deploy a Vercel en 5 Minutos

## 🎯 Requisitos Rápidos

1. ✅ Cuenta Vercel (gratuita): https://vercel.com/signup
2. ✅ MySQL accesible desde internet (NO localhost)
3. ✅ Git/GitHub instalado

---

## 🚀 Pasos Rápidos

### 1️⃣ Instalar dependencias faltantes

```bash
cd migracion
npm install mysql2 dotenv
```

### 2️⃣ Probar conexión local a MySQL

```bash
npm run test:db
```

Si esto falla, tu MySQL necesita configuración para acceso remoto (ver `DEPLOY-VERCEL.md`).

### 3️⃣ Subir a GitHub

```bash
# Inicializar Git (si no lo hiciste)
git init

# Agregar archivos
git add .
git commit -m "Setup inicial para Vercel"

# Crear repo en GitHub y conectar
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

### 4️⃣ Deploy en Vercel

**Opción A - Desde Web (MÁS FÁCIL):**

1. Ve a https://vercel.com/new
2. Importa tu repositorio de GitHub
3. Configura variables de entorno:

```
DATABASE_URL = mysql://transpo1_credenciales:feelthesky1@TU_HOST_MYSQL:3306/transpo1_credenciales

JWT_SECRET = [generar uno nuevo - ver abajo]

NEXT_PUBLIC_APP_URL = https://tu-proyecto.vercel.app
```

4. Click en "Deploy"

**Opción B - Desde CLI:**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 5️⃣ Configurar Variables de Entorno

Genera un JWT_SECRET seguro:

**Windows PowerShell:**

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Mac/Linux:**

```bash
openssl rand -base64 32
```

**O usa:** https://generate-secret.vercel.app/32

### 6️⃣ Verificar Deploy

Cuando termine el deploy:

1. Abre: `https://tu-proyecto.vercel.app/api/health`
2. Deberías ver:

   ```json
   {
     "status": "healthy",
     "database": {
       "status": "connected"
     }
   }
   ```

3. Prueba el login en: `https://tu-proyecto.vercel.app/login`

---

## ⚠️ IMPORTANTE: Configurar MySQL Remoto

Tu DATABASE_URL actual usa `localhost`, que NO funcionará en Vercel.

### Opciones:

**A) cPanel / Hosting Compartido:**

- Ve a: `MySQL® Databases` → `Remote MySQL®`
- Agrega: `0.0.0.0/0` (todas las IPs)
- Usa como host: el dominio de tu servidor (ej: `servidor123.tuhost.com`)

**B) Servidor Propio/VPS:**

```bash
# 1. Editar MySQL config
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# 2. Cambiar:
bind-address = 0.0.0.0

# 3. Reiniciar MySQL
sudo systemctl restart mysql

# 4. Crear usuario remoto
mysql -u root -p
```

```sql
CREATE USER 'transpo1_credenciales'@'%' IDENTIFIED BY 'feelthesky1';
GRANT ALL PRIVILEGES ON transpo1_credenciales.* TO 'transpo1_credenciales'@'%';
FLUSH PRIVILEGES;
```

```bash
# 5. Abrir puerto en firewall
sudo ufw allow 3306/tcp
```

**C) Base de datos en la Nube:**

- Usar el endpoint proporcionado (AWS RDS, DigitalOcean, etc.)

---

## 🔧 Troubleshooting Rápido

### ❌ "Can't connect to MySQL"

**Solución:**

1. Verifica que MySQL acepte conexiones remotas
2. Cambia `localhost` por IP pública o dominio
3. Verifica que el puerto 3306 esté abierto

### ❌ "Access denied"

**Solución:**

```sql
-- Verificar usuario
SELECT User, Host FROM mysql.user WHERE User='transpo1_credenciales';

-- Si solo muestra 'localhost', crear usuario remoto
CREATE USER 'transpo1_credenciales'@'%' IDENTIFIED BY 'feelthesky1';
GRANT ALL PRIVILEGES ON transpo1_credenciales.* TO 'transpo1_credenciales'@'%';
```

### ❌ Health check muestra "unhealthy"

**Solución:**

1. Ve a Vercel → Tu proyecto → Functions → Ver logs
2. Busca el error específico
3. Verifica las variables de entorno

---

## 📝 Scripts Útiles

```bash
# Probar conexión BD
npm run test:db

# Deploy a producción
npm run vercel:deploy

# Ver logs en tiempo real
vercel logs --follow

# Abrir proyecto en Vercel
vercel open
```

---

## ✅ Checklist Pre-Deploy

- [ ] MySQL acepta conexiones remotas
- [ ] DATABASE_URL usa host público (no localhost)
- [ ] `npm run test:db` funciona correctamente
- [ ] Código subido a GitHub
- [ ] Variables de entorno configuradas en Vercel
- [ ] JWT_SECRET es único y diferente del desarrollo

---

## 🎉 ¡Listo!

Una vez que el health check responda "healthy", tu aplicación Next.js está 100% funcional en producción con MySQL.

**Siguiente paso:** Lee `DEPLOY-VERCEL.md` para detalles completos de configuración y seguridad.
