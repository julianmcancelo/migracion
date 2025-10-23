# 🚗 Sistema de Cambio de Vehículos en Habilitaciones

## 📋 Descripción

Sistema completo para cambiar el vehículo de una habilitación activa **manteniendo todo el historial** y sin perder ninguna información.

---

## ✨ Características

✅ **Cambio Controlado**: Proceso guiado paso a paso  
✅ **Historial Completo**: Todos los vehículos anteriores quedan registrados  
✅ **Trazabilidad**: Fechas y observaciones de cada cambio  
✅ **Auditabilidad**: Se puede ver cuándo y por qué se cambió  
✅ **Reversibilidad**: La información nunca se elimina  
✅ **Integridad**: Cambios atómicos mediante transacciones  

---

## 🗄️ Cambios en Base de Datos

### Nuevas Columnas en `habilitaciones_vehiculos`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `fecha_alta` | DATETIME | Fecha de vinculación del vehículo |
| `fecha_baja` | DATETIME | Fecha de desvinculación (cambio) |
| `activo` | BOOLEAN | TRUE = actual, FALSE = histórico |
| `observaciones_cambio` | TEXT | Motivo del cambio |

### Migración

```sql
-- Ejecutar en la base de datos
source scripts/agregar-control-cambio-vehiculos.sql
```

O copiar y ejecutar el contenido del script SQL.

---

## 🔧 Instalación

### 1. Ejecutar Migración SQL

```bash
mysql -u root -p transpo1_credenciales < scripts/agregar-control-cambio-vehiculos.sql
```

### 2. Regenerar Prisma Client

```bash
npx prisma generate
```

### 3. Verificar Cambios

```bash
npx prisma db pull
```

---

## 🚀 Uso desde la Interfaz

### Desde el Detalle de Habilitación:

1. **Abrir habilitación** en `/habilitaciones/[id]`
2. En la sección de **Vehículos**, click en botón **"Cambiar Vehículo"**
3. **Buscar** el nuevo vehículo por dominio, marca o modelo
4. **Seleccionar** el vehículo de la lista
5. **Agregar observaciones** (opcional pero recomendado)
6. **Confirmar** el cambio

### Ver Historial:

1. En el modal de cambio, ir a tab **"Ver Historial"**
2. Ver todos los vehículos anteriores con fechas

---

## 🔌 API Endpoints

### **POST** `/api/habilitaciones/[id]/cambiar-vehiculo`

Cambia el vehículo de una habilitación.

**Request Body:**
```json
{
  "nuevo_vehiculo_id": 123,
  "observaciones": "Cambio de material rodante por solicitud del titular"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Vehículo cambiado exitosamente",
  "data": {
    "habilitacion_id": 456,
    "vehiculo_anterior": {
      "id": 100,
      "dominio": "ABC123",
      "marca": "Ford",
      "modelo": "Transit"
    },
    "vehiculo_nuevo": {
      "id": 123,
      "dominio": "XYZ789",
      "marca": "Mercedes Benz",
      "modelo": "Sprinter"
    },
    "observaciones": "Cambio de material rodante..."
  }
}
```

---

### **GET** `/api/habilitaciones/[id]/cambiar-vehiculo`

Obtiene el historial completo de vehículos.

**Response:**
```json
{
  "success": true,
  "data": {
    "vehiculo_actual": {
      "id": 10,
      "vehiculo_id": 123,
      "dominio": "XYZ789",
      "marca": "Mercedes Benz",
      "modelo": "Sprinter",
      "fecha_alta": "2025-01-20T10:00:00Z",
      "observaciones": "Cambio de material rodante..."
    },
    "historial": [
      {
        "id": 9,
        "vehiculo_id": 100,
        "dominio": "ABC123",
        "marca": "Ford",
        "modelo": "Transit",
        "fecha_alta": "2024-03-15T14:30:00Z",
        "fecha_baja": "2025-01-20T10:00:00Z",
        "observaciones": "Vehículo original"
      }
    ],
    "total_cambios": 1
  }
}
```

---

## 💡 Ejemplo de Uso en Componente

