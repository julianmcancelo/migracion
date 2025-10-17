# 🚀 Guía de Deployment a Vercel

## 📋 Requisitos Previos

1. ✅ Cuenta en [Vercel](https://vercel.com) (gratuita)
2. ✅ Servidor MySQL accesible desde internet (NO localhost)
3. ✅ Credenciales de MySQL con permisos completos

## 🔧 Paso 1: Configurar MySQL para Acceso Remoto

### Si usas cPanel / Hosting compartido:

1. Ir a **phpMyAdmin** o **MySQL Databases**
2. Agregar IP de Vercel a **Remote MySQL**
   - En cPanel: MySQL® Databases → Remote MySQL®
   - Agregar: `0.0.0.0/0` (todas las IPs) o IPs específicas de Vercel

### Si usas Servidor Dedicado/VPS:

1. Editar configuración de MySQL:
```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

2. Cambiar bind-address:
```conf
# De:
bind-address = 127.0.0.1

# A:
bind-address = 0.0.0.0
```

3. Crear usuario remoto:
```sql
CREATE USER 'transpo1_credenciales'@'%' IDENTIFIED BY 'feelthesky1';
GRANT ALL PRIVILEGES ON transpo1_credenciales.* TO 'transpo1_credenciales'@'%';
FLUSH PRIVILEGES;
```

4. Reiniciar MySQL:
```bash
sudo systemctl restart mysql
```

5. Abrir puerto 3306 en firewall:
```bash
sudo ufw allow 3306/tcp
```

### Verificar host de MySQL:

Necesitas saber el host público de tu servidor MySQL:

- **cPanel**: Generalmente es el dominio del servidor (ej: `servidor123.tuhost.com`)
- **VPS/Dedicado**: La IP pública del servidor
- **Cloud**: El endpoint proporcionado (ej: RDS endpoint en AWS)

## 🌐 Paso 2: Conectar Repositorio a Vercel

### Opción A: Desde la Web de Vercel

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Importa tu repositorio de Git (GitHub, GitLab, Bitbucket)
3. Si no tienes repo, sube el código a GitHub primero

### Opción B: Instalar CLI de Vercel

```bash
# Instalar Vercel CLI globalmente
npm i -g vercel

# En la carpeta del proyecto
cd migracion

# Login en Vercel
vercel login

# Deploy
vercel
```

## 🔐 Paso 3: Configurar Variables de Entorno en Vercel

### Desde el Dashboard:

1. Ve a tu proyecto en Vercel
2. Ir a **Settings** → **Environment Variables**
3. Agregar las siguientes variables:

#### Variable 1: DATABASE_URL
```
Nombre: DATABASE_URL
Valor: mysql://transpo1_credenciales:feelthesky1@TU_HOST_MYSQL:3306/transpo1_credenciales
Environments: Production, Preview, Development
```

**⚠️ IMPORTANTE**: Reemplazar `TU_HOST_MYSQL` con:
- La IP pública de tu servidor MySQL, O
- El dominio/hostname de tu servidor cPanel, O
- El endpoint de tu base de datos en la nube

Ejemplos válidos:
- `mysql://user:pass@192.168.1.100:3306/dbname`
- `mysql://user:pass@servidor123.tuhost.com:3306/dbname`
- `mysql://user:pass@mysql.tudominio.com:3306/dbname`

#### Variable 2: JWT_SECRET
```
Nombre: JWT_SECRET
Valor: [GENERAR UNO NUEVO - Ver abajo]
Environments: Production, Preview, Development
```

Para generar un JWT_SECRET seguro:
```bash
# En terminal (Mac/Linux):
openssl rand -base64 32

# En terminal (Windows PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# O usa este generador online:
# https://generate-secret.vercel.app/32
```

#### Variable 3: NEXT_PUBLIC_APP_URL
```
Nombre: NEXT_PUBLIC_APP_URL
Valor: https://tu-proyecto.vercel.app
Environments: Production
```

**Nota**: Este valor se puede agregar después del primer deploy cuando ya tengas la URL de Vercel.

### Desde la CLI:

```bash
# Agregar variables una por una
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
vercel env add NEXT_PUBLIC_APP_URL production
```

## 📦 Paso 4: Configurar Build Settings

En Vercel, verifica que esté configurado:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (automático)
- **Install Command**: `npm install`

## 🚀 Paso 5: Deploy

### Deploy Automático (Recomendado):

Cada push a la rama principal desplegará automáticamente.

```bash
git add .
git commit -m "Listo para producción"
git push origin main
```

### Deploy Manual:

```bash
cd migracion
vercel --prod
```

## ✅ Paso 6: Verificar el Deploy

Una vez deployado, verificar:

### 1. Health Check de la Base de Datos

Visita: `https://tu-proyecto.vercel.app/api/health`

Deberías ver:
```json
{
  "status": "healthy",
  "database": {
    "status": "connected",
    "message": "Conexión exitosa a MySQL"
  },
  "system": { ... }
}
```

### 2. Probar el Login

1. Ve a: `https://tu-proyecto.vercel.app`
2. Click en "Acceso Administrativo"
3. Intenta hacer login con un usuario existente

## 🔧 Troubleshooting

### ❌ Error: "Can't connect to MySQL server"

**Causas comunes**:
1. MySQL no acepta conexiones remotas
2. Firewall bloqueando puerto 3306
3. Host incorrecto en DATABASE_URL

**Solución**:
```bash
# Probar conexión desde tu computadora
mysql -h TU_HOST_MYSQL -u transpo1_credenciales -p transpo1_credenciales

# Si no conecta, el problema es de configuración del servidor MySQL
```

### ❌ Error: "Access denied for user"

**Solución**:
- Verificar que el usuario tenga permisos remotos (`user@'%'` no solo `user@'localhost'`)
- Verificar contraseña en DATABASE_URL

### ❌ Error: "Connection timeout"

**Solución**:
- Agregar parámetros de timeout a la URL:
```
DATABASE_URL="mysql://user:pass@host:3306/db?connect_timeout=60&pool_timeout=30"
```

### ❌ Error: "Too many connections"

**Solución**:
- Agregar connection limit a la URL:
```
DATABASE_URL="mysql://user:pass@host:3306/db?connection_limit=5"
```

## 🔒 Seguridad en Producción

### 1. Cambiar Credenciales

**⚠️ MUY IMPORTANTE**: Las credenciales en `conexion.php` están expuestas en este documento.

Después del deploy, considera:
```sql
-- Cambiar contraseña de MySQL
ALTER USER 'transpo1_credenciales'@'%' IDENTIFIED BY 'NUEVA_CONTRASEÑA_SEGURA';
FLUSH PRIVILEGES;
```

Y actualizar en Vercel:
```
DATABASE_URL="mysql://transpo1_credenciales:NUEVA_CONTRASEÑA_SEGURA@host:3306/db"
```

### 2. Restringir IPs (Recomendado)

En lugar de `@'%'`, usar IPs específicas de Vercel:
```sql
-- Ver IPs de Vercel en: https://vercel.com/docs/concepts/edge-network/regions
CREATE USER 'transpo1_credenciales'@'76.76.21.0/24' IDENTIFIED BY 'password';
```

### 3. Usar SSL para MySQL

```
DATABASE_URL="mysql://user:pass@host:3306/db?sslmode=require"
```

## 📊 Monitoreo

### Logs en Vercel:

1. Ir a tu proyecto en Vercel
2. Click en "Functions" → Ver logs en tiempo real
3. Revisar errores de conexión

### Analytics:

Vercel incluye analytics automáticos en el dashboard.

## 🔄 Actualizar el Deploy

### Redeploy automático:
```bash
git add .
git commit -m "Actualización"
git push
```

### Redeploy manual:
```bash
vercel --prod
```

## 📝 Checklist Final

Antes de considerar el deploy como exitoso:

- [ ] Health check responde correctamente
- [ ] Login funciona con usuario de prueba
- [ ] Panel de administración carga correctamente
- [ ] No hay errores en los logs de Vercel
- [ ] Variables de entorno están configuradas
- [ ] JWT_SECRET es diferente del de desarrollo
- [ ] NEXT_PUBLIC_APP_URL apunta a la URL de Vercel

## 🆘 Soporte

Si tienes problemas:

1. Revisar logs en Vercel Dashboard
2. Probar el health check endpoint
3. Verificar conectividad MySQL desde otra herramienta
4. Revisar la documentación de Vercel: https://vercel.com/docs

---

**¡Listo para producción!** 🎉

Tu aplicación Next.js ahora está desplegada en Vercel con conexión a MySQL.
