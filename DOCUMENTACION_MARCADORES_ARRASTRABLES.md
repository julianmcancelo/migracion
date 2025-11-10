# 🗺️ Marcadores Arrastrables en el Mapa

## ✅ Funcionalidad Implementada

Se ha agregado la capacidad de **mover puntos arrastrándolos** directamente en el mapa para facilitar la corrección de ubicaciones.

---

## 🎯 Cómo Usar

### **Editar una Parada Existente**

1. **Localiza el punto** en el mapa que deseas editar
2. Click en el marcador para abrir el popup
3. Click en el botón **"Editar"** 
4. El formulario se cargará con los datos del punto
5. **¡NUEVA FUNCIONALIDAD!** El marcador ahora se vuelve **arrastrable**
6. Verás un mensaje azul en el popup: *"Modo Edición Activo - Arrastra este marcador para cambiar su ubicación"*

### **Mover el Punto**

1. **Click y mantén presionado** sobre el marcador
2. **Arrastra** el marcador a la nueva ubicación
3. **Suelta** el mouse
4. Verás una notificación: *"📍 Ubicación actualizada. Guarda los cambios para confirmar."*
5. Las coordenadas en el formulario se actualizan **automáticamente**
6. Click en **"Guardar"** para confirmar los cambios

### **Cancelar Cambios**

- Si no guardas, los cambios NO se aplican
- Click en **"Cancelar"** para volver al estado original
- El marcador volverá a su posición original

---

## 🔧 Características Técnicas

### **Modo Edición**
- Solo el marcador en edición es arrastrable
- Los demás marcadores permanecen fijos
- Indicador visual claro en el popup

### **Actualización en Tiempo Real**
- Las coordenadas se actualizan instantáneamente al arrastrar
- El formulario refleja los nuevos valores de latitud y longitud
- No se guarda en la base de datos hasta que confirmes

### **Validación**
- Las coordenadas se validan antes de guardar
- Se mantiene precisión de 6 decimales
- Toast de confirmación al guardar

---

## 📋 Flujo de Datos

```
1. Usuario click en "Editar"
   ↓
2. Estado: editingParada = parada seleccionada
   ↓
3. Marcador se vuelve draggable={true}
   ↓
4. Usuario arrastra marcador
   ↓
5. Evento dragend captura nueva posición
   ↓
6. onMarkerDragEnd(paradaId, lat, lng)
   ↓
7. Actualiza editingLat, editingLng
   ↓
8. FormularioParada recibe nuevas coordenadas
   ↓
9. useEffect actualiza formData.latitud, formData.longitud
   ↓
10. Usuario click "Guardar"
   ↓
11. PUT /api/paradas/:id con nuevas coordenadas
   ↓
12. Base de datos actualizada ✅
```

---

## 🎨 Indicadores Visuales

### **Modo Edición Activo**
```
┌─────────────────────────────────────────┐
│ 👆 Modo Edición Activo                  │
│    Arrastra este marcador para cambiar  │
│    su ubicación                          │
└─────────────────────────────────────────┘
```

### **Notificación al Arrastrar**
```
📍 Ubicación actualizada. Guarda los cambios para confirmar.
```

---

## 💻 Archivos Modificados

### **1. MapaLeafletMejorado.tsx**
```typescript
// Nueva prop para callback de arrastre
onMarkerDragEnd?: (paradaId: number, lat: number, lng: number) => void
editingParadaId?: number | null

// Marcador con draggable condicional
<Marker
  draggable={isEditing}
  eventHandlers={{
    dragend: (e) => {
      if (isEditing && onMarkerDragEnd) {
        const position = e.target.getLatLng()
        onMarkerDragEnd(parada.id, position.lat, position.lng)
      }
    }
  }}
>
```

### **2. paradas/page.tsx**
```typescript
// Estados para coordenadas de edición
const [editingLat, setEditingLat] = useState<number>()
const [editingLng, setEditingLng] = useState<number>()

// Handler para arrastre
const handleMarkerDragEnd = (paradaId: number, lat: number, lng: number) => {
  setEditingLat(lat)
  setEditingLng(lng)
  toast.info('📍 Ubicación actualizada. Guarda los cambios para confirmar.')
}

// Pasar a componentes
<MapaLeafletMejorado
  onMarkerDragEnd={handleMarkerDragEnd}
  editingParadaId={editingParada?.id || null}
/>

<FormularioParada
  editingLat={editingLat}
  editingLng={editingLng}
/>
```

### **3. FormularioParada.tsx**
```typescript
// Nuevas props
editingLat?: number
editingLng?: number

// Effect para actualizar coordenadas al arrastrar
useEffect(() => {
  if (editingLat !== undefined && editingLng !== undefined && editingParada) {
    setFormData((prev) => ({
      ...prev,
      latitud: editingLat,
      longitud: editingLng,
    }))
  }
}, [editingLat, editingLng, editingParada])
```

---

## 🚀 Beneficios

### **Mayor Precisión**
- Ajuste visual directo en el mapa
- No es necesario buscar coordenadas manualmente
- Corrección rápida de ubicaciones incorrectas

### **Mejor UX**
- Interacción natural de arrastrar y soltar
- Feedback visual inmediato
- Menos errores de entrada de datos

### **Eficiencia**
- Edición más rápida
- Menos pasos para corregir ubicaciones
- Vista previa antes de guardar

---

## ⚠️ Consideraciones

### **Solo en Modo Edición**
- Los marcadores NO son arrastrables por defecto
- Se activan SOLO al editar un punto específico
- Esto previene movimientos accidentales

### **Confirmación Requerida**
- Los cambios NO se guardan automáticamente
- Debes hacer click en "Guardar" para confirmar
- Puedes cancelar para descartar cambios

### **Un Punto a la Vez**
- Solo un marcador es arrastrable simultáneamente
- El que está siendo editado en el formulario

---

## 📱 Responsive

### **Desktop**
- Arrastrar con mouse
- Click y mantener para mover

### **Móvil/Tablet**
- Touch y arrastrar con dedo
- Funciona igual que en desktop

---

## 🎯 Casos de Uso

1. **Corrección de geocodificación**: Ajustar puntos que fueron geocodificados incorrectamente
2. **Refinamiento de ubicación**: Mover el punto a la entrada exacta de un edificio
3. **Cambio de ubicación**: Actualizar cuando un servicio se muda
4. **Precisión visual**: Colocar el marcador exactamente donde corresponde visualmente

---

**Fecha de implementación**: ${new Date().toLocaleString('es-AR')}
**Estado**: ✅ Completado y funcional
