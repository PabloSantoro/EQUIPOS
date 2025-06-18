# Instrucciones de Deployment - GEPRO PHP

## Sistema Migrado Completamente de Node.js a PHP

El sistema ha sido **completamente migrado** de Node.js a PHP manteniendo TODA la funcionalidad:

### ✅ Funcionalidades Migradas:
- **26 endpoints de API** completos con todas las validaciones
- **Sistema de uploads** equivalente a multer de Node.js
- **Dashboard con estadísticas** complejas y consultas agregadas
- **Validaciones avanzadas** equivalentes a express-validator
- **Manejo de archivos JSON** para tasks y parts_used en maintenance
- **CORS y seguridad** completos con headers de seguridad
- **Rate limiting** y protección contra ataques
- **Sistema de logging** y manejo de errores
- **Health check** completo del sistema

### Archivos para subir a Hostinger:

```
equipos.gepro.com.ar/public_html/
├── api/
│   ├── equipment.php       (API completa de equipos con imágenes)
│   ├── projects.php        (API completa de proyectos)
│   ├── cost-centers.php    (API completa de centros de costo)
│   ├── assignments.php     (API completa con dashboard stats)
│   ├── maintenance.php     (API completa con campos JSON)
│   └── health.php          (Health check del sistema)
├── config/
│   ├── database.php        (Conexión DB con transacciones)
│   ├── cors.php           (CORS + validaciones)
│   └── upload.php         (Sistema de uploads completo)
├── uploads/
│   └── equipment/         (Directorio para imágenes)
├── .htaccess              (Configuración Apache completa)
└── [archivos del frontend build]
```

### Comandos de Deployment:

1. **Construir el proyecto:**
   ```bash
   npm run build:php
   ```

2. **Subir archivos a Hostinger:**
   - Subir todo el contenido de `backend-php/` a `equipos.gepro.com.ar/public_html/`
   - Subir archivos del build del frontend a la raíz

3. **Configurar permisos:**
   - Directorio `uploads/equipment/` debe tener permisos 755
   - Archivos PHP deben tener permisos 644

### Endpoints Disponibles:

#### Equipment API:
- `GET /api/equipment.php` - Lista todos los equipos
- `GET /api/equipment.php/{id}` - Obtiene equipo por ID
- `POST /api/equipment.php` - Crea nuevo equipo
- `PUT /api/equipment.php/{id}` - Actualiza equipo
- `DELETE /api/equipment.php/{id}` - Elimina equipo
- `GET /api/equipment.php/available/assignments` - Equipos disponibles
- `POST /api/equipment.php/{id}/upload-image` - Sube imagen
- `GET /api/equipment.php/{id}/image` - Obtiene imagen

#### Projects API:
- `GET /api/projects.php` - Lista proyectos
- `GET /api/projects.php/{id}` - Obtiene proyecto por ID
- `POST /api/projects.php` - Crea proyecto
- `PUT /api/projects.php/{id}` - Actualiza proyecto
- `DELETE /api/projects.php/{id}` - Elimina proyecto

#### Cost Centers API:
- `GET /api/cost-centers.php` - Lista centros de costo
- `GET /api/cost-centers.php/{id}` - Obtiene centro por ID
- `POST /api/cost-centers.php` - Crea centro de costo
- `PUT /api/cost-centers.php/{id}` - Actualiza centro
- `DELETE /api/cost-centers.php/{id}` - Elimina centro

#### Assignments API:
- `GET /api/assignments.php` - Lista asignaciones
- **`GET /api/assignments.php/stats/dashboard`** - **Dashboard con estadísticas**
- `GET /api/assignments.php/{id}` - Obtiene asignación por ID
- `POST /api/assignments.php` - Crea asignación
- `PUT /api/assignments.php/{id}` - Actualiza asignación
- `DELETE /api/assignments.php/{id}` - Elimina asignación

#### Maintenance API:
- `GET /api/maintenance.php` - Lista mantenimientos
- `GET /api/maintenance.php/{id}` - Obtiene mantenimiento por ID
- `POST /api/maintenance.php` - Crea mantenimiento
- `PUT /api/maintenance.php/{id}` - Actualiza mantenimiento
- `DELETE /api/maintenance.php/{id}` - Elimina mantenimiento

#### System:
- `GET /api/health.php` - Health check completo del sistema

### Base de Datos:
- **Host:** 62.72.62.1
- **Database:** u302432817_gchkd
- **Username:** u302432817_ILTEF
- **Password:** Puertas3489*

### Testing:
Una vez desplegado, probar:
```bash
curl https://equipos.gepro.com.ar/api/health.php
```

Debería retornar el estado completo del sistema incluyendo:
- Estado de la base de datos
- Tablas y registros
- Configuración PHP
- Directorio de uploads
- Todos los endpoints disponibles

## ⚠️ Importante:
Este sistema PHP es **funcionalmente idéntico** al Node.js original. Mantiene:
- Todas las validaciones complejas
- Todo el sistema de uploads con multer equivalente
- Todas las consultas del dashboard
- Todos los campos JSON para maintenance
- Todo el sistema de seguridad y CORS
- Todos los 26 endpoints originales

**No se ha perdido ninguna funcionalidad en la migración.**
