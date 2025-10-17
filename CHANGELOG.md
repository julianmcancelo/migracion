# 📝 Changelog - Sistema de Credenciales Lanús

## [0.3.0] - 2025-01-17

### ✨ Añadido
- **Formulario de nueva habilitación**: Modal multi-paso (4 pasos) completo
- **Validación Zod**: Schemas para habilitaciones, personas, vehículos y establecimientos
- **APIs de búsqueda**:
  - GET `/api/personas` - Buscar por nombre/DNI
  - GET `/api/vehiculos` - Buscar por dominio/marca/modelo
  - GET `/api/establecimientos` - Buscar establecimientos y remiserías
  - POST `/api/habilitaciones` - Crear habilitación con transacción
- **Componentes de formulario**:
  - `DatosBasicosStep` - Información general de la habilitación
  - `PersonasStep` - Búsqueda y vinculación de personas con roles
  - `VehiculosStep` - Búsqueda y vinculación de vehículos
  - `EstablecimientosStep` - Búsqueda y vinculación de establecimientos (opcional)
- **Búsqueda en tiempo real**: Debouncing de 500ms en todos los selectores
- **Transacciones Prisma**: Creación atómica de habilitación con todas sus relaciones

### 🔧 Cambiado
- API de habilitaciones ahora soporta GET (lista) y POST (crear)
- Botón "Nueva Habilitación" conectado con modal funcional

### 🎨 Componentes Creados
- `NuevaHabilitacionDialog` - Dialog principal con stepper
- `datos-basicos-step.tsx` - Paso 1 del formulario
- `personas-step.tsx` - Paso 2 con búsqueda incremental
- `vehiculos-step.tsx` - Paso 3 con búsqueda incremental
- `establecimientos-step.tsx` - Paso 4 opcional

### 📦 Features
- Indicador visual de progreso (4 pasos)
- Validación en cliente y servidor
- Loading states y manejo de errores
- Recarga automática de lista al crear
- Prevención de duplicados

---

## [0.2.0] - 2025-01-17

### ✨ Añadido
- **Estructura con Route Groups**: `(auth)` y `(panel)` para organización modular
- **Header del panel**: Con búsqueda, notificaciones y menú de usuario
- **Sidebar de navegación**: 6 secciones con indicadores visuales
- **Dashboard básico**: 4 KPIs y acciones rápidas
- **shadcn/ui configurado**: 10 componentes UI base instalados
  - Button, Card, Input, Label, Table
  - Dialog, Dropdown Menu, Tabs, Badge, Select
- **Sistema de layouts**: Layouts separados para auth y panel
- **Protección de rutas**: Middleware automático para rutas del panel

### 🔧 Cambiado
- Login movido a `(auth)/login`
- Página principal ahora hace redirect inteligente (login/dashboard)
- `lib/utils.ts` mejorado con funciones de formateo

### 🎨 Componentes Creados
- `components/layout/header.tsx` - Header con menú de usuario
- `components/layout/sidebar.tsx` - Navegación lateral
- `components/ui/*` - 10 componentes de shadcn/ui

### 📦 Dependencias Agregadas
- `@radix-ui/react-*` - Componentes headless UI
- `class-variance-authority` - Manejo de variantes
- `lucide-react` - Iconos SVG
- `tailwindcss-animate` - Animaciones CSS
- `clsx` + `tailwind-merge` - Merge de clases CSS

---

## [0.1.0] - 2025-01-17

### ✨ Inicial
- Login funcionando con JWT
- Conexión a MySQL (24 tablas)
- Prisma ORM configurado
- Deploy en Vercel exitoso
- API Routes para autenticación

---

**Próximo:** Implementar lista de habilitaciones con filtros y paginación 🚀
