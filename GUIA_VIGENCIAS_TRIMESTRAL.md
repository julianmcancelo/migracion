# 📅 Guía: Sistema de Consulta de Vigencias por Trimestre

## 🎯 DESCRIPCIÓN

Sistema completo para consultar y visualizar las fechas de vigencia de habilitaciones agrupadas por trimestres, permitiendo análisis temporal y seguimiento de vencimientos.

---

## 🚀 ACCESO RÁPIDO

### **Interfaz Web** (RECOMENDADO)
```
http://localhost:3000/vigencias/trimestral
```

### **API REST**
```bash
# Todos los trimestres
curl http://localhost:3000/api/vigencias/trimestral

# Filtrar por año
curl http://localhost:3000/api/vigencias/trimestral?anio=2024

# Filtrar por año y trimestre
curl http://localhost:3000/api/vigencias/trimestral?anio=2024&trimestre=1
```

### **Script Node.js**
```bash
# Ver todos los trimestres
node scripts/consultar-vigencias-trimestral.js

# Solo año 2024
node scripts/consultar-vigencias-trimestral.js 2024

# Solo Q1 2024
node scripts/consultar-vigencias-trimestral.js 2024 1
```

### **SQL Directo** (phpMyAdmin)
Abre: `scripts/consultas-vigencias-trimestral.sql`

---

## 📊 CARACTERÍSTICAS DE LA INTERFAZ WEB

### **1. Vista General**
- ✅ Cards por trimestre ordenados cronológicamente
- ✅ Estadísticas visuales (total, escolares, remis, activas)
- ✅ Diseño moderno con colores diferenciados
- ✅ Responsive (funciona en móvil)

### **2. Filtros Dinámicos**
- **Por Año:** Selecciona un año específico o ver todos
- **Por Trimestre:** Filtra Q1, Q2, Q3 o Q4
- **Combinados:** Ej: Solo Q2 2024

### **3. Detalle Expandible**
- Click en "Ver detalle" para expandir cada trimestre
- Lista completa de habilitaciones del período
- Info por habilitación:
  - Número de licencia
  - Tipo (escolar/remis)
  - Titular y DNI
  - Dominio del vehículo
  - Fechas de inicio y fin
  - Estado (activo/vencido)

### **4. Indicadores Visuales**
- 📘 **Azul:** Total de habilitaciones
- 🟣 **Púrpura:** Transporte escolar
- 🟠 **Naranja:** Remises
- 🟢 **Verde:** Habilitaciones activas

---

## 💻 CONSULTAS SQL INCLUIDAS

El archivo `consultas-vigencias-trimestral.sql` incluye:

### **1. Resumen por Trimestre**
```sql
-- Ver todos los trimestres con totales
SELECT YEAR(vigencia_inicio), QUARTER(vigencia_inicio), COUNT(*)...
```

### **2. Detalle de Trimestre Específico**
```sql
-- Ver todas las habilitaciones de Q1 2024
WHERE YEAR(vigencia_inicio) = 2024 AND QUARTER(vigencia_inicio) = 1
```

### **3. Próximas a Vencer**
```sql
-- Habilitaciones que vencen en los próximos 90 días
WHERE vigencia_fin BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)
```

### **4. Comparativa Anual**
```sql
-- Comparar trimestre actual vs mismo trimestre año anterior
```

### **5. Evolución Trimestral**
```sql
-- Ver tendencia de los últimos 4 trimestres
```

### **6. Export para Excel**
```sql
-- Datos completos formateados para exportar
```

---

## 🔧 CASOS DE USO

### **Caso 1: Ver vigencias del trimestre actual**

**Interfaz Web:**
1. Ir a `http://localhost:3000/vigencias/trimestral`
2. Los datos se cargan automáticamente
3. Buscar el trimestre actual (ej: 2025-Q1)

**SQL:**
```sql
SELECT * FROM habilitaciones_generales
WHERE YEAR(vigencia_inicio) = YEAR(CURDATE())
AND QUARTER(vigencia_inicio) = QUARTER(CURDATE());
```

