# 🗺️ Sistema de Geocodificación por Dirección

## ✅ Funcionalidad Implementada

Se ha agregado un **sistema de búsqueda por dirección** que permite encontrar coordenadas escribiendo una dirección, ver el resultado y confirmar la ubicación.

---

## 🎯 Cómo Usar

### **Método 1: Nuevo Punto desde Dirección**

1. En el formulario lateral, ve a la sección **"Buscar por Dirección"** (fondo azul)
2. Escribe una dirección, por ejemplo:
   ```
   Av. Hipólito Yrigoyen 5650, Lanús
   ```
3. Click en **"Buscar"** o presiona Enter
4. Verás un resultado verde con:
   - ✓ **Ubicación Encontrada**
   - Dirección formateada completa
   - Coordenadas (lat, lng)
5. Click en **"Usar Esta Ubicación"**
6. Las coordenadas se actualizan automáticamente
7. Completa el resto del formulario
8. Click **"Guardar Punto"**

### **Método 2: Reubicar Punto Existente**

1. Click en un marcador del mapa
2. Click en **"Editar"**
3. En la sección **"Buscar por Dirección"**:
   - Escribe la nueva dirección
   - Click **"Buscar"**
   - Revisa el resultado
   - Click **"Usar Esta Ubicación"**
4. Las coordenadas se actualizan
5. Click **"Actualizar Punto"**
6. ✅ El punto se mueve a la nueva ubicación

---

## ✨ Características

### **Búsqueda Inteligente**
- ✅ Geocodificación con Google Maps API
- ✅ Funciona con direcciones completas o parciales
- ✅ Presiona Enter para buscar rápidamente
- ✅ Resultados en tiempo real

### **Vista Previa del Resultado**
- ✅ Muestra dirección formateada completa
- ✅ Coordenadas con 6 decimales de precisión
- ✅ Confirmar antes de aplicar
- ✅ Cancelar si el resultado no es correcto

### **Feedback Visual**
- 🔵 **Buscando...**: Spinner animado durante búsqueda
- 🟢 **Ubicación Encontrada**: Resultado exitoso
- 🔴 **Error**: Si no se encuentra la dirección
- 📍 **Coordenadas Actualizadas**: Toast de confirmación

---

## 🔧 Tres Formas de Establecer Coordenadas

Ahora tienes **3 métodos** para definir la ubicación de un punto:

### **1. 🔍 Búsqueda por Dirección** (NUEVO)
```
Escribe dirección → Buscar → Confirmar → Guardar
```
**Ideal para**: Direcciones conocidas, puntos nuevos

### **2. 🖱️ Click en el Mapa**
```
Click en el mapa → Las coordenadas se capturan → Guardar
```
**Ideal para**: Ubicaciones aproximadas, exploración

### **3. ↔️ Arrastrar Marcador** (en edición)
```
Editar punto → Arrastrar marcador → Guardar
```
**Ideal para**: Ajustes finos, correcciones visuales

---

## 📋 Ejemplos de Direcciones

### **Formato Completo**
```
Av. Hipólito Yrigoyen 5650, Lanús, Buenos Aires
```

### **Con Código Postal**
```
Av. Rivadavia 12345, Lanús Oeste, B1824
```

### **Solo Calle y Número**
```
Av. San Martín 3456, Lanús
```

### **Intersección**
```
Av. 9 de Julio y Av. Pavón, Lanús
```

### **Lugar Conocido**
```
Plaza Grigera, Lanús
Municipalidad de Lanús
```

---

## 🎨 Interfaz Visual

```
┌─────────────────────────────────────────────────┐
│ 📍 Buscar por Dirección                         │
│ Escribe una dirección para encontrar las        │
│ coordenadas automáticamente                     │
│                                                  │
│ ┌──────────────────────────────┐  ┌──────────┐ │
│ │ Av. Hipólito Yrigoyen 5650...│  │ 🔍 Buscar│ │
│ └──────────────────────────────┘  └──────────┘ │
│                                                  │
│ ┌──────────────────────────────────────────┐   │
│ │ ✓ Ubicación Encontrada                   │   │
│ │ Av. Hipólito Yrigoyen 5650, Lanús, Bs As │   │
│ │ -34.706789, -58.392456                   │   │
│ │ [ ✓ Usar Esta Ubicación ]                │   │
│ └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Flujo Completo

```mermaid
Usuario escribe dirección
    ↓
