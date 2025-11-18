# Módulo de Inspecciones Móviles

Sistema de inspecciones vehiculares para transporte escolar y remis, diseñado exclusivamente para uso móvil por inspectores.

## 📱 Características

- **Diseño Mobile-First**: Optimizado para tablets y smartphones
- **Captura de Fotos Base64**: Todas las imágenes se guardan en formato Base64
- **Firmas Digitales**: Sistema de captura de firmas con canvas HTML5
- **Offline-Ready**: Preparado para funcionar sin conexión (pendiente implementar)
- **Formulario Dinámico**: Ítems de inspección específicos según tipo de transporte
  - **Transporte Escolar**: 18 ítems (9 comunes + 9 específicos)
  - **Remis**: 10 ítems (9 comunes + 1 específico)

## 🗂️ Estructura de Archivos

```
app/
├── inspecciones/
│   ├── layout.tsx                    # Layout del módulo
│   ├── page.tsx                      # Listado de trámites pendientes
│   ├── verificacion/
│   │   └── page.tsx                  # Verificación de datos del trámite
│   └── formulario/
│       └── page.tsx                  # Formulario de inspección (3 pasos)
│
├── api/
│   └── inspecciones/
│       ├── tramites-pendientes/
│       │   └── route.ts              # GET: Obtener trámites con turnos
│       └── guardar/
│           └── route.ts              # POST: Guardar inspección completa
│
components/
└── inspector/
    ├── CameraCapture.tsx             # Componente de captura de fotos
    └── SignaturePad.tsx              # Componente de firma digital
│
lib/
└── inspection-config.ts              # Configuración de ítems de inspección
```

## 🚀 Flujo de Uso

### 1. Listado de Trámites (`/inspecciones`)
- Muestra habilitaciones con turnos pendientes
- Agrupados por fecha de turno
- Cards con información del titular, vehículo y turno

### 2. Verificación (`/inspecciones/verificacion`)
- Muestra todos los datos del trámite seleccionado
- Información del titular, vehículo, habilitación y turno
- Botón para comenzar la inspección

### 3. Formulario de Inspección (`/inspecciones/formulario`)

#### **Paso 1: Verificación de Ítems**

El formulario muestra ítems **diferentes según el tipo de transporte**.

**Lógica de Evidencia Fotográfica:**
- **Estado "Bien"**: No requiere foto ni observación
- **Estado "Regular"**: Requiere foto OBLIGATORIA + observación opcional
- **Estado "Mal"**: Requiere foto OBLIGATORIA + observación obligatoria

**Ítems Comunes (aplican a AMBOS tipos):**
- Carrocería exterior
- Espejos retrovisores
- Luces
- Cubiertas
- Interior general
- Cinturones de seguridad
- Cabezales
- Matafuego
- Kit de emergencias

**Ítems Específicos de TRANSPORTE ESCOLAR (9 adicionales):**
- Puertas accionadas por conductor (derecha e izquierda)
- Salida de emergencia independiente
- Ventanas con vidrio templado/inastillable
- Pisos con material antideslizante
- Banquetas con dimensiones reglamentarias
- Asientos fijos y acolchados
- Pintura reglamentaria (naranja y blanco)
- Leyenda "Escolares" o "Niños"

**Ítems Específicos de REMIS (1 adicional):**
- Mampara divisoria transparente entre plazas delanteras y traseras

> **Nota importante:** Los ítems específicos de cada tipo **NO se evalúan** en el otro tipo de transporte.

#### **Paso 2: Evidencia Fotográfica del Vehículo**

**TODAS las fotos son OPCIONALES** en este paso:
- Frente del vehículo
- Parte trasera
- Lateral izquierdo
- Lateral derecho
- Foto adicional

> **Nota:** Las fotos obligatorias son las de los ítems calificados como "Regular" o "Mal" en el Paso 1. Las fotos del vehículo en este paso son solo para documentación general si el inspector lo considera necesario.

#### **Paso 3: Firmas**
- Firma del inspector (obligatoria)
- Firma del contribuyente (opcional)
- Checkbox para enviar copia por email

## 🔧 API Endpoints

### GET `/api/inspecciones/tramites-pendientes`

