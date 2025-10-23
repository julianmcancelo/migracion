# 🚀 Migración a Next.js - Sistema de Gestión de Transporte

Prueba de concepto de migración del sistema PHP a Next.js 14 con TypeScript, Prisma y MySQL.

## 📋 Stack Tecnológico

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Prisma** - ORM para MySQL
- **Tailwind CSS** - Estilos
- **bcryptjs** - Hash de contraseñas
- **jose** - JWT para sesiones
- **Zod** - Validación de datos

## 🎯 Características Implementadas

- ✅ Sistema de login completo con validación
- ✅ Autenticación con JWT en cookies HTTP-only
- ✅ Middleware de protección de rutas
- ✅ Conexión a base de datos MySQL existente
- ✅ Panel de administración básico
- ✅ Manejo de sesiones seguras
- ✅ UI moderna con Tailwind CSS (mantiene diseño original)

## 📦 Instalación

### 1. Instalar dependencias

```bash
cd migracion
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env`:

```bash
copy .env.example .env
```

Luego edita `.env` con tus credenciales:

```env
DATABASE_URL="mysql://transpo1_credenciales:feelthesky1@localhost:3306/transpo1_credenciales"
JWT_SECRET="tu-secret-super-secreto-cambiar-en-produccion"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Configurar Prisma

Genera el cliente de Prisma:

```bash
npm run prisma:generate
```

**IMPORTANTE**: El schema de Prisma está configurado para usar la tabla `admin` existente en tu base de datos. No necesitas ejecutar migraciones ya que la tabla ya existe.

Si quieres verificar la conexión:

```bash
npm run prisma:studio
```

Esto abrirá una interfaz web en http://localhost:5555 para explorar tu base de datos.

### 4. Iniciar servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

## 🔐 Probar el Login

Usa las mismas credenciales que usas en tu sistema PHP actual:

- **Email**: El correo de cualquier admin en tu tabla `admin`
- **Contraseña**: La contraseña correspondiente (debe estar hasheada con bcrypt en la BD)

### Crear un usuario de prueba (si necesitas)

Puedes crear un usuario de prueba ejecutando este SQL en tu base de datos:

```sql
-- La contraseña es: "password123"
INSERT INTO admin (nombre, email, password, rol, legajo)
VALUES (
  'Usuario Prueba',
  'prueba@lanus.gob.ar',
  '$2a$10$YourHashedPasswordHere',
  'administrador',
  '12345'
);
```

Para generar el hash de una contraseña, puedes usar este código Node.js:

```javascript
const bcrypt = require('bcryptjs')
const password = 'password123'
const hash = bcrypt.hashSync(password, 10)
console.log(hash)
```

## 📁 Estructura del Proyecto

```
migracion/
├── app/
│   ├── api/
│   │   └── auth/           # API Routes de autenticación
│   │       ├── login/
│   │       ├── logout/
│   │       └── session/
│   ├── login/              # Página de login
│   ├── panel/              # Panel administrativo
│   ├── globals.css         # Estilos globales
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Página de inicio
├── lib/
│   ├── auth.ts             # Utilidades de autenticación
│   └── db.ts               # Cliente Prisma
├── prisma/
│   └── schema.prisma       # Schema de base de datos
├── middleware.ts           # Middleware de protección
├── .env                    # Variables de entorno
└── package.json
```

## 🔄 Rutas Disponibles

- `/` - Página de inicio (home)
- `/login` - Página de inicio de sesión
- `/panel` - Panel administrativo (requiere autenticación)

## 🛡️ Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT almacenado en cookies HTTP-only
- ✅ Middleware de protección de rutas
- ✅ Validación de datos con Zod
- ✅ CSRF protection integrado en Next.js
- ✅ Variables de entorno para secretos

## 🚀 Próximos Pasos para Migración Completa

1. **Migrar modelos de base de datos a Prisma**
   - Agregar modelos para: personas, habilitaciones, tokens_acceso, etc.
   - Actualizar `prisma/schema.prisma`

2. **Migrar endpoints PHP a API Routes**
   - Buscar credencial
   - Gestión de habilitaciones
   - Subida de archivos
   - etc.

3. **Migrar páginas PHP a componentes React**
   - Panel de administración completo
   - Gestión de credenciales
   - Reportes y estadísticas

4. **Implementar funcionalidades faltantes**
   - Envío de emails (Nodemailer)
   - Generación de PDFs (Puppeteer o jsPDF)
   - Generación de QR codes (qrcode npm)

## 📊 Comparación PHP vs Next.js

### Sistema Actual (PHP)

```php
// login.php
$stmt = $pdo->prepare("SELECT * FROM admin WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();
if ($user && password_verify($password, $user['password'])) {
    $_SESSION['usuario_id'] = $user['id'];
    header("Location: panel/");
}
```

### Sistema Nuevo (Next.js)

```typescript
// app/api/auth/login/route.ts
const user = await prisma.admin.findUnique({ where: { email } });
if (user && await bcrypt.compare(password, user.password)) {
    await createSession({ userId: user.id, ... });
    return NextResponse.json({ success: true });
}
```

## 🐛 Troubleshooting

### Error de conexión a MySQL

Si obtienes un error de conexión, verifica:

1. MySQL está corriendo
2. Las credenciales en `.env` son correctas
3. La base de datos existe
4. El usuario tiene permisos

### Error "Module not found"

Ejecuta:

```bash
npm install
npm run prisma:generate
```

### Puerto 3000 en uso

Cambia el puerto:

```bash
npm run dev -- -p 3001
```

## 📝 Scripts Disponibles

```bash
npm run dev          # Iniciar desarrollo
npm run build        # Compilar para producción
npm run start        # Iniciar producción
npm run lint         # Ejecutar linter
npm run prisma:generate   # Generar cliente Prisma
npm run prisma:studio     # Abrir Prisma Studio
```

## 🎨 Personalización

El diseño mantiene el estilo del sistema original con Tailwind CSS. Puedes personalizar:

- Colores en `tailwind.config.ts`
- Estilos globales en `app/globals.css`
- Componentes en `app/`

## 📄 Licencia

Municipio de Lanús © 2025

---

**¿Preguntas?** Este es un prototipo funcional. Puedes expandirlo módulo por módulo según tus necesidades.
