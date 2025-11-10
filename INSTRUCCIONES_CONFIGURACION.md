# 🎨 Sistema de Personalización de la Aplicación

## ✅ Implementación Completa

Se ha creado un sistema completo de personalización de la aplicación que permite configurar desde el panel de administración:

- ✅ Título de la aplicación
- ✅ Subtítulo
- ✅ Logo (en Base64)
- ✅ Favicon (en Base64)
- ✅ Colores primario y secundario
- ✅ Pie de página

---

## 📋 Pasos para Usar el Sistema

### **1. Generar el Cliente de Prisma**

Primero, necesitas regenerar el cliente de Prisma para que reconozca la nueva tabla `configuracion_app`:

```bash
# Cierra VS Code primero si está abierto
npx prisma generate
```

### **2. Crear la Tabla en la Base de Datos**

Tienes dos opciones:

#### **Opción A: Con Prisma Migrate (Recomendado)**

```bash
npx prisma migrate dev --name agregar_configuracion_app
```

#### **Opción B: Crear la Tabla Manualmente (SQL)**

Si prefieres hacerlo manualmente, ejecuta este SQL en tu base de datos:

```sql
CREATE TABLE `configuracion_app` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(200) NOT NULL DEFAULT 'Sistema de Gestión',
  `subtitulo` VARCHAR(300) NULL,
  `logo_base64` LONGTEXT NULL,
  `favicon_base64` LONGTEXT NULL,
  `color_primario` VARCHAR(20) NULL DEFAULT '#2563eb',
  `color_secundario` VARCHAR(20) NULL DEFAULT '#1e40af',
  `pie_pagina` TEXT NULL,
  `actualizado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `actualizado_por` INT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar configuración por defecto
INSERT INTO `configuracion_app` (
  `titulo`,
  `subtitulo`,
  `color_primario`,
  `color_secundario`
) VALUES (
  'Sistema de Gestión Municipal',
  'Municipio de Lanús',
  '#2563eb',
  '#1e40af'
);
```

### **3. Acceder al Panel de Configuración**

1. Inicia sesión en el panel administrativo
2. Ve al **Sidebar** (menú lateral)
3. Click en **⚙️ Configuración**
4. Personaliza tu aplicación:
   - Título y subtítulo
   - Carga tu logo (PNG, JPG, SVG, máx 2MB)
   - Ajusta los colores
   - Personaliza el pie de página
5. Click en **Guardar Cambios**
6. La página se recargará automáticamente

---

## 🎯 Archivos Creados

### **1. Schema de Prisma**
- `prisma/schema.prisma` → Tabla `configuracion_app`

### **2. API**
- `app/api/configuracion/route.ts` → GET y PUT para configuración

### **3. Frontend**
- `app/(panel)/configuracion/page.tsx` → Página de administración
- `lib/hooks/useConfiguracion.ts` → Hook para cargar configuración

### **4. Componentes Actualizados**
- `components/layout/header.tsx` → Usa logo y título personalizados
- `components/layout/sidebar.tsx` → Enlace a configuración

---

## 🔧 Características

### **Logo en Base64**
- Formatos soportados: PNG, JPG, SVG
- Tamaño máximo: 2MB
- Se guarda en Base64 en la base de datos
- No requiere almacenamiento de archivos

### **Vista Previa en Tiempo Real**
- Previsualiza cómo se verá el logo en el header
- Vista previa de colores en botones
- Validación de tamaño de imágenes

### **Colores Personalizados**
- Color primario: Botones, enlaces principales
- Color secundario: Estados hover
- Selector de color visual
- Input de texto para códigos HEX

---

## 📸 Cómo Cargar un Logo

1. Click en **"Elegir archivo"** en la sección de Logo
2. Selecciona tu imagen (PNG, JPG o SVG)
3. La imagen se convertirá automáticamente a Base64
4. Verás una vista previa
5. Click en **"Guardar Cambios"**

---

## 🚀 Deploy en Vercel

Los cambios se aplicarán automáticamente después de:

1. Hacer commit de los archivos
2. Push a tu repositorio
3. Vercel detectará los cambios
4. Ejecutar `npx prisma generate` en Vercel (automático)
5. Crear la tabla manualmente en la BD o usar Prisma Migrate

**IMPORTANTE**: Asegúrate de crear la tabla `configuracion_app` en la base de datos de producción.

---

## 🔒 Seguridad

- ✅ Solo usuarios autenticados pueden modificar la configuración
- ✅ Validación de tamaño de imagen (máx 2MB)
- ✅ Validación de tipo de archivo
- ✅ Se guarda el ID del usuario que hizo la última modificación

---

## 💡 Próximos Pasos

Después de configurar todo:

1. **Genera Prisma Client**: `npx prisma generate`
2. **Crea la tabla**: Migración o SQL manual
3. **Reinicia el servidor**: `npm run dev`
4. **Accede a `/configuracion`**
5. **Personaliza tu aplicación** 🎨

---

## 🐛 Troubleshooting

### Error: "Property 'configuracion_app' does not exist"
**Solución**: Ejecuta `npx prisma generate` para regenerar el cliente.

### La tabla no existe
**Solución**: Ejecuta la migración o crea la tabla manualmente con el SQL proporcionado.

### Error de permisos en Windows
**Solución**: Cierra VS Code y ejecuta `npx prisma generate` desde la terminal.

### Los cambios no se reflejan
**Solución**: Recarga la página después de guardar (se hace automáticamente).

---

**Fecha de creación**: ${new Date().toLocaleString('es-AR')}
**Versión**: 1.0.0
