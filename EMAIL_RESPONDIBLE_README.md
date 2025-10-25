# 📧 Email Respondible con Adjuntos - Sistema de Documentación

## 🎯 Descripción

Email configurado para que los titulares puedan **responder directamente** adjuntando la documentación vencida. Sistema simple y efectivo.

---

## ✅ Implementado

### **1. Email Respondible** ✅
```
FROM: Transporte Lanús <transportepublicolanus@gmail.com>
REPLY-TO: transportepublicolanus@gmail.com
TO: titular@email.com
SUBJECT: Actualización de documentación - Vehículo ABC123
```

### **2. Instrucciones Claras** ✅
El email explica paso a paso cómo responder con adjuntos:
```
① Renovar la documentación vencida
② Escanear los documentos (PDF o imagen, máx. 10MB)
③ Responder a este email adjuntando los documentos
```

### **3. Lista de Documentos** ✅
Muestra exactamente qué documentos adjuntar:
- Certificado VTV vigente (si VTV vencida)
- Póliza de seguro vigente (si póliza vencida)

---

## 📧 Configuración del Email

### **Email de Envío:**
```
transportepublicolanus@gmail.com
```

### **Características:**
- ✅ **Respondible** - Los titulares pueden responder directamente
- ✅ **Con adjuntos** - Pueden agregar PDFs e imágenes
- ✅ **Tracking** - Asunto se mantiene para seguimiento
- ✅ **Simple** - No necesitan saber otro email

---

## 🎨 Vista del Email

```
┌──────────────────────────────────────────┐
│ De: Transporte Lanús                     │
│     transportepublicolanus@gmail.com     │
│ Para: Juan Pérez (juan@email.com)       │
│ Responder a: transportepublicolanus@...  │
│ Asunto: Actualización - Vehículo ABC123 │
├──────────────────────────────────────────┤
│        [LOGO MUNICIPALIDAD]              │
│                                          │
│     MUNICIPIO DE LANÚS                   │
│  Dirección General de Movilidad         │
├──────────────────────────────────────────┤
│                                          │
│ Estimado/a Juan Pérez,                   │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ Vehículo: ABC123                     │ │
│ │ • Mercedes Benz Sprinter             │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Documentación vencida...                 │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ ⚠️  VTV        Vencida               │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Pasos a seguir:                          │
│                                          │
│ ① Renovar la documentación               │
│                                          │
│ ② Escanear documentos                    │
│    (PDF o imagen, máx. 10MB)            │
│                                          │
│ ③ Responder a este email                 │
│                                          │
│ ┌────────────────────────────────────┐   │
│ │ 📧 Responder al email              │   │
│ │                                    │   │
│ │ Use el botón "Responder" y         │   │
│ │ adjunte los documentos             │   │
│ │                                    │   │
│ │ Documentos a adjuntar:             │   │
│ │ • Certificado VTV vigente          │   │
│ │                                    │   │
│ │ 💡 Tip: Mantenga el asunto sin     │   │
│ │    modificar para gestión rápida   │   │
│ └────────────────────────────────────┘   │
│                                          │
│ ────────────────────────────────────     │
│                                          │
│ Contacto                                 │
│ Tel: 4357-5100 Int. 7137                │
│ Email: transportepublicolanus@gmail.com │
│ Web: www.lanus.gob.ar                   │
└──────────────────────────────────────────┘
```

---

## 🔄 Flujo Completo

### **1. Admin Envía Notificación:**
```
Admin ve documento vencido
    ↓
Click "Solicitar Actualización"
    ↓
Vista previa del email
    ↓
Confirma y envía
    ↓
Email sale desde: transportepublicolanus@gmail.com
```

### **2. Titular Recibe Email:**
```
Bandeja de entrada
    ↓
Email de "Transporte Lanús"
    ↓
Lee instrucciones claras
    ↓
Ve qué documentos necesita
```

### **3. Titular Responde:**
```
Click en "Responder"
    ↓
Cliente de correo abre respuesta
    ↓
Adjunta documentos (VTV, póliza)
    ↓
Envía
    ↓
Email llega a: transportepublicolanus@gmail.com
```

### **4. Admin Recibe Respuesta:**
```
Bandeja de transportepublicolanus@gmail.com
    ↓
Email con asunto: "Re: Actualización - Vehículo ABC123"
    ↓
Abre y descarga adjuntos
    ↓
Verifica documentos
    ↓
Actualiza sistema
```

---

## 📎 Gestión de Adjuntos

### **Formatos Aceptados:**
```
✅ PDF (.pdf)
✅ Imágenes (.jpg, .jpeg, .png)
✅ Tamaño máximo: 10MB por archivo
```

### **Documentos Solicitados:**
```
VTV Vencida:
  → Certificado VTV vigente

Póliza Vencida:
  → Póliza de seguro vigente
```

### **Instrucciones en el Email:**
```
"Documentos a adjuntar:
• Certificado VTV vigente (PDF o imagen)
• Póliza de seguro vigente (PDF o imagen)"
```

