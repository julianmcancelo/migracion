# 🚀 Configurar Variables de Entorno en Vercel

## El problema actual:
El deploy está exitoso pero **las paradas no cargan** porque falta configurar la conexión a la base de datos en Vercel.

## ✅ Solución - Configurar en Vercel Dashboard:

### **Paso 1: Ir a tu proyecto en Vercel**
1. Abre https://vercel.com/dashboard
2. Selecciona tu proyecto: **migracion** (o como se llame)
3. Click en **Settings** (arriba)
4. Click en **Environment Variables** (menú lateral)

### **Paso 2: Agregar Variables de Entorno**

Agrega estas **3 variables obligatorias**:

#### **Variable 1: DATABASE_URL**
```
Name:  DATABASE_URL
Value: mysql://TU_USUARIO:TU_PASSWORD@167.250.5.55:3306/transpo1_credenciales
```
**Reemplaza `TU_USUARIO` y `TU_PASSWORD` con tus credenciales reales de MySQL**

#### **Variable 2: JWT_SECRET**
```
Name:  JWT_SECRET
Value: un_string_aleatorio_muy_largo_y_seguro_para_produccion
```
**Usa un string seguro y largo (mínimo 32 caracteres)**

#### **Variable 3: NODE_ENV**
```
Name:  NODE_ENV
Value: production
```

### **Paso 3: Seleccionar Entornos**

Para cada variable, marca estos checkboxes:
- ✅ **Production**
- ✅ **Preview**
- ✅ **Development** (opcional)

### **Paso 4: Guardar y Redeploy**

1. Click en **Save** para cada variable
2. Después de agregar todas, ve a la pestaña **Deployments**
3. Click en los 3 puntos `...` del último deployment
4. Click en **Redeploy**

---

## 🔍 Verificar que Funciona

Después del redeploy (tarda ~2 minutos):

1. Abre tu URL de Vercel: `https://tu-proyecto.vercel.app/paradas`
2. Abre la consola del navegador (F12)
3. **Si ya no ves error 500**: ✅ Funcionó!
4. **Si aún ves error 500**: Revisa que las credenciales de MySQL sean correctas

---

## ⚠️ Importante

### **Credenciales de Base de Datos**

Debes usar las **mismas credenciales** que usas en tu sistema PHP original:

- **Host**: `167.250.5.55`
- **Puerto**: `3306`
- **Base de datos**: `transpo1_credenciales`
- **Usuario**: (el que usas actualmente)
- **Password**: (el que usas actualmente)

### **Formato DATABASE_URL Completo**

```
mysql://usuario:password@167.250.5.55:3306/transpo1_credenciales
```

**Ejemplo real** (reemplaza con tus datos):
```
mysql://root:MiPassword123@167.250.5.55:3306/transpo1_credenciales
```

---

## 🎯 Resumen Rápido

1. **Vercel Dashboard** → Tu proyecto → **Settings** → **Environment Variables**
2. Agregar:
   - `DATABASE_URL` = `mysql://user:pass@167.250.5.55:3306/transpo1_credenciales`
   - `JWT_SECRET` = `string_largo_aleatorio`
   - `NODE_ENV` = `production`
3. Marcar **Production**, **Preview**, **Development**
4. **Save** → **Redeploy**

---

## 📞 Si Persiste el Error

Si después de configurar las variables aún no funciona:

1. Verifica que las credenciales MySQL sean correctas
2. Asegúrate que el servidor MySQL (167.250.5.55) permita conexiones remotas
3. Revisa los logs en Vercel:
   - **Deployments** → Click en el deployment → **Function Logs**
   - Busca errores de conexión

---

**Creado**: ${new Date().toLocaleString('es-AR')}
