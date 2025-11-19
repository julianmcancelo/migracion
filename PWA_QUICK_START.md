# 🚀 PWA - Inicio Rápido

## ✅ ¿Qué se implementó?

Tu aplicación ahora tiene **2 PWAs independientes**:

### 1️⃣ PWA Administrativa (Azul)
- **URL**: `/panel`
- **Para**: Administradores
- **Icono**: Escudo con engranaje azul

### 2️⃣ PWA de Inspecciones (Verde)
- **URL**: `/inspector-movil`
- **Para**: Inspectores de campo
- **Icono**: Lupa verde
- **Funciona offline** ✨

---

## 🎯 Probar Ahora

### 1. Iniciar el servidor

```bash
npm run dev
```

### 2. Abrir en el navegador

**Para PWA Admin**:
```
http://localhost:3000/panel
```

**Para PWA Inspector**:
```
http://localhost:3000/inspector-movil
```

### 3. Esperar el prompt

Después de 3 segundos, aparecerá un banner en la esquina inferior derecha:

```
┌─────────────────────────────────┐
│ 📥 Instalar Aplicación          │
│                                 │
│ • Funciona sin conexión         │
│ • Acceso directo                │
│ • Notificaciones                │
│                                 │
│ [Ahora no]  [Instalar]          │
└─────────────────────────────────┘
```

### 4. Click en "Instalar"

¡Listo! La app se instalará en tu sistema.

---

## 📱 ¿Dónde encontrar la app instalada?

### Windows
- Menú Inicio > Buscar "Transporte Lanús" o "Inspecciones"
- O en la barra de tareas si la anclas

### Mac
- Launchpad > Buscar la app
- O en Applications

### Android
- Pantalla de inicio
- Drawer de aplicaciones

### iOS
- Pantalla de inicio (requiere Safari)

---

## 🔧 Comandos Útiles

```bash
# Verificar configuración PWA
npm run pwa:verify

# Regenerar iconos
npm run pwa:generate-icons

# Limpiar caché y reiniciar
npm run clean && npm run dev
```

---

## 🎨 Personalización Rápida

### Cambiar nombre de la app

Edita `public/manifest-admin.json` o `public/manifest-inspector.json`:

```json
{
  "name": "Tu Nombre Aquí",
  "short_name": "Nombre Corto"
}
```

### Cambiar color

En los manifests:

```json
{
  "theme_color": "#TU_COLOR",
  "background_color": "#TU_COLOR"
}
```

---

## 🐛 Problemas Comunes

### No aparece el botón de instalación

1. Verifica que estés en `http://localhost` (no `127.0.0.1`)
2. Abre DevTools (F12) > Console
3. Busca errores del service worker
4. Recarga la página (Ctrl+Shift+R)

### Ya instalé pero quiero reinstalar

1. Desinstala la app actual
2. En DevTools > Application > Service Workers > "Unregister"
3. Application > Clear storage > "Clear site data"
4. Recarga y vuelve a instalar

### La app no funciona offline

1. Verifica que el service worker esté activo:
   - DevTools > Application > Service Workers
   - Debe decir "activated and is running"

2. Verifica el caché:
   - DevTools > Application > Cache Storage
   - Debe haber entradas en `transporte-lanus-admin-v1` o `inspecciones-lanus-v1`

---

## 📚 Documentación Completa

Para más detalles, consulta:
- **[PWA_DUAL_SETUP.md](./PWA_DUAL_SETUP.md)** - Documentación completa
- **[PWA_README.md](./PWA_README.md)** - Documentación legacy

---

## ✨ Características

| Característica | Admin | Inspector |
|----------------|-------|-----------|
| Instalable | ✅ | ✅ |
| Offline | ⚠️ Parcial | ✅ Completo |
| Notificaciones | ✅ | ✅ |
| Sincronización | ❌ | ✅ |
| Shortcuts | ✅ 4 | ✅ 3 |

---

## 🎉 ¡Listo!

Tu sistema ahora es una **Progressive Web App** profesional con:
- ✅ 2 apps instalables independientes
- ✅ Funcionamiento offline
- ✅ Iconos personalizados
- ✅ Notificaciones
- ✅ Sincronización automática

**¿Dudas?** Consulta la documentación completa en `PWA_DUAL_SETUP.md`
