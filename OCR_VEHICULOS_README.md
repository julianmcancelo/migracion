# 🤖 OCR Automático para Títulos de Vehículos

## 📋 Descripción

Sistema de reconocimiento óptico de caracteres (OCR) usando **Gemini 2.0 Flash** para extraer automáticamente datos de títulos y cédulas de vehículos desde **imágenes (JPG, PNG) o archivos PDF**.

---

## ✨ Características

- ✅ **Extracción automática** de datos del título
- ✅ **Múltiples formatos** - JPG, PNG y PDF
- ✅ **IA de Google (Gemini 2.0 Flash)** - Rápido y económico
- ✅ **Autocompletado inteligente** del formulario
- ✅ **Detección de múltiples campos**:
  - Dominio (Patente)
  - Marca
  - Modelo
  - Tipo de vehículo
  - Año
  - Número de chasis
  - Número de motor
  - Cantidad de asientos

---

## 🎯 Flujo de Uso

### **1. Desde la Página de Vehículos:**

```
1. Click en "+ Nuevo Vehículo"
2. En el modal, click en "📸 Subir Título (Foto o PDF)"
3. Seleccionar archivo:
   - Imagen: JPG, PNG (máx 5MB)
   - PDF: Archivo PDF (máx 10MB)
4. ⏳ IA procesa el documento (5-15 segundos)
5. ✅ Formulario se completa automáticamente
6. Revisar datos y confirmar
7. Click en "Registrar Vehículo"
```

### **2. Desde Cambio de Material:**

```
1. Buscar vehículo que no existe
2. Click en "🤖 Registrar con OCR Automático"
3. Redirige a página de vehículos
4. Seguir flujo anterior
5. Volver y buscar el vehículo recién creado
```

---

## 🔧 Implementación Técnica

### **Endpoint API**

```typescript
POST /api/ocr/titulo-vehiculo
Content-Type: multipart/form-data

Body:
- file: File (imagen JPG/PNG o archivo PDF del título)

Límites:
- Imágenes: Máximo 5MB
- PDFs: Máximo 10MB

Response:
{
  "success": true,
  "data": {
    "dominio": "ABC123",
    "marca": "FORD",
    "modelo": "TRANSIT",
    "tipo": "MINIBUS",
    "ano": 2020,
    "chasis": "8AFXXMPH9LJ123456",
    "motor": "JXFA123456",
    "asientos": 15
  },
  "message": "Datos extraídos correctamente"
}
```

### **Modelo de IA**

- **Modelo:** `gemini-2.0-flash-exp`
- **Capacidad:** Visión + Texto
- **Ventajas:**
  - ⚡ 10x más rápido que Gemini Pro
  - 💰 Más económico
  - 🎯 Alta precisión en documentos estructurados

---

## 📸 Recomendaciones para Mejores Resultados

### **✅ BUENAS PRÁCTICAS:**

**Para Imágenes (JPG, PNG):**
1. **Iluminación clara** - Sin sombras
2. **Imagen enfocada** - Texto legible
3. **Ángulo frontal** - Sin perspectiva
4. **Alta resolución** - Mínimo 1080p
5. **Sin reflejos** - Evitar flash directo
6. **Documento completo** - Todos los campos visibles

**Para PDFs:**
1. **PDF original** - Preferir PDF nativo sobre escaneado
2. **Texto seleccionable** - Mejor que imagen escaneada
3. **Buena calidad** - Si es escaneado, mínimo 300 DPI
4. **Orientación correcta** - Documento derecho
5. **Sin protección** - No usar PDFs con restricciones

### **❌ EVITAR:**

- Imágenes borrosas o movidas
- PDFs muy pesados (>10MB)
- Luz insuficiente o excesiva
- Ángulos muy inclinados
- Documentos dañados o ilegibles
- Fotos/escaneos de baja resolución
- PDFs con múltiples documentos mezclados

---

## 🔐 Seguridad

