# 🏗️ Diagrama de Base de Datos - Sistema de Gestión de Equipos

## 🎯 **Diagrama Entidad-Relación (ER)**

```
                    ┌─────────────────────────────────────┐
                    │             EQUIPOS                 │
                    │  ┌─────────────────────────────────┐│
                    │  │ 🔑 id (PK)                      ││
                    │  │ 🏷️  codigo_articulo              ││
                    │  │ 🚗 dominio (UNIQUE)             ││
                    │  │ 🏭 marca                        ││
                    │  │ 📝 modelo                       ││
                    │  │ ⚙️  numero_motor                 ││
                    │  │ 🔧 numero_chasis                ││
                    │  │ 📅 año                          ││
                    │  │ 📊 status                       ││
                    │  │ 📍 deposito                     ││
                    │  │ 🖼️  imagen_url                   ││
                    │  │ ... (más campos)                ││
                    │  └─────────────────────────────────┘│
                    └─────────────────┬───────────────────┘
                                     │
                     ┌───────────────┴────────────────┐
                     │ 1:N                           │ 1:N
                     ▼                               ▼
    ┌────────────────────────────────┐    ┌──────────────────────────────┐
    │        ASIGNACIONES            │    │       MANTENIMIENTOS         │
    │ ┌─────────────────────────────┐│    │ ┌─────────────────────────── ┐│
    │ │ 🔑 id (PK)                  ││    │ │ 🔑 id (PK)                 ││
    │ │ 🔗 equipo_id (FK)           ││    │ │ 🔗 equipment_id (FK)       ││
    │ │ 🔗 proyecto_id (FK)         ││    │ │ 📋 work_order_number       ││
    │ │ 🔗 centro_costo_id (FK)     ││    │ │ 🔧 type                    ││
    │ │ 📅 fecha_inicio             ││    │ │ ⚡ priority                ││
    │ │ 📅 fecha_fin_prevista       ││    │ │ 📊 status                  ││
    │ │ 📅 fecha_fin                ││    │ │ 📅 scheduled_date          ││
    │ │ 💰 retribucion_tipo         ││    │ │ 🔧 assigned_technician     ││
    │ │ 💵 retribucion_valor        ││    │ │ ⏱️  estimated_hours         ││
    │ │ ⏱️  horas_estimadas          ││    │ │ 💰 cost                    ││
    │ │ ⏱️  horas_reales             ││    │ │ 📝 tasks (JSON)            ││
    │ │ 💰 costo_total              ││    │ │ 🔩 parts_used (JSON)       ││
    │ │ 📊 estado                   ││    │ │ ... (más campos)           ││
    │ └─────────────────────────────┘│    │ └─────────────────────────── ┘│
    └────────────┬───────────────────┘    └──────────────────────────────┘
                 │
      ┌─────────┴──────────┐
      │ N:1              │ N:1
      ▼                  ▼
┌─────────────────┐  ┌────────────────────┐
│   PROYECTOS     │  │  CENTROS_COSTO     │
│ ┌──────────────┐│  │ ┌─────────────────┐│
│ │ 🔑 id (PK)   ││  │ │ 🔑 id (PK)      ││
│ │ 📋 nombre    ││  │ │ 🏷️  nombre       ││
│ │ 🎯 tipo      ││  │ │ 🆔 codigo (UQ)  ││
│ │ 💰 costo_hora││  │ │ 👤 responsable  ││
│ │ 👤 responsable││  │ │ 💰 presupuesto  ││
│ │ 💵 presupuesto││  │ │ ✅ activo       ││
│ │ 📊 estado    ││  │ │ ... (más)       ││
│ │ ... (más)    ││  │ └─────────────────┘│
│ └──────────────┘│  └────────────────────┘
└─────────────────┘
```

## 🔗 **Matriz de Relaciones**

| **Tabla Padre** | **Tabla Hija** | **Tipo Relación** | **Clave Foránea** | **Cardinalidad** |
|-----------------|----------------|-------------------|-------------------|------------------|
| `equipos` | `asignaciones` | 1:N | `equipo_id` | Un equipo → Muchas asignaciones |
| `proyectos` | `asignaciones` | 1:N | `proyecto_id` | Un proyecto → Muchas asignaciones |
| `centros_costo` | `asignaciones` | 1:N | `centro_costo_id` | Un centro → Muchas asignaciones |
| `equipos` | `mantenimientos` | 1:N | `equipment_id` | Un equipo → Muchos mantenimientos |

## 🎯 **Tabla Central: ASIGNACIONES**

La tabla `asignaciones` actúa como el **núcleo del sistema**, conectando:

```
    EQUIPOS ←── ASIGNACIONES ──→ PROYECTOS
                     │
                     ▼
               CENTROS_COSTO
```

