# Sistema de Notificaciones - Instrucciones de Instalación

## ✅ Archivos Creados

1. **Migración SQL**: `db/migrations/009_create_notificaciones.sql`
2. **Schema Prisma**: Actualizado `prisma/schema.prisma`
3. **API de Notificaciones**: `app/api/notificaciones/route.ts`
4. **API Marcar Leídas**: `app/api/notificaciones/marcar-leida/route.ts`
5. **Librería de Helpers**: `lib/notificaciones.ts`
6. **Componente Dropdown**: `components/layout/dropdown-notificaciones.tsx`
7. **Header Actualizado**: `components/layout/header.tsx`

## 🔧 Pasos para Activar el Sistema

### 1. Ejecutar Migración SQL

Ejecuta la migración manualmente en tu base de datos MySQL:

```sql
-- Primero, eliminar la tabla anterior de notificaciones si existe
DROP TABLE IF EXISTS notificaciones;

-- Crear la nueva tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL COMMENT 'ID del usuario que recibirá la notificación',
  tipo VARCHAR(50) NOT NULL COMMENT 'Tipo: contacto_nuevo, habilitacion_vencida, turno_nuevo, etc.',
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  icono VARCHAR(50) DEFAULT '🔔' COMMENT 'Emoji o clase de icono',
  url VARCHAR(500) DEFAULT NULL COMMENT 'URL a donde redirigir al hacer click',
  leida BOOLEAN DEFAULT FALSE,
  fecha_creacion DATETIME NOT NULL,
  fecha_lectura DATETIME DEFAULT NULL,
  metadata JSON DEFAULT NULL COMMENT 'Datos adicionales en formato JSON',
  
  FOREIGN KEY (usuario_id) REFERENCES admin(id) ON DELETE CASCADE,
  
  INDEX idx_usuario_leida (usuario_id, leida),
  INDEX idx_fecha_creacion (fecha_creacion),
  INDEX idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentario de la tabla
ALTER TABLE notificaciones 
COMMENT = 'Notificaciones del sistema para usuarios administrativos';
```

### 2. Regenerar Cliente Prisma

Ejecuta en tu terminal (PowerShell o CMD):

```bash
cd c:\Users\Jota\Documents\Proyecto\migracion
npm run prisma:generate
```

O directamente:

```bash
npx prisma generate
```

### 3. Verificar Schema Prisma

El modelo `notificaciones` ya está actualizado en `prisma/schema.prisma`.

### 4. Crear Notificaciones de Prueba

Para probar inmediatamente el sistema:

```bash
node scripts/crear-notificacion-prueba.js
```

Este script creará 4 notificaciones de prueba para el primer administrador.

### 5. Reiniciar el Servidor de Desarrollo

```bash
npm run dev
```

Ahora deberías ver el badge de notificaciones en el header.

## 📋 Cómo Usar el Sistema

### Crear Notificación Manualmente

```typescript
import { crearNotificacion } from '@/lib/notificaciones'

await crearNotificacion({
  usuarioId: 1,
  tipo: 'contacto_nuevo',
  titulo: 'Nuevo contacto interesado',
  mensaje: 'juan@example.com solicitó información',
  icono: '📧',
  url: '/dashboard?seccion=contactos',
  metadata: { email: 'juan@example.com' }
})
```

### Notificar a Todos los Administradores

```typescript
import { notificarAdmins } from '@/lib/notificaciones'

await notificarAdmins({
  tipo: 'contacto_nuevo',
  titulo: 'Nuevo contacto interesado',
  mensaje: 'Alguien solicitó información',
  icono: '📧',
  url: '/dashboard'
})
```

### Notificar Nuevo Contacto Interesado

```typescript
import { notificarNuevoContacto } from '@/lib/notificaciones'

await notificarNuevoContacto('email@example.com', 'requisitos_landing')
```

## 🎯 Integrar con Contactos Interesados

Para que funcione automáticamente cuando se inserte un nuevo contacto en la tabla `contactos_interesados`, agrega esto al endpoint donde se guarda el contacto:

```typescript
// En tu API de contactos interesados
import { notificarNuevoContacto } from '@/lib/notificaciones'

// Después de insertar el contacto
await notificarNuevoContacto(email, origen)
```

## 🔔 Características del Sistema

- ✅ **Badge con contador** en tiempo real
- ✅ **Dropdown funcional** con lista de notificaciones
- ✅ **Marcar como leída** al hacer click
- ✅ **Marcar todas como leídas** con un botón
- ✅ **Navegación automática** a la URL de la notificación
- ✅ **Polling cada 30 segundos** para actualizar el contador
- ✅ **Formato de tiempo relativo** ("Hace 5m", "Hace 2h")
- ✅ **Íconos emoji** personalizables por tipo
- ✅ **Metadata JSON** para datos adicionales

## 📊 Tipos de Notificaciones Sugeridos

```typescript
// Contactos
'contacto_nuevo'

// Habilitaciones
'habilitacion_vencida'
'habilitacion_aprobada'
'habilitacion_rechazada'

// Inspecciones
'inspeccion_asignada'
'inspeccion_completada'

// Turnos
'turno_nuevo'
'turno_cancelado'
'turno_recordatorio'

// Vehículos
'oblea_vencida'
'cambio_vehiculo_solicitado'
```

## 🐛 Troubleshooting

Si el cliente de Prisma no se regenera correctamente, ejecuta:

```bash
npm run prisma:clean
```

Si hay errores de TypeScript, reinicia el servidor TypeScript en VS Code:
- `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
