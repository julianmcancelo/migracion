# ⚡ Instalación Rápida - Sistema PDF

## 📦 Paso 1: Instalar Dependencias

```bash
npm install jspdf jspdf-autotable
npm install --save-dev @types/jspdf-autotable
```

---

## 🔧 Paso 2: Ya está todo implementado

✅ API endpoint: `app/api/habilitaciones/[id]/descargar-pdf/route.ts`  
✅ Integrado en el menú de acciones  
✅ Botón "Descargar PDF" funcional  

---

## 🎨 Resultado

El PDF generado incluye:

```
┌─────────────────────────────────────┐
│ 📋 Certificado de Habilitación     │
│ Municipalidad de Lanús             │
│ ────────────────────────────────── │
│                                    │
│ ✓ Datos Generales                 │
│   • N° Licencia, Expediente        │
│   • Resolución, Año                │
│   • Vigencias                      │
│                                    │
│ ┌────────────────────────────────┐ │
│ │   ESTADO: HABILITADO           │ │
│ └────────────────────────────────┘ │
│                                    │
│ 👥 Personas (Tabla)                │
│ 🚗 Vehículos (Tabla)               │
│ 🏢 Establecimientos (Tabla)        │
│ 📝 Observaciones                   │
│                                    │
│ Generado: 26/10/2025 18:30        │
└─────────────────────────────────────┘
```

---

## ✅ Listo!

Después de instalar las dependencias, ya puedes:

1. Ir a cualquier habilitación
2. Click en el menú (⋮)
3. Click en "Descargar PDF"
4. Se descarga automáticamente

**¡Eso es todo!** 🚀
