# 📊 Estructura de Base de Datos - Sistema de Gestión de Equipos

## 🗃️ **Información General**
- **Motor de BD:** MySQL 8.0+
- **Codificación:** UTF8MB4
- **Motor de Almacenamiento:** InnoDB
- **Nombre de BD:** `equipos_db` (configurable via env)

---

## 📋 **Listado Completo de Tablas**

### 1. 🚛 **`equipos`** - Gestión de Equipos y Vehículos

**Propósito:** Almacena toda la información de la flota de equipos, vehículos y maquinaria de la empresa.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|--------------|
| `id` | VARCHAR(50) | Identificador único | PRIMARY KEY |
| `codigo_articulo` | VARCHAR(100) | Código interno del artículo (ACT-...) | |
| `dominio` | VARCHAR(20) | Patente/dominio del vehículo | UNIQUE, NOT NULL |
| `marca` | VARCHAR(50) | Marca/fabricante | NOT NULL |
| `modelo` | VARCHAR(50) | Descripción del modelo | NOT NULL |
| `numero_motor` | VARCHAR(100) | Número de motor | |
| `numero_chasis` | VARCHAR(100) | Número de chasis/VIN | |
| `año` | INT | Año del modelo | NOT NULL |
| `fecha_incorporacion` | DATE | Fecha de incorporación a la empresa | |
| `titulo_nombre` | VARCHAR(200) | Titular del título | |
| `seguro_compania` | VARCHAR(200) | Compañía de seguros | |
| `poliza_vto` | DATE | Vencimiento de póliza | |
| `fecha_baja` | DATE | Fecha de baja del equipo | |
| `uso` | ENUM | 'OPERATIVO', 'NO OPERATIVO', 'PARTICULAR' | |
| `tipo_vehiculo` | VARCHAR(50) | Tipo de vehículo/equipo | NOT NULL |
| `vtv_vto` | DATE | Vencimiento VTV | |
| `ficha_mantenimiento` | VARCHAR(500) | Referencia a ficha de mantenimiento | |
| `deposito` | VARCHAR(200) | Ubicación/depósito | |
| `observaciones` | TEXT | Observaciones generales | |
| `imagen_url` | VARCHAR(500) | URL de imagen del equipo | |
| `status` | ENUM | 'OPERATIVO', 'MANTENIMIENTO', 'FUERA_SERVICIO' | DEFAULT 'OPERATIVO' |
| `created_at` | TIMESTAMP | Fecha de creación | AUTO |
| `updated_at` | TIMESTAMP | Fecha de actualización | AUTO |

**Módulo:** Equipment Management (`/modules/equipment/`)  
**API:** `/api/equipment`

---

### 2. 📊 **`proyectos`** - Gestión de Proyectos

**Propósito:** Administra proyectos internos y externos para asignación de equipos y seguimiento de costos.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|--------------|
| `id` | VARCHAR(50) | Identificador único | PRIMARY KEY |
| `nombre` | VARCHAR(200) | Nombre del proyecto | NOT NULL |
| `tipo` | ENUM | 'INTERNO', 'EXTERNO' | NOT NULL |
| `descripcion` | TEXT | Descripción del proyecto | |
| `costo_hora` | DECIMAL(10,2) | Costo por hora (proyectos internos) | |
| `porcentaje_costo` | DECIMAL(5,2) | Porcentaje de costo (proyectos internos) | |
| `fecha_inicio` | DATE | Fecha de inicio del proyecto | |
| `fecha_fin_prevista` | DATE | Fecha de finalización prevista | |
| `responsable` | VARCHAR(100) | Responsable del proyecto | |
| `cliente` | VARCHAR(200) | Cliente (proyectos externos) | |
| `estado` | ENUM | 'ACTIVO', 'FINALIZADO', 'SUSPENDIDO' | DEFAULT 'ACTIVO' |
| `presupuesto` | DECIMAL(15,2) | Presupuesto del proyecto | |
| `created_at` | TIMESTAMP | Fecha de creación | AUTO |
| `updated_at` | TIMESTAMP | Fecha de actualización | AUTO |

**Módulo:** Projects Management (`/modules/projects/`)  
**API:** `/api/projects`

---

### 3. 💰 **`centros_costo`** - Centros de Costo

**Propósito:** Gestiona centros de costo para asignación financiera y seguimiento presupuestario.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|--------------|
| `id` | VARCHAR(50) | Identificador único | PRIMARY KEY |
| `nombre` | VARCHAR(200) | Nombre del centro de costo | NOT NULL |
| `codigo` | VARCHAR(20) | Código del centro de costo | UNIQUE, NOT NULL |
| `descripcion` | TEXT | Descripción | |
| `responsable` | VARCHAR(100) | Responsable del centro | |
| `presupuesto` | DECIMAL(15,2) | Presupuesto asignado | |
| `activo` | BOOLEAN | Estado activo | DEFAULT TRUE |
| `created_at` | TIMESTAMP | Fecha de creación | AUTO |
| `updated_at` | TIMESTAMP | Fecha de actualización | AUTO |

