# 📋 Certificado de Verificación Vehicular - Transporte Escolar

## ✅ Implementado

He creado un sistema completo para generar **Certificados de Verificación Vehicular** específicos para transporte escolar, con diseño profesional y todos los ítems requeridos en una sola página.

---

## 🎨 Diseño del Certificado

### **Estructura Visual (1 Página A4):**

```
┌──────────────────────────────────────────────┐
│ ██████████████████████████████████████████  │ ← Header Bordo
│ CERTIFICADO DE VERIFICACIÓN VEHICULAR       │
│ Subsecretaria de Ordenamiento Urbano        │
│ Dirección Gral. de Movilidad y Transporte   │
│                          Fecha: 26/10/2025  │
├──────────────────────────────────────────────┤
│ Expediente N°: XXX    Licencia N°: XXX      │
│ Tipo: HABILITACIÓN    Transporte: Escolar   │
│                                             │
│ Titular                                      │
│ Nombre: JUAN GARCÍA                         │
│ DNI: 12345678                               │
│ Domicilio: Calle 123, Lanús                 │
│                                             │
│ Conductor                                    │
│ Nombre: MARÍA LÓPEZ                         │
│ DNI: 87654321                               │
│                                             │
│ Vehículo                                     │
│ Dominio: ABC123                             │
│ Marca: Ford     Modelo: Transit             │
│ Inscripción Inicial: 01/01/2020             │
│                                             │
│ DETALLES Y OBSERVACIONES DEL VEHÍCULO       │
│ ┌────────────┬──┬───┬───┬────────────────┐ │
│ │Descripción │B │R  │M  │Observaciones   │ │
│ ├────────────┼──┼───┼───┼────────────────┤ │
│ │Pta. acc... │✓ │   │   │                │ │
│ │Pta. acc... │✓ │   │   │                │ │
│ │Salida Emer.│  │✓  │   │Revisar         │ │
│ │... (13 items en total)                  │ │
│ └────────────┴──┴───┴───┴────────────────┘ │
│                                             │
│ __________________    __________________    │
│ Firma Interesado      Firma Verificador    │
└──────────────────────────────────────────────┘
```

---

## 📝 Items de Verificación (13 Obligatorios)

1. Pta. accionada cond. para desc./ asc. (Puerta derecha)
2. Pta. accionada cond. para desc./ asc. (Puerta izquierda)
3. Salida de Emer. indep. de laplataf. asc. / desc. (En Caso de Combi - L. Der. y Trasero)
4. Vent. Vidrio Temp. / inastillable (Apertura 10 cm)
5. Pisos rec. con mat. Antideslizantes
6. Dimens. de Banquetas ( desde el piso 0.40 mts - ancho min 0.45mts Prof. medida horiz. 0.40 mts)
7. Asientos: Fijos, Acolchados, Estructu. metalicas, revestimiento (Caucho o similar )
8. Puerta Izquierda de la Carroceria
9. Cinturones de Seguridad en todos los asientos
10. Cabezales o apoya Cabeza en todos los asientos
11. Espacios Libres
12. Pintura ( Carroceria baja y capot naranja Nº 1054 IRAM - carroceria altatecho y parantes Color blanco)
13. Leyenda de Escolares o Niños Tamaño minimo : 0,20 mts

---

## 🎯 Archivos Creados

### **1. `components/habilitaciones/certificado-verificacion-pdf.tsx`**
Componente cliente para generar el PDF:

```typescript
export function generarCertificadoVerificacionPDF(datos: DatosVerificacion): jsPDF
```

**Características:**
- Genera PDF en el **navegador** (no en el servidor)
- Header con fondo bordo (color institucional)
- Información organizada en 2 columnas
- Tabla con 13 items predefinidos
- Columnas: Descripción, Bien, Regular, Mal, Observaciones
- Espacios para firmas
- Todo en 1 página A4

### **2. `app/api/habilitaciones/[id]/certificado-verificacion/route.ts`**
Endpoint API para obtener datos del certificado:

```typescript
GET /api/habilitaciones/[id]/certificado-verificacion
```

**Retorna:**
```json
{
  "success": true,
  "data": {
    "expediente": "...",
    "licencia": "...",
    "titularNombre": "...",
    // ... más datos
  }
}
```

**Validaciones:**
- Solo para `tipo_transporte === 'Escolar'`
- Verifica que exista titular
- Verifica que exista vehículo
- Maneja datos opcionales (conductor)

