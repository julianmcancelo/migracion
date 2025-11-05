# 🗺️ Sistema de Gestión de Paradas - Municipio de Lanús

## ✅ Sistema Completo Migrado

Se ha migrado exitosamente el sistema de paradas desde PHP + JSON a **Next.js 14 + TypeScript + Prisma + React-Leaflet**.

---

## 🚀 Acceso Directo

**URL Pública:** `http://localhost:3000/paradas/`

No requiere autenticación para visualizar el mapa. Las operaciones de edición sí requieren login.

---

## 📦 Archivos Creados

### **1. Base de Datos**
```
prisma/schema.prisma
```
- ✅ Modelo `paradas` con 10 campos
- ✅ Enums para tipos y estados
- ✅ Índices optimizados
- ✅ Soft delete (campo `activo`)

### **2. API Routes**
```
app/api/paradas/
├── route.ts              # GET (público), POST (auth)
└── [id]/route.ts         # GET (público), PUT/DELETE (auth)
```

### **3. Componentes**
```
components/paradas/
├── types.ts              # Tipos TypeScript
├── MapaLeaflet.tsx       # Mapa con React-Leaflet
└── FormularioParada.tsx  # Formulario CRUD
```

### **4. Página Pública**
```
app/paradas/
├── page.tsx              # Vista principal
└── layout.tsx            # Metadata y Toaster
```

### **5. Scripts**
```
scripts/migrate-paradas.js  # Migración desde JSON
```

---

## 🔧 Comandos de Instalación

```bash
# 1. Instalar dependencia faltante
npm install @radix-ui/react-alert-dialog

# 2. Generar cliente Prisma actualizado
npx prisma generate

# 3. Aplicar cambios a la base de datos
npx prisma db push

# 4. (Opcional) Migrar datos del sistema antiguo
node scripts/migrate-paradas.js
```

---

## 🎨 Características Implementadas

### **Frontend**
- ✅ Mapa interactivo con React-Leaflet
- ✅ Iconos personalizados por tipo de punto
- ✅ Click en mapa para agregar coordenadas
- ✅ Popups con información y acciones
- ✅ Formulario lateral con validaciones
- ✅ Modal de confirmación para eliminar
- ✅ Responsive design (móvil y desktop)
- ✅ Loading states y animaciones
- ✅ Toast notifications

### **Backend**
- ✅ API REST completa (CRUD)
- ✅ Validaciones de datos
- ✅ Conversión de Decimal a Number
- ✅ Filtros por tipo y estado
- ✅ Soft delete (no destruye datos)
- ✅ Timestamps automáticos
- ✅ GET público, POST/PUT/DELETE con auth

### **Tipos de Puntos**
| Tipo | Icono | Color | Uso |
|------|-------|-------|-----|
| **seguridad** | 🛡️ shield-halved | Azul | Puntos de seguridad |
| **transporte** | 🚌 bus | Amarillo | Garitas y paradas |
| **semaforo** | 🚦 traffic-light | Gris | Semáforos |
| **salud** | 🏥 briefcase-medical | Rojo | Centros de salud |
| **educacion** | 🎓 graduation-cap | Verde | Escuelas |
| **municipal** | 🏛️ building-columns | Gris | Oficinas municipales |

---

## 📊 Comparación: Antes vs Ahora

### **Sistema Anterior (PHP)**
- ❌ JSON file storage (límites de escala)
- ❌ Sin validaciones en backend
- ❌ Sin autenticación
- ❌ Sin historial de cambios
- ❌ Difícil mantenimiento
- ❌ Sin tipos (PHP débilmente tipado)

### **Sistema Nuevo (Next.js)**
- ✅ MySQL con Prisma ORM
- ✅ TypeScript estricto
- ✅ Autenticación JWT
- ✅ Timestamps automáticos
- ✅ Código modular y mantenible
- ✅ API REST profesional
- ✅ UI moderna con shadcn/ui

---

## 🔌 Documentación de API

### **GET /api/paradas** (Público)
Obtener todas las paradas

**Query Params:**
- `tipo`: filtrar por tipo
- `activo`: true/false
- `limite`: máximo de resultados

**Ejemplo:**
```bash
curl http://localhost:3000/api/paradas?tipo=transporte&limite=50
```

**Respuesta:**
```json
{
  "success": true,
  "data": [...],
  "total": 123
}
```

