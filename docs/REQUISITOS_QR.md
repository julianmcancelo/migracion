# Sistema de Requisitos con QR y Google Sign-In

## 📋 Descripción

Sistema completo para que los usuarios consulten requisitos de habilitaciones mediante:
1. **Email minimalista** - Diseño limpio y profesional
2. **QR Code** - Escaneo con celular para acceso rápido
3. **Google Sign-In** - Detección automática de cuenta de Google
4. **Base de datos** - Almacenamiento de contactos interesados

---

## 🚀 Funcionalidades

### 1. Landing Page Principal (`/`)
- Botón "Ver Requisitos Completos"
- Modal con:
  - Lista completa de requisitos
  - **QR Code** generado dinámicamente
  - Formulario para enviar por email

### 2. Página Dedicada QR (`/requisitos`)
- Optimizada para móviles
- Dos opciones de envío:
  - **Google Sign-In** (automático)
  - **Email manual**
- Responsive y mobile-first
- Confirmación visual de envío

### 3. Email Minimalista
- Diseño clean y moderno
- Compatible con todos los clientes de email
- Listado completo de requisitos
- Información de contacto

### 4. Base de Datos
- Tabla `contactos_interesados`
- Tracking de consultas
- Contador de interacciones
- Útil para marketing y seguimiento

---

## ⚙️ Configuración

### Variables de Entorno Necesarias

```bash
# Gmail (ya configurado en Vercel)
GMAIL_USER="tu-email@gmail.com"
GMAIL_APP_PASSWORD="tu-app-password-16-digitos"

# Google Sign-In (OPCIONAL)
# Solo necesario si querés habilitar el botón de Google
NEXT_PUBLIC_GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
```

### Obtener Google Client ID (Opcional)

Si querés habilitar Google Sign-In:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Crea un nuevo proyecto o usa uno existente
3. **APIs & Services** → **Credentials**
4. **Create Credentials** → **OAuth 2.0 Client ID**
5. Tipo de aplicación: **Web application**
6. Agrega URIs autorizados:
   - Desarrollo: `http://localhost:3000`
   - Producción: `https://tu-dominio.com`
7. Copia el **Client ID**
8. Agrega a Vercel como `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

---

## 🗄️ Migración de Base de Datos

Ejecuta el script de migración:

```bash
# En MySQL Workbench o terminal
mysql -u usuario -p nombre_db < db/migrations/008_create_contactos_interesados.sql
```

O desde el código SQL directamente:

```sql
CREATE TABLE contactos_interesados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  origen VARCHAR(50) NOT NULL,
  fecha_registro DATETIME NOT NULL,
  ultima_consulta DATETIME DEFAULT NULL,
  contador_consultas INT DEFAULT 1,
  suscrito_newsletter BOOLEAN DEFAULT FALSE,
  notas TEXT,
  INDEX idx_email (email),
  INDEX idx_origen (origen)
);
```

---

## 📱 Flujos de Usuario

### Flujo 1: Desktop/Laptop
1. Usuario hace clic en "Ver Requisitos Completos"
2. Se abre modal con lista de requisitos
3. Usuario puede:
   - Leer los requisitos
   - Enviar por email ingresando su correo
   - Guardar/compartir el QR

### Flujo 2: Móvil (QR)
1. Usuario escanea QR con celular
2. Se abre `/requisitos` en navegador móvil
3. Usuario puede:
   - Usar cuenta de Google (1 clic)
   - Ingresar email manualmente
4. Recibe email con requisitos
5. Éxito confirmado visualmente

---

## 🎨 Características del Email

### Diseño Minimalista
- Header azul con branding
- Contenido limpio y legible
- Listas simples sin decoración excesiva
- Sección de contacto destacada
- Footer institucional

### Compatible con:
- Gmail
- Outlook
- Apple Mail
- Yahoo Mail
- Otros clientes modernos

---

## 📊 Datos Almacenados

### Tabla `contactos_interesados`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | ID autoincremental |
| email | VARCHAR(255) | Email del usuario (único) |
| origen | VARCHAR(50) | `requisitos_landing` o `credencial_busqueda` |
| fecha_registro | DATETIME | Primera vez que consultó |
| ultima_consulta | DATETIME | Última vez que consultó |
| contador_consultas | INT | Número de veces que pidió info |
| suscrito_newsletter | BOOLEAN | Para futuras campañas |
| notas | TEXT | Notas adicionales |

### Uso de los datos
- Marketing dirigido
- Seguimiento de prospectos
- Análisis de interés en servicios
- Base para newsletter municipal

---

## 🔐 Seguridad y Privacidad

- Emails se validan antes de guardar
- No se exponen credenciales en el front
- Google Sign-In usa OAuth 2.0 seguro
- Solo se guarda el email, no otros datos de Google
- Cumple con buenas prácticas de privacidad

---

## 🚨 Troubleshooting

### El QR no se genera
- Verifica que `qrcode.react` esté instalado
- Comprueba que la URL base esté correcta

### Google Sign-In no funciona
- Verifica que `NEXT_PUBLIC_GOOGLE_CLIENT_ID` esté configurado
- Asegúrate de que la URI esté autorizada en Google Console
- El botón se oculta automáticamente si no está configurado

### Email no se envía
- Verifica `GMAIL_USER` y `GMAIL_APP_PASSWORD`
- En desarrollo, se simula el envío (check console)
- En producción, revisa los logs de Vercel

### No se guardan los contactos
- Verifica que la tabla exista en la BD
- Comprueba la conexión a BD con `npm run db:test`
- Revisa logs del servidor

---

## 🎯 Próximas Mejoras (Sugerencias)

- [ ] Estadísticas de QR escaneados
- [ ] Diferentes versiones de requisitos (PDF, etc.)
- [ ] Notificaciones push cuando cambien requisitos
- [ ] Newsletter automático para contactos guardados
- [ ] A/B testing de diseños de email
- [ ] Analytics de apertura de emails

---

## 📝 Notas Técnicas

- QR generado client-side (no servidor)
- Google Sign-In solo carga si está configurado
- Email usa Nodemailer con fallback a credenciales Gmail
- Página `/requisitos` es SSR para mejor SEO
- Modal usa QRCodeSVG para renderizado rápido
- Diseño responsive mobile-first

---

## 👨‍💻 Desarrollo

```bash
# Instalar dependencias (ya instaladas)
npm install

# Modo desarrollo
npm run dev

# Acceder a:
# - Landing: http://localhost:3000
# - Requisitos QR: http://localhost:3000/requisitos

# Build para producción
npm run build
npm run start
```

---

## 📧 Contacto y Soporte

Para dudas o problemas, contactar al equipo de desarrollo del Municipio de Lanús.

---

© 2025 Municipio de Lanús - Dirección General de Movilidad y Transporte