```tsx
import ModalCambioVehiculo from '@/components/habilitaciones/modal-cambio-vehiculo'

function DetalleHabilitacion({ habilitacion }) {
  const [modalOpen, setModalOpen] = useState(false)

  const handleCambioExitoso = () => {
    // Recargar datos de la habilitación
    cargarHabilitacion()
    toast.success('Vehículo cambiado exitosamente')
  }

  return (
    <>
      <Button onClick={() => setModalOpen(true)}>
        Cambiar Vehículo
      </Button>

      <ModalCambioVehiculo
        open={modalOpen}
        onOpenChange={setModalOpen}
        habilitacionId={habilitacion.id}
        vehiculoActual={habilitacion.vehiculo_actual}
        onCambioExitoso={handleCambioExitoso}
      />
    </>
  )
}
```

---

## 📊 Consultas SQL Útiles

### Ver vehículos activos por habilitación

```sql
SELECT 
  hg.id,
  hg.nro_licencia,
  v.dominio,
  v.marca,
  v.modelo,
  hv.fecha_alta
FROM habilitaciones_generales hg
JOIN habilitaciones_vehiculos hv ON hg.id = hv.habilitacion_id
JOIN vehiculos v ON hv.vehiculo_id = v.id
WHERE hv.activo = TRUE;
```

### Ver historial completo de cambios

```sql
SELECT 
  hg.nro_licencia,
  v.dominio,
  v.marca,
  v.modelo,
  hv.activo,
  hv.fecha_alta,
  hv.fecha_baja,
  hv.observaciones_cambio
FROM habilitaciones_vehiculos hv
JOIN habilitaciones_generales hg ON hv.habilitacion_id = hg.id
JOIN vehiculos v ON hv.vehiculo_id = v.id
WHERE hg.id = 123
ORDER BY hv.fecha_alta DESC;
```

### Estadísticas de cambios

```sql
SELECT 
  COUNT(*) AS total_habilitaciones,
  SUM(CASE WHEN tiene_cambios > 0 THEN 1 ELSE 0 END) AS con_cambios,
  AVG(tiene_cambios) AS promedio_cambios
FROM (
  SELECT 
    habilitacion_id,
    COUNT(*) - 1 AS tiene_cambios
  FROM habilitaciones_vehiculos
  GROUP BY habilitacion_id
) AS stats;
```

---

## ⚠️ Consideraciones Importantes

### ✅ **Buenas Prácticas**

1. **Siempre agregar observaciones** claras del motivo del cambio
2. **Verificar documentación** del nuevo vehículo antes de cambiar
3. **Notificar al titular** sobre el cambio realizado
4. **Generar nueva oblea** si corresponde

### ❌ **NO Hacer**

- ❌ NO eliminar registros de `habilitaciones_vehiculos`
- ❌ NO modificar manualmente el campo `activo`
- ❌ NO actualizar directamente sin usar el endpoint
- ❌ NO cambiar vehículo sin observaciones

### 🔒 **Seguridad**

- Solo usuarios con rol **admin** pueden cambiar vehículos
- Todos los cambios quedan auditados con fecha y hora
- Las transacciones garantizan integridad de datos

---

## 🐛 Troubleshooting

### Error: "El nuevo vehículo no existe"
- Verificar que el vehículo esté registrado en la tabla `vehiculos`
- Verificar el ID del vehículo

### Error: "Habilitación no encontrada"
- Verificar que la habilitación exista y esté activa
- Verificar el ID de la habilitación

### No se muestra el historial
- Verificar que se ejecutó la migración SQL
- Ejecutar `npx prisma generate`
- Reiniciar el servidor de desarrollo

---

## 📝 Changelog

### v1.0.0 - 2025-01-23
- ✅ Sistema completo de cambio de vehículos
- ✅ Historial con fechas y observaciones
- ✅ API endpoints completos
- ✅ Componente UI con modal
- ✅ Migración de base de datos
- ✅ Documentación completa

---

## 👨‍💻 Soporte

Para reportar bugs o sugerir mejoras, contactar al equipo de desarrollo.
