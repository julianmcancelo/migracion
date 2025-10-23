# 📧 Configuración del Sistema de Emails

## Instalación de Dependencias

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

## Configuración de Gmail

### 1. Obtener Contraseña de Aplicación de Gmail

Para usar Gmail como servidor SMTP, necesitas una **contraseña de aplicación** (no tu contraseña normal):

1. Ve a tu cuenta de Google: https://myaccount.google.com/security
2. Asegúrate de tener activada la **Verificación en 2 pasos**
3. Busca **"Contraseñas de aplicaciones"**
4. Selecciona:
   - App: **Correo**
   - Dispositivo: **Otro (nombre personalizado)** → Escribe "Sistema Turnos Lanús"
5. Copia la contraseña de 16 dígitos que se genera

### 2. Configurar Variables de Entorno

Agrega estas variables a tu archivo `.env.local`:

```env
# Email Configuration
GMAIL_USER="tu-email@gmail.com"
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"  # Sin espacios: xxxxxxxxxxxxxxxx
NEXT_PUBLIC_URL="http://localhost:3000"   # O tu URL de producción
```

### 3. Para Vercel (Producción)

Agrega las variables en: **Vercel Dashboard → Tu Proyecto → Settings → Environment Variables**

```
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
NEXT_PUBLIC_URL=https://tu-dominio.vercel.app
```

## Funcionamiento

### Envío Automático al Crear Turno

Cuando se crea un turno, el sistema:

1. ✅ Crea el registro en la base de datos
2. ✅ Busca el email del titular de la habilitación
3. ✅ Si tiene email, envía automáticamente un correo de confirmación
4. ✅ Si no tiene email o falla, el turno se crea igual (no bloquea)

### Plantilla del Email

El email incluye:

- ✅ Logo y header del municipio
- ✅ Datos del turno (licencia, fecha, hora)
- ✅ Información importante para la inspección
- ✅ Documentación requerida
- ✅ Diseño responsive (HTML profesional)

## Testing Local

Para probar el sistema:

```bash
# 1. Configurar .env.local con tus credenciales de Gmail

# 2. Iniciar servidor
npm run dev

# 3. Crear un turno desde el sistema
# El email se enviará automáticamente
```

## Solución de Problemas

### Error: "Invalid login"

- Verifica que la contraseña sea de aplicación (16 dígitos)
- Asegúrate que la verificación en 2 pasos esté activa

### Error: "Missing credentials"

- Verifica que las variables GMAIL_USER y GMAIL_APP_PASSWORD estén configuradas
- Revisa que el archivo .env.local esté en la raíz del proyecto

### No se envía el email

- Revisa la consola del servidor para ver errores
- Verifica que el titular tenga un email en la base de datos
- Chequea los logs en Vercel si está en producción

## Personalización

Para modificar la plantilla del email, edita:

```
/app/api/turnos/enviar-email/route.ts
```

Puedes cambiar:

- Colores del diseño
- Texto del mensaje
- Información adicional
- Logo del municipio

## APIs Disponibles

### POST /api/turnos/enviar-email

Envía email de confirmación de turno.

**Body:**

```json
{
  "email": "usuario@ejemplo.com",
  "nombre": "Juan Pérez",
  "nro_licencia": "123456",
  "fecha": "2025-01-20",
  "hora": "10:00",
  "tipo_transporte": "Escolar"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email enviado correctamente",
  "messageId": "<id-del-mensaje>"
}
```

## Alternativas a Gmail

Si prefieres usar otro proveedor:

### Outlook/Office 365

```javascript
service: 'outlook',
auth: {
  user: process.env.OUTLOOK_USER,
  pass: process.env.OUTLOOK_PASSWORD
}
```

### SMTP Personalizado

```javascript
host: 'smtp.tudominio.com',
port: 587,
secure: false,
auth: {
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASSWORD
}
```

## Notas de Seguridad

⚠️ **IMPORTANTE:**

- Nunca subas el archivo `.env.local` al repositorio
- Usa contraseñas de aplicación, nunca tu contraseña principal
- En producción, rota las credenciales periódicamente
- Monitorea el uso de tu cuenta de Gmail

## Límites de Gmail

Gmail tiene límites de envío:

- **500 emails por día** (cuentas gratuitas)
- **2000 emails por día** (Google Workspace)

Para alto volumen, considera:

- SendGrid
- AWS SES
- Mailgun
- Postmark
