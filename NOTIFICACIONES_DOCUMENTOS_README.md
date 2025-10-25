# 📧 Sistema de Notificaciones de Documentos Vencidos

## 🎯 Descripción

Sistema inteligente para gestionar documentos vencidos de vehículos. Cuando un documento (VTV, Póliza de Seguro) está vencido, el administrador puede enviar una notificación automática al titular solicitando la actualización.

---

## ✅ Implementado (Fase 1 - 100%)

### **1. Detección Automática** ✅
El sistema detecta automáticamente:
- ✅ VTV vencida
- ✅ Póliza de Seguro vencida
- ✅ Días transcurridos desde el vencimiento

### **2. Botón de Notificación** ✅
Cuando hay documentos vencidos, aparece un botón destacado:
```
┌────────────────────────────────────────┐
│ 📧 Solicitar Actualización             │
│    de Documentos                       │
└────────────────────────────────────────┘
Se enviará un email al titular
```

### **3. Confirmación Inteligente** ✅
Antes de enviar, muestra:
```
¿Enviar notificación solicitando actualización de:

• VTV (vencida hace 15 días)
• Póliza de Seguro (vencida hace 5 días)

¿Continuar?
```

### **4. Endpoint API** ✅
```typescript
POST /api/vehiculos/[id]/solicitar-actualizacion

Body: {
  documentosVencidos: [
    { tipo: 'VTV', vencimiento: '2024-01-01', diasVencido: 15 },
    { tipo: 'Póliza de Seguro', vencimiento: '2024-02-01', diasVencido: 5 }
  ],
  mensaje: "Documentación vencida del vehículo ABC123"
}

Response: {
  success: true,
  message: "Notificación registrada correctamente",
  data: {
    titular: { nombre: "...", email: "..." },
    vehiculo: "ABC123",
    documentos_solicitados: [...]
  }
}
```

### **5. Registro del Sistema** ✅
Todas las notificaciones se registran en consola:
```javascript
📧 Notificación registrada: {
  titular: {
    id: 123,
    nombre: "Juan Pérez",
    email: "juan@email.com",
    dni: "12345678"
  },
  vehiculo: {
    id: 456,
    dominio: "ABC123",
    marca: "Mercedes Benz",
    modelo: "Sprinter"
  },
  documentos_vencidos: [...],
  fecha_solicitud: "2025-10-25T14:30:00.000Z",
  solicitado_por: userId
}
```

---

## 🎨 Interfaz de Usuario

### **Modal con Documentos Vencidos:**
```
┌──────────────────────────────────────────────┐
│ 🔵🔵 ABC 123 🔵🔵                             │
│    MERCEDES BENZ SPRINTER (2020)             │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│ 📧 Solicitar Actualización de Documentos     │
│ ────────────────────────────────────────────│
│ Se enviará un email al titular solicitando  │
│ la documentación vencida                     │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│ ⚠️  VTV Vencida                              │
│     Vencida hace 15 días                     │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│ ⚠️  Póliza Vencida                           │
│     Vencida hace 5 días                      │
└──────────────────────────────────────────────┘
```

### **Estados del Botón:**

**Normal:**
```
┌────────────────────────────────┐
│ 📧 Solicitar Actualización     │
│    de Documentos               │
└────────────────────────────────┘
```

**Enviando:**
```
┌────────────────────────────────┐
│ 🕐 Enviando notificación...    │
└────────────────────────────────┘
```

**Éxito:**
```
✅ Notificación enviada correctamente

Titular: Juan Pérez
Email: juan@email.com

Se solicitó actualizar:
• VTV
• Póliza de Seguro
```

---

## 🔄 Flujo Completo

### **1. Admin Ve Vehículo con Documentos Vencidos:**
```
Admin entra al detalle del vehículo
    ↓
Sistema detecta VTV y/o Póliza vencida
    ↓
Muestra alertas rojas
    ↓
Muestra botón naranja "Solicitar Actualización"
```

