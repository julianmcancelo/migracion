# 🔍 Sistema de Búsqueda de Paradas y Geolocalización

## ✅ Funcionalidades Implementadas

Se han agregado **tres nuevas características** al sistema de paradas:

1. **Banner de sugerencia de login** para usuarios no autenticados
2. **Búsqueda de paradas por dirección**
3. **Visualización de paradas cercanas** usando geolocalización

---

## 1. 🔐 Banner de Login (No Autenticados)

### **Comportamiento**
- Al entrar sin estar logueado, después de 2 segundos aparece un banner
- El banner sugiere iniciar sesión para gestionar paradas
- Botón directo para ir al login
- Se puede cerrar temporalmente

### **Diseño**
```
┌─────────────────────────────────────────────────┐
│ 🔓 ¿Quieres gestionar paradas?                  │
│ Inicia sesión para crear, editar y eliminar     │
│ puntos de interés en el mapa                    │
│                                                  │
│ [ 🔓 Iniciar Sesión ]  [ Cerrar ]         [X]   │
└─────────────────────────────────────────────────┘
```

### **Ventajas**
- ✅ No bloquea el acceso a usuarios no autenticados
- ✅ Sugiere la autenticación de forma amigable
- ✅ Puede verse el mapa sin login
- ✅ Gestión solo disponible para usuarios logueados

---

## 2. 🔍 Búsqueda de Paradas por Dirección

### **Cómo Funciona**

1. **Escribir dirección**:
   ```
   Ej: Av. Hipólito Yrigoyen 5650, Lanús
   ```

2. **Click "Buscar"** o presiona Enter

3. **El sistema**:
   - Geocodifica la dirección (obtiene coordenadas)
   - Busca paradas cercanas en un radio de **1 km**
   - Ordena por distancia (más cercanas primero)

4. **Muestra resultados**:
   - Lista de paradas encontradas
   - Tipo de parada (icono y color)
   - Click para ver/editar

### **Ejemplo de Uso**

```
Usuario escribe: "Plaza Grigera, Lanús"
    ↓
Sistema geocodifica: -34.7012, -58.3893
    ↓
Busca paradas en radio de 1 km
    ↓
Encuentra: 5 paradas
    ↓
Muestra lista ordenada por cercanía
```

### **Resultados**

```
┌──────────────────────────────────────┐
│ 5 resultado(s) encontrado(s)    [X]  │
│                                       │
│ [🏛️] Municipalidad de Lanús          │
│      Municipal                        │
│                                       │
│ [🚏] Parada 29 de Septiembre          │
│      Transporte                       │
│                                       │
│ [🚦] Semáforo Av. Yrigoyen            │
│      Semáforo                         │
└──────────────────────────────────────┘
```

---

## 3. 📍 Paradas Cercanas a Mi Ubicación

### **Cómo Funciona**

1. **Click**: "Ver Paradas Cercanas a Mi Ubicación"

2. **El navegador solicita permiso** de geolocalización

3. **El sistema**:
   - Obtiene tu ubicación GPS actual
   - Busca paradas cercanas en un radio de **2 km**
   - Calcula distancia exacta a cada parada
   - Ordena por proximidad

4. **Muestra resultados** con distancia en kilómetros

### **Resultados con Distancia**

```
┌──────────────────────────────────────┐
│ 8 parada(s) cercana(s)          [X]  │
│                                       │
│ [🚏] Terminal de Lanús                │
│      Transporte • 0.35 km             │
│                                       │
│ [🏛️] Centro Cultural                  │
│      Municipal • 0.82 km              │
│                                       │
│ [🚦] Semáforo Hipólito Y.             │
│      Semáforo • 1.24 km               │
└──────────────────────────────────────┘
```

### **Cálculo de Distancia**

Se usa la **fórmula de Haversine** para calcular distancias precisas entre dos puntos GPS:

```typescript
// Radio de la Tierra: 6,371 km
const distance = calculateDistance(
  miLatitud, miLongitud,
  paradaLatitud, paradaLongitud
)
// Resultado en kilómetros con 2 decimales
```

---

## 🎨 Interfaz de Usuario

### **Sección de Búsqueda**

```
┌─────────────────────────────────────────────┐
│ 🔍 Buscar Paradas por Dirección             │
│                                              │
│ ┌──────────────────────────────┐  [Buscar]  │
│ │ Ej: Av. Hipólito Yrigoyen... │            │
│ └──────────────────────────────┘            │
│                                              │
│ [ 🧭 Ver Paradas Cercanas a Mi Ubicación ]  │
└─────────────────────────────────────────────┘
```

### **Estados Visuales**

| Estado | Visual |
|--------|--------|
| **Buscando** | Spinner animado en botón |
| **Resultados** | Lista expandible con scroll |
| **Sin resultados** | Toast informativo |
| **Error** | Toast de error con mensaje |
| **Cercanas** | Lista con distancias en km |

---

## 🔧 Funcionalidades Técnicas

### **Autenticación**

```typescript
// Verificar sesión al cargar
useEffect(() => {
  verificarSesion()
  cargarParadas()
}, [])

// Mostrar banner después de 2 segundos
const verificarSesion = async () => {
  const response = await fetch('/api/auth/session')
  if (!response.ok) {
    setTimeout(() => setShowLoginBanner(true), 2000)
  }
}
```

