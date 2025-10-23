# 🔍 Diagnóstico: PDF de Obleas sin Imágenes

## ⚡ SOLUCIÓN RÁPIDA

### Paso 1: Diagnosticar el problema

```bash
# Ver estado de la oblea ID 9
node scripts/diagnosticar-obleas.js 9

# O ver todas las obleas
node scripts/diagnosticar-obleas.js
```

Esto te dirá:
- ✅ Si las imágenes existen
- 📍 Dónde están ubicadas
- 📊 Qué formato tienen (base64, archivo local, URL)
- ❌ Qué problemas hay

---

## 🛠️ SOLUCIONES SEGÚN EL PROBLEMA

### Problema 1: "archivo local (no encontrado)"

**Significa:** Los paths en la BD apuntan a archivos que no existen.

**Solución A: Encontrar la ubicación real**
```bash
# En Windows, buscar los archivos
dir /s /b C:\*firma_receptor*.png

# En Linux/Mac
find / -name "*firma_receptor*.png" 2>/dev/null
```

**Solución B: Convertir a base64 (RECOMENDADO)**

```bash
# Ejecutar script de conversión
node scripts/convertir-firmas-a-base64.js
```

Este script:
1. Lee las imágenes desde donde estén
2. Las convierte a base64
3. Las guarda en la BD
4. ✅ El PDF funcionará automáticamente

---

### Problema 2: "Formato base64 pero PDF no lo muestra"

**Causa:** El base64 puede estar corrupto o incompleto.

**Verificar en la BD:**
```sql
SELECT 
  id,
  SUBSTRING(path_firma_receptor, 1, 50) as inicio,
  LENGTH(path_firma_receptor) as longitud
FROM obleas 
WHERE id = 9;
```

**Debe verse así:**
```
inicio: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
longitud: 50000+ (mínimo varios miles de caracteres)
```

**Si está corrupto:**
```sql
-- Limpiar y reconvertir
UPDATE obleas 
SET path_firma_receptor = NULL 
WHERE id = 9;

-- Luego ejecutar el script de conversión
node scripts/convertir-firmas-a-base64.js
```

---

### Problema 3: "URL externa"

**Causa:** Las imágenes están en otro servidor y puede haber problemas de CORS o acceso.

**Solución: Descargar y convertir a base64**

```javascript
// Script temporal para una oblea específica
const fetch = require('node-fetch')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function descargarYConvertir() {
  const url = 'https://ejemplo.com/firma.png'
  
  const response = await fetch(url)
  const buffer = await response.buffer()
  const base64 = buffer.toString('base64')
  const dataUrl = `data:image/png;base64,${base64}`
  
  await prisma.obleas.update({
    where: { id: 9 },
    data: { path_firma_receptor: dataUrl }
  })
  
  console.log('✅ Convertido!')
}

descargarYConvertir()
```

---

## 🧪 VERIFICAR QUE FUNCIONE

### 1. Después de convertir, probar el PDF:

```bash
# Desde PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/obleas/9/pdf" -OutFile "oblea-9.pdf"
start oblea-9.pdf

# O desde el navegador
http://localhost:3000/api/obleas/9/pdf
```

### 2. Ver logs del servidor:

Cuando generes el PDF, deberías ver:
```
🔍 Buscando oblea con ID: 9
✅ Oblea encontrada: { tiene_firma_receptor: true }
📸 Convirtiendo imágenes a base64...
✍️ Firma receptor: Convertida  <-- DEBE DECIR "Convertida"
✍️ Firma inspector: Convertida
📷 Foto oblea: Convertida
📝 Generando PDF...
✅ PDF generado exitosamente
```

**Si dice "Error" en lugar de "Convertida":**
- Las imágenes NO se están leyendo correctamente
- Ejecutar diagnóstico para ver el problema

---

## 📋 CHECKLIST DE VERIFICACIÓN

Antes de generar el PDF:

- [ ] Ejecutar diagnóstico: `node scripts/diagnosticar-obleas.js 9`
- [ ] Verificar que dice "Existe: ✅" para todas las imágenes
- [ ] Si no existen, ejecutar conversión: `node scripts/convertir-firmas-a-base64.js`
- [ ] Volver a ejecutar diagnóstico para confirmar
- [ ] Generar PDF y verificar que aparecen las imágenes

---

## 🆘 CASOS ESPECIALES

### Las imágenes están en otro servidor

```sql
-- Opción 1: Actualizar a URLs públicas completas
UPDATE obleas 
SET 
  path_firma_receptor = 'https://tuservidor.com/storage/firmas/firma_receptor_25.png',
  path_firma_inspector = 'https://tuservidor.com/storage/firmas/firma_inspector_25.png',
  path_foto = 'https://tuservidor.com/storage/obleas/foto_25.png'
WHERE id = 9;
```

### Las imágenes están en carpeta compartida de red

```javascript
// Ajustar el script de conversión con el path de red
const networkPath = '\\\\servidor\\shared\\firmas\\firma.png'
const buffer = fs.readFileSync(networkPath)
// ... resto del código
```

### Base de datos en producción

```bash
# Opción 1: Ejecutar script directamente en producción
ssh usuario@servidor
cd /var/www/tu-app
node scripts/convertir-firmas-a-base64.js

# Opción 2: Hacer dump, convertir local, subir
mysqldump -u user -p db > dump.sql
# Importar local, convertir, exportar
mysql -u user -p db < dump_convertido.sql
```

---

## 📊 ESTADOS POSIBLES

| Estado | Significado | Acción |
|--------|-------------|--------|
| ✅ base64 | Ya convertido, listo para usar | Ninguna |
| ✅ archivo local | Existe pero hay que convertir | Ejecutar script |
| ❌ archivo local (no encontrado) | Path incorrecto | Buscar archivo real o regenerar |
| ⚠️ URL externa | Puede funcionar o no | Probar o descargar y convertir |
| ⚪ vacío | No hay imagen | Subir imagen y actualizar BD |

---

## 💡 TIPS

1. **Siempre convertir a base64** para máxima compatibilidad
2. **Comprimir imágenes** antes de convertir (< 200KB por firma)
3. **Usar PNG con transparencia** para firmas
4. **Usar JPEG** para fotos
5. **Verificar que el campo no esté truncado** en la BD (debe ser TEXT o MEDIUMTEXT)

---

## 🚀 COMANDO DEFINITIVO

```bash
# Diagnosticar, convertir y probar en un solo paso:

# 1. Ver el problema
node scripts/diagnosticar-obleas.js 9

# 2. Convertir
node scripts/convertir-firmas-a-base64.js

# 3. Verificar
node scripts/diagnosticar-obleas.js 9

# 4. Generar PDF
curl http://localhost:3000/api/obleas/9/pdf --output oblea-9.pdf
start oblea-9.pdf
```

---

**¿Sigue sin funcionar?** Comparte la salida del script de diagnóstico y puedo ayudarte con el problema específico.
