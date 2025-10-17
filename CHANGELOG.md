# 📝 Changelog - Sistema de Credenciales Lanús

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
