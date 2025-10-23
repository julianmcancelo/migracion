# 🧪 Guía de Testing - Sistema de Obleas

## 🎯 **Objetivo del Testing**

Verificar que el sistema de obleas funcione correctamente en producción, desde la generación del PDF hasta el registro en base de datos.

---

## 🔗 **URLs de Testing**

- **Producción:** https://migracionnext.vercel.app
- **Login:** https://migracionnext.vercel.app/login
- **Habilitaciones:** https://migracionnext.vercel.app/habilitaciones

---

## ✅ **Checklist de Testing**

### **1. 🔐 Acceso al Sistema**

- [ ] Cargar https://migracionnext.vercel.app
- [ ] Iniciar sesión con credenciales válidas
- [ ] Verificar que el dashboard carga correctamente
- [ ] Navegar a "Habilitaciones"

### **2. 📋 Acceso a Habilitaciones**

- [ ] Ver listado de habilitaciones
- [ ] Filtrar por habilitaciones "HABILITADO" (activas)
- [ ] Hacer clic en "Ver detalles" de una habilitación activa
- [ ] Verificar que carga la página de detalle

### **3. 🔘 Botón de Obleas**

- [ ] Localizar el botón naranja "Gestionar Obleas" (ícono Shield)
- [ ] Verificar que está junto a otros botones de acción
- [ ] Hacer clic en "Gestionar Obleas"
- [ ] Verificar que se abre el modal

### **4. 📱 Modal de Obleas**

- [ ] **Header:** Verificar título "Gestión de Obleas" y número de licencia
- [ ] **Sección izquierda:** "Generar Nueva Oblea" visible
- [ ] **Sección derecha:** "Historial de Obleas" visible
- [ ] **Responsive:** Probar en diferentes tamaños de pantalla
- [ ] **Cerrar:** Botón X funciona correctamente

### **5. 📄 Generación de Certificado**

- [ ] Leer la información sobre el certificado
- [ ] Hacer clic en "Generar Certificado de Oblea"
- [ ] Verificar loading state (spinner + texto)
- [ ] Esperar a que se complete el proceso
- [ ] **CRÍTICO:** Verificar que se descarga el PDF automáticamente

### **6. 🔍 Verificación del PDF**

- [ ] **Archivo descargado:** `certificado_oblea_[LICENCIA].pdf`
- [ ] **Header:** Logo y datos del municipio
- [ ] **Título:** "CERTIFICADO DE ENTREGA DE OBLEA"
- [ ] **Datos titular:** Nombre y DNI correctos
- [ ] **Datos vehículo:** Dominio, marca, modelo
- [ ] **Datos habilitación:** Expediente, resolución, vigencia
- [ ] **Licencia destacada:** Número en caja azul grande
- [ ] **Espacios para firmas:** Receptor y agente municipal
- [ ] **Información legal:** Texto sobre uso de oblea
- [ ] **Footer:** ID de oblea y fecha de generación

### **7. 📊 Historial de Obleas**

- [ ] Verificar que aparece la oblea recién generada
- [ ] **Badge verde:** "Entregada" visible
- [ ] **Fecha:** Correcta y en formato argentino
- [ ] **ID de oblea:** Número único asignado
- [ ] **Número de licencia:** Coincide con la habilitación

### **8. 🔄 Funcionalidad Completa**

- [ ] Generar una segunda oblea para la misma habilitación
- [ ] Verificar que aparecen ambas en el historial
- [ ] Cerrar y reabrir el modal
- [ ] Verificar que el historial persiste
- [ ] Probar con diferentes habilitaciones

---

## 🐛 **Posibles Errores y Soluciones**

### **Causa 3: Estado Incorrecto**

- El botón solo aparece en habilitaciones con estado **"HABILITADO"**
- **Solución:** Asegúrate de abrir una habilitación con estado HABILITADO

### **Error: "El estado debe ser HABILITADO para generar oblea"**

- **Causa:** Habilitación inactiva o en trámite
- **Solución:** Usar una habilitación con estado "HABILITADO"

### **Error: PDF no se descarga**

- **Causa:** Bloqueador de pop-ups o error de jsPDF
- **Solución:** Permitir descargas, revisar consola del navegador

### **Error: "No se encontró email del titular"**

- **Causa:** Datos incompletos en la habilitación
- **Solución:** Verificar que la habilitación tenga titular con datos completos

### **Error: Modal no se abre**

- **Causa:** Error de JavaScript o componente no cargado
- **Solución:** Revisar consola del navegador, recargar página

---

## 📋 **Datos de Prueba Sugeridos**

### **Habilitaciones Ideales para Testing:**

- **Estado:** HABILITADO
- **Tipo:** Escolar o Remis (ambos funcionan)
- **Con titular:** Nombre y DNI completos
- **Con vehículo:** Dominio, marca, modelo
- **Con vigencia:** Fechas de inicio y fin válidas

---

## 🎯 **Criterios de Éxito**

### **✅ Testing Exitoso si:**

1. **Modal se abre** sin errores
2. **PDF se genera** y descarga automáticamente
3. **Contenido del PDF** es correcto y completo
4. **Historial se actualiza** inmediatamente
5. **Base de datos** registra la oblea correctamente
6. **No hay errores** en consola del navegador

### **❌ Testing Fallido si:**

1. Modal no se abre o tiene errores visuales
2. PDF no se genera o está corrupto
3. Datos incorrectos en el certificado
4. Historial no se actualiza
5. Errores en consola del navegador

---

## 🔧 **Debugging**

### **Si algo falla:**

1. **Abrir DevTools** (F12)
2. **Revisar Console** para errores JavaScript
3. **Revisar Network** para errores de API
4. **Verificar variables de entorno** en Vercel
5. **Comprobar conexión a BD** con /api/health

### **URLs de Debug:**

- **Health Check:** https://migracionnext.vercel.app/api/health
- **API Obleas:** https://migracionnext.vercel.app/api/habilitaciones/[ID]/obleas
- **API Generar:** https://migracionnext.vercel.app/api/habilitaciones/[ID]/generar-oblea

---

## 📞 **Contacto en Caso de Problemas**

Si encuentras algún error durante el testing:

1. **Captura de pantalla** del error
2. **Copia el mensaje** de error completo
3. **Anota los pasos** que llevaron al error
4. **Revisa la consola** del navegador

---

## 🚀 **¡A Probar!**

**El sistema de obleas está listo para testing en:**
👉 **https://migracionnext.vercel.app**

**¡Que tengas un testing exitoso!** 🎯