---

### **Caso 2: Planificar renovaciones del próximo trimestre**

**Script Node.js:**
```bash
# Ver habilitaciones que iniciaron en Q2 2024
node scripts/consultar-vigencias-trimestral.js 2024 2
```

**SQL:**
```sql
-- Habilitaciones que VENCEN en Q2 2025
SELECT * FROM habilitaciones_generales
WHERE YEAR(vigencia_fin) = 2025
AND QUARTER(vigencia_fin) = 2;
```

---

### **Caso 3: Análisis anual completo**

**Interfaz Web:**
1. Filtrar por año: 2024
2. Dejar trimestre en "Todos"
3. Ver todos los trimestres de ese año

**Script:**
```bash
node scripts/consultar-vigencias-trimestral.js 2024
```

---

### **Caso 4: Exportar datos a Excel**

**Opción 1: Desde phpMyAdmin**
1. Ejecutar la consulta #9 de `consultas-vigencias-trimestral.sql`
2. Click en "Exportar" → Formato CSV
3. Abrir en Excel

**Opción 2: Desde la API**
```bash
# Obtener JSON y convertir
curl http://localhost:3000/api/vigencias/trimestral > vigencias.json
```

---

## 📈 INFORMES DISPONIBLES

### **Resumen Ejecutivo**
```bash
node scripts/consultar-vigencias-trimestral.js
```

Muestra:
- Total de trimestres con datos
- Habilitaciones por trimestre
- Trimestre con más habilitaciones
- Estadísticas por tipo y estado

### **Reporte Detallado**
```sql
-- En phpMyAdmin, ejecutar consulta #8
-- Evolución trimestral de los últimos 4 trimestres
```

### **Dashboard Visual**
```
http://localhost:3000/vigencias/trimestral
```

Gráficos y cards interactivos en tiempo real.

---

## 🎨 PERSONALIZACIÓN

### **Cambiar colores en la interfaz web**

Editar: `app/vigencias/trimestral/page.tsx`

```tsx
// Línea ~180: Cambiar colores de los cards
<div className="bg-blue-50 rounded-lg p-3">  // Cambiar bg-blue-50
  <p className="text-2xl font-bold text-blue-600">  // Cambiar text-blue-600
```

### **Modificar filtros**

```tsx
// Agregar más opciones al selector
<SelectItem value="2023">2023</SelectItem>
<SelectItem value="2022">2022</SelectItem>
```

### **Ajustar límite de visualización**

```tsx
// Línea ~237: Cambiar de 20 a otro número
{trimestre.habilitaciones.slice(0, 20).map((hab) => (
                                              ^^
```

---

## 🔍 EJEMPLOS PRÁCTICOS

### **Ejemplo 1: Alertas de vencimiento**

```sql
-- Habilitaciones que vencen en los próximos 30 días
SELECT 
    nro_licencia,
    CONCAT(p.apellido, ' ', p.nombre) as titular,
    vigencia_fin,
    DATEDIFF(vigencia_fin, CURDATE()) as dias_restantes
FROM habilitaciones_generales hg
LEFT JOIN personas p ON hg.id_persona = p.id
WHERE vigencia_fin BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
ORDER BY vigencia_fin;
```

### **Ejemplo 2: Estadísticas trimestrales**

```bash
# Ver Q4 2024 con detalles
node scripts/consultar-vigencias-trimestral.js 2024 4
```

Salida:
```
📆 2024 - Q4 (Oct-Dic)
────────────────────────────────────────────────────────────────────────────────
📊 Total habilitaciones: 15

📋 Por tipo de transporte:
   escolar: 8
   remis: 7

📊 Por estado:
   activo: 12
   vencida: 3
```

### **Ejemplo 3: Tendencias anuales**

