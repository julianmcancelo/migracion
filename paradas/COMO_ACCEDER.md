# 🌐 Cómo Acceder a la Interfaz Web de Geocodificación

## 📍 URLs Directas

Una vez que el servidor esté corriendo, puedes acceder directamente a:

### 🏠 Página de Inicio (Todas las opciones)
```
http://localhost:3001/paradas/inicio
```
**Recomendado para empezar** - Muestra 3 opciones claramente:
- ✅ Geocodificar Excel (interfaz gráfica)
- ✅ Paradas en Base de Datos
- ✅ Ver Paradas Geocodificadas

---

### 🎯 Acceso Directo al Geocodificador
```
http://localhost:3001/paradas/geocodificar
```
**Interfaz gráfica principal** para subir Excel y geocodificar

---

### 🗺️ Ver Paradas de la Base de Datos
```
http://localhost:3001/paradas
```
Mapa con las 196 paradas almacenadas en la BD

---

### 🌍 Ver Paradas Geocodificadas (desde Excel)
```
http://localhost:3001/paradas/geocodificadas
```
Resultados de geocodificaciones previas con filtros avanzados

---

## 🚀 Pasos Rápidos

### 1. Inicia el Servidor
```bash
cd c:\Users\Julian Cancelo\Documents\Proyectos\credenciales.transportelanus.com.ar\migracion
npm run dev
```

Verás algo como:
```
✓ Ready in 2.7s
- Local:        http://localhost:3001
```

### 2. Abre el Navegador

**Copia y pega en tu navegador:**
```
http://localhost:3001/paradas/inicio
```

### 3. Elige una Opción

**Opción A: Geocodificar un Excel** ⭐ (Más común)
1. Click en "Geocodificar Excel"
2. Arrastra tu archivo .xlsx
3. Configura velocidad (30-50 recomendado)
4. Click "Iniciar Geocodificación"
5. Espera y descarga resultados

**Opción B: Ver/Editar Paradas en BD**
1. Click en "Paradas en BD"
2. Navega por el mapa
3. Click en marcadores para ver info
4. Botón "Editar" o "Eliminar"

**Opción C: Ver Resultados Previos**
1. Click en "Paradas Geocodificadas"
2. Filtra por estado/precisión
3. Exporta subconjuntos

---

## 📱 Desde Otro Dispositivo en la Misma Red

Si quieres acceder desde tu celular o tablet:

1. **Encuentra tu IP local**:
   ```bash
   ipconfig
   # Busca "IPv4 Address" (ejemplo: 192.168.1.100)
   ```

2. **Accede desde cualquier dispositivo**:
   ```
   http://192.168.1.100:3001/paradas/inicio
   ```
   *(Reemplaza 192.168.1.100 con tu IP)*

---

## 🎨 Capturas de Pantalla (Descripción)

### Página de Inicio
- 3 cards grandes con iconos
- Verde = Geocodificar Excel
- Azul = Paradas en BD
- Púrpura = Ver Geocodificadas

### Interfaz de Geocodificación
- **Paso 1**: Área de drag & drop para Excel
- **Paso 2**: Configuración de velocidad y límites
- **Paso 3**: Botón grande "Iniciar Geocodificación"
- **Progreso**: Barra animada + contador en vivo
- **Resultados**: Botones de descarga + "Ver en Mapa"

---

## ❓ Problemas Comunes

### "No puedo acceder a localhost:3001"
✅ **Solución**: Asegúrate que el servidor esté corriendo (`npm run dev`)

### "Página no encontrada (404)"
✅ **Solución**: Verifica la URL exacta:
- ✅ `http://localhost:3001/paradas/inicio`
- ❌ `http://localhost:3000/paradas/inicio` (puerto incorrecto)

### "El servidor usa puerto 3000 en vez de 3001"
✅ **Solución**: Si Next.js usa puerto 3000, usa ese:
```
http://localhost:3000/paradas/inicio
```

---

## 🔗 Flujo Recomendado

```
1. npm run dev
   ↓
2. http://localhost:3001/paradas/inicio
   ↓
3. Click "Geocodificar Excel"
   ↓
4. Arrastra archivo Excel
   ↓
5. Click "Iniciar Geocodificación"
   ↓
6. Espera (ve progreso en tiempo real)
   ↓
7. Click "Ver en el Mapa"
   ↓
8. ¡Listo! Tus paradas geocodificadas en el mapa
```

---

## 💡 Tips

- **Primera vez**: Prueba con 10-20 filas primero
- **Bookmark**: Guarda `http://localhost:3001/paradas/inicio` en favoritos
- **Compartir**: Envía la IP local a colegas en tu red
- **Mobile**: Funciona perfecto en tablets y celulares

---

**¿Dudas?** El servidor debe estar corriendo con `npm run dev` antes de acceder a cualquier URL.
