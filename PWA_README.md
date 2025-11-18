# 📱 PWA - Inspecciones Lanús

## ✅ Configuración Completada

La aplicación ahora es una **Progressive Web App (PWA)** completamente funcional.

## 🎯 Características Implementadas

### ✨ Instalación
- ✅ Instalable como app nativa en Android
- ✅ Prompt de instalación automático
- ✅ Acceso directo en pantalla de inicio
- ✅ Splash screen personalizado

### 📡 Funcionalidad Offline
- ✅ Service Worker configurado
- ✅ Caché inteligente de recursos
- ✅ Página offline personalizada
- ✅ Sincronización en segundo plano

### 🎨 Experiencia Nativa
- ✅ Modo standalone (sin barra del navegador)
- ✅ Theme color personalizado (#0093D2)
- ✅ Iconos de app (192x192 y 512x512)
- ✅ Orientación portrait bloqueada

## 📲 Cómo Instalar en Android

### Desde Chrome:
1. Abre la app en Chrome: `https://migracionnext.vercel.app/inspector-movil/tramites`
2. Aparecerá un banner "Instalar Aplicación"
3. Click en **"Instalar"**
4. La app se agregará a tu pantalla de inicio

### Manualmente:
1. Abre el menú de Chrome (⋮)
2. Selecciona **"Agregar a pantalla de inicio"** o **"Instalar app"**
3. Confirma la instalación
4. ¡Listo! La app está instalada

## 🔧 Archivos Creados

```
public/
├── manifest.json          # Configuración de la PWA
├── sw.js                  # Service Worker
├── offline.html           # Página sin conexión
├── icon-192.png          # Icono 192x192 (pendiente)
└── icon-512.png          # Icono 512x512 (pendiente)

components/
└── pwa/
    └── ServiceWorkerRegistration.tsx  # Registro del SW

app/
├── layout.tsx            # Metadata PWA
└── inspector-movil/
    └── layout.tsx        # SW Registration
```

## 🎨 Iconos Pendientes

**IMPORTANTE:** Necesitas crear los iconos de la app:

### Requisitos:
- **icon-192.png**: 192x192 píxeles
- **icon-512.png**: 512x512 píxeles
- Fondo: Azul #0093D2
- Logo: Escudo de Lanús o icono de inspección

### Herramientas Recomendadas:
- [Favicon Generator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- Canva o Figma para diseño

## 🚀 Funcionalidades

### Cache Strategy
- **Network First**: Intenta red primero, fallback a caché
- **API Requests**: Siempre desde red (no se cachean)
- **Static Assets**: Se cachean automáticamente

### Offline Support
- Páginas visitadas disponibles offline
- Mensaje amigable cuando no hay conexión
- Auto-reconexión cuando vuelve internet

### Auto-Update
- Verifica actualizaciones cada 60 segundos
- Actualización automática del Service Worker
- Sin necesidad de reinstalar

## 📊 Testing

### Verificar PWA:
1. Abre Chrome DevTools (F12)
2. Ve a la pestaña **"Application"**
3. Verifica:
   - ✅ Manifest
   - ✅ Service Workers
   - ✅ Cache Storage

### Lighthouse Audit:
1. Chrome DevTools → **"Lighthouse"**
2. Selecciona **"Progressive Web App"**
3. Click en **"Generate report"**
4. Objetivo: Score > 90

## 🔄 Actualizaciones

Cuando hagas cambios:
1. Incrementa la versión en `sw.js`: `CACHE_NAME = 'inspecciones-lanus-v2'`
2. El Service Worker se actualizará automáticamente
3. Los usuarios verán los cambios en la próxima visita

## 📱 Compatibilidad

- ✅ Android (Chrome, Edge, Samsung Internet)
- ✅ iOS (Safari 16.4+)
- ✅ Desktop (Chrome, Edge)

## 🎯 Próximos Pasos

1. **Crear iconos** (icon-192.png y icon-512.png)
2. **Probar instalación** en dispositivo Android
3. **Verificar offline** (modo avión)
4. **Lighthouse audit** para optimizar

## 💡 Tips

- La app se actualiza automáticamente
- Funciona offline después de la primera visita
- Los datos de API siempre están actualizados (no se cachean)
- Puedes desinstalar desde Configuración → Apps

## 🐛 Troubleshooting

### La app no se instala:
- Verifica que estés en HTTPS
- Revisa la consola del navegador
- Asegúrate de que los iconos existan

### Service Worker no se registra:
- Verifica la consola: `navigator.serviceWorker`
- Limpia caché: DevTools → Application → Clear storage

### Cambios no se ven:
- Incrementa versión del caché en `sw.js`
- Fuerza actualización: DevTools → Application → Service Workers → Update