Obtiene los trámites con turnos pendientes de inspección.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "habilitacion": {
        "id": 1,
        "nro_licencia": "2024-001",
        "estado": "EN_TRAMITE",
        "tipo_transporte": "Escolar",
        "expte": "EXP-2024-001"
      },
      "titular": {
        "nombre": "Juan Pérez",
        "dni": "12345678",
        "email": "juan@example.com"
      },
      "vehiculo": {
        "dominio": "ABC123",
        "marca": "Mercedes Benz",
        "modelo": "Sprinter"
      },
      "turno": {
        "fecha": "2024-11-20",
        "hora": "10:00",
        "estado": "PENDIENTE"
      }
    }
  ]
}
```

### POST `/api/inspecciones/guardar`

Guarda una inspección completa con fotos y firmas.

**Request Body:**
```json
{
  "habilitacion_id": 1,
  "nro_licencia": "2024-001",
  "tipo_transporte": "Escolar",
  "titular": { "nombre": "...", "dni": "...", "email": "..." },
  "vehiculo": { "dominio": "...", "marca": "...", "modelo": "..." },
  "items": [
    {
      "id": "carroceria_exterior",
      "nombre": "Estado General de la Carrocería...",
      "estado": "bien",
      "observacion": "Sin observaciones",
      "foto": "data:image/png;base64,..."
    }
  ],
  "fotos_vehiculo": {
    "frente": "data:image/png;base64,...",
    "contrafrente": "data:image/png;base64,...",
    "lateral_izq": "data:image/png;base64,...",
    "lateral_der": "data:image/png;base64,..."
  },
  "foto_adicional": "data:image/png;base64,...",
  "firma_inspector": "data:image/png;base64,...",
  "firma_contribuyente": "data:image/png;base64,...",
  "email_contribuyente": "juan@example.com",
  "sendEmailCopy": true
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Inspección guardada correctamente",
  "data": {
    "inspeccion_id": 123
  }
}
```

## 💾 Almacenamiento de Imágenes

Las imágenes se guardan en:
```
public/uploads/inspecciones/{nro_licencia}_{timestamp}/
├── item_{item_id}_{timestamp}.png
├── vehiculo_frente_{timestamp}.png
├── vehiculo_contrafrente_{timestamp}.png
├── vehiculo_lateral_izq_{timestamp}.png
├── vehiculo_lateral_der_{timestamp}.png
└── adicional_{timestamp}.png
```

## 🗄️ Tablas de Base de Datos Utilizadas

### `inspecciones`
- Registro principal de la inspección
- Contiene firmas y datos generales

### `inspeccion_detalles`
- Detalles de cada ítem inspeccionado
- Estado, observación y foto por ítem

### `inspeccion_fotos`
- Fotos del vehículo y adicionales
- Tipo de foto y ubicación del archivo

## 🎨 Componentes Reutilizables

### `CameraCapture`
Componente para captura de fotos desde la cámara del dispositivo.

**Props:**
- `onCapture: (base64: string) => void` - Callback con la imagen en Base64
- `currentPhoto?: string | null` - Foto actual (para mostrar preview)
- `label: string` - Etiqueta del campo

**Uso:**
```tsx
<CameraCapture
  label="Frente del Vehículo"
  currentPhoto={vehiclePhotos.frente}
  onCapture={(base64) => setVehiclePhotos({ ...vehiclePhotos, frente: base64 })}
/>
```

### `SignaturePad`
Componente modal para captura de firmas digitales.

**Props:**
- `onSave: (signature: string) => void` - Callback con la firma en Base64
- `onClose: () => void` - Callback para cerrar el modal
- `title: string` - Título del modal

**Uso:**
```tsx
{showSignaturePad && (
  <SignaturePad
    title="Firma del Inspector"
    onSave={(signature) => setInspectorSignature(signature)}
    onClose={() => setShowSignaturePad(false)}
  />
)}
```

## 📋 Pendientes / Mejoras Futuras

- [ ] Implementar autenticación de inspectores
- [ ] Sistema de sincronización offline
- [ ] Envío de emails con PDF de la inspección
- [ ] Compresión de imágenes antes de guardar
- [ ] Geolocalización en cada foto
- [ ] Proteger rutas `/inspecciones/*` con middleware de autenticación
- [ ] Dashboard de estadísticas
- [ ] Exportación de reportes en PDF
- [ ] Notificaciones push al contribuyente

## 🔐 Seguridad

- Las rutas deben protegerse con middleware de autenticación
- Validar que el usuario sea inspector antes de permitir acceso
- Sanitizar todos los inputs antes de guardar en BD
- Limitar el tamaño de las imágenes Base64

## 📱 Compatibilidad

- ✅ Chrome Mobile (Android)
- ✅ Safari (iOS)
- ✅ Firefox Mobile
- ✅ Edge Mobile

## 🐛 Troubleshooting

### Las fotos no se capturan
- Verificar permisos de cámara en el navegador
- Usar HTTPS (requerido para acceso a cámara)

### Las firmas no se guardan
- Verificar que el canvas tenga contenido antes de guardar
- Revisar la consola del navegador para errores

### Error al guardar inspección
- Verificar que todos los campos obligatorios estén completos
- Revisar logs del servidor para detalles del error
- Verificar permisos de escritura en `/public/uploads/inspecciones/`

## 📞 Soporte

Para reportar bugs o solicitar nuevas funcionalidades, contactar al equipo de desarrollo.
