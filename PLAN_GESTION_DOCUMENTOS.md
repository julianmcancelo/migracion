# 📂 Sistema de Gestión de Documentos

## Objetivo
Implementar un sistema completo para cargar, almacenar y gestionar documentos digitales asociados a habilitaciones, personas y vehículos.

## Flujo de Trabajo

### 1. **Al crear Habilitación Nueva**

#### Paso 1: Datos Básicos
- Seleccionar tipo (Remis/Escolar)
- Datos de titular
- Datos de vehículo

#### Paso 2: Cargar Documentos (NUEVO)
```
┌─────────────────────────────────────────┐
│  📄 Documentos del Titular             │
│  ✓ DNI Frente                          │
│  ✓ DNI Dorso                           │
│  ○ Antecedentes (opcional)             │
├─────────────────────────────────────────┤
│  🚗 Documentos del Vehículo            │
│  ✓ Título del Vehículo                 │
│  ✓ Cédula Verde/Azul                   │
│  ✓ Póliza de Seguro                    │
│  ✓ Certificado VTV                     │
│  ○ Foto del Vehículo (opcional)        │
├─────────────────────────────────────────┤
│  👨‍✈️ Documentos de Conductores         │
│  ✓ DNI Conductor 1                     │
│  ✓ Licencia D1/D2 Conductor 1          │
│  ○ DNI Conductor 2 (si aplica)         │
│  ○ Licencia Conductor 2                │
├─────────────────────────────────────────┤
│  👥 Celadores (solo Escolar)           │
│  ✓ DNI Celador 1                       │
│  ○ DNI Celador 2 (opcional)            │
└─────────────────────────────────────────┘
```

#### Paso 3: Revisión y Envío
- Ver lista de documentos cargados
- Faltantes marcados en rojo
- Botón: "Enviar Solicitud"

### 2. **Revisión del Operador**

El operador puede:
- Ver todos los documentos escaneados
- Aprobar/Rechazar cada documento
- Solicitar recarga si está ilegible
- Agregar observaciones

### 3. **Almacenamiento**

**Estructura de carpetas:**
```
/uploads/
  /habilitaciones/
    /{habilitacion_id}/
      /titular/
        - dni_frente.pdf
        - dni_dorso.pdf
        - antecedentes.pdf
      /vehiculo/
        - titulo.pdf
        - cedula.pdf
        - seguro.pdf
        - vtv.pdf
        - foto_vehiculo.jpg
      /conductor_1/
        - dni.pdf
        - licencia.pdf
      /conductor_2/
        - dni.pdf
        - licencia.pdf
      /celador_1/
        - dni.pdf
      /resolucion/
        - resolucion_oficial.pdf
```

## Implementación Técnica

### Fase 1: Backend (APIs)
- [ ] `POST /api/documentos/upload` - Subir archivo
- [ ] `GET /api/documentos/[id]` - Descargar archivo
- [ ] `GET /api/habilitaciones/[id]/documentos` - Listar documentos
- [ ] `DELETE /api/documentos/[id]` - Eliminar archivo
- [ ] `PATCH /api/documentos/[id]` - Actualizar estado

### Fase 2: Base de Datos
Tabla: `documentos`
```sql
CREATE TABLE documentos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  habilitacion_id INT,
  tipo_entidad ENUM('PERSONA', 'VEHICULO', 'HABILITACION'),
  entidad_id INT, -- ID de persona, vehiculo o habilitacion
  tipo_documento VARCHAR(50), -- 'DNI_FRENTE', 'SEGURO', 'VTV', etc
  nombre_archivo VARCHAR(255),
  ruta_archivo VARCHAR(500),
  mime_type VARCHAR(100),
  tamanio_bytes INT,
  estado ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO'),
  observaciones TEXT,
  subido_por INT,
  revisado_por INT,
  fecha_subida DATETIME,
  fecha_revision DATETIME,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Fase 3: Frontend (Componentes)
- [ ] `<FileUploader />` - Componente drag & drop
- [ ] `<DocumentosList />` - Lista de documentos
- [ ] `<DocumentViewer />` - Preview de PDF/imágenes
- [ ] `<DocumentStatus />` - Estado de revisión
- [ ] `<BulkUpload />` - Carga múltiple

### Fase 4: Integración OCR (Ya implementado ✅)
- [x] OCR para DNI (extrae datos automáticamente)
- [x] OCR para Cédula Verde (extrae datos del vehículo)
- [ ] OCR para Póliza de Seguro
- [ ] OCR para VTV

## Validaciones

### Al subir:
- Formato válido: PDF, JPG, PNG
- Tamaño máximo: 5MB por archivo
- Nombre descriptivo automático

### Al revisar:
- Documento legible
- Datos coinciden con los registrados
- Documento vigente (no vencido)

## Notificaciones

### Para el Usuario:
- Email cuando todos los documentos son aprobados
- Notificación si algún documento es rechazado
- Recordatorio si faltan documentos

### Para el Operador:
- Alerta cuando llegan nuevos documentos
- Dashboard con pendientes de revisión

## Seguridad

- ✅ Solo usuarios autenticados pueden subir
- ✅ Solo operadores pueden aprobar/rechazar
- ✅ Archivos almacenados fuera de public/
- ✅ URLs firmadas con expiración
- ✅ Registro de auditoría (quién subió/revisó)

## Mejoras Futuras

1. **Compresión automática** de imágenes
2. **OCR integrado** en todos los documentos
3. **Firma digital** de documentos oficiales
4. **Versionado** (poder subir versión corregida)
5. **Descarga masiva** en ZIP
6. **Integración con AFIP/RENAPER** para validación
7. **Reconocimiento facial** DNI vs foto actual

## Prioridad de Implementación

### Alta Prioridad:
1. Backend de carga/descarga
2. Modelo de BD
3. Componente FileUploader básico
4. Integración en formulario de habilitación

### Media Prioridad:
5. Sistema de revisión para operadores
6. Preview de documentos
7. Notificaciones

### Baja Prioridad:
8. OCR adicionales
9. Validaciones cruzadas
10. Mejoras futuras

## Estimación de Tiempo

- Fase 1 (Backend): 2-3 días
- Fase 2 (BD): 1 día
- Fase 3 (Frontend básico): 3-4 días
- Fase 4 (OCR integración): 1-2 días
- Testing y ajustes: 2 días

**Total: ~10-12 días de desarrollo**

## Beneficios

✅ **Digitalización completa** del proceso
✅ **Menos errores** de carga manual
✅ **Trazabilidad** de documentos
✅ **Acceso inmediato** a documentación
✅ **Menos papel** (ecológico)
✅ **Facilita auditorías**
✅ **OCR reduce tiempos** de carga