```sql
-- Ver evolución año a año
SELECT 
    YEAR(vigencia_inicio) as anio,
    COUNT(*) as total,
    COUNT(CASE WHEN tipo_transporte = 'escolar' THEN 1 END) as escolares,
    COUNT(CASE WHEN tipo_transporte = 'remis' THEN 1 END) as remis
FROM habilitaciones_generales
WHERE vigencia_inicio IS NOT NULL
GROUP BY YEAR(vigencia_inicio)
ORDER BY anio DESC;
```

---

## 📱 INTEGRACIÓN CON EL SISTEMA

### **Agregar link en el menú principal**

Editar el layout o navbar:

```tsx
<Link href="/vigencias/trimestral">
  <Calendar className="h-4 w-4 mr-2" />
  Vigencias Trimestrales
</Link>
```

### **Widget para Dashboard**

```tsx
// Componente para mostrar próximo vencimiento trimestral
import { useEffect, useState } from 'react'

export function ProximoVencimientoWidget() {
  const [datos, setDatos] = useState(null)
  
  useEffect(() => {
    fetch('/api/vigencias/trimestral')
      .then(r => r.json())
      .then(d => setDatos(d))
  }, [])
  
  // Renderizar card con datos
}
```

---

## 🐛 TROUBLESHOOTING

### **Error: "No se encontraron datos"**
- Verificar que `vigencia_inicio` no sea NULL en la BD
- Revisar filtros aplicados
- Ejecutar: `SELECT COUNT(*) FROM habilitaciones_generales WHERE vigencia_inicio IS NOT NULL`

### **La página no carga**
```bash
# Verificar que el servidor esté corriendo
npm run dev

# Verificar la URL
http://localhost:3000/vigencias/trimestral
```

### **Error en el script Node.js**
```bash
# Verificar que Prisma esté instalado
npm install @prisma/client

# Regenerar cliente
npx prisma generate
```

### **Error en SQL**
- Asegurarse que la tabla `habilitaciones_generales` existe
- Verificar conexión a MySQL
- Revisar nombres de columnas (pueden variar)

---

## 📊 MÉTRICAS Y KPIs

El sistema permite calcular:

- ✅ **Crecimiento trimestral:** Comparar cantidad entre trimestres
- ✅ **Tasa de renovación:** Vencidas vs renovadas por trimestre
- ✅ **Distribución por tipo:** Porcentaje escolar vs remis
- ✅ **Proyección de vencimientos:** Habilitaciones que vencen próximamente
- ✅ **Estacionalidad:** Identificar trimestres con más actividad

---

## 🎓 MEJORES PRÁCTICAS

1. **Revisar trimestralmente** las habilitaciones próximas a vencer
2. **Exportar a Excel** para análisis más profundos
3. **Usar filtros** para enfocarse en períodos específicos
4. **Monitorear tendencias** comparando trimestres similares de años diferentes
5. **Automatizar alertas** usando la API para notificaciones

---

## 📚 ARCHIVOS CREADOS

| Archivo | Descripción | Tipo |
|---------|-------------|------|
| `app/api/vigencias/trimestral/route.ts` | API REST | TypeScript |
| `app/vigencias/trimestral/page.tsx` | Interfaz web | React/Next.js |
| `scripts/consultar-vigencias-trimestral.js` | Script consulta | Node.js |
| `scripts/consultas-vigencias-trimestral.sql` | Consultas SQL | SQL |
| `GUIA_VIGENCIAS_TRIMESTRAL.md` | Esta guía | Markdown |

---

## 🚀 PRÓXIMOS PASOS

1. **Probar la interfaz web:**
   ```bash
   npm run dev
   # Abrir: http://localhost:3000/vigencias/trimestral
   ```

2. **Ejecutar el script de ejemplo:**
   ```bash
   node scripts/consultar-vigencias-trimestral.js 2024
   ```

3. **Explorar las consultas SQL** en phpMyAdmin

4. **Personalizar** según tus necesidades específicas

---

**¿Necesitas ayuda?** Todos los archivos están documentados y listos para usar. 🎉