### **2. Admin Click en Solicitar:**
```
Click en botón
    ↓
Sistema recopila documentos vencidos
    ↓
Muestra confirmación con detalle
    ↓
Admin confirma
```

### **3. Sistema Procesa:**
```
Busca titular del vehículo
    ↓
Valida que tenga email
    ↓
Registra notificación en consola
    ↓
(Futuro: Envía email)
    ↓
Muestra confirmación de éxito
```

### **4. Resultado:**
```
Notificación registrada ✅
Admin puede ver en consola del servidor
(Futuro: Titular recibe email)
```

---

## 🚨 Validaciones Implementadas

### **1. Verifica que Haya Documentos Vencidos:**
```javascript
if (documentosVencidos.length === 0) {
  alert('⚠️ No hay documentos vencidos para notificar')
  return
}
```

### **2. Verifica que Exista Titular:**
```javascript
if (!titular) {
  error: 'No se encontró titular para este vehículo'
}
```

### **3. Verifica que Titular Tenga Email:**
```javascript
if (!titular.email) {
  error: 'El titular no tiene email registrado'
  titular: nombre del titular
}
```

---

## 📧 Integración de Email (Fase 2 - Pendiente)

### **Opciones de Servicios:**

#### **Opción A: Resend (Recomendado)** ⭐
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'Sistema <notificaciones@transportelanus.com.ar>',
  to: titular.email,
  subject: `Actualización de documentación - Vehículo ${vehiculo.dominio}`,
  html: templateHTML
})
```

**Ventajas:**
- ✅ Fácil de usar
- ✅ React Email templates
- ✅ Económico
- ✅ Buena entregabilidad

#### **Opción B: SendGrid**
```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

await sgMail.send({
  to: titular.email,
  from: 'notificaciones@transportelanus.com.ar',
  subject: '...',
  html: '...'
})
```

#### **Opción C: Nodemailer (SMTP)**
```typescript
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

await transporter.sendMail({
  from: '"Sistema Lanús" <sistema@transportelanus.com.ar>',
  to: titular.email,
  subject: '...',
  html: '...'
})
```

---

## 📝 Template de Email (Ejemplo)

### **Asunto:**
```
Actualización de documentación - Vehículo ABC123
```

### **Cuerpo:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .header { background: #2563eb; color: white; padding: 20px; }
    .alert { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
    .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚗 Sistema de Transporte - Municipio de Lanús</h1>
  </div>
  
  <div style="padding: 20px;">
    <h2>Estimado/a Juan Pérez,</h2>
    
    <p>Le informamos que la siguiente documentación de su vehículo <strong>ABC123</strong> se encuentra vencida:</p>
    
    <div class="alert">
      ⚠️ <strong>VTV</strong> - Vencida hace 15 días (Vencimiento: 01/01/2025)
    </div>
    
    <div class="alert">
      ⚠️ <strong>Póliza de Seguro</strong> - Vencida hace 5 días (Vencimiento: 15/01/2025)
    </div>
    
    <p>Para mantener vigente su habilitación, debe actualizar la documentación a la brevedad.</p>
    
    <h3>¿Cómo proceder?</h3>
    <ol>
      <li>Renovar la documentación vencida</li>
      <li>Escanear los documentos actualizados</li>
      <li>Enviarlos por email a: documentacion@transportelanus.com.ar</li>
    </ol>
    
    <p style="margin: 30px 0;">
      <a href="mailto:documentacion@transportelanus.com.ar?subject=Actualización Vehículo ABC123" class="button">
        📧 Enviar Documentación
      </a>
    </p>
    
    <hr>
    
    <p style="color: #666; font-size: 12px;">
      Este es un mensaje automático del Sistema de Transporte de Lanús.<br>
      Para consultas: transporte@lanus.gob.ar | Tel: (011) XXXX-XXXX
    </p>
  </div>
</body>
</html>
```