Click "Buscar" o Enter
    ↓
POST /api/paradas/geocode-single
    ↓
Google Maps Geocoding API
    ↓
¿Resultado OK?
    ├─ NO → Toast error "No se encontró la dirección"
    └─ SÍ → Mostrar resultado verde
           ↓
    Usuario revisa dirección y coordenadas
           ↓
    Click "Usar Esta Ubicación"
           ↓
    formData.latitud = resultado.lat
    formData.longitud = resultado.lng
           ↓
    Toast: "📍 Coordenadas actualizadas desde dirección"
           ↓
    Campo de dirección se limpia
           ↓
    Usuario completa formulario
           ↓
    Click "Guardar Punto"
           ↓
    Base de datos actualizada ✅
```

---

## 💻 Archivos Modificados

```typescript
✅ components/paradas/FormularioParada.tsx
   - Estados: searchAddress, geocoding, geocodeResult
   - Función handleGeocode() para buscar dirección
   - Función handleConfirmGeocode() para aplicar coordenadas
   - UI: Campo de búsqueda con diseño destacado
   - UI: Resultado con animación y confirmación

✅ app/api/paradas/geocode-single/route.ts (ya existía)
   - POST endpoint para geocodificación
   - Integración con Google Maps Geocoding API
   - Manejo de errores y validaciones
```

---

## 🌐 API de Geocodificación

### **Endpoint**
```
POST /api/paradas/geocode-single
```

### **Request**
```json
{
  "address": "Av. Hipólito Yrigoyen 5650, Lanús"
}
```

### **Response (Éxito)**
```json
{
  "success": true,
  "address": "Av. Hipólito Yrigoyen 5650, Lanús",
  "formatted_address": "Av. Hipólito Yrigoyen 5650, Lanús, Buenos Aires, Argentina",
  "lat": -34.706789,
  "lng": -58.392456,
  "place_id": "ChIJ...",
  "accuracy": "ROOFTOP"
}
```

### **Response (Error)**
```json
{
  "success": false,
  "error": "No se encontraron resultados para esta dirección"
}
```

---

## 🔑 Variables de Entorno

Asegúrate de tener configurada la API Key de Google Maps:

```env
GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

**En Vercel**: Ve a Settings → Environment Variables → Agrega `GOOGLE_MAPS_API_KEY`

---

## ⚠️ Manejo de Errores

### **Sin Resultados**
```
❌ No se encontró la dirección
```
**Solución**: Intenta con más detalles o escribe diferente

### **API Key no configurada**
```
❌ API Key no configurada
```
**Solución**: Configura `GOOGLE_MAPS_API_KEY` en `.env.local` o Vercel

### **Error de conexión**
```
❌ Error al buscar la dirección
```
**Solución**: Revisa conexión a internet y API Key

---

## 💡 Mejores Prácticas

### **Para Mejores Resultados**
- ✅ Incluye ciudad: "Lanús" o "Lanús, Buenos Aires"
- ✅ Usa formato claro: "Av. [nombre] [número], [ciudad]"
- ✅ Revisa el resultado antes de confirmar
- ✅ Si el resultado no es exacto, prueba con más detalles

### **Combinación de Métodos**
1. **Búsqueda por dirección** → Ubicación aproximada
2. **Arrastrar marcador** → Ajuste fino
3. **Guardar** → Ubicación perfecta ✅

---

## 🚀 Ventajas

### **Antes**
- ❌ Buscar coordenadas manualmente en Google Maps
- ❌ Copiar y pegar lat/lng
- ❌ Propenso a errores

### **Ahora**
- ✅ Escribe dirección conocida
- ✅ Sistema encuentra coordenadas
- ✅ Confirma y guarda
- ✅ Rápido, fácil, preciso

---

## 📱 Responsive

- ✅ Desktop: Campo completo con botón al lado
- ✅ Móvil: Campo y botón apilados (si es necesario)
- ✅ Tablet: Diseño adaptativo

---

**Fecha de implementación**: ${new Date().toLocaleString('es-AR')}
**Estado**: ✅ Completado y funcional
**API**: Google Maps Geocoding API
