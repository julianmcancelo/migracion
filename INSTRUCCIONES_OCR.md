# 🤖 Sistema OCR con Gemini AI

Sistema de reconocimiento óptico de caracteres usando Google Gemini para extraer datos automáticamente de documentos.

## 📋 Documentos Soportados

- ✅ **DNI Argentino** - Extrae nombre, DNI, CUIL, fecha nacimiento, domicilio
- ✅ **Cédula Verde/Azul** - Extrae dominio, marca, modelo, año, chasis, motor, titular
- 🔜 **Póliza de Seguro** - Próximamente
- 🔜 **Certificado VTV** - Próximamente

## 🚀 Configuración

### 1. Obtener API Key de Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Crea una API Key gratuita
3. Copia la key

### 2. Configurar Variables de Entorno

Agrega en tu archivo `.env.local`:

```env
GEMINI_API_KEY=tu_api_key_aqui
```

### 3. Instalar Dependencias

```bash
npm install @google/generative-ai
```

## 📱 Uso Básico

### En cualquier componente:

```tsx
import { OCRScanner } from '@/components/ocr-scanner'

function MiFormulario() {
  const handleDNIExtracted = (data) => {
    console.log('Datos del DNI:', data)
    // Llenar formulario automáticamente
    setNombre(data.nombre)
    setDNI(data.dni)
    setFechaNacimiento(data.fecha_nacimiento)
    // etc...
  }

  return (
    <OCRScanner 
      type="dni" 
      onDataExtracted={handleDNIExtracted}
      buttonText="Escanear DNI del Titular"
    />
  )
}
```

### Para Cédula de Vehículo:

```tsx
<OCRScanner 
  type="cedula" 
  onDataExtracted={(data) => {
    setDominio(data.dominio)
    setMarca(data.marca)
    setModelo(data.modelo)
    setAno(data.ano)
    setChasis(data.chasis)
    // etc...
  }}
/>
```

## 🎯 Página de Prueba

Accede a `/ocr-demo` en el panel para probar el sistema:
- `http://localhost:3000/ocr-demo`

## 📊 Estructura de Datos

### DNI Response:
```json
{
  "nombre": "Juan Pérez",
  "dni": "12345678",
  "sexo": "M",
  "fecha_nacimiento": "1990-01-15",
  "domicilio": "Calle Falsa 123, CABA",
  "fecha_emision": "2020-01-01",
  "fecha_vencimiento": "2035-01-01",
  "ejemplar": "A",
  "cuil": "20-12345678-9",
  "confianza": "Alta"
}
```

### Cédula Response:
```json
{
  "dominio": "ABC123",
  "marca": "Ford",
  "modelo": "Focus",
  "ano": "2018",
  "tipo": "Automóvil",
  "chasis": "ABC123456789",
  "motor": "XYZ789456",
  "titular": "Juan Pérez",
  "dni_titular": "12345678",
  "domicilio_titular": "Calle Falsa 123",
  "color": "Blanco",
  "confianza": "Alta"
}
```

## 🔧 APIs Disponibles

### POST /api/ai/ocr-dni
Procesa una imagen de DNI.

**Body:** `FormData` con campo `image` (File)

**Response:**
```json
{
  "success": true,
  "data": { /* datos del DNI */ }
}
```

### POST /api/ai/ocr-cedula
Procesa una imagen de cédula verde/azul.

**Body:** `FormData` con campo `image` (File)

**Response:**
```json
{
  "success": true,
  "data": { /* datos de la cédula */ }
}
```

## 💡 Consejos para Mejores Resultados

### Para el Usuario:
- ✅ Buena iluminación
- ✅ Documento completo en la foto
- ✅ Evitar reflejos y sombras
- ✅ Mantener documento plano
- ❌ No usar flash directo
- ❌ No fotos borrosas

### Para el Desarrollador:
- Validar siempre los datos extraídos
- Permitir edición manual si la IA se equivoca
- Mostrar nivel de confianza al usuario
- Guardar imágenes originales para auditoría

## 🔐 Seguridad

- ✅ Las imágenes NO se guardan en el servidor
- ✅ Solo se envían a Gemini API (Google)
- ✅ Los datos extraídos se devuelven al cliente
- ✅ Respeta las políticas de privacidad de Google

## 📈 Limitaciones de Uso

**Plan Gratuito de Gemini:**
- 60 requests por minuto
- 1500 requests por día
- Suficiente para uso normal

**Si necesitas más:**
- Upgrade a plan pago en Google AI Studio
- O implementar rate limiting

## 🎨 Integración en Formularios Existentes

### Ejemplo: Formulario de Personas

```tsx
// En tu formulario de personas, agrega:
const [showOCR, setShowOCR] = useState(false)

return (
  <div>
    <Button onClick={() => setShowOCR(!showOCR)}>
      📸 Escanear DNI con IA
    </Button>

    {showOCR && (
      <OCRScanner 
        type="dni"
        onDataExtracted={(data) => {
          // Llenar formulario
          form.setValue('nombre', data.nombre)
          form.setValue('dni', data.dni)
          form.setValue('fecha_nacimiento', data.fecha_nacimiento)
          setShowOCR(false)
        }}
      />
    )}

    {/* Resto del formulario... */}
  </div>
)
```

## 🚀 Próximas Mejoras

- [ ] OCR de pólizas de seguro
- [ ] OCR de certificados de VTV
- [ ] OCR de licencias de conducir
- [ ] Validación cruzada con bases de datos
- [ ] Detección de documentos falsos
- [ ] OCR multiidioma
- [ ] Batch processing (múltiples documentos)

## 📞 Soporte

Si tienes problemas:
1. Verifica que `GEMINI_API_KEY` esté configurada
2. Revisa los logs del servidor
3. Prueba en `/ocr-demo` primero
4. Verifica que la imagen sea clara y legible

---

**Powered by Google Gemini 1.5 Flash** 🚀