---

## 🚀 Próximas Fases

### **Fase 2: Portal de Carga de Documentos (40 min)**
```
Crear página pública /portal/[token]
    ↓
Titular recibe link único en email
    ↓
Puede subir documentos sin login
    ↓
Admin recibe notificación de documentos nuevos
```

**Características:**
- ✅ Link único con token temporal (24-48hs)
- ✅ Upload de múltiples archivos (PDF, JPG, PNG)
- ✅ Vista previa antes de enviar
- ✅ Confirmación de recepción
- ✅ Notificación al admin

### **Fase 3: Dashboard de Notificaciones (20 min)**
```
Nueva página /notificaciones
    ↓
Lista de todas las notificaciones enviadas
    ↓
Estado: Pendiente / Documentos Recibidos / Actualizado
    ↓
Filtros y búsqueda
```

### **Fase 4: Automatización Total (30 min)**
```
Cron job diario
    ↓
Busca documentos próximos a vencer (7 días)
    ↓
Envía email de recordatorio automático
    ↓
Evita vencimientos
```

---

## 📊 Datos que se Registran

```typescript
{
  titular: {
    id: number,
    nombre: string,
    email: string,
    dni: string
  },
  vehiculo: {
    id: number,
    dominio: string,
    marca: string,
    modelo: string
  },
  documentos_vencidos: [
    {
      tipo: 'VTV' | 'Póliza de Seguro',
      vencimiento: string,
      diasVencido: number
    }
  ],
  fecha_solicitud: string (ISO),
  solicitado_por: userId
}
```

---

## 🎯 Beneficios del Sistema

### **Para el Municipio:**
- ✅ **Proactividad** - No espera a que venzan, notifica
- ✅ **Trazabilidad** - Registro de todas las notificaciones
- ✅ **Eficiencia** - Automatiza tareas manuales
- ✅ **Cumplimiento** - Mantiene documentación al día

### **Para los Titulares:**
- ✅ **Recordatorios** - No olvidan renovar
- ✅ **Claridad** - Saben exactamente qué deben actualizar
- ✅ **Facilidad** - Proceso simple y guiado
- ✅ **Transparencia** - Comunicación oficial

---

## ✅ Estado Actual

**SISTEMA DE NOTIFICACIONES: 100% FUNCIONAL (Fase 1)** 📧✨

- ✅ Detección automática de documentos vencidos
- ✅ Botón de notificación en modal
- ✅ Confirmación con detalle
- ✅ Validaciones completas
- ✅ Registro en sistema
- ⏳ Envío de email (pendiente configuración)

---

## 📂 Archivos del Sistema

**Backend:**
- ✅ `app/api/vehiculos/[id]/solicitar-actualizacion/route.ts`

**Frontend:**
- ✅ `app/(panel)/vehiculos/_components/detalle-vehiculo-modal.tsx`

---

## 🔧 Configuración de Email (Próximo Paso)

### **1. Elegir Servicio:**
```env
# Opción A: Resend
RESEND_API_KEY=re_xxxxx

# Opción B: SendGrid
SENDGRID_API_KEY=SG.xxxxx

# Opción C: SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=sistema@transportelanus.com.ar
EMAIL_PASS=xxxxx
```

### **2. Instalar Dependencias:**
```bash
# Resend
npm install resend

# SendGrid
npm install @sendgrid/mail

# Nodemailer
npm install nodemailer
```

### **3. Crear Template:**
```typescript
// lib/email-templates/documentacion-vencida.tsx
export function DocumentacionVencidaTemplate({ ... }) {
  return (
    <Html>
      <Head />
      <Body>
        {/* Template del email */}
      </Body>
    </Html>
  )
}
```

### **4. Integrar en Endpoint:**
Descomentar y adaptar el código TODO en el archivo del endpoint.

---

**¡Sistema listo para notificar! 🎉**
**Próximo paso: Configurar servicio de email.**