### **Flujo de Datos Principal:**
1. 🚛 Se registra un **equipo** en `equipos`
2. 📊 Se crea un **proyecto** en `proyectos`
3. 💰 Se define un **centro de costo** en `centros_costo`
4. 🔗 Se crea una **asignación** que conecta los tres elementos
5. 🔧 Se programa **mantenimiento** para el equipo asignado

## 📊 **Dependencias Funcionales**

### **Dependencias Fuertes (CASCADE DELETE)**
```
equipos ──DELETE──→ asignaciones ──DELETE──→ [Órfanos eliminados]
equipos ──DELETE──→ mantenimientos ──DELETE──→ [Órfanos eliminados]
proyectos ──DELETE──→ asignaciones ──DELETE──→ [Órfanos eliminados]
centros_costo ──DELETE──→ asignaciones ──DELETE──→ [Órfanos eliminados]
```

### **Dependencias de Negocio**
```
🔒 REGLA: Solo una asignación ACTIVA por equipo
🔒 REGLA: Mantenimiento validado antes de asignación
🔒 REGLA: Cálculo automático de costos según tipo proyecto
```

## 🗂️ **Módulos y Tablas por Funcionalidad**

### 🚛 **Módulo Equipment (Equipos)**
- **Tabla Principal:** `equipos`
- **Tablas Relacionadas:** `asignaciones`, `mantenimientos`
- **Funciones:** CRUD de equipos, gestión de imágenes, historial

### 📊 **Módulo Projects (Proyectos)**
- **Tabla Principal:** `proyectos`
- **Tablas Relacionadas:** `asignaciones`
- **Funciones:** Gestión de proyectos internos/externos, costos

### 💰 **Módulo Cost Centers (Centros de Costo)**
- **Tabla Principal:** `centros_costo`
- **Tablas Relacionadas:** `asignaciones`
- **Funciones:** Administración presupuestaria, reporting financiero

### 🔗 **Módulo Assignments (Asignaciones)**
- **Tabla Principal:** `asignaciones`
- **Tablas Relacionadas:** Todas (equipos, proyectos, centros_costo)
- **Funciones:** Orquestación central, cálculos de costos, planning

### 🔧 **Módulo Maintenance (Mantenimiento)**
- **Tabla Principal:** `mantenimientos`
- **Tablas Relacionadas:** `equipos`
- **Funciones:** Mantenimiento preventivo/correctivo, órdenes de trabajo

### 📈 **Módulo Dashboard/Reports**
- **Tablas:** Todas mediante VIEWs y JOINs complejos
- **Funciones:** Analytics, KPIs, reportes ejecutivos

## 🔧 **Triggers y Funciones Automáticas**

### **Trigger: assignment_validation**
```sql
-- Previene múltiples asignaciones activas por equipo
BEFORE INSERT ON asignaciones
BEFORE UPDATE ON asignaciones
```

### **Trigger: cost_calculation**
```sql
-- Calcula automáticamente costo_total basado en:
-- - Tipo de proyecto (INTERNO/EXTERNO)
-- - Tipo de retribución (PORCENTAJE/VALOR_FIJO)
-- - Horas trabajadas (reales o estimadas)
BEFORE INSERT ON asignaciones
BEFORE UPDATE ON asignaciones
```

## 📋 **Índices de Rendimiento**

### **Índices Primarios**
- `equipos.id`, `proyectos.id`, `centros_costo.id`, `asignaciones.id`, `mantenimientos.id`

### **Índices Únicos**
- `equipos.dominio` (patente única)
- `centros_costo.codigo` (código único)
- `mantenimientos.work_order_number` (orden única)

### **Índices de Consulta**
- `asignaciones.estado` (filtros por estado)
- `equipos.status` (filtros por estado operativo)
- `asignaciones.fecha_inicio` (consultas por fecha)
- `mantenimientos.scheduled_date` (planificación)

## 🎯 **Consultas Típicas del Sistema**

### **1. Equipos Disponibles para Asignación**
```sql
SELECT * FROM equipos e
WHERE NOT EXISTS (
    SELECT 1 FROM asignaciones a 
    WHERE a.equipo_id = e.id AND a.estado = 'ACTIVA'
)
AND e.status = 'OPERATIVO';
```

### **2. Resumen de Asignaciones por Proyecto**
```sql
SELECT 
    p.nombre,
    COUNT(a.id) as total_asignaciones,
    SUM(a.costo_total) as costo_total_proyecto
FROM proyectos p
LEFT JOIN asignaciones a ON p.id = a.proyecto_id
GROUP BY p.id, p.nombre;
```

### **3. Mantenimientos Vencidos**
```sql
SELECT 
    e.dominio,
    m.work_order_number,
    m.scheduled_date,
    DATEDIFF(CURDATE(), m.scheduled_date) as dias_vencido
FROM mantenimientos m
JOIN equipos e ON m.equipment_id = e.id
WHERE m.status = 'SCHEDULED' 
AND m.scheduled_date < CURDATE();
```

Esta estructura garantiza la integridad de datos, optimización de consultas y escalabilidad del sistema de gestión de equipos.