# Configuración de Google Maps para Paradas

## 🗺️ Nuevo Componente de Mapa

Se ha implementado un nuevo componente de Google Maps con las siguientes características:

### ✨ Características

1. **Estilo Limpio y Moderno**
   - Esquema de colores "Silver" minimalista
   - Diseño profesional sin distracciones
   - Marcadores personalizados con gradientes

2. **Sistema de Filtros Avanzado**
   - ✅ Filtrar por tipo de parada (Seguridad, Transporte, Salud, etc.)
   - ✅ Filtrar por estado (Operativo, Mantenimiento, Fuera de servicio)
   - ✅ Toggle "Seleccionar todos" para activar/desactivar rápidamente
   - ✅ Contador de paradas visibles en tiempo real
   - ✅ Panel de filtros colapsable

3. **Interactividad Mejorada**
   - Marcadores con iconos SVG personalizados por tipo
   - InfoWindows con información completa
   - Opacidad reducida para paradas con falla
   - Botones de editar/eliminar integrados

## 🔧 Configuración

### 1. Obtener API Key de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - **Maps JavaScript API**
   - **Geocoding API** (si usas geocodificación)
4. Ve a "Credenciales" y crea una API Key
5. Restringe la API Key:
   - **Restricción de aplicación**: Referentes HTTP
   - **Dominios permitidos**: 
     - `localhost:3000`
     - `*.vercel.app`
     - `credenciales.transportelanus.com.ar`
   - **Restricción de API**: Limitar a Maps JavaScript API y Geocoding API

### 2. Configurar Variable de Entorno

Agrega la siguiente variable a tu archivo `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

**IMPORTANTE**: La variable debe tener el prefijo `NEXT_PUBLIC_` para ser accesible en el cliente.

### 3. Configurar en Vercel (Producción)

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   - **Key**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - **Value**: Tu API Key de Google Maps
   - **Environments**: Production, Preview, Development

## 📂 Archivos Creados/Modificados

### Nuevos
- `components/paradas/MapaGoogle.tsx` - Componente principal de Google Maps

### Modificados
- `app/paradas/page.tsx` - Actualizado para usar MapaGoogle
- `package.json` - Agregada dependencia `@react-google-maps/api`

## 🎨 Personalización

### Cambiar Estilo del Mapa

Edita el array `mapStyles` en `MapaGoogle.tsx` para usar diferentes temas:

```typescript
// Otros estilos disponibles:
// - Night mode (oscuro)
// - Retro (vintage)
// - Aubergine (morado oscuro)
// - Standard (por defecto de Google)
```

Visita [Google Maps Styling Wizard](https://mapstyle.withgoogle.com/) para crear estilos personalizados.

### Agregar Nuevos Tipos de Filtros

1. Agrega el tipo en `components/paradas/types.ts`
2. Actualiza `TIPOS_PARADA` con icono y color
3. Los filtros se generan automáticamente

## 🔍 Uso

### Filtrar Paradas

1. Abre el panel de filtros (siempre visible en la esquina superior derecha)
2. Usa los switches para activar/desactivar tipos
3. Filtra por estado operativo
4. El contador muestra paradas visibles/totales

### Colapsar Filtros

Haz clic en el ícono de chevron en el header del panel de filtros para expandir/colapsar.

### Interactuar con Marcadores

- **Click en marcador**: Abre ventana de información
- **Click en mapa**: Añade coordenadas para nueva parada
- **Botón Editar**: Abre formulario de edición
- **Botón Eliminar**: Solicita confirmación de eliminación

## 🚀 Ventajas sobre Leaflet

1. **Mejor rendimiento** con grandes cantidades de marcadores
2. **Street View** integrado
3. **Geocodificación** nativa de Google
4. **Estilos profesionales** y personalizables
5. **Soporte oficial** de Google
6. **Funcionalidades avanzadas**: Directions, Places, etc.

## 📝 Notas

- El componente es **client-side** (`'use client'`)
- Carga diferida para optimizar performance inicial
- Filtros se guardan en estado local (no persisten al recargar)
- Compatible con todos los tipos de parada existentes

## 🐛 Troubleshooting

### "Google Maps API Key no configurada"
- Verifica que la variable esté en `.env.local`
- Debe empezar con `NEXT_PUBLIC_`
- Reinicia el servidor de desarrollo

### Marcadores no aparecen
- Revisa la consola del navegador
- Verifica que las paradas tengan `activo: true`
- Chequea que los filtros no estén bloqueando todo

### Error de permisos de API
- Ve a Google Cloud Console
- Verifica que Maps JavaScript API esté habilitada
- Revisa restricciones de la API Key
