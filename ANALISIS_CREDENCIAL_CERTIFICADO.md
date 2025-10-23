# 🎫 Análisis: Sistema de Credenciales y Certificados

## 📋 SISTEMA ACTUAL (PHP)

### 1. **CREDENCIAL DIGITAL (`credencial.php`)**

#### **🔐 Sistema de Tokens de Acceso**

```sql
tokens_acceso
├── token (string único)
├── habilitacion_id
├── fecha_expiracion
└── estado
```

**Funcionalidad:**

- Genera un token único para cada habilitación
- Token con URL: `https://credenciales.transportelanus.com.ar/credencial.php?token=ABC123`
- Validación de expiración automática
- Acceso público sin login

#### **📄 Contenido de la Credencial:**

**A. Header Institucional**

- Logo de Municipalidad de Lanús
- Gradiente rojo institucional (#891628)
- Marca de agua "LANÚS"
- Badge de estado (Habilitado/En Trámite/Vencido)

**B. Datos de la Habilitación**

- Tipo de transporte (ESCOLAR/REMIS)
- Número de licencia (grande, destacado)
- Vigencia inicio/fin
- Tipo de trámite
- Fecha de emisión digital

**C. Titular**

- Foto (70x85px, redondeada)
- Nombre completo
- DNI
- CUIT (solo para Remis)

**D. Vehículo Afectado**

- Dominio (destacado, fondo amarillo)
- Marca, modelo, año
- Chasis
- Motor
- Asientos
- **Aseguradora + Póliza**
- **Vencimiento VTV** (con colores de alerta)
- **Vencimiento Póliza** (con colores de alerta)

**E. Conductores** (múltiples)

- Foto de cada conductor
- Nombre, DNI
- Categoría de licencia

**F. Celadores** (solo Escolar, múltiples)

- Foto de cada celador
- Nombre, DNI

**G. Establecimiento/Remisería**

- Nombre
- Dirección
- Localidad

**H. QR Code de Verificación**

- Código QR grande (140x140px)
- Enlace al mismo token
- Texto: "Verifique autenticidad escaneando el código"

**I. Acciones**

- Botón: Imprimir Credencial
- Botón: Copiar Enlace

#### **🎨 Diseño Visual:**

```css
- Fondo celeste claro (#DCEEFB)
- Card blanco con sombra elevada
- Gradiente rojo institucional en header
- Vencimientos con código de colores:
  * Verde: Vigente (más de 30 días)
  * Amarillo: Por vencer (menos de 30 días)
  * Rojo pulsante: Vencido
- Dominio con badge amarillo destacado
- Fotos con bordes blancos y sombra
- QR con borde blanco y sombra
```

---

### 2. **CERTIFICADO DE VERIFICACIÓN (`descargar_certificado.php`)**

#### **📄 Contenido del Certificado:**

**A. Header**

- Logo institucional
- Título: "CERTIFICADO DE VERIFICACIÓN VEHICULAR"
- Fecha y hora del turno (último turno registrado)

**B. Datos Generales** (barra superior)

- Expediente N°
- Licencia N°
- Tipo de habilitación
- Tipo de transporte

**C. Información en Grid**

- **Titular**: Nombre, DNI, Domicilio
- **Conductor**: Nombre, DNI
- **Vehículo**: Dominio, Marca, Modelo, Inscripción inicial

**D. Tabla de Verificación Técnica**

Checklist con columnas:

- Descripción
- Bien
- Regular
- Mal
- Observaciones

**Items verificados:**

1. Puerta accionada conductor (derecha)
2. Puerta accionada conductor (izquierda)
3. Salida de emergencia
4. Ventanas (vidrio templado, apertura 10cm)
5. Pisos antideslizantes
6. Dimensiones de banquetas
7. Asientos (fijos, acolchados)
8. Puerta izquierda carrocería
9. Cinturones de seguridad (todos)
10. Cabezales apoya cabeza (todos)
11. Espacios libres
12. Pintura (naranja/blanco según reglamento)
13. Leyenda "Escolares" o "Niños" (tamaño mínimo)

**E. Firmas**

- Firma del interesado
- Firma del agente verificador

#### **💾 Tecnología:**

- **html2pdf.js** - Generación de PDF desde HTML
- Diseño A4 (210mm x 297mm)
- Descarga automática al cargar la página
- Se cierra automáticamente tras descarga

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### **Sprint 1: Sistema de Credenciales (1-2 semanas)**

#### **Fase 1: Backend**

**1.1. Tabla de Tokens**

```prisma
model tokens_acceso {
  id                 Int       @id @default(autoincrement())
  token              String    @unique @default(uuid())
  habilitacion_id    Int
  fecha_expiracion   DateTime
  fecha_creacion     DateTime  @default(now())
  habilitacion       habilitaciones_generales @relation(fields: [habilitacion_id], references: [id])

  @@index([token])
  @@index([habilitacion_id])
}
```

**1.2. API Routes necesarias:**

```
POST   /api/habilitaciones/[id]/generar-token
  → Genera token con expiración (30 días)
  → Retorna URL completa

GET    /api/credenciales/verificar?token=xxx
  → Valida token y fecha
  → Retorna datos completos para credencial

POST   /api/habilitaciones/[id]/reenviar-credencial
  → Genera nuevo token
  → Envía email con enlace
```

**1.3. Modificar Schema de Vehículos**

```prisma
model vehiculos {
  // ... campos existentes
  Aseguradora       String?
  poliza            String?
  Vencimiento_VTV   DateTime?
  Vencimiento_Poliza DateTime?
}
```

#### **Fase 2: Frontend Público**

**2.1. Página Pública de Credencial**

```
/credencial/[token]/page.tsx
  → Sin autenticación
  → Valida token del server side
  → Muestra credencial completa
  → Genera QR con qrcode.react
```

**Componentes:**

- `CredencialCard.tsx` - Card principal
- `PersonaBlock.tsx` - Bloque de persona con foto
- `VehiculoInfo.tsx` - Info del vehículo
- `QRVerificacion.tsx` - QR code
- `EstadoBadge.tsx` - Badge de estado con colores

**2.2. Funcionalidades:**

- ✅ Imprimir credencial (CSS print-friendly)
- ✅ Copiar enlace al portapapeles
- ✅ QR code dinámico
- ✅ Responsive design
- ✅ Colores de alerta en vencimientos

#### **Fase 3: Panel Administrativo**

**3.1. Agregar en Detalle de Habilitación**

```tsx
<Button onClick={handleGenerarCredencial}>
  <QrCode className="mr-2 h-4 w-4" />
  Generar Credencial Digital
</Button>
```

**3.2. Funciones:**

- Generar token y obtener URL
- Copiar URL
- Enviar por email al titular
- Ver credencial en nueva pestaña

---

### **Sprint 2: Certificado de Verificación (1 semana)**

#### **Fase 1: Backend**

**1.1. API Route**

```
GET /api/habilitaciones/[id]/certificado-verificacion/pdf
  → Genera HTML del certificado
  → Convierte a PDF con puppeteer o @react-pdf/renderer
  → Retorna PDF para descarga
```

**1.2. Tecnología:**

- **Opción A**: `@react-pdf/renderer` (React components → PDF)
- **Opción B**: `puppeteer` (HTML → PDF, más flexible)
- **Recomendado**: puppeteer (permite reutilizar estilos)

#### **Fase 2: Template del Certificado**

**2.1. Componente React**

```tsx
components/certificado-verificacion.tsx
  → Header institucional
  → Datos en grid
  → Tabla de verificación
  → Sección de firmas
```

**2.2. Estilos print-ready**

- A4 (210mm x 297mm)
- Colores institucionales
- Page breaks inteligentes
- Bordes y tablas bien definidos

#### **Fase 3: Integración**

**3.1. En Panel Admin**

```tsx
<DropdownMenuItem onClick={handleDescargarCertificado}>
  <FileText className="mr-2 h-4 w-4" />
  Certificado de Verificación
</DropdownMenuItem>
```

---

## 📊 PRIORIZACIÓN

### **🔴 CRÍTICO (Esta semana)**

1. **Sistema de Tokens de Acceso**
   - Crear tabla y migraciones
   - API de generación y validación

2. **Credencial Digital - Backend**
   - Endpoint de generación
   - Endpoint de verificación

3. **Credencial Digital - Frontend**
   - Página pública `/credencial/[token]`
   - Componentes visuales
   - QR code

### **🟠 IMPORTANTE (Semana 2)**

4. **Credencial - Funcionalidades**
   - Envío por email
   - Integración en panel admin
   - Impresión mejorada

5. **Certificado de Verificación**
   - Template HTML/React
   - Generación de PDF
   - Descarga desde panel

### **🟡 MEJORAS (Semana 3)**

6. **Optimizaciones**
   - Cache de credenciales
   - Tokens renovables
   - Historial de envíos

---

## 🎨 MEJORAS RESPECTO AL SISTEMA PHP

### **Ventajas del nuevo sistema:**

✅ **Tecnología**

- React Server Components para SSR
- TypeScript para type safety
- Tailwind con sistema de diseño consistente

✅ **Performance**

- Generación de credencial más rápida
- Cache de Next.js
- Optimización de imágenes automática

✅ **UX Mejorada**

- Animaciones suaves
- Loading states
- Feedback visual inmediato
- Responsive perfecto

✅ **Seguridad**

- Validación en servidor y cliente
- Tokens con expiración
- Rate limiting en generación

✅ **Mantenibilidad**

- Componentes reutilizables
- Estilos centralizados
- Testing más fácil

---

## 📝 NOTAS TÉCNICAS

### **Librerías necesarias:**

```bash
npm install qrcode.react
npm install @react-pdf/renderer  # Para PDFs
# o
npm install puppeteer  # Alternativa más potente
```

### **Variables de entorno:**

```env
# URL pública para credenciales
NEXT_PUBLIC_CREDENCIAL_URL=https://transporte.lanus.gob.ar/credencial
```

### **Consideraciones:**

- Los tokens deben expirar (recomendado: 30-90 días)
- Permitir regenerar token si expira
- Enviar email con enlace al generar
- Guardar historial de generación de tokens
- QR debe apuntar a URL pública

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **Backend**

- [ ] Crear modelo `tokens_acceso` en Prisma
- [ ] Migración de BD
- [ ] API: Generar token
- [ ] API: Validar token
- [ ] API: Obtener datos para credencial
- [ ] API: Generar certificado PDF
- [ ] Agregar campos de seguro a vehículos

### **Frontend Público**

- [ ] Página `/credencial/[token]`
- [ ] Componente CredencialCard
- [ ] Componente PersonaBlock
- [ ] Componente VehiculoInfo
- [ ] Integrar QR code
- [ ] Función copiar enlace
- [ ] CSS para impresión
- [ ] Responsive design

### **Panel Admin**

- [ ] Botón "Generar Credencial"
- [ ] Modal con URL generada
- [ ] Botón "Enviar por Email"
- [ ] Botón "Ver Credencial"
- [ ] Botón "Certificado Verificación"
- [ ] Lista de tokens activos

### **Extras**

- [ ] Email template para credencial
- [ ] Historial de generación
- [ ] Renovación de tokens
- [ ] Analytics de uso

---

## 🎯 RESULTADO ESPERADO

Al completar este sprint tendremos:

✅ **Credencial Digital Completa**

- Accesible vía URL pública con token
- QR code de verificación
- Imprimible en formato físico
- Envío automático por email

✅ **Certificado de Verificación**

- PDF generado automáticamente
- Checklist técnico completo
- Listo para imprimir y firmar

✅ **Integración Total**

- Desde panel admin
- Portal público
- Sistema de emails

**Esto completará ~70-75% del sistema original PHP** 🚀
