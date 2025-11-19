# 📱 Sistema PWA Dual - Transporte Lanús

## 🎯 Descripción General

El sistema ahora cuenta con **2 PWAs independientes** que se pueden instalar por separado:

### 1. **PWA Administrativa** 🏛️
- **Nombre**: Sistema de Gestión de Transporte - Lanús
- **URL**: `/panel`
- **Usuarios**: Administradores, personal municipal
- **Características**:
  - Gestión de habilitaciones
  - Administración de vehículos y personas
  - Sistema de turnos
  - Reportes y estadísticas
  - Gestión de obleas

### 2. **PWA de Inspecciones** 🔍
- **Nombre**: Inspecciones Lanús
- **URL**: `/inspector-movil`
- **Usuarios**: Inspectores de campo
- **Características**:
  - Funciona 100% offline
  - Sincronización automática
  - Captura de fotos
  - Verificación de credenciales
  - Checklist de inspección

---

## 📦 Archivos Creados

### Manifests
```
public/
├── manifest-admin.json          # Manifest para PWA administrativa
├── manifest-inspector.json      # Manifest para PWA de inspecciones
└── manifest.json               # Manifest genérico (legacy)
```

### Service Workers
```
public/
├── sw-admin.js                 # Service Worker para admin
├── sw-inspector.js             # Service Worker para inspecciones
└── sw.js                       # Service Worker genérico (legacy)
```

### Iconos
```
public/
├── icon-admin-192.svg          # Icono admin 192x192
├── icon-admin-512.svg          # Icono admin 512x512
├── icon-inspector-192.svg      # Icono inspector 192x192
└── icon-inspector-512.svg      # Icono inspector 512x512
```

### Componentes
```
components/pwa/
├── InstallPWA.tsx              # Botón de instalación con prompt
├── PWARegistration.tsx         # Registro del service worker
├── ServiceWorkerRegistration.tsx  # Legacy
└── SyncStatus.tsx              # Estado de sincronización
```

---

## 🚀 Cómo Funciona

### PWA Administrativa

1. **Acceso**: Usuario entra a `/panel`
2. **Manifest**: Se carga `manifest-admin.json`
3. **Service Worker**: Se registra `sw-admin.js`
4. **Prompt**: Después de 3 segundos, aparece botón de instalación
5. **Instalación**: Usuario puede instalar la app en su dispositivo

**Estrategia de Caché**: Network First con timeout de 3 segundos
- Prioriza datos frescos de la red
- Fallback a caché si no hay conexión
- APIs siempre desde red

### PWA de Inspecciones

1. **Acceso**: Inspector entra a `/inspector-movil`
2. **Manifest**: Se carga `manifest-inspector.json`
3. **Service Worker**: Se registra `sw-inspector.js`
4. **Offline**: Funciona completamente sin conexión
5. **Sincronización**: Datos se sincronizan cuando vuelve la conexión

**Estrategia de Caché**: Cache First para recursos, Network First para datos
- Recursos estáticos desde caché
- Datos desde red con fallback a caché
- Inspecciones se guardan en IndexedDB offline
- Sincronización automática en background

---

## 💻 Instalación

### En Escritorio (Chrome/Edge)

1. Visita `/panel` o `/inspector-movil`
2. Espera el prompt de instalación (3 segundos)
3. Click en "Instalar"
4. La app aparecerá en tu menú de aplicaciones

**Alternativa**: Click en el ícono de instalación en la barra de direcciones

### En Móvil (Android)

1. Abre Chrome/Edge
2. Visita la URL correspondiente
3. Toca el banner "Agregar a pantalla de inicio"
4. O usa el menú ⋮ > "Instalar aplicación"

### En iOS (Safari)

1. Abre Safari
2. Visita la URL
3. Toca el botón de compartir 
4. Selecciona "Agregar a pantalla de inicio"

---

## 🎨 Personalización

### Colores de Tema

**Admin**:
- Primary: `#0093D2` (Azul institucional)
- Gradient: `from-blue-600 to-blue-700`

**Inspector**:
- Primary: `#10b981` (Verde esmeralda)
- Gradient: `from-emerald-600 to-emerald-700`

### Modificar Iconos

Los iconos son SVG y se pueden editar fácilmente:

```bash
# Generar nuevos iconos
node scripts/generate-pwa-icons.js
```

Para usar PNG en lugar de SVG:
1. Convierte los SVG a PNG (192x192 y 512x512)
2. Actualiza los manifests cambiando:
   - `type: "image/svg+xml"` → `type: "image/png"`
   - `.svg` → `.png`

---

## 🔧 Configuración Avanzada

