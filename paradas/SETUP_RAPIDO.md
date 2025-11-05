# 🚀 Setup Rápido - Pipeline de Geocodificación

## 1️⃣ Configurar API Key (IMPORTANTE)

```bash
# Copia el archivo de ejemplo si no existe .env.local
cp .env.example .env.local

# Abre .env.local y agrega tu API Key
nano .env.local
```

Agrega esta línea a `.env.local`:
```bash
GOOGLE_MAPS_API_KEY=AIzaSyAYpg-lZ_qGsOPV-veIp9Mnv36NHU1Ib-A
```

⚠️ **NUNCA commitees este archivo al repositorio**

## 2️⃣ Instalar Dependencias

```bash
npm install
```

Esto instalará las nuevas dependencias:
- `xlsx` - Leer archivos Excel
- `yargs` - CLI con argumentos
- `p-limit` - Rate limiting
- `tsx` - Ejecutar TypeScript

## 3️⃣ Preparar Excel

1. Coloca tu archivo Excel en: `/paradas/PARADAS INTERVENIDAS Y NUEVAS.xlsx`
2. Asegúrate que tenga columnas como: `Calle`, `Altura`, `Localidad`, `Provincia`

## 4️⃣ Prueba (Dry Run)

```bash
# Primero haz un dry run para estimar costos sin gastar créditos
npm run geocode:dry
```

Esto te mostrará:
- Cuántas direcciones se geocodificarían
- Costo estimado
- Sin consumir la API

## 5️⃣ Geocodificar (Modo Producción)

```bash
# Empieza con pocas para probar
npm run geocode -- --max-requests=10

# Si todo va bien, procesa todas
npm run geocode
```

## 6️⃣ Ver Resultados

### En archivos:
- `paradas/out/paradas_geocodificadas.csv` - CSV con coordenadas
- `paradas/out/paradas_geocodificadas.geojson` - Para mapas
- `paradas/out/reporte_geocode.json` - Estadísticas
- `paradas/out/geocode.log` - Log detallado

### En el navegador:
```bash
# Inicia el servidor si no está corriendo
npm run dev

# Abre: http://localhost:3001/paradas/geocodificadas
```

## 🎯 Comandos Útiles

```bash
# Dry run (sin consumir API)
npm run geocode:dry

# Geocodificar con límite
npm run geocode -- --max-requests=50

# Rate limiting bajo (más lento, más seguro)
npm run geocode -- --rate=30

# Hoja específica del Excel
npm run geocode -- --sheet="Paradas2024"

# Combinar opciones
npm run geocode -- --rate=40 --max-requests=100
```

## ❓ Troubleshooting Rápido

### Error: "GOOGLE_MAPS_API_KEY no está configurada"
```bash
# Verifica que existe .env.local
ls -la .env.local

# Si no existe, créalo
cp .env.example .env.local
# Luego edita y agrega la API key
```

### Error: "REQUEST_DENIED"
1. Ve a https://console.cloud.google.com/
2. Habilita "Geocoding API"
3. Verifica que la facturación esté activa

### Direcciones sin match
1. Revisa `paradas/out/paradas_geocodificadas.csv`
2. Busca filas con `status = ZERO_RESULTS`
3. Corrige las direcciones en el Excel
4. Vuelve a ejecutar (la caché evita re-procesar las OK)

## 💰 Costos Aprox.

- **100 requests** = $0.50 USD
- **500 requests** = $2.50 USD  
- **1,000 requests** = $5.00 USD

Google da **$200 USD gratis/mes** = ~40,000 geocodificaciones

## 📚 Documentación Completa

Lee `README_GEOCODIFICACION.md` para:
- Detalles completos de la API
- Estructura de archivos
- Troubleshooting detallado
- Mejores prácticas

---

**¿Problemas?** Revisa los logs en `paradas/out/geocode.log`
