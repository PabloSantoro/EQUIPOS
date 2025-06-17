# 📋 Resumen Ejecutivo - Base de Datos del Sistema

## 🏗️ **Arquitectura General**

El sistema utiliza **5 tablas principales** en una arquitectura **star schema** con `asignaciones` como tabla central:

```
equipos ←─┐
         ├─→ asignaciones ←─ proyectos
centros_costo ←─┘           
                            
equipos ←───→ mantenimientos
```

## 📊 **Tablas por Módulo**

| **Módulo** | **Tabla Principal** | **Registros Típicos** | **Propósito** |
|------------|--------------------|-----------------------|---------------|
| 🚛 **Equipment** | `equipos` | ~51 equipos | Gestión de flota vehicular/maquinaria |
| 📊 **Projects** | `proyectos` | Variable | Proyectos internos y externos |
| 💰 **Cost Centers** | `centros_costo` | ~10-20 centros | Control presupuestario |
| 🔗 **Assignments** | `asignaciones` | Variable (histórico) | **TABLA CENTRAL** - Conecta todo |
| 🔧 **Maintenance** | `mantenimientos` | Variable | Mantenimiento preventivo/correctivo |

## 🎯 **Flujo de Datos Principal**

1. **Registro de Equipo** → `equipos`
2. **Creación de Proyecto** → `proyectos`  
3. **Definición de Centro de Costo** → `centros_costo`
4. **Asignación de Equipo** → `asignaciones` (conecta 1+2+3)
5. **Programación de Mantenimiento** → `mantenimientos`

## 🔒 **Reglas de Negocio Críticas**

- ⚠️ **UN EQUIPO = UNA ASIGNACIÓN ACTIVA** (controlado por trigger)
- 💰 **Cálculo automático de costos** según tipo de proyecto
- 🔧 **Validación de mantenimiento** antes de asignación
- 📅 **Control de estados** y transiciones válidas

## 🚀 **Características Técnicas**

### **Motor y Configuración**
- **MySQL 8.0+** con InnoDB
- **UTF8MB4** encoding
- **Connection pooling** habilitado
- **Cascade deletes** para integridad

### **Optimizaciones**
- **Índices estratégicos** en campos críticos
- **Triggers automáticos** para cálculos
- **Views optimizadas** para consultas complejas
- **Campos JSON** para datos flexibles

## 📈 **APIs y Endpoints**

| **Endpoint** | **Tabla(s)** | **Funcionalidad** |
|--------------|--------------|-------------------|
| `/api/equipment` | `equipos` | CRUD de equipos + imágenes |
| `/api/projects` | `proyectos` | Gestión de proyectos |
| `/api/cost-centers` | `centros_costo` | Administración de centros |
| `/api/assignments` | `asignaciones` + FK | **Core business logic** |
| `/api/maintenance` | `mantenimientos` | Órdenes de trabajo |

## 🔗 **Dependencias Críticas**

### **Foreign Keys**
- `asignaciones.equipo_id` → `equipos.id`
- `asignaciones.proyecto_id` → `proyectos.id`
- `asignaciones.centro_costo_id` → `centros_costo.id`
- `mantenimientos.equipment_id` → `equipos.id`

### **Campos Únicos**
- `equipos.dominio` (patente/placa)
- `centros_costo.codigo`
- `mantenimientos.work_order_number`

## 🎯 **Consultas Típicas de Alto Impacto**

### **Dashboard Principal**
```sql
-- Equipos por estado
SELECT status, COUNT(*) FROM equipos GROUP BY status;

-- Asignaciones activas con detalles
SELECT * FROM v_assignments_complete WHERE estado = 'ACTIVA';
```

### **Control Operativo**
```sql
-- Equipos disponibles para asignación
SELECT * FROM equipos WHERE status = 'OPERATIVO' 
AND id NOT IN (SELECT equipo_id FROM asignaciones WHERE estado = 'ACTIVA');

-- Mantenimientos vencidos
SELECT * FROM mantenimientos WHERE status = 'SCHEDULED' 
AND scheduled_date < CURDATE();
```

## ⚠️ **Puntos Críticos de Atención**

1. **Integridad Referencial:** Las FK garantizan consistencia pero requieren orden en eliminaciones
2. **Rendimiento:** Tabla `asignaciones` crecerá históricamente - considerar archivado
3. **Backup:** Datos críticos de activos físicos - backup diario recomendado
4. **Concurrencia:** Trigger de asignación única puede crear bloqueos en alta concurrencia

## 📊 **Métricas de Monitoreo**

### **Operacionales**
- Total equipos por estado
- Asignaciones activas vs disponibles
- Mantenimientos vencidos
- Costo total por proyecto/centro

### **Técnicas**
- Tiempo de respuesta en consultas JOIN complejas
- Crecimiento de tabla `asignaciones`
- Uso de índices en consultas frecuentes
- Bloqueos en triggers de validación

## 🔄 **Próximos Pasos Recomendados**

1. **Implementar auditoría** completa en tablas críticas
2. **Optimizar consultas** de dashboard con views materializadas  
3. **Agregar validaciones** adicionales en capa de aplicación
4. **Configurar alertas** para mantenimientos vencidos
5. **Implementar archivado** histórico para asignaciones antigas

---

**Última actualización:** Junio 2025  
**Versión del schema:** 1.0  
**Contacto técnico:** Administrador de Base de Datos