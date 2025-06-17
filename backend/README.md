# Backend API - Sistema de Control de Equipos

Backend API desarrollado en Node.js/Express para el sistema de gestión de equipos, proyectos y asignaciones.

## 🚀 Instalación y Configuración

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar variables de entorno
Las variables de entorno ya están configuradas en `.env`:
```
DB_HOST=62.72.62.1
DB_PORT=3306
DB_DATABASE=u302432817_gchkd
DB_USERNAME=u302432817_ILTEF
DB_PASSWORD=Puertas3489*
PORT=3001
```

### 3. Inicializar base de datos
```bash
npm run init-db
```

### 4. Cargar datos de prueba (opcional)
```bash
npm run seed
```

### 5. Iniciar servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📡 Endpoints API

### Equipment (Equipos)
- `GET /api/equipment` - Obtener todos los equipos
- `GET /api/equipment/:id` - Obtener equipo específico
- `POST /api/equipment` - Crear nuevo equipo
- `PUT /api/equipment/:id` - Actualizar equipo
- `DELETE /api/equipment/:id` - Eliminar equipo
- `GET /api/equipment/available/assignments` - Equipos disponibles para asignación

### Projects (Proyectos)
- `GET /api/projects` - Obtener todos los proyectos
- `GET /api/projects/:id` - Obtener proyecto específico
- `POST /api/projects` - Crear nuevo proyecto
- `PUT /api/projects/:id` - Actualizar proyecto
- `DELETE /api/projects/:id` - Eliminar proyecto

### Cost Centers (Centros de Costo)
- `GET /api/cost-centers` - Obtener todos los centros de costo
- `GET /api/cost-centers/:id` - Obtener centro específico
- `POST /api/cost-centers` - Crear nuevo centro
- `PUT /api/cost-centers/:id` - Actualizar centro
- `DELETE /api/cost-centers/:id` - Eliminar centro

### Assignments (Asignaciones)
- `GET /api/assignments` - Obtener todas las asignaciones
- `GET /api/assignments/:id` - Obtener asignación específica
- `POST /api/assignments` - Crear nueva asignación
- `PUT /api/assignments/:id` - Actualizar asignación
- `DELETE /api/assignments/:id` - Eliminar asignación
- `GET /api/assignments/stats/dashboard` - Estadísticas del dashboard

### Maintenance (Mantenimientos)
- `GET /api/maintenance` - Obtener todos los mantenimientos
- `GET /api/maintenance/:id` - Obtener mantenimiento específico
- `POST /api/maintenance` - Crear nuevo mantenimiento
- `PUT /api/maintenance/:id` - Actualizar mantenimiento
- `DELETE /api/maintenance/:id` - Eliminar mantenimiento

### Health Check
- `GET /api/health` - Estado del servidor y base de datos

## 🗃️ Estructura de Base de Datos

### Tablas principales:
- **equipos** - Información de equipos/vehículos
- **proyectos** - Proyectos internos y externos
- **centros_costo** - Centros de costo para asignaciones
- **asignaciones** - Asignaciones de equipos a proyectos
- **mantenimientos** - Registros de mantenimiento

### Relaciones:
- `asignaciones.equipo_id → equipos.id`
- `asignaciones.proyecto_id → proyectos.id`
- `asignaciones.centro_costo_id → centros_costo.id`
- `mantenimientos.equipment_id → equipos.id`

## 🔧 Comandos NPM

```bash
# Instalar dependencias
npm install

# Iniciar en desarrollo (con nodemon)
npm run dev

# Iniciar en producción
npm start

# Inicializar base de datos
npm run init-db

# Cargar datos de prueba
npm run seed
```

## 📊 Características

### Seguridad
- Helmet para headers de seguridad
- CORS configurado
- Rate limiting
- Validación de entrada con express-validator

### Base de Datos
- Pool de conexiones MySQL
- Transacciones
- Índices optimizados
- Manejo de errores

### API Features
- Filtros y búsquedas
- Paginación (preparado)
- Validaciones robustas
- Respuestas consistentes
- Logging de requests

## 🌐 URLs de Acceso

- **Servidor**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health
- **API Base**: http://localhost:3001/api/

## 📝 Notas

1. El servidor se conecta automáticamente a la base de datos MySQL remota
2. Las tablas se crean automáticamente con `npm run init-db`
3. Los datos de prueba incluyen equipos reales del frontend
4. Todas las respuestas están en formato JSON
5. Los errores incluyen códigos HTTP apropiados