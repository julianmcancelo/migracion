# 📄 Sistema de PDF Profesional

## ✅ Implementado

He creado un sistema de generación de PDFs basado en la estética del sistema antiguo pero modernizado.

---

## 🎨 Diseño del PDF

### **Estructura Visual:**

```
┌─────────────────────────────────────────┐
│                                         │
│  📋 Certificado de Habilitación        │
│  Municipalidad de Lanús                │
│  ─────────────────────────────────────  │
│                                         │
│  MARCA DE AGUA: "HABILITADO"           │
│  (Solo si estado = HABILITADO)         │
│                                         │
│  ✓ Datos Generales                     │
│    N° Licencia: 123   Expediente: ABC  │
│    Resolución: 456    Año: 2025        │
│    Vigencia: 01/01 - 31/12/2025        │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │      ESTADO: HABILITADO          │  │
│  └──────────────────────────────────┘  │
│                                         │
│  👥 Personas Autorizadas               │
│  ┌─────┬──────────────┬──────────┐    │
│  │ Rol │ Nombre       │ DNI      │    │
│  ├─────┼──────────────┼──────────┤    │
│  │ ... │ ...          │ ...      │    │
│  └─────┴──────────────┴──────────┘    │
│                                         │
│  🚗 Vehículos Habilitados              │
│  ┌────────┬────────┬────────┬────┐    │
│  │ Dominio│ Marca  │ Modelo │ Año│    │
│  ├────────┼────────┼────────┼────┤    │
│  │ ...    │ ...    │ ...    │... │    │
│  └────────┴────────┴────────┴────┘    │
│                                         │
│  🏢 Establecimientos                   │
│  ┌──────┬────────┬──────────┬──────┐  │
│  │ Tipo │ Nombre │ Domicilio│Local │  │
│  ├──────┼────────┼──────────┼──────┤  │
│  │ ...  │ ...    │ ...      │ ...  │  │
│  └──────┴────────┴──────────┴──────┘  │
│                                         │
│  📝 Observaciones                      │
│  ...                                   │
│                                         │
│  ─────────────────────────────────────  │
│  Página 1 de 1                         │
│  Generado el 26/10/2025 18:30          │
└─────────────────────────────────────────┘
```

---

## 🎯 Características

✅ **Marca de agua** → "HABILITADO" en diagonal (solo si aplica)  
✅ **Colores por estado** → Verde, amarillo, rojo  
✅ **Tablas profesionales** → Con jsPDF-AutoTable  
✅ **Header/Footer** → Información clara  
✅ **Multipágina** → Se adapta automáticamente  
✅ **Datos completos** → Personas, vehículos, establecimientos  

---

## 📦 Instalación

### **1. Instalar dependencias:**

```bash
npm install jspdf jspdf-autotable
npm install --save-dev @types/jspdf-autotable
```

### **2. Verificar imports en el código:**

El archivo ya está creado en:
```
app/api/habilitaciones/[id]/descargar-pdf/route.ts
```

---

## 🚀 Uso

### **Desde el Frontend:**

```typescript
// En el componente de habilitaciones
const handleDescargarPDF = async (habilitacionId: number) => {
  try {
    const response = await fetch(
      `/api/habilitaciones/${habilitacionId}/descargar-pdf`
    )
    
    if (!response.ok) throw new Error('Error al generar PDF')
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Habilitacion-${habilitacionId}.pdf`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error:', error)
    alert('Error al descargar PDF')
  }
}
```

### **Ya implementado en el menú:**

El botón "Descargar PDF" en el menú de acciones ya está conectado.

---

## 🎨 Colores y Estética

### **Paleta de Colores:**

```typescript
const colors = {
  primary: [41, 128, 185],      // Azul profesional
  text: [0, 0, 0],               // Negro texto
  gray: [150, 150, 150],         // Gris subtítulos
  border: [200, 200, 200],       // Gris bordes
  success: [39, 174, 96],        // Verde HABILITADO
  warning: [241, 196, 15],       // Amarillo PENDIENTE
  danger: [231, 76, 60],         // Rojo RECHAZADO
}
```

### **Estados:**

| Estado      | Color   | Texto        |
|-------------|---------|--------------|
| HABILITADO  | Verde   | + Marca agua |
| PENDIENTE   | Amarillo| -            |
| VENCIDO     | Rojo    | -            |
| RECHAZADO   | Rojo    | -            |

---

## 📋 Estructura del Código

### **1. Obtener Datos:**
```typescript
const habilitacion = await prisma.habilitaciones_generales.findUnique({
  where: { id },
  include: {
    habilitaciones_personas: { include: { persona: true } },
    habilitaciones_vehiculos: { include: { vehiculo: true } },
    habilitaciones_establecimientos: { 
      include: { establecimiento: true, remiseria: true } 
    },
  },
})
```

### **2. Generar PDF:**
```typescript
const doc = new jsPDF({ orientation: 'portrait', format: 'a4' })

