# 🔄 Sistema de Renovación de Habilitaciones

## 📋 Descripción

Sistema completo para renovar habilitaciones de forma automática, manteniendo el número de licencia y copiando los datos del año anterior.

---

## ✅ Archivos Creados

### Base de Datos
- **`db/migrations/010_add_renovacion_fields.sql`** - Migración para agregar campos

### Backend
- **`app/api/habilitaciones/[id]/renovar/route.ts`** - API de renovación

### Frontend
- **`components/habilitaciones/modal-renovar.tsx`** - Modal para renovar

### Schema
- **`prisma/schema.prisma`** - Actualizado con campos de renovación

---

## 🚀 Instalación

### 1. Ejecutar Migración SQL

```sql
ALTER TABLE habilitaciones_generales 
ADD COLUMN es_renovacion BOOLEAN DEFAULT FALSE,
ADD COLUMN renovacion_de_id INT DEFAULT NULL,
ADD COLUMN fecha_renovacion DATETIME DEFAULT NULL,
ADD COLUMN fue_renovada BOOLEAN DEFAULT FALSE,
ADD COLUMN renovada_en_id INT DEFAULT NULL,
ADD INDEX idx_renovacion (renovacion_de_id),
ADD INDEX idx_fue_renovada (fue_renovada);
```

### 2. Regenerar Prisma

```bash
npx prisma generate
```

### 3. Reiniciar servidor

```bash
npm run dev
```

---

## 🎯 Lógica de Renovación

### Datos que SE MANTIENEN:
- ✅ **Número de licencia** (cambia solo el año)
- ✅ **Titular** (personas asociadas)
- ✅ **Vehículo** (vehículos activos)
- ✅ **Tipo de transporte** (Escolar/Remis)
- ✅ **Establecimiento o remisería**

### Datos que CAMBIAN:
- 🔄 **Número de expediente** (nuevo cada año)
- 🔄 **Año** (año actual)
- 🔄 **Vigencia** (01/01/XXXX - 31/12/XXXX)
- 🔄 **Estado** (EN_TRAMITE)

### Ejemplo:

```
Habilitación 2024:
├─ Licencia: 123/2024
├─ Expediente: EXP-2024-0456
├─ Titular: Juan García
└─ Vehículo: ABC123

        ⬇️ RENOVAR

Habilitación 2025:
├─ Licencia: 123/2025  ← Mismo número, nuevo año
├─ Expediente: EXP-2025-0789  ← NUEVO
├─ Titular: Juan García  ← Copiado
└─ Vehículo: ABC123  ← Copiado
```

---

## 💻 Uso

### En la Lista de Habilitaciones

Agregar botón "Renovar" en el menú de acciones (⋮):

```tsx
import { ModalRenovar } from '@/components/habilitaciones/modal-renovar'

// En el componente de lista
const [habilitacionRenovar, setHabilitacionRenovar] = useState(null)

// Botón en menú
<DropdownMenuItem onClick={() => setHabilitacionRenovar(habilitacion)}>
  <RefreshCw className="mr-2 h-4 w-4" />
  Renovar
</DropdownMenuItem>

// Modal
{habilitacionRenovar && (
  <ModalRenovar
    habilitacion={habilitacionRenovar}
    open={!!habilitacionRenovar}
    onOpenChange={(open) => !open && setHabilitacionRenovar(null)}
  />
)}
```

### Mostrar Solo Si:
- Habilitación por vencer (< 60 días)
- O ya vencida
- Y NO fue renovada aún

```tsx
const puedeRenovar = 
  !habilitacion.fue_renovada && 
  (esVencida || diasParaVencer < 60)
```

---

## 🔍 Validaciones Automáticas

El sistema valida antes de renovar:

### ✅ Documentos del Vehículo:
- VTV vigente
- Póliza de seguro vigente

### ⚠️ Si hay documentos vencidos:
- Muestra advertencia
- Permite continuar
- Marca los documentos faltantes

---

## 📊 Dashboard de Renovaciones (Opcional)

Crear página `/habilitaciones/renovaciones`:

```tsx
export default function RenovacionesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>⚠️ Por Vencer (30 días)</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Lista de habilitaciones */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📋 Por Vencer (60 días)</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Lista de habilitaciones */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>✅ Renovadas Este Mes</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Lista de renovaciones */}
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 🔔 Notificaciones Automáticas

El sistema envía notificación cuando se renueva:

```typescript
await notificarAdmins({
  tipo: 'renovacion_creada',
  titulo: 'Renovación de habilitación',
  mensaje: `${titular} - Lic. ${nuevaLicencia} renovada`,
  icono: '🔄',
  url: `/habilitaciones/${nuevaId}`
})
```

---

## 📈 Consultas Útiles

### Ver cadena de renovaciones:

```sql
SELECT 
  id, 
  anio, 
  nro_licencia, 
  expte,
  es_renovacion,
  renovacion_de_id,
  fue_renovada,
  renovada_en_id
