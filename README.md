# Sistema de Control de Equipos

Sistema completo de gestión de equipos, mantenimientos y asignaciones desarrollado con React/TypeScript (frontend) y Node.js/Express (backend) conectado a MySQL.

## 🚀 Características Principales

### ✅ Módulos Implementados
- **📦 Gestión de Equipos**: CRUD completo, búsqueda, filtros, exportación CSV
- **🔧 Mantenimientos**: Calendario, Kanban, programación, seguimiento
- **📅 Asignaciones**: Asignación de equipos a proyectos, calendario, costos
- **📊 Reportes**: Dashboard con estadísticas (en desarrollo)
- **👥 Usuarios**: Gestión de usuarios (en desarrollo)

### 🗃️ Base de Datos MySQL Conectada
- **Host**: 62.72.62.1:3306
- **Base de datos**: u302432817_gchkd
- **Tablas**: equipos, proyectos, centros_costo, asignaciones, mantenimientos

## 🛠️ Tecnologías

### Frontend
- **React 19.1.0** con TypeScript
- **Tailwind CSS 3.x** para estilos
- **Vite** como build tool
- **Lucide React** para iconos
- **Hooks personalizados** para API calls

### Backend
- **Node.js** con Express
- **MySQL2** para base de datos
- **JSON Web Tokens** para autenticación
- **Helmet** y **CORS** para seguridad
- **Express Validator** para validaciones

## 📁 Estructura del Proyecto

```
proyecto-equipos/
├── frontend/                    # React/TypeScript frontend
│   ├── src/
│   │   ├── components/         # Componentes UI reutilizables
│   │   ├── modules/           # Módulos principales
│   │   │   ├── equipment/     # Gestión de equipos
│   │   │   ├── maintenance/   # Mantenimientos
│   │   │   ├── assignments/   # Asignaciones
│   │   │   ├── reports/       # Reportes
│   │   │   └── users/         # Usuarios
│   │   ├── services/          # API calls y servicios
│   │   ├── hooks/             # Hooks personalizados
│   │   ├── types/             # Definiciones TypeScript
│   │   └── data/              # Datos mock (backup)
│   └── package.json
│
├── backend/                     # Node.js/Express API
│   ├── config/                # Configuración DB
│   ├── routes/                # Endpoints API
│   ├── scripts/               # Scripts de inicialización
│   ├── server.js              # Servidor principal
│   └── package.json
│
└── README.md                   # Este archivo
```

## 🚀 Instalación y Configuración

### 1. Clonar e instalar dependencias

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Configurar base de datos

```bash
# Inicializar tablas
npm run init-db

# Cargar datos de prueba
npm run seed
```

### 3. Ejecutar en desarrollo

```bash
# Terminal 1: Backend (puerto 3001)
cd backend
npm run dev

# Terminal 2: Frontend (puerto 5173/5174)
cd frontend
npm run dev
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

## 📡 API Endpoints Principales

### Equipos
- `GET /api/equipment` - Listar equipos
- `POST /api/equipment` - Crear equipo
- `PUT /api/equipment/:id` - Actualizar equipo
- `DELETE /api/equipment/:id` - Eliminar equipo

### Asignaciones
- `GET /api/assignments` - Listar asignaciones
- `POST /api/assignments` - Crear asignación
- `PUT /api/assignments/:id` - Actualizar asignación
- `GET /api/assignments/stats/dashboard` - Estadísticas

### Proyectos
- `GET /api/projects` - Listar proyectos
- `POST /api/projects` - Crear proyecto

### Centros de Costo
- `GET /api/cost-centers` - Listar centros de costo
- `POST /api/cost-centers` - Crear centro

### Mantenimientos
- `GET /api/maintenance` - Listar mantenimientos
- `POST /api/maintenance` - Crear mantenimiento

## 🔧 Características Técnicas

### Seguridad
- Autenticación JWT (preparado)
- CORS configurado
- Rate limiting
- Validación de entrada
- Headers de seguridad con Helmet

### Base de Datos
- Pool de conexiones MySQL
- Transacciones
- Índices optimizados
- Relaciones FK con integridad referencial

### Frontend
- Componentes modulares y reutilizables
- Hooks personalizados para API
- Estados de loading y error
- Interfaz responsive
- Exportación de datos a CSV

## 📊 Datos de Ejemplo

El sistema incluye datos de prueba:
- **2 equipos** (Caterpillar 320D, Toyota Hilux)
- **3 proyectos** (Interno: Planta Norte, Externo: Ganfeng Lithium)
- **3 centros de costo** (Operaciones, Proyectos Externos, Mantenimiento)
- **1 asignación activa** de ejemplo

## 🔄 Estado del Proyecto

### ✅ Completado
- Conexión frontend-backend-MySQL
- Módulo de equipos con API real
- Módulo de asignaciones completo
- Módulo de mantenimientos funcional
- Sistema de navegación compacto
- Componentes UI reutilizables

### 🚧 En Desarrollo
- Integración completa de todos los módulos con API
- Módulo de reportes avanzados
- Sistema de autenticación
- Dashboard analytics

### 📋 Por Hacer
- Pruebas unitarias
- Documentación de API
- Deployment a producción
- Optimizaciones de rendimiento

## 💡 Notas Técnicas

1. **Base de datos remota** conectada y funcional
2. **CORS configurado** para desarrollo local
3. **API RESTful** con validaciones robustas
4. **Frontend modular** con arquitectura escalable
5. **Datos reales** desde MySQL, sin dependencias de mock data

## 🆘 Troubleshooting

### Error de CORS
- Verificar que el backend esté corriendo en puerto 3001
- Verificar configuración CORS_ORIGIN en .env

### Error de conexión DB
- Verificar credenciales en backend/.env
- Ejecutar `npm run init-db` si las tablas no existen

### Puerto ocupado
- Frontend automáticamente busca puerto disponible (5173, 5174, etc.)
- Backend configurado en puerto 3001 fijo

El sistema está completamente funcional con base de datos real conectada! 🎉