### **POST /api/paradas** (Auth requerida)
Crear nueva parada

```json
{
  "titulo": "Nueva Parada",
  "tipo": "transporte",
  "descripcion": "Líneas 520, 9, 247",
  "latitud": -34.698699,
  "longitud": -58.392291,
  "estado": "ok"
}
```

### **PUT /api/paradas/[id]** (Auth requerida)
Actualizar parada existente

### **DELETE /api/paradas/[id]** (Auth requerida)
Eliminar (desactivar) parada

---

## 🎯 Próximos Pasos Sugeridos

### **Mejoras Inmediatas**
- [ ] Agregar filtros visuales en el mapa
- [ ] Búsqueda de puntos por nombre
- [ ] Clustering de marcadores (muchos puntos)
- [ ] Geolocalización del usuario

### **Funcionalidades Avanzadas**
- [ ] Exportar a KML/GeoJSON
- [ ] Importación masiva CSV/Excel
- [ ] Calcular rutas entre puntos
- [ ] Áreas de cobertura (polígonos)
- [ ] Integración con Google Maps
- [ ] Street View integration
- [ ] Notificaciones de cambios

### **Analytics**
- [ ] Panel de estadísticas
- [ ] Mapa de calor
- [ ] Historial de cambios
- [ ] Reportes en PDF

---

## 🐛 Troubleshooting

### **Error: Model 'paradas' not found**
```bash
# Regenerar cliente Prisma
npx prisma generate
npx prisma db push
```

### **Mapa no se muestra**
1. Verificar que Leaflet CSS esté en `globals.css`
2. Verificar Font Awesome en el HTML
3. Revisar consola del navegador

### **Error: Cannot find module '@radix-ui/react-alert-dialog'**
```bash
npm install @radix-ui/react-alert-dialog
```

---

## 📱 Uso del Sistema

### **Ver Mapa**
1. Ir a: `http://localhost:3000/paradas/`
2. Navegar por el mapa
3. Hacer click en marcadores para ver detalles

### **Agregar Punto**
1. Hacer click en el mapa (se capturan coordenadas)
2. Completar formulario lateral
3. Click en "Guardar Punto"

### **Editar Punto**
1. Click en marcador del mapa
2. Click en "Editar" en popup
3. Modificar datos en formulario
4. Click en "Actualizar Punto"

### **Eliminar Punto**
1. Click en marcador
2. Click en "Eliminar"
3. Confirmar en modal

---

## 🔐 Seguridad

- ✅ GET endpoints públicos (solo lectura)
- ✅ POST/PUT/DELETE requieren JWT
- ✅ Validaciones en frontend y backend
- ✅ Soft delete (no se pierden datos)
- ✅ SQL injection protegido (Prisma)
- ✅ XSS protegido (React)

---

## 📈 Performance

- ✅ Server Components por defecto
- ✅ Dynamic imports para Leaflet (evita SSR issues)
- ✅ Índices en base de datos
- ✅ Lazy loading de mapa
- ✅ Optimized queries con Prisma

---

## 🎨 Stack Técnico

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Base de Datos:** MySQL + Prisma ORM
- **Mapas:** React-Leaflet + OpenStreetMap
- **UI:** TailwindCSS + shadcn/ui
- **Iconos:** Lucide React + Font Awesome
- **Notificaciones:** Sonner (toast)
- **Estado:** React Hooks

---

## 📝 Notas Técnicas

- Coordenadas por defecto: Lanús `-34.715, -58.407`
- Zoom inicial: 14
- Proveedor de tiles: OpenStreetMap HOT
- Límite de paradas por request: 1000
- Precisión coordenadas: 8 decimales (Decimal 10,8)

---

## 🤝 Contribuir

Para agregar nuevos tipos de paradas:

1. Editar `prisma/schema.prisma` - Agregar al enum `paradas_tipo`
2. Editar `components/paradas/types.ts` - Agregar configuración visual
3. Ejecutar `npx prisma db push`
4. Reiniciar servidor

---

## 📞 Soporte

Si encuentras errores o tienes sugerencias, reporta en el sistema de issues.

---

**✨ Desarrollado para el Municipio de Lanús**  
Migración exitosa de PHP legacy a stack moderno Next.js 14

**🗺️ Acceso:** `http://localhost:3000/paradas/`