FROM habilitaciones_generales 
WHERE nro_licencia LIKE '123/%'
ORDER BY anio DESC;
```

### Habilitaciones por renovar:

```sql
SELECT 
  id,
  nro_licencia,
  vigencia_fin,
  DATEDIFF(vigencia_fin, CURDATE()) as dias_restantes
FROM habilitaciones_generales
WHERE vigencia_fin BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 60 DAY)
  AND fue_renovada = FALSE
  AND estado = 'HABILITADO'
ORDER BY vigencia_fin;
```

### Renovaciones del mes:

```sql
SELECT 
  h_nueva.id as nueva_id,
  h_nueva.nro_licencia as nueva_licencia,
  h_nueva.expte as nuevo_expte,
  h_anterior.nro_licencia as anterior_licencia,
  h_anterior.expte as anterior_expte,
  h_nueva.fecha_renovacion
FROM habilitaciones_generales h_nueva
LEFT JOIN habilitaciones_generales h_anterior ON h_nueva.renovacion_de_id = h_anterior.id
WHERE h_nueva.es_renovacion = TRUE
  AND MONTH(h_nueva.fecha_renovacion) = MONTH(CURDATE())
  AND YEAR(h_nueva.fecha_renovacion) = YEAR(CURDATE())
ORDER BY h_nueva.fecha_renovacion DESC;
```

---

## 🎨 Mejoras Futuras

### 1. Renovación Masiva
Renovar múltiples habilitaciones a la vez:

```typescript
POST /api/habilitaciones/renovar-masivo
Body: {
  habilitaciones: [1, 2, 3, 4],
  expedienteBase: "EXP-2025-"  // Se autoincrementará
}
```

### 2. Edición Durante Renovación
Permitir cambiar titular o vehículo al renovar:

```typescript
POST /api/habilitaciones/[id]/renovar
Body: {
  nuevoExpediente: "EXP-2025-0123",
  cambiarDatos: true,
  nuevoTitular?: { ... },
  nuevoVehiculo?: { ... }
}
```

### 3. Alertas Automáticas
Cron job que notifica 90, 60, 30 días antes:

```typescript
// scripts/notificar-vencimientos.js
// Ejecutar diariamente
```

### 4. Historial de Renovaciones
Ver todas las renovaciones de una licencia:

```
Licencia 123
├─ 2022 - EXP-2022-0100 ✅ Vencida
├─ 2023 - EXP-2023-0234 ✅ Vencida
├─ 2024 - EXP-2024-0456 ✅ Vencida → Renovada
└─ 2025 - EXP-2025-0789 🔄 En trámite
```

---

## 📱 Integración con Notificaciones

Ya integrado con el sistema de notificaciones:

```typescript
import { notificarAdmins } from '@/lib/notificaciones'

// Se notifica automáticamente al renovar
await notificarAdmins({
  tipo: 'renovacion_creada',
  titulo: 'Renovación de habilitación',
  mensaje: `${titular} - Lic. ${nuevaLicencia}`,
  icono: '🔄',
  url: `/habilitaciones/${nuevaId}`
})
```

---

## 🐛 Troubleshooting

### Error: "Esta habilitación ya fue renovada"
- La habilitación ya tiene una renovación
- Ver el campo `renovada_en_id` para encontrar la nueva

### Error: "Documentos vencidos"
- Actualizar VTV o póliza antes de renovar
- O ignorar advertencia y renovar igual

### No aparece botón "Renovar"
- Verificar que `fue_renovada = FALSE`
- Verificar que faltan < 60 días para vencer

---

## ✅ Checklist de Implementación

- [x] Migración SQL creada
- [x] Schema Prisma actualizado
- [x] API de renovación
- [x] Modal de renovación
- [x] Validación de documentos
- [x] Notificaciones
- [x] Historial de novedades
- [ ] Botón en lista de habilitaciones
- [ ] Dashboard de renovaciones
- [ ] Alertas automáticas
- [ ] Renovación masiva

---

## 📚 Próximos Pasos

1. **Ejecutar migración SQL** en tu base de datos
2. **Regenerar Prisma**: `npx prisma generate`
3. **Agregar botón** "Renovar" en la lista de habilitaciones
4. **Probar** renovar una habilitación
5. **Configurar alertas** para vencimientos

---

**¿Necesitas ayuda?** Todo está listo para usar. Solo falta ejecutar las migraciones. 🚀
