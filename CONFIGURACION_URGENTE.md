# ⚠️ CONFIGURACIÓN URGENTE - Error 500 Resuelto

## 🔴 Problema Actual

El error 500 en `/api/paradas` es causado por **credenciales de base de datos inválidas**.

```
Authentication failed against database server at `localhost`
```

## ✅ Solución Inmediata

### 1. Crear archivo `.env.local`

En la carpeta `migracion/`, crea un archivo llamado `.env.local` con este contenido:

```bash
# Base de datos MySQL (CAMBIAR estos valores con tus credenciales reales)
DATABASE_URL="mysql://USUARIO:PASSWORD@167.250.5.55:3306/transpo1_credenciales"

# JWT Secret (generar uno único y seguro)
JWT_SECRET="cambia_esto_por_un_string_aleatorio_muy_largo"

# Opcional - Google AI
GOOGLE_AI_API_KEY="tu_api_key_si_usas_gemini"

# Next.js
NEXT_PUBLIC_API_URL="http://localhost:3001"
NODE_ENV="development"
```

### 2. Reemplazar Valores

**IMPORTANTE**: Reemplaza estos valores con tus credenciales reales:

- `USUARIO` → Tu usuario de MySQL
- `PASSWORD` → Tu contraseña de MySQL  
- `167.250.5.55` → IP del servidor de base de datos (según tu configuración existente)
- `transpo1_credenciales` → Nombre de la base de datos

### 3. Reiniciar Servidor

Después de crear `.env.local`:

```bash
# Detener el servidor (Ctrl + C)
# Iniciar nuevamente:
npm run dev
```

## 📝 Ejemplo Completo

Si tu usuario es `root` y tu password es `mipassword123`:

```bash
DATABASE_URL="mysql://root:mipassword123@167.250.5.55:3306/transpo1_credenciales"
JWT_SECRET="a8d7f9e2b4c1d3f6e8a0b2c4d6e8f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5"
NEXT_PUBLIC_API_URL="http://localhost:3001"
NODE_ENV="development"
```

## 🔒 Seguridad

**NUNCA subas el archivo `.env.local` a Git**. Ya está en `.gitignore`.

## ✅ Verificar que Funciona

Después de configurar, abre la consola del navegador. Deberías ver:

✅ **Sin errores 500**  
✅ **Mapa cargando correctamente**  
✅ **Paradas visibles en el mapa**

## 🗺️ Sobre el Mapa Mejorado

Ya implementé un **mapa Leaflet con capas limpias** (sin API key necesaria):

- **5 estilos de mapa**: Google Style, Dark Mode, Voyager, Satélite, OSM
- **Filtros por tipo y estado** con switches
- **100% gratis** - no necesita Google Maps API Key
- **Panel flotante colapsable**

---

**Última actualización**: ${new Date().toLocaleString('es-AR')}
