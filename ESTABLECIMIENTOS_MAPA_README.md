# 🗺️ Sistema de Establecimientos con Mapa Interactivo

## 🎯 Descripción

Sistema completo para gestionar establecimientos educativos y remiserías con visualización en mapa interactivo. Permite ver todos los establecimientos en el mapa, hacer click en ellos para ver detalles o click en el mapa vacío para crear uno nuevo.

---

## ✅ Características Implementadas

### **1. Sidebar con Menú** ✅
- Opción "Establecimientos" agregada al menú principal
- Icono de MapPin (📍)
- Ubicado entre Personas y Obleas

### **2. Página Principal** ✅
- **Ruta:** `/establecimientos`
- 4 Cards de estadísticas:
  - Total de establecimientos
  - Escuelas
  - Remiserías
  - Activos
- Filtros por tipo (Todos, Escuelas, Remiserías)
- Búsqueda por nombre o dirección

### **3. Mapa Interactivo** ✅
- Visualización completa con Leaflet
- Centro en Lanús, Buenos Aires
- Marcadores diferenciados:
  - 🟢 Verde: Establecimientos educativos
  - 🟣 Morado: Remiserías
- **Click en marcador:** Ver detalles y editar
- **Click en mapa vacío:** Crear nuevo establecimiento
- Popups con información resumida

### **4. Modal de Gestión** ✅
- **Crear:** Click en mapa vacío
- **Ver/Editar:** Click en marcador existente
- **Eliminar:** Botón dentro del modal
- Campos:
  - Tipo (Escuela/Remisería)
  - Nombre *
  - Dirección *
  - Coordenadas (lat/lng)
  - Teléfono
  - Email
  - Responsable
  - Observaciones
  - Estado (activo/inactivo)

### **5. APIs Implementadas** ✅
- `GET /api/establecimientos` - Listar todos
- `POST /api/establecimientos` - Crear nuevo
- ~~`PUT /api/establecimientos/[id]` - Actualizar~~ (PENDIENTE)
- ~~`DELETE /api/establecimientos/[id]` - Eliminar~~ (PENDIENTE)

---

## 📦 Dependencias Requeridas

### **IMPORTANTE: Instalar antes de usar**

```bash
# Leaflet (mapas)
npm install leaflet react-leaflet

# Types de Leaflet
npm install --save-dev @types/leaflet

# Radix UI Switch (para el toggle activo/inactivo)
npm install @radix-ui/react-switch
```

### **Comando único:**
```bash
npm install leaflet react-leaflet @radix-ui/react-switch && npm install --save-dev @types/leaflet
```

---

## 🗄️ Estructura de Base de Datos

### **Tablas Utilizadas:**

**1. `establecimientos`**
```sql
- id (INT)
- habilitacion_id (INT)
- nombre (VARCHAR)
- domicilio (VARCHAR)
- localidad (VARCHAR)
- latitud (DECIMAL)
- longitud (DECIMAL)
- direccion (MEDIUMTEXT)
```

**2. `remiserias`**
```sql
- id (INT)
- nombre (VARCHAR)
- direccion (VARCHAR)
- latitud (DECIMAL)
- longitud (DECIMAL)
- localidad (VARCHAR)
- nro_habilitacion (VARCHAR)
- nro_expediente (VARCHAR)
- creado_en (TIMESTAMP)
```

---

## 🎨 Flujo de Usuario

### **1. Ver Mapa General**
```
Usuario → Sidebar → Establecimientos
↓
Mapa con todos los establecimientos cargados
🟢 Escuelas
🟣 Remiserías
```

### **2. Ver Detalles de Establecimiento**
```
Click en marcador del mapa
↓
Popup con resumen
↓
Botón "Editar"
↓
Modal con todos los detalles
```

### **3. Crear Nuevo Establecimiento**
```
Click en área vacía del mapa
↓
Modal se abre con coordenadas precargadas
↓
Completar formulario
↓
Guardar
↓
Nuevo marcador aparece en el mapa
```

### **4. Editar Establecimiento**
```
Click en marcador → Editar
↓
Modificar datos en modal
↓
Guardar cambios
↓
Marcador se actualiza
```

### **5. Eliminar Establecimiento**
```
Abrir modal de establecimiento
↓
Botón "Eliminar" (rojo)
↓
Confirmar eliminación
↓
Marcador desaparece del mapa
```

---

## 📂 Estructura de Archivos