**Módulo:** Cost Centers (`/modules/cost-centers/`)  
**API:** `/api/cost-centers`

---

### 4. 🔗 **`asignaciones`** - Asignaciones de Equipos (TABLA CENTRAL)

**Propósito:** Tabla central que gestiona las asignaciones de equipos a proyectos y centros de costo.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|--------------|
| `id` | VARCHAR(50) | Identificador único | PRIMARY KEY |
| `equipo_id` | VARCHAR(50) | Referencia al equipo | FK → equipos(id), NOT NULL |
| `proyecto_id` | VARCHAR(50) | Referencia al proyecto | FK → proyectos(id), NOT NULL |
| `centro_costo_id` | VARCHAR(50) | Referencia al centro de costo | FK → centros_costo(id), NOT NULL |
| `fecha_inicio` | DATE | Fecha de inicio de asignación | NOT NULL |
| `fecha_fin_prevista` | DATE | Fecha de finalización prevista | |
| `fecha_fin` | DATE | Fecha de finalización real | |
| `retribucion_tipo` | ENUM | 'PORCENTAJE', 'VALOR_FIJO' | NOT NULL |
| `retribucion_valor` | DECIMAL(10,2) | Valor de retribución | NOT NULL |
| `horas_estimadas` | DECIMAL(8,2) | Horas estimadas de trabajo | |
| `horas_reales` | DECIMAL(8,2) | Horas reales trabajadas | |
| `costo_total` | DECIMAL(15,2) | Costo total calculado | AUTO-CALCULADO |
| `estado` | ENUM | 'ACTIVA', 'FINALIZADA', 'SUSPENDIDA', 'CANCELADA' | DEFAULT 'ACTIVA' |
| `observaciones` | TEXT | Observaciones de la asignación | |
| `validacion_mantenimiento` | BOOLEAN | Validación de mantenimiento | DEFAULT FALSE |
| `creado_por` | VARCHAR(100) | Usuario que creó la asignación | |
| `created_at` | TIMESTAMP | Fecha de creación | AUTO |
| `updated_at` | TIMESTAMP | Fecha de actualización | AUTO |

**Reglas de Negocio:**
- ⚠️ Un equipo solo puede tener una asignación activa a la vez
- 🔄 Trigger automático calcula `costo_total` basado en tipo de proyecto y horas

**Módulo:** Assignments (`/modules/assignments/`)  
**API:** `/api/assignments`

---

### 5. 🔧 **`mantenimientos`** - Gestión de Mantenimiento

**Propósito:** Seguimiento de mantenimientos programados, órdenes de trabajo e historial de servicios.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|--------------|
| `id` | VARCHAR(50) | Identificador único | PRIMARY KEY |
| `equipment_id` | VARCHAR(50) | Referencia al equipo | FK → equipos(id), NOT NULL |
| `work_order_number` | VARCHAR(50) | Número de orden de trabajo | UNIQUE, NOT NULL |
| `type` | ENUM | 'PREVENTIVO', 'CORRECTIVO', 'PREDICTIVO' | NOT NULL |
| `priority` | ENUM | 'BAJA', 'MEDIA', 'ALTA', 'CRITICA' | DEFAULT 'MEDIA' |
| `status` | ENUM | 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE' | DEFAULT 'SCHEDULED' |
| `scheduled_date` | DATE | Fecha programada | NOT NULL |
| `completion_date` | DATE | Fecha de finalización | |
| `assigned_technician` | VARCHAR(100) | Técnico asignado | |
| `description` | TEXT | Descripción del mantenimiento | |
| `tasks` | JSON | Lista de tareas (formato JSON) | |
| `estimated_hours` | DECIMAL(6,2) | Horas estimadas | |
| `actual_hours` | DECIMAL(6,2) | Horas reales | |
| `cost` | DECIMAL(10,2) | Costo total del mantenimiento | |
| `parts_used` | JSON | Repuestos utilizados (formato JSON) | |
| `notes` | TEXT | Notas adicionales | |
| `created_by` | VARCHAR(100) | Usuario creador | |
| `created_at` | TIMESTAMP | Fecha de creación | AUTO |
| `updated_at` | TIMESTAMP | Fecha de actualización | AUTO |

**Módulo:** Maintenance (`/modules/maintenance/`)  
**API:** `/api/maintenance`

---