### **3. Botón en el menú** (habilitaciones-table.tsx)
Agregado condicionalmente para transporte escolar:

```typescript
{hab.tipo_transporte === 'Escolar' && (
  <DropdownMenuItem onClick={() => handleDescargarCertificado(hab)}>
    <ClipboardCheck className="mr-2 h-4 w-4" />
    Certificado Verificación
  </DropdownMenuItem>
)}
```

**Proceso:**
1. Obtiene datos desde API (JSON)
2. Importa dinámicamente la función de generación
3. Genera PDF en el navegador
4. Descarga automáticamente

---

## 🚀 Cómo Usar

### **Desde la interfaz:**

1. Ir a lista de habilitaciones
2. Buscar una habilitación de **Transporte Escolar**
3. Click en menú (⋮)
4. Click en "**Certificado Verificación**"
5. Se descarga el PDF automáticamente

---

## 📊 Datos que Incluye

### **De la Habilitación:**
- Número de expediente
- Número de licencia
- Tipo de habilitación
- Tipo de transporte

### **Del Titular:**
- Nombre completo
- DNI
- Domicilio (calle + nro + localidad)

### **Del Conductor (opcional):**
- Nombre completo
- DNI

### **Del Vehículo:**
- Dominio
- Marca
- Modelo
- Inscripción inicial

### **Ítems de Verificación:**
- 13 items predefinidos
- Columnas para marcar: Bien/Regular/Mal
- Campo de observaciones por item

---

## 🎨 Diseño Profesional

### **Colores:**
- **Header:** Bordo (#8B0000) con texto blanco
- **Títulos de sección:** Bordo
- **Tabla:** Bordes grises suaves
- **Texto:** Negro para datos, gris para labels

### **Tipografía:**
- Header: Helvetica Bold 16pt
- Subtítulos: Helvetica Bold 10pt
- Datos: Helvetica Normal 9pt
- Tabla: Helvetica 7-8pt (optimizada para espacio)

### **Layout:**
- Márgenes: 15mm
- 2 columnas para datos principales
- Tabla de ancho completo
- Firmas centradas al pie

---

## 🔧 Personalización Futura

### **Para agregar items de verificación:**

Editar en `lib/certificado-verificacion-escolar.ts`:

```typescript
const ITEMS_ESCOLAR = [
  // ... items existentes ...
  'Nuevo item a verificar',
]
```

### **Para modificar colores:**

```typescript
doc.setFillColor(139, 0, 0) // Cambiar RGB del bordo
```

### **Para integrar con BD de inspecciones:**

El sistema ya está preparado para recibir datos de inspecciones:

```typescript
interface DatosVerificacion {
  // ... campos existentes ...
  items?: Array<{
    descripcion: string
    estado: 'bien' | 'regular' | 'mal' | null
    observaciones?: string
  }>
}
```

Si se pasan `items` con datos, los checkmarks (✓) aparecerán automáticamente en las columnas correspondientes.

---

## ✅ Validaciones Implementadas

### **En el endpoint API:**

1. **Usuario autenticado** → `getSession()`
2. **ID válido** → `parseInt(params.id)`
3. **Habilitación existe** → Prisma query
4. **Es transporte escolar** → `tipo_transporte === 'Escolar'`
5. **Tiene titular** → Required
6. **Tiene vehículo** → Required
7. **Datos de persona no nulos** → Type guards

---

## 📱 Integración con el Sistema

### **Ubicación en el menú:**

```
Menú Habilitación (⋮)
  👁️  Ver Detalle
  ✏️  Editar
  ─────────────────
  🎫 Ver Credencial
  📄 Ver Resolución
  📥 Descargar PDF
  📋 Certificado Verificación  ← NUEVO (solo escolar)
  ─────────────────
  🔄 Gestión  ►
  ─────────────────
  🤖 Consultar con IA
```

---

## 🎉 Resultado Final

Un certificado profesional que:

✅ **Se ajusta a 1 página** → No desperdicia papel  
✅ **Incluye todos los ítems requeridos** → 13 items  
✅ **Diseño institucional** → Color bordo, logo preparado  
✅ **Datos completos** → Titular, conductor, vehículo  
✅ **Listo para firmar** → Espacios para firmas  
✅ **Fácil de generar** → 1 click desde el menú  
✅ **Solo para escolar** → Validación automática  

**¡Certificado de verificación profesional listo para usar!** 📋✨
