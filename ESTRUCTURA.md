# 📁 Estructura del Proyecto - Sistema de Credenciales Lanús

## ✅ Fase 1 Completada: Estructura Base

### 🗂️ Nueva Organización de Carpetas

```
migracion/
├── app/
│   ├── (auth)/                     # Route Group: Autenticación
│   │   ├── login/
│   │   │   └── page.tsx           # ✅ Página de login (movida)
│   │   └── layout.tsx             # ✅ Layout sin sidebar
│   │
│   ├── (panel)/                   # Route Group: Panel protegido
│   │   ├── dashboard/
│   │   │   └── page.tsx           # ✅ Dashboard con KPIs
│   │   ├── habilitaciones/
│   │   │   └── (pendiente)
│   │   └── layout.tsx             # ✅ Layout con Header + Sidebar
│   │
│   ├── api/
│   │   └── auth/
│   │       ├── login/route.ts     # ✅ Funcionando
│   │       ├── logout/route.ts    # ✅ Funcionando
│   │       └── session/route.ts   # ✅ Funcionando
│   │
│   └── page.tsx                   # ✅ Redirect inteligente (login/dashboard)
│
├── components/
│   ├── layout/
│   │   ├── header.tsx             # ✅ Header con menú de usuario
│   │   └── sidebar.tsx            # ✅ Sidebar con navegación
│   │
│   └── ui/                        # Para shadcn/ui (próximo paso)
│
├── lib/
│   ├── auth.ts                    # ✅ JWT y sesiones
│   ├── db.ts                      # ✅ Prisma client
│   ├── db-config.ts               # ✅ Configuración MySQL
│   └── utils.ts                   # ✅ Utilidades (cn, formatear, etc.)
│
└── prisma/
    └── schema.prisma              # ✅ 24 tablas introspectadas
```

---

## 🎨 Componentes Creados

### **Header** (`components/layout/header.tsx`)

- Logo del municipio
- Búsqueda global
- Notificaciones (con badge)
- Menú de usuario con dropdown
- Botón de logout funcional

### **Sidebar** (`components/layout/sidebar.tsx`)

- Navegación principal (6 secciones)
- Indicador visual de ruta activa
- Badges para notificaciones pendientes
- Footer con ayuda rápida
- Diseño oscuro (gray-900)

### **Dashboard** (`app/(panel)/dashboard/page.tsx`)

- 4 KPIs principales:
  - Habilitaciones activas
  - En trámite
  - Por vencer
  - Obleas pendientes
- 3 acciones rápidas
- Placeholder para gráfico (Recharts próximamente)

---

## 🔒 Sistema de Autenticación

### **Rutas Protegidas**

- Todo dentro de `(panel)/` requiere login
- Redirect automático a `/login` si no autenticado
- Redirect a `/dashboard` si ya autenticado

### **Flow de Autenticación**

1. Usuario visita `/` → Redirect a `/login` o `/dashboard`
2. Usuario hace login → Redirect a `/dashboard`
3. Usuario accede a ruta protegida sin login → Redirect a `/login?error=acceso_denegado`

---

## 📊 Base de Datos

### **24 Tablas Mapeadas con Prisma**

- `admin` (usuarios del sistema)
- `habilitaciones_generales`
- `habilitaciones_personas`
- `habilitaciones_vehiculos`
- `habilitaciones_establecimientos`
- `personas`
- `vehiculos`
- `establecimientos`
- `remiserias`
- `inspecciones`
- `inspeccion_detalles`
- `inspeccion_fotos`
- `turnos`
- `obleas`
- `notificaciones`
- `tokens_acceso`
- Y más...

---

## 📦 Dependencias Agregadas

```json
{
  "clsx": "^2.1.1", // Combinar clases condicionales
  "tailwind-merge": "^2.5.4" // Merge inteligente de Tailwind
}
```

---

## 🚀 Próximos Pasos

### **Paso 2: Instalar Dependencias**

```bash
npm install
```

### **Paso 3: Instalar shadcn/ui**

```bash
npx shadcn@latest init
npx shadcn@latest add button card table dialog tabs badge
```

### **Paso 4: Implementar Habilitaciones**

- Lista con tabs (Escolar/Remis)
- Tabla expandible
- Búsqueda y filtros
- Paginación
- CRUD completo

### **Paso 5: Dashboard Dinámico**

- Conectar KPIs a base de datos real
- Implementar gráfico con Recharts
- Obleas pendientes (lista)

---

## 📝 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Prisma Studio (explorar base de datos)
npm run prisma:studio

# Test de conexión MySQL
npm run test:db

# Deploy a Vercel
git push
```

---

## 🎯 URLs del Sistema

### **Desarrollo**

- http://localhost:3000 → Redirect automático
- http://localhost:3000/login → Login
- http://localhost:3000/dashboard → Dashboard

### **Producción**

- https://migracionnext.vercel.app

---

## 📌 Notas Importantes

1. **Route Groups**: Los paréntesis `(auth)` y `(panel)` NO afectan la URL
   - `(auth)/login` → URL: `/login`
   - `(panel)/dashboard` → URL: `/dashboard`

2. **Layouts Anidados**:
   - `app/layout.tsx` → Layout global
   - `app/(auth)/layout.tsx` → Solo para login (limpio)
   - `app/(panel)/layout.tsx` → Panel con Header + Sidebar

3. **Server vs Client Components**:
   - Layouts y páginas son Server Components (por defecto)
   - Header y Sidebar son Client Components (usan hooks)

4. **TypeScript Strict**:
   - Todos los componentes tipados
   - Validación con Zod en APIs
   - Tipos generados por Prisma

---

## ✅ Estado Actual

- [x] Estructura de carpetas organizada
- [x] Route Groups configurados
- [x] Login funcionando
- [x] Header con navegación
- [x] Sidebar con menú
- [x] Dashboard básico
- [x] Protección de rutas
- [x] Base de datos conectada
- [ ] shadcn/ui instalado
- [ ] Habilitaciones (CRUD)
- [ ] Gráficos dinámicos
- [ ] Inspecciones
- [ ] Turnos
- [ ] PDFs y QR

---

**Siguiente:** Instalar `npm install` y luego shadcn/ui 🎨