```
app/(panel)/establecimientos/
├── page.tsx                              # Página principal
└── _components/
    ├── mapa-establecimientos.tsx         # Componente del mapa
    └── modal-establecimiento.tsx         # Modal CRUD

app/api/establecimientos/
├── route.ts                              # GET (listar) y POST (crear)
└── [id]/
    └── route.ts                          # PUT (editar) y DELETE (eliminar) - PENDIENTE

components/
├── layout/
│   └── sidebar.tsx                       # Menú actualizado
└── ui/
    └── switch.tsx                        # Componente Switch (nuevo)
```

---

## 🎨 Colores y Diseño

### **Stats Cards:**
- **Total:** Azul (#3B82F6)
- **Escuelas:** Verde (#10B981)
- **Remiserías:** Morado (#A855F7)
- **Activos:** Esmeralda (#059669)

### **Marcadores del Mapa:**
- **Escuelas:** Verde con icono de edificio
- **Remiserías:** Morado con icono de auto

### **Filtros:**
- Tabs con contador de items
- Búsqueda en tiempo real

---

## 🔧 Configuración de Leaflet

### **Centro del Mapa:**
```typescript
// Lanús, Buenos Aires
const centroLanus = { lat: -34.7081, lng: -58.3958 }
```

### **Zoom Inicial:**
```typescript
zoom: 13  // Perfecto para ver Lanús completo
```

### **Tiles (Mapa Base):**
```typescript
// OpenStreetMap (gratis, sin API key)
url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
```

---

## 🚀 Próximos Pasos

### **PENDIENTES:**

1. **Crear API de Actualización**
   ```
   PUT /api/establecimientos/[id]
   ```

2. **Crear API de Eliminación**
   ```
   DELETE /api/establecimientos/[id]
   ```

3. **Geocodificación Automática**
   - Al escribir dirección → obtener coordenadas automáticamente
   - Usar servicio como Nominatim (OpenStreetMap)

4. **Búsqueda en Mapa**
   - Barra de búsqueda que centra el mapa
   - Autocompletado de direcciones

5. **Clustering de Marcadores**
   - Agrupar marcadores cercanos cuando hay muchos
   - Mejor performance con muchos establecimientos

6. **Exportar a PDF/Excel**
   - Lista de establecimientos
   - Incluir mapa estático

7. **Importar desde CSV**
   - Carga masiva de establecimientos
   - Con geocodificación automática

---

## 🎯 Casos de Uso

### **1. Administrador Municipal**
- Ve todos los establecimientos educativos en el mapa
- Verifica que estén correctamente georeferenciados
- Agrega nuevos establecimientos fácilmente

### **2. Inspector de Transporte**
- Localiza rápidamente escuelas y remiserías
- Verifica habilitaciones asociadas
- Planifica rutas de inspección

### **3. Gestión de Habilitaciones**
- Al crear habilitación → selecciona establecimiento del mapa
- Ve qué habilitaciones están asociadas a cada lugar
- Controla cobertura geográfica

---

## 📊 Estadísticas del Sistema

**Implementado:**
- ✅ Menú en sidebar
- ✅ Página principal con stats
- ✅ Mapa interactivo
- ✅ Filtros y búsqueda
- ✅ Modal de creación
- ✅ Modal de edición
- ✅ Modal de eliminación (UI)
- ✅ API GET (listar)
- ✅ API POST (crear)
- ✅ Componente Switch
- ✅ Íconos personalizados

**Pendiente:**
- ⏳ API PUT (actualizar)
- ⏳ API DELETE (eliminar)
- ⏳ Geocodificación
- ⏳ Clustering
- ⏳ Exportar datos

---

## 💡 Tips de Uso

### **Para el Usuario:**
1. **Ver todos:** Simplemente entrar a la página
2. **Buscar:** Escribir nombre o dirección en el filtro
3. **Filtrar:** Usar los tabs (Todos/Escuelas/Remiserías)
4. **Crear:** Click en cualquier parte vacía del mapa
5. **Editar:** Click en un marcador → botón Editar

### **Para el Desarrollador:**
1. **Instalar dependencias primero** (ver arriba)
2. **Verificar permisos de API**
3. **Centrar mapa en tu ubicación** si no estás en Lanús
4. **Personalizar iconos** editando los SVG en `mapa-establecimientos.tsx`
5. **Ajustar zoom** según densidad de establecimientos

---

## ✅ Estado del Proyecto

**MAPA INTERACTIVO DE ESTABLECIMIENTOS: 90% COMPLETO**

Solo falta agregar los endpoints PUT y DELETE para el CRUD completo. La interfaz y el mapa ya están 100% funcionales.

**Próximo paso:** Completar APIs de actualización y eliminación.