### **Búsqueda por Dirección**

```typescript
// 1. Geocodificar dirección
const geocodeResponse = await fetch('/api/paradas/geocode-single', {
  method: 'POST',
  body: JSON.stringify({ address: searchAddress })
})

// 2. Buscar paradas cercanas
const nearby = findNearbyParadas(lat, lng, 1) // 1 km

// 3. Mostrar resultados ordenados
setSearchResults(nearby)
```

### **Geolocalización**

```typescript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords
    const nearby = findNearbyParadas(latitude, longitude, 2) // 2 km
    setNearbyParadas(nearby)
  },
  (error) => {
    toast.error('No se pudo obtener tu ubicación')
  }
)
```

### **Cálculo de Distancia (Haversine)**

```typescript
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distancia en km
}
```

---

## 💡 Casos de Uso

### **Caso 1: Usuario Busca Parada Específica**

```
Problema: "¿Hay alguna parada cerca de la estación de tren?"
Solución:
  1. Escribe: "Estación Lanús, Buenos Aires"
  2. Click Buscar
  3. Ve 3 paradas en 500m de radio
  4. Click en la más cercana para ver detalles
```

### **Caso 2: Turista Busca Servicios Cercanos**

```
Problema: "Estoy en la plaza, ¿qué paradas hay cerca?"
Solución:
  1. Click "Ver Paradas Cercanas a Mi Ubicación"
  2. Acepta permiso de ubicación
  3. Ve lista de 8 paradas ordenadas por distancia
  4. La más cercana: Terminal (0.35 km)
```

### **Caso 3: Usuario No Logueado Quiere Gestionar**

```
Situación: Usuario ve el mapa pero quiere crear paradas
Solución:
  1. Aparece banner: "¿Quieres gestionar paradas?"
  2. Click "Iniciar Sesión"
  3. Login exitoso
  4. Ahora puede crear/editar/eliminar
```

---

## 📱 Responsive

### **Desktop**
- Banner de login: Completo con todos los textos
- Búsqueda: Campo ancho + botón al lado
- Resultados: Lista con scroll, max 48px de altura

### **Móvil**
- Banner: Se ajusta al ancho, botones apilados si necesario
- Búsqueda: Campo completo, botón debajo
- Resultados: Lista scrolleable, táctil

---

## 🎯 Ventajas del Sistema

### **Para Usuarios No Logueados**

- ✅ Ver todas las paradas en el mapa
- ✅ Buscar paradas por dirección
- ✅ Ver paradas cercanas a su ubicación
- ✅ Navegar y explorar libremente
- ✅ Sugerencia amigable para login (no bloqueante)

### **Para Usuarios Autenticados**

- ✅ Todo lo anterior +
- ✅ Crear nuevas paradas
- ✅ Editar paradas existentes
- ✅ Eliminar paradas
- ✅ Arrastrar marcadores
- ✅ Geocodificación para ubicación

---

## 🔒 Permisos

### **Geolocalización**

El usuario debe dar permiso al navegador para:
- Acceder a su ubicación GPS
- Solo se solicita al click en "Ver Paradas Cercanas"
- Se puede denegar sin afectar otras funciones

### **Mensajes de Error**

```
✅ Permiso concedido
   → "8 parada(s) cercana(s) a tu ubicación"

❌ Permiso denegado
   → "No se pudo obtener tu ubicación. Verifica los permisos del navegador."

❌ No soportado
   → "Tu navegador no soporta geolocalización"
```

---

## 📊 Radios de Búsqueda

| Tipo de Búsqueda | Radio | Uso |
|------------------|-------|-----|
| Por dirección | 1 km | Resultados más precisos |
| Por ubicación GPS | 2 km | Mayor cobertura |

Ambos ordenan resultados por **distancia ascendente** (más cercano primero).

---

## 🚀 Mejoras Futuras (Opcional)

- [ ] Ajustar radio de búsqueda con slider
- [ ] Filtrar resultados por tipo de parada
- [ ] Mostrar rutas en el mapa a parada seleccionada
- [ ] Guardar búsquedas frecuentes
- [ ] Compartir ubicación de parada por link

---

## 💻 Archivos Modificados

```typescript
✅ app/paradas/page.tsx
   - verificarSesion(): Chequeo de autenticación
   - handleSearchParadas(): Búsqueda por dirección
   - handleShowNearby(): Paradas cercanas GPS
   - calculateDistance(): Fórmula Haversine
   - findNearbyParadas(): Filtrado y ordenamiento
   - UI: Banner de login
   - UI: Sección de búsqueda
   - UI: Resultados de búsqueda
   - UI: Lista de cercanas con distancia
```

---

## 🎨 Paleta de Colores

- **Banner Login**: Amber/Orange (cálido, invitante)
- **Búsqueda**: Purple/Pink (distintivo, llamativo)
- **Resultados**: Blanco con bordes purple
- **Distancia**: Texto gris, fuente mono

---

**Fecha de implementación**: ${new Date().toLocaleString('es-AR')}
**Estado**: ✅ Completado y funcional
**Tecnologías**: Geolocation API, Google Maps Geocoding API, Haversine Formula
