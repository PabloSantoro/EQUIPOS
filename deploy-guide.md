# 🚀 Guía de Despliegue en Hostinger

## 📋 **Pre-requisitos**
- Cuenta de Hostinger con hosting compartido
- Acceso a cPanel/hPanel
- FileZilla o cliente FTP
- Acceso a bases de datos MySQL

---

## **PASO 1: 🗄️ Configurar Base de Datos**

### 1.1 Crear Base de Datos en Hostinger
1. Ve a **hPanel** → **Bases de Datos MySQL**
2. Crea una nueva base de datos: `u123456789_equipos`
3. Crea un usuario: `u123456789_dbuser`
4. Asigna permisos completos al usuario
5. Anota los datos: host, usuario, contraseña, base de datos

### 1.2 Importar Estructura de DB
1. Ve a **phpMyAdmin** desde hPanel
2. Selecciona tu base de datos
3. Importa estos archivos en orden:
   ```
   database/create_tables.sql
   database/equipment_schema.sql
   backend/import_complete_equipment.cjs (datos)
   ```

---

## **PASO 2: 📦 Compilar Frontend**

### 2.1 En tu máquina local:
```bash
cd frontend
npm install
npm run build
```

### 2.2 Archivos generados en `frontend/dist/`:
- `index.html`
- `static/` (CSS, JS, assets)

---

## **PASO 3: 📤 Subir Archivos**

### 3.1 Estructura en Hostinger:
```
public_html/
├── index.html          # Del frontend/dist/
├── static/             # Del frontend/dist/static/
├── .htaccess           # Archivo raíz del proyecto
└── api/                # Todo el backend/
    ├── server.js
    ├── package.json
    ├── routes/
    ├── middleware/
    ├── config/
    ├── uploads/
    └── .env
```

### 3.2 Usando FileZilla:
1. Conecta a tu hosting: 
   - Host: `ftp.tudominio.com`
   - Usuario: tu usuario de hosting
   - Contraseña: tu contraseña de hosting

2. **Subir Frontend:**
   - Copia `frontend/dist/index.html` → `public_html/`
   - Copia `frontend/dist/static/` → `public_html/static/`

3. **Subir Backend:**
   - Crea carpeta `public_html/api/`
   - Copia todo `backend/` → `public_html/api/`

4. **Subir Configuración:**
   - Copia `.htaccess` → `public_html/`

---

## **PASO 4: ⚙️ Configurar Backend**

### 4.1 Editar `.env` en `public_html/api/.env`:
```env
NODE_ENV=production
DB_HOST=localhost
DB_USER=u123456789_dbuser
DB_PASSWORD=TU_PASSWORD_REAL
DB_DATABASE=u123456789_equipos
PORT=3001
CORS_ORIGIN=https://tudominio.com
```

### 4.2 Instalar dependencias (Terminal en hPanel):
```bash
cd public_html/api
npm install --production
```

---

## **PASO 5: 🔧 Configurar Node.js en Hostinger**

### 5.1 En hPanel → **Node.js**:
1. Crear nueva aplicación Node.js
2. **Versión:** 18.x o superior
3. **Directorio de aplicación:** `api`
4. **Archivo de inicio:** `server.js`
5. **Variables de entorno:** Copiar desde `.env`

### 5.2 NPM Install:
- Ve a la sección NPM e instala las dependencias

---

## **PASO 6: 🌐 Configurar Dominio y SSL**

### 6.1 Configurar Dominio:
1. En hPanel → **Dominios**
2. Apunta tu dominio al hosting
3. Edita `CORS_ORIGIN` en `.env` con tu dominio real

### 6.2 Activar SSL:
1. hPanel → **SSL/TLS**
2. Activa SSL gratuito de Let's Encrypt
3. Fuerza HTTPS

---

## **PASO 7: ✅ Verificar Funcionamiento**

### 7.1 Pruebas:
1. **Frontend:** `https://tudominio.com`
2. **API Health:** `https://tudominio.com/api/health`
3. **Datos:** `https://tudominio.com/api/equipment`

### 7.2 Solución de Problemas:
- **500 Error:** Revisar logs en hPanel → **Archivos de Error**
- **Base de Datos:** Verificar credenciales en phpMyAdmin
- **CORS:** Verificar dominio en configuración

---

## **📁 Archivos Críticos**

### **Configuración:**
- `.htaccess` (raíz)
- `api/.env` (backend)
- `api/package.json`

### **Base de Datos:**
- Host: `localhost` (Hostinger)
- Puerto: `3306`
- Encoding: `utf8mb4`

### **URLs de Producción:**
- Frontend: `https://tudominio.com`
- API: `https://tudominio.com/api`
- Health Check: `https://tudominio.com/api/health`

---

## **🔄 Actualizaciones Futuras**

### Para actualizar el frontend:
```bash
npm run build
# Subir solo frontend/dist/ → public_html/
```

### Para actualizar el backend:
```bash
# Subir archivos modificados → public_html/api/
# Reiniciar app Node.js en hPanel
```

---

## **📞 Soporte**

Si tienes problemas:
1. Revisa logs en hPanel
2. Verifica configuración de .env
3. Prueba conexión a base de datos en phpMyAdmin
4. Contacta soporte de Hostinger si es necesario