- ✅ **Autenticación requerida** - Solo usuarios logueados
- ✅ **Validación de archivos** - Solo imágenes (máx 5MB) y PDFs (máx 10MB)
- ✅ **Sin almacenamiento** - Los archivos no se guardan en el servidor
- ✅ **Procesamiento temporal** - Datos en memoria, se borran después
- ✅ **Tipos permitidos** - Solo JPG, PNG y PDF

---

## 🐛 Troubleshooting

### **Problema: "No se pudo detectar el dominio"**

**Causas:**
- Imagen muy borrosa
- Dominio tapado u oculto
- Formato de documento no reconocido

**Solución:**
- Tomar nueva foto más clara
- Asegurar que el dominio sea visible
- Completar manualmente si persiste

### **Problema: "Error al procesar la imagen/PDF"**

**Causas:**
- Archivo muy grande (>5MB para imágenes, >10MB para PDFs)
- Formato no soportado
- PDF protegido o encriptado
- Error de conexión

**Solución:**
- Comprimir archivo
- Usar formatos permitidos: JPG, PNG o PDF
- Remover protección del PDF
- Reintentar con conexión estable

### **Problema: "PDF no se lee correctamente"**

**Causas:**
- PDF escaneado de baja calidad
- PDF con múltiples páginas
- Documento rotado incorrectamente

**Solución:**
- Usar PDF nativo (generado digitalmente) si es posible
- Extraer solo la página del título
- Rotar el documento antes de subirlo
- Convertir a imagen JPG de alta calidad

### **Problema: Datos incorrectos**

**Causas:**
- Documento con formato inusual
- Texto mal impreso
- OCR interpretó mal

**Solución:**
- **SIEMPRE revisar** los datos extraídos
- Corregir manualmente antes de guardar
- El OCR es una ayuda, no reemplaza la verificación

---

## 📊 Campos Extraídos

| Campo | Obligatorio | Tipo | Ejemplo |
|-------|-------------|------|---------|
| **Dominio** | ✅ SÍ | String | ABC123, AA123BB |
| **Marca** | ❌ No | String | FORD, MERCEDES BENZ |
| **Modelo** | ❌ No | String | TRANSIT, SPRINTER |
| **Tipo** | ❌ No | String | MINIBUS, SEDÁN |
| **Año** | ❌ No | Number | 2020 |
| **Chasis** | ❌ No | String | 8AFXXMPH9LJ123456 |
| **Motor** | ❌ No | String | JXFA123456 |
| **Asientos** | ❌ No | Number | 15 |

---

## 💰 Costo Estimado

Con **Gemini 2.0 Flash**:

- **Input:** ~$0.075 por 1M tokens
- **Output:** ~$0.30 por 1M tokens
- **Promedio por imagen:** ~0.5 tokens = **~$0.0002 por escaneo**

**Aproximadamente 5000 escaneos por $1 USD** 💸

---

## 🚀 Futuras Mejoras

- [ ] Soporte para múltiples páginas
- [ ] Detección de RTO/RPA
- [ ] Extraer fechas de vencimiento
- [ ] Validación cruzada con DNRPA
- [ ] Historial de escaneos
- [ ] Modo offline con caché

---

## 📝 Notas Importantes

⚠️ **SIEMPRE VERIFICAR LOS DATOS EXTRAÍDOS**

El OCR es una herramienta de ayuda para agilizar la carga, pero NO es 100% preciso.

✅ **RESPONSABILIDAD DEL USUARIO:**
- Revisar todos los campos
- Confirmar que los datos sean correctos
- Corregir cualquier error antes de guardar

---

## 📞 Soporte

Si encuentras problemas con el OCR:

1. Verifica que la imagen sea clara
2. Intenta con mejor iluminación
3. Si persiste, completa manualmente
4. Reporta el caso para mejorar el modelo

---

**Implementado con ❤️ usando Gemini 2.0 Flash**
