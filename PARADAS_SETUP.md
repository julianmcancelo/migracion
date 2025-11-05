# 🗺️ Sistema de Gestión de Paradas - Setup

Sistema moderno de gestión de puntos de interés y paradas para el Municipio de Lanús.

## 📋 Características

- ✅ Mapa interactivo con React-Leaflet
- ✅ CRUD completo de paradas
- ✅ Tipos de puntos: Seguridad, Transporte, Semáforo, Salud, Educación, Municipal
- ✅ Gestión de estados (OK, Falla, Mantenimiento)
- ✅ API REST con Next.js
- ✅ Base de datos MySQL con Prisma ORM
- ✅ UI moderna con shadcn/ui y TailwindCSS
- ✅ TypeScript estricto

## 🚀 Instalación

### 1. Instalar dependencias faltantes

```bash
npm install @radix-ui/react-alert-dialog
```

> **Nota**: Las demás dependencias ya están instaladas (leaflet, react-leaflet, etc.)

### 2. Migrar la base de datos

```bash
# Generar cliente Prisma actualizado
npx prisma generate

# Aplicar cambios a la base de datos
npx prisma db push
```

### 3. (Opcional) Migrar datos del sistema PHP antiguo

Si tienes datos en el archivo `points.json` del sistema PHP antiguo, puedes ejecutar el siguiente script:

```bash
node scripts/migrate-paradas.js
```

## 📁 Estructura del Sistema

```
app/
├── (panel)/
│   └── paradas/
│       └── page.tsx           # Página principal del sistema
└── api/
    └── paradas/
        ├── route.ts           # GET y POST
        └── [id]/
            └── route.ts       # GET, PUT, DELETE por ID

components/
└── paradas/
    ├── types.ts               # Tipos TypeScript
    ├── MapaLeaflet.tsx        # Componente de mapa
    └── FormularioParada.tsx   # Formulario CRUD

prisma/
└── schema.prisma              # Modelo de base de datos
```

## 🗄️ Modelo de Base de Datos

```prisma
model paradas {
  id          Int            @id @default(autoincrement())
  titulo      String         @db.VarChar(150)
  tipo        paradas_tipo
  descripcion String?        @db.Text
  latitud     Decimal        @db.Decimal(10, 8)
  longitud    Decimal        @db.Decimal(11, 8)
  estado      paradas_estado? @default(ok)
  activo      Boolean        @default(true)
  creado_en   DateTime       @default(now())
  actualizado DateTime       @updatedAt
  creado_por  Int?
  metadata    Json?
}
```

## 🔌 API Endpoints

### GET /api/paradas
Obtener todas las paradas activas

**Query Params:**
- `tipo`: filtrar por tipo (seguridad, transporte, etc.)
- `activo`: true/false
- `limite`: número máximo de resultados

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titulo": "Municipalidad de Lanús",
      "tipo": "municipal",
      "latitud": -34.698699,
      "longitud": -58.392291,
      "estado": "ok",
      "activo": true
    }
  ]
}
```

### POST /api/paradas
Crear una nueva parada

**Body:**
```json
{
  "titulo": "Nuevo Punto",
  "tipo": "transporte",
  "descripcion": "Descripción opcional",
  "latitud": -34.715,
  "longitud": -58.407,
  "estado": "ok"
}
```

### PUT /api/paradas/[id]
Actualizar una parada existente

### DELETE /api/paradas/[id]
Eliminar (desactivar) una parada

## 🎨 Tipos de Puntos

| Tipo       | Color     | Icono              | Uso                    |
|------------|-----------|-------------------|------------------------|
| seguridad  | Azul      | shield-halved     | Puntos de seguridad    |
| transporte | Amarillo  | bus               | Garitas y paradas      |
| semaforo   | Gris      | traffic-light     | Semáforos              |
| salud      | Rojo      | briefcase-medical | Centros de salud       |
| educacion  | Verde     | graduation-cap    | Escuelas               |
| municipal  | Gris      | building-columns  | Oficinas municipales   |

## 🔧 Uso del Sistema

### Acceder al sistema

1. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

2. Navegar a: `http://localhost:3000/paradas`

### Agregar un punto

1. Click en el mapa para seleccionar coordenadas
2. Completar el formulario en el panel lateral
3. Click en "Guardar Punto"

### Editar un punto

1. Click en un marcador del mapa
2. Click en "Editar" en el popup
3. Modificar datos en el formulario
4. Click en "Actualizar Punto"

### Eliminar un punto

1. Click en un marcador del mapa
2. Click en "Eliminar" en el popup
3. Confirmar la eliminación

## 🔄 Migración desde PHP

El sistema anterior usaba archivos JSON y PHP. Los nuevos beneficios incluyen:

### Antes (PHP):
- ❌ Almacenamiento en archivo JSON (límites de escala)
- ❌ Sin validaciones en backend
- ❌ Sin autenticación
- ❌ Sin historial de cambios
- ❌ Sin relaciones con otros datos

### Ahora (Next.js):
- ✅ Base de datos MySQL con índices optimizados
- ✅ Validaciones TypeScript + Prisma
- ✅ Autenticación integrada
- ✅ Timestamps automáticos
- ✅ Soft delete (no se pierden datos)
- ✅ Preparado para auditoría

## 📊 Próximas Mejoras Sugeridas

- [ ] Filtros avanzados en el mapa
- [ ] Búsqueda de puntos por nombre
- [ ] Exportación a KML/GeoJSON
- [ ] Importación masiva de puntos
- [ ] Clustering de marcadores
- [ ] Rutas entre puntos
- [ ] Notificaciones de cambios de estado
- [ ] Panel de estadísticas
- [ ] Historial de cambios
- [ ] Integración con Google Maps

## 🐛 Troubleshooting

### Error: "Cannot find module 'leaflet'"

```bash
npm install leaflet react-leaflet @types/leaflet
```

### El mapa no se muestra

1. Verificar que los estilos de Leaflet estén cargados en `globals.css`
2. Verificar que Font Awesome esté disponible para los iconos
3. Abrir la consola del navegador para ver errores

### Error de base de datos

```bash
# Regenerar cliente Prisma
npm run prisma:clean
npx prisma generate
npx prisma db push
```

## 📝 Notas Técnicas

- El mapa usa OpenStreetMap como proveedor de tiles
- Las coordenadas por defecto son del centro de Lanús: `-34.715, -58.407`
- Los iconos usan Font Awesome 6
- El sistema usa Server Components de Next.js 14 donde es posible
- El mapa se carga dinámicamente para evitar SSR issues

## 🤝 Contribuir

Para agregar nuevos tipos de puntos, editar:
1. `prisma/schema.prisma` - Agregar enum
2. `components/paradas/types.ts` - Agregar configuración
3. Ejecutar `npx prisma db push`

---

**Desarrollado para el Municipio de Lanús**
Migración de PHP a Next.js 14 + TypeScript + Prisma