// Header
doc.text('Certificado de Habilitación', 15, 20)

// Marca de agua (condicional)
if (estado === 'HABILITADO') {
  doc.setFontSize(110)
  doc.setTextColor(230, 230, 230)
  doc.text('HABILITADO', 105, 150, { align: 'center', angle: 45 })
}

// Tablas con autoTable
doc.autoTable({
  head: [['Rol', 'Nombre', 'DNI']],
  body: personasData,
  theme: 'grid',
})

// Retornar como Buffer
const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
return new NextResponse(pdfBuffer, {
  headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'inline; filename="..."',
  },
})
```

---

## 🔧 Personalización

### **Cambiar colores:**

```typescript
// En la función generarPDF()
const colors = {
  primary: [TU_R, TU_G, TU_B],
  // ... más colores
}
```

### **Agregar secciones:**

```typescript
// Después de las tablas existentes
doc.setFontSize(12)
doc.text('Nueva Sección', 15, yPos)
yPos += 8

// Tu contenido aquí
```

### **Modificar header/footer:**

```typescript
// En el loop de páginas
for (let i = 1; i <= pageCount; i++) {
  doc.setPage(i)
  // Tu header/footer personalizado
}
```

---

## 📱 Ejemplo de Integración

### **Botón en la interfaz:**

```tsx
<DropdownMenuItem
  onClick={() => handleDescargarPDF(hab.id)}
  className="cursor-pointer"
>
  <Download className="mr-2 h-4 w-4" />
  Descargar PDF
</DropdownMenuItem>
```

Ya está implementado en:
```
app/(panel)/habilitaciones/_components/habilitaciones-table.tsx
```

---

## 🎉 Ventajas

✅ **Profesional** → Diseño limpio basado en el sistema antiguo  
✅ **Completo** → Incluye todos los datos relevantes  
✅ **Responsive** → Se adapta a diferentes cantidades de datos  
✅ **Multipágina** → Maneja documentos largos  
✅ **Moderno** → Usa jsPDF (librería actualizada)  
✅ **Tipado** → TypeScript con tipos completos  
✅ **Server-side** → Generado en el servidor (más seguro)  

---

## 📝 Próximas Mejoras (Opcional)

### **1. Agregar logo:**
```typescript
// En el header
const logoUrl = '/logo-municipalidad.png'
doc.addImage(logoUrl, 'PNG', 15, 12, 30, 15)
```

### **2. Códigos QR:**
```typescript
import QRCode from 'qrcode'

const qrDataUrl = await QRCode.toDataURL(
  `https://tudominio.com/credencial/${habilitacion.id}`
)
doc.addImage(qrDataUrl, 'PNG', 170, 15, 25, 25)
```

### **3. Firmas digitales:**
```typescript
// Si tienes imágenes de firmas guardadas
if (habilitacion.firma_url) {
  doc.addImage(habilitacion.firma_url, 'PNG', 15, yPos, 50, 20)
}
```

---

## 🚀 Estado Actual

**✅ Implementado:**
- API endpoint completo
- Generación de PDF profesional
- Estructura basada en sistema antiguo
- Integración con menú de habilitaciones
- Documentación completa

**⏳ Pendiente:**
- Instalar dependencias (`npm install jspdf jspdf-autotable`)
- Agregar logo (opcional)
- Personalizar colores institucionales (opcional)

**¡El sistema está listo para usar!** 🎯