## 🔗 **Relaciones Entre Tablas**

```
┌─────────────┐    1:N    ┌──────────────┐    N:1    ┌─────────────┐
│   equipos   │ ←──────── │ asignaciones │ ────────→ │  proyectos  │
└─────────────┘           └──────────────┘           └─────────────┘
                                  │
                                  │ N:1
                                  ▼
                           ┌─────────────┐
                           │centros_costo│
                           └─────────────┘

┌─────────────┐    1:N    ┌──────────────┐
│   equipos   │ ←──────── │mantenimientos│
└─────────────┘           └──────────────┘
```

### **Foreign Keys (Claves Foráneas)**

| Tabla | Campo | Referencia | Acción |
|-------|-------|------------|--------|
| `asignaciones` | `equipo_id` | `equipos(id)` | CASCADE DELETE |
| `asignaciones` | `proyecto_id` | `proyectos(id)` | CASCADE DELETE |
| `asignaciones` | `centro_costo_id` | `centros_costo(id)` | CASCADE DELETE |
| `mantenimientos` | `equipment_id` | `equipos(id)` | CASCADE DELETE |

---

## 🎯 **Mapeo de Módulos del Sistema**

| **Módulo** | **Tablas Principales** | **API Endpoints** | **Funcionalidad** |
|------------|----------------------|-------------------|-------------------|
| **Equipment** | `equipos` | `/api/equipment` | 🚛 Gestión completa de flota |
| **Projects** | `proyectos` | `/api/projects` | 📊 Administración de proyectos |
| **Cost Centers** | `centros_costo` | `/api/cost-centers` | 💰 Centros de costo |
| **Assignments** | `asignaciones` + todas las FK | `/api/assignments` | 🔗 Orquestación de asignaciones |
| **Maintenance** | `mantenimientos` + `equipos` | `/api/maintenance` | 🔧 Mantenimiento preventivo/correctivo |
| **Dashboard** | Todas las tablas | Varios endpoints | 📈 Analytics y reportes |
| **Reports** | Todas las tablas | `/api/assignments/stats` | 📊 Inteligencia de negocios |

---

## 🔒 **Características de Integridad de Datos**

### **Restricciones de Integridad**
1. **Claves Foráneas:** Garantizan integridad referencial
2. **Restricciones Únicas:** Previenen duplicados (dominios, códigos)
3. **Triggers de Negocio:** Una sola asignación activa por equipo
4. **Timestamps Automáticos:** Auditoría de creación/modificación
5. **Eliminación en Cascada:** Consistencia al eliminar registros padre

### **Reglas de Negocio Implementadas**
- ✅ Un equipo solo puede tener una asignación activa
- ✅ Cálculo automático de costos según tipo de proyecto
- ✅ Validación de mantenimiento antes de asignación
- ✅ Control de estados y transiciones válidas

---

## 🚀 **Optimizaciones de Rendimiento**

### **Índices Estratégicos**
- **Primarios:** Todos los `id` campos
- **Únicos:** `dominio`, `codigo`, `work_order_number`
- **Rendimiento:** `status`, `estado`, `fecha_inicio`, `scheduled_date`
- **Foráneas:** Todas las FK tienen índices automáticos

### **Características Avanzadas**
1. **Connection Pooling:** Pool de conexiones MySQL
2. **Campos JSON:** Almacenamiento flexible (tareas, repuestos)
3. **Vistas Optimizadas:** Views para consultas complejas
4. **Triggers Automáticos:** Cálculos en tiempo real

---

## 📊 **Vista Principal de Asignaciones**

```sql
CREATE VIEW v_assignments_complete AS
SELECT 
    a.*,
    e.dominio, e.marca, e.modelo,
    p.nombre as proyecto_nombre, p.tipo as proyecto_tipo,
    cc.nombre as centro_costo_nombre,
    DATEDIFF(COALESCE(a.fecha_fin, CURDATE()), a.fecha_inicio) as dias_asignados,
    -- Cálculo automático de costos
    CASE 
        WHEN p.tipo = 'INTERNO' THEN (p.costo_hora * a.horas_reales * a.retribucion_valor / 100)
        WHEN p.tipo = 'EXTERNO' THEN (a.retribucion_valor * a.horas_reales)
        ELSE 0
    END as costo_calculado
FROM asignaciones a
LEFT JOIN equipos e ON a.equipo_id = e.id
LEFT JOIN proyectos p ON a.proyecto_id = p.id
LEFT JOIN centros_costo cc ON a.centro_costo_id = cc.id;
```

Esta estructura proporciona una base sólida para la gestión integral de equipos con integridad de datos, optimización de rendimiento y separación clara de responsabilidades entre módulos funcionales.