# 📄 Generador de Documentos Word - Sistema de Resoluciones

## 🎯 Funcionalidad Implementada

Sistema completo para generar documentos Word (.docx) de resoluciones de habilitación, replicando la funcionalidad del sistema PHP original.

## ✅ Características

- ✅ Generación de documentos Word desde plantillas
- ✅ Soporte para Escolar y Remis (plantillas diferentes)
- ✅ Validación de datos requeridos
- ✅ Formulario automático para completar datos faltantes
- ✅ Lógica de género (tratamiento masculino/femenino)
- ✅ Formateo automático de fechas y números
- ✅ Descarga directa del documento generado

## 📦 Librerías Instaladas

```bash
npm install docxtemplater pizzip file-saver
```

## 📂 Estructura Creada

```
migracion/
├── app/
│   ├── api/
│   │   └── habilitaciones/
│   │       └── [id]/
│   │           └── generar-resolucion/
│   │               └── route.ts          # API para generar documento
│   └── (panel)/
│       └── habilitaciones/
│           └── [id]/
│               └── generar-resolucion/
│                   └── page.tsx           # Página del panel
└── public/
    └── plantillas/
        ├── resolucion_escolar_template.docx  ⚠️ COPIAR
        └── resolucion_remis_template.docx    ⚠️ COPIAR
```

## ⚠️ ACCIÓN REQUERIDA - Copiar Plantillas

**IMPORTANTE:** Debes copiar manualmente las plantillas Word del proyecto PHP:

### Paso 1: Copiar Plantillas

```bash
# Desde la carpeta del proyecto PHP
copy plantillas\resolucion_escolar_template.docx migracion\public\plantillas\
copy plantillas\resolucion_remis_template.docx migracion\public\plantillas\
```

### Paso 2: Verificar

Las plantillas deben estar en:
- `public/plantillas/resolucion_escolar_template.docx`
- `public/plantillas/resolucion_remis_template.docx`

## 🔧 Placeholders en las Plantillas

Los documentos Word deben contener estos marcadores:

### Generales:
- `{fecha_larga}` - Fecha completa en español
- `{resolucion_nro}` - Número de resolución
- `{expediente_nro}` - Número de expediente
- `{licencia_nro}` - Número de licencia

### Titular:
- `{tratamiento}` - "el Señor" / "la Señora"
- `{propiedad_de}` - "del Señor" / "de la Señora"
- `{domiciliada}` - "domiciliado" / "domiciliada"
- `{titular_nombre}` - Nombre completo
- `{titular_dni}` - DNI formateado
- `{titular_domicilio_calle}` - Calle y número
- `{titular_domicilio_localidad}` - Localidad

### Vehículo:
- `{vehiculo_marca}` - Marca
- `{vehiculo_modelo}` - Modelo
- `{vehiculo_anho}` - Año
- `{vehiculo_dominio}` - Patente
- `{vehiculo_tipo}` - Tipo de vehículo
- `{vehiculo_motor}` - Número de motor
- `{vehiculo_inscripcion_inicial}` - Fecha inscripción

### Remis (opcional):
- `{nombre_remiseria}`, `{expte_remiseria}`, `{cuenta_remiseria}`, `{domicilio_remiseria}`

## 🚀 Uso

### Desde el Panel:

1. Ir a la habilitación que quieras generar
2. Click en "Generar Resolución"
3. Si faltan datos, completar el formulario
4. El documento se descarga automáticamente

### API Directa:

```bash
GET /api/habilitaciones/{id}/generar-resolucion
```

**Respuesta:**
- ✅ **200** - Descarga el archivo .docx
- ⚠️ **400** - Faltan datos (devuelve JSON con campos faltantes)
- ❌ **404** - Habilitación no encontrada
- ❌ **500** - Error al generar

## 📋 Campos Validados

El sistema valida que existan estos datos antes de generar:

1. **Titular:**
   - DNI
   - Domicilio (calle)
   - Localidad

2. **Vehículo:**
   - Dominio/Patente
   - Marca
   - Modelo
   - Año

3. **Habilitación:**
   - Número de expediente
   - Número de licencia

## 🔄 Flujo de Trabajo

```
1. Usuario solicita generar resolución
         ↓
2. Sistema consulta datos de BD
         ↓
3. ¿Faltan datos?
   ├─ SÍ → Muestra formulario para completar
   │        ↓
   │   Usuario completa datos
   │        ↓
   │   Sistema actualiza BD
   │        ↓
   └─ NO → Continúa
         ↓
4. Carga plantilla según tipo (Escolar/Remis)
         ↓
5. Reemplaza placeholders con datos
         ↓
6. Genera archivo .docx
         ↓
7. Descarga automática
```

## 🎨 Diseño del Formulario

- ✅ Diseño moderno con TailwindCSS
- ✅ Validación en frontend
- ✅ Estados de loading
- ✅ Mensajes de error claros
- ✅ Pre-llenado con datos existentes

## 📝 Notas Técnicas

- **docxtemplater** - Reemplaza placeholders en Word
- **pizzip** - Maneja archivos .docx (que son ZIP)
- **file-saver** - Descarga archivos en el cliente
- Funciona en servidor (API Route) usando `fs` de Node.js
- Formato de fecha en español
- DNI con formato de puntos

## 🔐 Seguridad

- ✅ Validación de ID de habilitación
- ✅ Sanitización de datos
- ✅ Manejo de errores robusto
- ✅ Solo usuarios autenticados del panel

## ⚡ Performance

- Generación del lado del servidor
- No carga plantillas en memoria hasta que se necesitan
- Descarga directa sin almacenar en disco

## 🧪 Testing

Para probar:
1. Crear/editar una habilitación
2. Ir a generar resolución
3. Verificar que se descarga el .docx
4. Abrir el archivo y verificar que los datos son correctos

---

**✅ Sistema listo para usar una vez copiadas las plantillas!**