### Actualizar URLs en Caché

**Admin** (`sw-admin.js`):
```javascript
const urlsToCache = [
  '/panel',
  '/panel/habilitaciones',
  '/panel/vehiculos',
  // Agregar más rutas aquí
];
```

**Inspector** (`sw-inspector.js`):
```javascript
const urlsToCache = [
  '/inspector-movil',
  '/inspector-movil/tramites',
  // Agregar más rutas aquí
];
```

### Cambiar Versión de Caché

Cuando hagas cambios importantes, actualiza la versión:

```javascript
// En sw-admin.js
const CACHE_NAME = 'transporte-lanus-admin-v2'; // Incrementar versión

// En sw-inspector.js
const CACHE_NAME = 'inspecciones-lanus-v2'; // Incrementar versión
```

### Shortcuts Personalizados

Edita los manifests para agregar más atajos:

```json
{
  "shortcuts": [
    {
      "name": "Nueva Habilitación",
      "short_name": "Nueva",
      "description": "Crear nueva habilitación",
      "url": "/panel/habilitaciones/nueva",
      "icons": [{ "src": "/icon-admin-192.svg", "sizes": "192x192" }]
    }
  ]
}
```

---

## 🧪 Testing

### Verificar Service Worker

```javascript
// En DevTools Console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers registrados:', registrations.length);
  registrations.forEach(reg => console.log(reg.scope));
});
```

### Simular Offline

1. Abre DevTools (F12)
2. Ve a la pestaña "Network"
3. Selecciona "Offline" en el dropdown
4. Recarga la página

### Verificar Caché

1. DevTools > Application
2. Cache Storage
3. Verifica que existan:
   - `transporte-lanus-admin-v1`
   - `inspecciones-lanus-v1`

### Verificar Manifest

1. DevTools > Application > Manifest
2. Verifica que se cargue el correcto según la ruta

---

## 📊 Características PWA

### ✅ Implementadas

- [x] Manifests separados por app
- [x] Service Workers independientes
- [x] Iconos SVG escalables
- [x] Instalación con prompt personalizado
- [x] Funcionamiento offline
- [x] Sincronización en background (inspector)
- [x] Notificaciones push
- [x] Shortcuts de aplicación
- [x] Detección de actualizaciones
- [x] Página offline personalizada

### 🔄 Próximamente

- [ ] Notificaciones push reales (requiere backend)
- [ ] Share Target API (compartir archivos)
- [ ] Background Sync avanzado
- [ ] Periodic Background Sync
- [ ] Web Share API
- [ ] Badging API (contador en icono)

---

## 🐛 Troubleshooting

### La PWA no se instala

1. Verifica que estés en HTTPS (o localhost)
2. Verifica que el manifest sea válido (DevTools > Application > Manifest)
3. Verifica que el service worker se registre correctamente
4. Limpia caché y recarga

### El Service Worker no se actualiza

1. Cierra todas las pestañas de la app
2. DevTools > Application > Service Workers > "Unregister"
3. Limpia caché
4. Recarga

### Problemas de caché

```javascript
// Limpiar todo el caché
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

### No aparece el botón de instalación

- Verifica que no esté ya instalada
- Verifica que no hayas rechazado la instalación en esta sesión
- Limpia `sessionStorage.getItem('pwa-prompt-dismissed')`

---

## 📱 Compatibilidad

| Navegador | Escritorio | Móvil | Notas |
|-----------|-----------|-------|-------|
| Chrome    | ✅ | ✅ | Soporte completo |
| Edge      | ✅ | ✅ | Soporte completo |
| Firefox   | ⚠️ | ⚠️ | Sin prompt automático |
| Safari    | ❌ | ⚠️ | Requiere "Add to Home Screen" manual |
| Opera     | ✅ | ✅ | Soporte completo |

---

## 🔐 Seguridad

- Service Workers solo funcionan en HTTPS
- Los manifests deben servirse con CORS correcto
- Las notificaciones requieren permiso del usuario
- IndexedDB está aislado por origen

---

## 📚 Recursos

- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev - PWA](https://web.dev/progressive-web-apps/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox](https://developers.google.com/web/tools/workbox)

---

## 🎉 Resultado Final

Ahora tienes **2 aplicaciones instalables** independientes:

1. **Panel Administrativo**: Para gestión completa del sistema
2. **App de Inspecciones**: Para trabajo de campo offline

Ambas pueden instalarse en el mismo dispositivo y funcionan de manera independiente, cada una con su propio icono, caché y service worker.

---

**Desarrollado para**: Municipio de Lanús  
**Fecha**: Noviembre 2024  
**Versión**: 1.0.0
