# 🎫 Instrucciones para Implementar Sistema de Credenciales

## ✅ Lo que se implementó:

### **Backend:**
1. ✅ Modelo `tokens_acceso` en Prisma schema
2. ✅ API `/api/habilitaciones/[id]/generar-token-credencial` (POST/GET)
3. ✅ API `/api/credencial/verificar?token=xxx` (GET)

### **Frontend:**
4. ✅ Página pública `/credencial/[token]`
5. ✅ Componente `CredencialCard` con diseño completo
6. ✅ Página 404 personalizada

---

## 📦 PASO 1: Instalar dependencias

```bash
npm install qrcode.react uuid
npm install --save-dev @types/uuid
```

---

## 🗄️ PASO 2: Crear la tabla en la base de datos

```bash
# Generar la migración
npx prisma migrate dev --name add_tokens_acceso

# Si hay problemas, usar:
npx prisma db push
```

---

## 🔧 PASO 3: Regenerar el cliente de Prisma

```bash
npx prisma generate
```

---

## 🌐 PASO 4: Configurar variable de entorno

Agregar a tu `.env`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
# En producción: NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

---

## 🧪 PASO 5: Probar el sistema

### **A. Generar un token desde el panel admin:**

```typescript
// Hacer POST request desde el navegador o Postman
POST http://localhost:3000/api/habilitaciones/1/generar-token-credencial

// Respuesta:
{
  "success": true,
  "data": {
    "token": "uuid-generado",
    "url": "http://localhost:3000/credencial/uuid-generado",
    "fecha_expiracion": "2025-04-15T00:00:00.000Z"
  }
}
```

### **B. Acceder a la credencial pública:**

```
http://localhost:3000/credencial/[token-generado]
```

---

## 🎨 PASO 6: Integrar en el panel admin

### **Agregar botón en detalle de habilitación:**

```tsx
// En app/(panel)/habilitaciones/[id]/_components/habilitacion-detalle.tsx

import { QrCode } from 'lucide-react'

// Agregar función:
const handleGenerarCredencial = async () => {
  try {
    const res = await fetch(`/api/habilitaciones/${id}/generar-token-credencial`, {
      method: 'POST'
    })
    const data = await res.json()
    
    if (data.success) {
      // Copiar URL al portapapeles
      await navigator.clipboard.writeText(data.data.url)
      alert('✅ Credencial generada. URL copiada al portapapeles.')
      
      // Opcional: abrir en nueva pestaña
      window.open(data.data.url, '_blank')
    }
  } catch (error) {
    alert('❌ Error al generar credencial')
  }
}

// Agregar botón:
<Button onClick={handleGenerarCredencial} className="gap-2">
  <QrCode className="h-4 w-4" />
  Generar Credencial Digital
</Button>
```

---

## 📧 PASO 7: Enviar credencial por email (opcional)

Crear API para enviar email con el enlace:

```typescript
// app/api/habilitaciones/[id]/enviar-credencial/route.ts

import nodemailer from 'nodemailer'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  // 1. Generar token
  const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/habilitaciones/${id}/generar-token-credencial`, {
    method: 'POST'
  })
  const tokenData = await tokenRes.json()
  
  // 2. Obtener email del titular
  const habilitacion = await prisma.habilitaciones_generales.findUnique({
    where: { id: parseInt(id) },
    include: {
      habilitaciones_personas: {
        where: { rol: 'TITULAR' },
        include: { persona: true },
        take: 1
      }
    }
  })
  
  const email = habilitacion?.habilitaciones_personas[0]?.persona?.email
  
  if (!email) {
    return NextResponse.json({ error: 'No se encontró email del titular' }, { status: 400 })
  }
  
  // 3. Enviar email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  })
  
  await transporter.sendMail({
    from: `"Municipalidad de Lanús" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: '🎫 Su Credencial Digital - Habilitación de Transporte',
    html: `
      <h1>Credencial Digital Disponible</h1>
      <p>Su credencial de habilitación ya está disponible.</p>
      <p><a href="${tokenData.data.url}">Ver Credencial Digital</a></p>
      <p>Este enlace expira el: ${new Date(tokenData.data.fecha_expiracion).toLocaleDateString('es-AR')}</p>
    `
  })
  
  return NextResponse.json({ success: true })
}
```

---

## ✨ CARACTERÍSTICAS IMPLEMENTADAS

### **Credencial Digital incluye:**
- ✅ Header institucional con logo
- ✅ Badge de estado (Habilitado/En Trámite/No Habilitado)
- ✅ Número de licencia destacado
- ✅ Vigencias de la habilitación
- ✅ Datos del titular con foto
- ✅ Información completa del vehículo
- ✅ Datos de aseguradora y vencimientos (VTV, Póliza)
- ✅ Conductores asignados con fotos
- ✅ Celadores (solo para Escolar)
- ✅ Establecimiento/Remisería
- ✅ QR Code de verificación
- ✅ Botón para imprimir
- ✅ Botón para copiar enlace
- ✅ Diseño responsive
- ✅ CSS optimizado para impresión

### **Seguridad:**
- ✅ Tokens únicos (UUID)
- ✅ Expiración automática (90 días)
- ✅ Validación de estado activo
- ✅ Validación de fecha de expiración
- ✅ Acceso público sin login
- ✅ No expone datos sensibles

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

1. **Integrar en panel admin**
   - Agregar botón "Generar Credencial" en detalle de habilitación
   - Mostrar lista de tokens activos
   - Permitir desactivar tokens

2. **Sistema de emails**
   - Enviar credencial automáticamente al crear habilitación
   - Reenviar credencial cuando se solicite
   - Notificar cuando el token esté por expirar

3. **Mejoras opcionales**
   - Sistema de renovación de tokens
   - Estadísticas de visualizaciones
   - Historial de tokens generados
   - Exportar credencial a PDF server-side

---

## 🐛 TROUBLESHOOTING

### Error: "Module not found: qrcode.react"
```bash
npm install qrcode.react
```

### Error: "Cannot find module 'uuid'"
```bash
npm install uuid @types/uuid
```

### Error en migración de Prisma
```bash
# Si hay conflictos, usar:
npx prisma db push --accept-data-loss
```

### Tokens no aparecen en la BD
```bash
# Regenerar cliente Prisma:
npx prisma generate
# Reiniciar servidor dev:
npm run dev
```

---

## 📞 Soporte

Para dudas técnicas:
- Revisar logs del servidor: `npm run dev`
- Revisar consola del navegador (F12)
- Verificar variables de entorno en `.env`

¡Sistema de credenciales digitales listo para usar! 🎉
