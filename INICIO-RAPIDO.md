# ⚡ Inicio Rápido - 3 Pasos

## 1️⃣ Instalar dependencias

```bash
cd migracion
npm install
```

## 2️⃣ Configurar base de datos

Copia el archivo de ejemplo y configura tus credenciales:

```bash
copy .env.example .env
```

Luego edita el archivo `.env` y asegúrate que la URL de la base de datos sea correcta:

```
DATABASE_URL="mysql://transpo1_credenciales:feelthesky1@localhost:3306/transpo1_credenciales"
```

Genera el cliente de Prisma:

```bash
npm run prisma:generate
```

## 3️⃣ Iniciar el servidor

```bash
npm run dev
```

Abre tu navegador en: **http://localhost:3000**

---

## 🔐 Probar Login

Usa las mismas credenciales de tu sistema PHP actual (tabla `admin`).

Si no tienes un usuario, puedes crear uno ejecutando este SQL:

```sql
-- Contraseña: "admin123"
INSERT INTO admin (nombre, email, password, rol) 
VALUES (
  'Administrador Prueba',
  'admin@lanus.gob.ar',
  '$2a$10$YP5qZ0yFZEZQXN8KZ8sXEOGkYOVHZqKZN8X5xN8KZ8sXEOGkYOVHZq',
  'administrador'
);
```

**Email**: admin@lanus.gob.ar  
**Contraseña**: admin123

---

## ❓ ¿Problemas?

Lee el archivo `README.md` completo para más detalles.