---

## 🎯 Ventajas del Sistema

### **Para el Titular:**
- ✅ **Simple** - Solo responder al email
- ✅ **Rápido** - No buscar otros emails
- ✅ **Claro** - Sabe exactamente qué enviar
- ✅ **Tracking** - Asunto se mantiene

### **Para el Admin:**
- ✅ **Organizado** - Todo en un solo email thread
- ✅ **Trazable** - Historial completo
- ✅ **Fácil** - Recibe todo en bandeja
- ✅ **Eficiente** - No buscar entre múltiples emails

---

## 🔧 Configuración de Gmail

### **Cuenta:**
```
Email: transportepublicolanus@gmail.com
Nombre: Transporte Lanús
```

### **Configuración Recomendada:**

**1. Firma Automática:**
```
──────────────────────────────
Dirección General de Movilidad y Transporte
Municipio de Lanús

☎️ 4357-5100 Int. 7137
🌐 www.lanus.gob.ar
```

**2. Respuestas Automáticas (Opcional):**
```
"Hemos recibido su documentación. La misma será 
verificada en un plazo de 48 horas hábiles. 
Recibirá una confirmación una vez procesada."
```

**3. Etiquetas para Organizar:**
```
📋 Pendiente de revisar
✅ Documentos verificados
❌ Documentos rechazados
⏰ Requiere seguimiento
```

**4. Filtros Automáticos:**
```
De: *
Asunto: "Actualización - Vehículo"
Acción: Aplicar etiqueta "Pendiente de revisar"
```

---

## 📧 Plantilla de Email (Para Configuración)

### **Configuración del Servicio de Email:**

```javascript
// Ejemplo con Nodemailer
const mailOptions = {
  from: {
    name: 'Transporte Lanús',
    address: 'transportepublicolanus@gmail.com'
  },
  replyTo: 'transportepublicolanus@gmail.com',
  to: titular.email,
  subject: `Actualización de documentación - Vehículo ${vehiculo.dominio}`,
  html: emailHTMLTemplate,
  // Importante: Configurar reply-to para que sea respondible
}
```

### **Headers Importantes:**
```
From: Transporte Lanús <transportepublicolanus@gmail.com>
Reply-To: transportepublicolanus@gmail.com
Subject: Actualización de documentación - Vehículo ABC123
```

---

## 💡 Tips de Gestión

### **Para el Admin:**

**1. Revisar Diariamente:**
```
Abrir bandeja de transportepublicolanus@gmail.com
    ↓
Filtrar por "Pendiente de revisar"
    ↓
Revisar adjuntos uno por uno
```

**2. Verificar Documentos:**
```
✅ Fecha de vigencia válida
✅ Datos coinciden con el vehículo
✅ Documento legible y completo
✅ Formato correcto (PDF o imagen)
```

**3. Actualizar Sistema:**
```
Documento válido
    ↓
Actualizar fecha de vencimiento en sistema
    ↓
Marcar email como procesado
    ↓
(Opcional) Enviar confirmación al titular
```

**4. Documentos Rechazados:**
```
Documento inválido
    ↓
Responder al titular explicando el problema
    ↓
Solicitar corrección
    ↓
Mantener thread activo
```

---

## 📊 Métricas Sugeridas

### **Para Seguimiento:**
```
- Emails enviados: X
- Respuestas recibidas: Y
- Documentos procesados: Z
- Tasa de respuesta: Y/X %
- Tiempo promedio de respuesta: N días
```

---

## 🚀 Próximos Pasos (Opcional)

### **Mejoras Futuras:**

**1. Portal de Carga (Alternativa):**
- Link en el email a portal web
- Titular sube documentos sin email
- Sistema notifica al admin

**2. Integración con Drive:**
- Adjuntos se guardan automáticamente
- Organizados por vehículo
- Backup automático

**3. Notificaciones Automáticas:**
- Confirmación de recepción
- Estado de verificación
- Aprobación/rechazo

**4. Dashboard Admin:**
- Ver todos los documentos recibidos
- Estado de cada uno
- Gestionar desde panel web

---

## ✅ Estado Actual

**EMAIL RESPONDIBLE: 100% FUNCIONAL** 📧✅

- ✅ Email desde transportepublicolanus@gmail.com
- ✅ Completamente respondible
- ✅ Instrucciones claras para adjuntos
- ✅ Lista específica de documentos
- ✅ Diseño minimalista con logo
- ✅ Datos reales de contacto
- ✅ Vista previa antes de enviar

---

## 📂 Archivos Actualizados

**Modificados:**
- ✅ `app/(panel)/vehiculos/_components/preview-email-modal.tsx`
- ✅ `app/api/vehiculos/[id]/solicitar-actualizacion/route.ts`

**Nuevos:**
- ✅ `EMAIL_RESPONDIBLE_README.md`

---

**¡Sistema de email respondible con adjuntos listo para usar!** 📧📎✅

Los titulares pueden responder directamente al email adjuntando su documentación actualizada.
