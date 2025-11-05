# 🗺️ Pipeline de Geocodificación de Paradas

Sistema completo para geocodificar direcciones de paradas de transporte usando Google Maps Geocoding API.

## 📋 Tabla de Contenidos

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Estructura de Archivos](#estructura-de-archivos)
- [Costos y Límites](#costos-y-límites)
- [Troubleshooting](#troubleshooting)

## ✅ Requisitos

- Node.js 18+ 
- NPM o Yarn
- Cuenta de Google Cloud Platform
- API Key de Google Maps con Geocoding API habilitada

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Las nuevas dependencias incluyen:
# - xlsx: para leer archivos Excel
# - yargs: para CLI
# - p-limit: para rate limiting
# - tsx: para ejecutar TypeScript
```

## 🔑 Configuración

### 1. Obtener API Key de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - **Geocoding API** (obligatorio)
   - **Maps JavaScript API** (para visualización)
4. Ve a **Credenciales** → **Crear credenciales** → **Clave de API**
5. Copia la API Key generada

### 2. Configurar Variables de Entorno

```bash
# Copia el archivo de ejemplo
cp .env.example .env.local

# Edita .env.local y agrega tu API Key
GOOGLE_MAPS_API_KEY=tu-api-key-aqui
```

**⚠️ IMPORTANTE:**
- NUNCA commitees `.env.local` al repositorio
- En producción, configura restricciones de dominio/IP para tu API Key
- Considera usar diferentes keys para desarrollo y producción

### 3. Preparar Archivo Excel

El archivo debe estar ubicado en `/paradas/PARADAS INTERVENIDAS Y NUEVAS.xlsx` (o especifica otra ruta con `--in`).

**Columnas esperadas** (pueden variar en nombre, el script las detecta automáticamente):
- `Calle` o `Dirección`
- `Altura` o `Numero`
- `EntreCalles` (opcional)
- `Localidad` o `Ciudad`
- `Partido` o `Municipio` (opcional)
- `Provincia` 
- `Pais` o `País` (si falta, asume "Argentina")
- `Referencia` o `Observaciones` (opcional)
- `CodigoParada` o `ID` (identificador único)

**Ejemplo de fila:**
| Calle | Altura | EntreCalles | Localidad | Provincia | CodigoParada |
|-------|--------|-------------|-----------|-----------|--------------|
| 9 de Julio | 1234 | San Martín y Belgrano | Lanús | Buenos Aires | P001 |

## 🚀 Uso

### Comandos Básicos

```bash
# Geocodificar con configuración por defecto
npm run geocode

# Dry run (sin consumir API, solo muestra qué se haría)
npm run geocode:dry

# Con opciones personalizadas
npm run geocode -- --sheet="Hoja1" --rate=40 --max-requests=100
```

### Opciones CLI

| Opción | Alias | Tipo | Default | Descripción |
|--------|-------|------|---------|-------------|
| `--dry-run` | `-d` | boolean | false | Modo prueba sin consumir API |
| `--in` | `-i` | string | `./paradas/PARADAS...xlsx` | Ruta del archivo Excel |
| `--sheet` | `-s` | string | (primera hoja) | Nombre de la hoja Excel |
| `--rate` | `-r` | number | 50 | Requests por minuto |
| `--max-requests` | `-m` | number | 0 | Límite de requests (0 = sin límite) |
| `--country` | `-c` | string | "Argentina" | País por defecto |
| `--localidad-fallback` | `-l` | string | "Lanús" | Localidad si falta |

### Ejemplos de Uso

```bash
# Procesar solo 50 filas para testear
npm run geocode -- --max-requests=50

# Usar una hoja específica con rate limiting bajo
npm run geocode -- --sheet="Paradas2024" --rate=30

# Dry run para estimar costos sin gastar créditos
npm run geocode:dry

# Archivo en otra ubicación
npm run geocode -- --in="./data/otra-planilla.xlsx"
```

## 📁 Estructura de Archivos

```
paradas/
├── PARADAS INTERVENIDAS Y NUEVAS.xlsx  # Input (Excel)
├── cache/
│   └── geocode-cache.json              # Caché de geocodificaciones
├── out/
│   ├── paradas_geocodificadas.csv      # Output: CSV con coordenadas
│   ├── paradas_geocodificadas.geojson  # Output: GeoJSON para mapas
│   ├── reporte_geocode.json            # Métricas y resumen
│   └── geocode.log                     # Log detallado
└── README_GEOCODIFICACION.md           # Este archivo
```

### Formatos de Salida

#### CSV
Incluye todas las columnas originales más:
- `fullAddress`: Dirección normalizada usada para geocodificar
- `lat`, `lng`: Coordenadas
- `formatted_address`: Dirección formateada por Google
- `place_id`: ID único de Google Maps
- `accuracy`: Nivel de precisión (ROOFTOP, RANGE_INTERPOLATED, APPROXIMATE, etc.)
- `status`: Estado (OK, ZERO_RESULTS, insuficiente, etc.)

#### GeoJSON
FeatureCollection estándar compatible con Leaflet, MapBox, QGIS, etc.
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-58.407, -34.715]
      },
      "properties": {
        "codigoParada": "P001",
        "calle": "9 de Julio",
        ...
      }
    }
  ]
}
```

#### Reporte JSON
```json
{
  "timestamp": "2024-11-05T15:30:00.000Z",
  "total_filas": 200,
  "geocodificadas_ok": 185,
  "sin_match": 8,
  "datos_insuficientes": 5,
  "errores": 2,
  "cache_hits": 120,
  "reintentos": 3,
  "tiempo_total_seg": 245.5,
  "requests_realizados": 80,
  "costo_estimado": "$0.40 USD (~80 requests)"
}
```

## 💰 Costos y Límites

### Precios de Google Maps Geocoding API (2024)

| Volumen de Requests | Costo por 1000 Requests |
|---------------------|-------------------------|
| 0 - 100,000 / mes | $5.00 USD |
| 100,001 - 500,000 / mes | $4.00 USD |
| 500,001+ / mes | $4.00 USD |

**Ejemplos:**
- 100 requests = $0.50 USD
- 500 requests = $2.50 USD
- 1,000 requests = $5.00 USD
- 10,000 requests = $50.00 USD

### Crédito Gratuito

Google ofrece **$200 USD de crédito mensual gratuito** para nuevas cuentas, lo que equivale a:
- **40,000 geocodificaciones gratis por mes**
- Después de eso, se cobra según la tabla de arriba

### Estrategias para Minimizar Costos

1. **Usa Caché**: El script nunca geocodifica la misma dirección dos veces
2. **Dry Run Primero**: Estima costos antes de ejecutar
3. **Max Requests**: Limita requests para testear (`--max-requests=100`)
4. **Limpia Datos**: Asegúrate de que todas las filas tengan datos válidos
5. **Lotes**: Procesa en batches pequeños inicialmente

## 🛠️ Troubleshooting

### Error: `GOOGLE_MAPS_API_KEY no está configurada`

**Causa**: Falta la variable de entorno

**Solución**:
```bash
# Verifica que existe .env.local
ls -la .env.local

# Si no existe, cópialo del ejemplo
cp .env.example .env.local

# Edita y agrega tu API key
nano .env.local
```

### Error: `REQUEST_DENIED`

**Causas posibles**:
- API key inválida
- Geocoding API no habilitada en Google Cloud
- Restricciones de dominio/IP bloqueando el request

**Solución**:
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Verifica que **Geocoding API** esté habilitada
3. Revisa las restricciones de la API key (temporalmente quítalas para testear)
4. Verifica que la facturación esté activada

### Error: `OVER_QUERY_LIMIT`

**Causa**: Superaste el límite de requests por segundo/minuto

**Solución**:
```bash
# Reduce el rate limiting
npm run geocode -- --rate=20

# El script reintentará automáticamente con backoff exponencial
# Si persiste, espera unos minutos y vuelve a ejecutar
```

### Direcciones sin Match (`ZERO_RESULTS`)

**Causas**:
- Dirección mal formada o incompleta
- Calle inexistente
- Error tipográfico

**Solución**:
1. Revisa el CSV de salida, columna `status`
2. Para filas con `ZERO_RESULTS`, verifica `fullAddress`
3. Corrige los datos en el Excel original
4. Vuelve a ejecutar (la caché evitará re-geocodificar las OK)

### Baja Precisión (`baja_precision`)

**Causa**: Google devolvió coordenadas con `RANGE_INTERPOLATED` o `APPROXIMATE`

**Significado**:
- `ROOFTOP`: Precisión exacta (mejor)
- `RANGE_INTERPOLATED`: Estimación entre dos puntos (buena)
- `APPROXIMATE`: Aproximada (revisa la dirección)
- `GEOMETRIC_CENTER`: Centro geométrico de un área

**Solución**:
- Si necesitas precisión exacta, agrega el número de altura
- Verifica que la calle y localidad sean correctos
- Considera validar manualmente en Google Maps

### Datos Insuficientes

**Causa**: Filas sin `calle` o sin `altura` ni `entreCalles`

**Solución**:
1. Completa los datos faltantes en el Excel
2. O marca esas filas para geocodificación manual posterior

### Re-ejecutar Después de Interrumpir

**El script es idempotente y puede resumirse de forma segura:**
```bash
# Simplemente vuelve a ejecutar
npm run geocode

# Gracias a la caché, solo procesa las filas nuevas/fallidas
# No gasta créditos en las que ya se geocodificaron exitosamente
```

## 📊 Monitoreo y Logs

### Ver Logs en Tiempo Real

```bash
# Durante la ejecución
tail -f paradas/out/geocode.log
```

### Revisar Estadísticas

```bash
# Ver reporte JSON
cat paradas/out/reporte_geocode.json | json_pp

# O abrelo en tu editor
code paradas/out/reporte_geocode.json
```

## 🔐 Seguridad

1. **No expongas tu API Key**
   - Nunca la commitees al repo
   - No la imprimas en logs
   - Usa `.env.local` que está en `.gitignore`

2. **Restricciones de API Key**
   - En desarrollo: Sin restricciones (más fácil)
   - En producción: Restringe por dominio o IP

3. **Monitoreo de Uso**
   - Revisa [Google Cloud Console](https://console.cloud.google.com/apis/dashboard)
   - Configura alertas de presupuesto

4. **Rate Limiting**
   - El script respeta límites (default: 50 rpm)
   - Google permite hasta 50-100 requests/segundo
   - Pero mejor ir con límites conservadores

## 🎯 Próximos Pasos

Una vez que tengas las paradas geocodificadas:

1. **Visualiza en el mapa**: `/paradas` en el frontend
2. **Filtra por status**: Ver solo las OK, o las que fallaron
3. **Exporta subconjuntos**: Crea GeoJSONs filtrados
4. **Integra con base de datos**: Importa coordenadas a Prisma

## 📚 Referencias

- [Google Maps Geocoding API Docs](https://developers.google.com/maps/documentation/geocoding)
- [GeoJSON Spec](https://geojson.org/)
- [Leaflet Docs](https://leafletjs.com/)

---

**Última actualización**: 5 de noviembre de 2024
