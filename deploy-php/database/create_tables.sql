-- Script para crear todas las tablas del sistema en Hostinger
-- Ejecutar en phpMyAdmin después de crear la base de datos

USE u123456789_equipos; -- Cambiar por el nombre real de tu BD

-- Tabla de equipos (principal)
CREATE TABLE IF NOT EXISTS equipos (
    id VARCHAR(50) PRIMARY KEY,
    codigo_articulo VARCHAR(100),
    dominio VARCHAR(20) UNIQUE NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    numero_motor VARCHAR(100),
    numero_chasis VARCHAR(100),
    año INT NOT NULL,
    fecha_incorporacion DATE,
    titulo_nombre VARCHAR(200),
    seguro_compania VARCHAR(200),
    poliza_vto DATE,
    fecha_baja DATE,
    uso ENUM('OPERATIVO', 'NO OPERATIVO', 'PARTICULAR') DEFAULT 'OPERATIVO',
    tipo_vehiculo VARCHAR(50) NOT NULL,
    vtv_vto DATE,
    ficha_mantenimiento VARCHAR(500),
    deposito VARCHAR(200),
    observaciones TEXT,
    imagen_url VARCHAR(500),
    status ENUM('OPERATIVO', 'MANTENIMIENTO', 'FUERA_SERVICIO', 'NO_OPERATIVO', 'PARTICULAR', 'BAJA') DEFAULT 'OPERATIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_tipo_vehiculo (tipo_vehiculo),
    INDEX idx_deposito (deposito)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de proyectos
CREATE TABLE IF NOT EXISTS proyectos (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    tipo ENUM('INTERNO', 'EXTERNO') NOT NULL,
    descripcion TEXT,
    costo_hora DECIMAL(10,2),
    porcentaje_costo DECIMAL(5,2),
    fecha_inicio DATE,
    fecha_fin_prevista DATE,
    responsable VARCHAR(100),
    cliente VARCHAR(200),
    estado ENUM('ACTIVO', 'FINALIZADO', 'SUSPENDIDO') DEFAULT 'ACTIVO',
    presupuesto DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_estado (estado),
    INDEX idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de centros de costo
CREATE TABLE IF NOT EXISTS centros_costo (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descripcion TEXT,
    responsable VARCHAR(100),
    presupuesto DECIMAL(15,2),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de asignaciones (central)
CREATE TABLE IF NOT EXISTS asignaciones (
    id VARCHAR(50) PRIMARY KEY,
    equipo_id VARCHAR(50) NOT NULL,
    proyecto_id VARCHAR(50) NOT NULL,
    centro_costo_id VARCHAR(50) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin_prevista DATE,
    fecha_fin DATE,
    retribucion_tipo ENUM('PORCENTAJE', 'VALOR_FIJO') NOT NULL,
    retribucion_valor DECIMAL(10,2) NOT NULL,
    horas_estimadas DECIMAL(8,2),
    horas_reales DECIMAL(8,2),
    costo_total DECIMAL(15,2),
    estado ENUM('ACTIVA', 'FINALIZADA', 'SUSPENDIDA', 'CANCELADA') DEFAULT 'ACTIVA',
    observaciones TEXT,
    validacion_mantenimiento BOOLEAN DEFAULT FALSE,
    creado_por VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (centro_costo_id) REFERENCES centros_costo(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_equipo_id (equipo_id),
    INDEX idx_proyecto_id (proyecto_id),
    INDEX idx_centro_costo_id (centro_costo_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_inicio (fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de mantenimientos
CREATE TABLE IF NOT EXISTS mantenimientos (
    id VARCHAR(50) PRIMARY KEY,
    equipment_id VARCHAR(50) NOT NULL,
    work_order_number VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('PREVENTIVO', 'CORRECTIVO', 'PREDICTIVO') NOT NULL,
    priority ENUM('BAJA', 'MEDIA', 'ALTA', 'CRITICA') DEFAULT 'MEDIA',
    status ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE') DEFAULT 'SCHEDULED',
    scheduled_date DATE NOT NULL,
    completion_date DATE,
    assigned_technician VARCHAR(100),
    description TEXT,
    tasks JSON,
    estimated_hours DECIMAL(6,2),
    actual_hours DECIMAL(6,2),
    cost DECIMAL(10,2),
    parts_used JSON,
    notes TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key
    FOREIGN KEY (equipment_id) REFERENCES equipos(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_equipment_id (equipment_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vista para asignaciones completas
CREATE OR REPLACE VIEW v_assignments_complete AS
SELECT 
    a.*,
    e.dominio, e.marca, e.modelo, e.tipo_vehiculo,
    p.nombre as proyecto_nombre, 
    p.tipo as proyecto_tipo,
    p.costo_hora as proyecto_costo_hora,
    cc.nombre as centro_costo_nombre,
    cc.codigo as centro_costo_codigo,
    DATEDIFF(COALESCE(a.fecha_fin, CURDATE()), a.fecha_inicio) as dias_asignados,
    -- Cálculo de costo
    CASE 
        WHEN p.tipo = 'INTERNO' AND a.retribucion_tipo = 'PORCENTAJE' THEN
            (p.costo_hora * COALESCE(a.horas_reales, a.horas_estimadas, 0) * a.retribucion_valor / 100)
        WHEN p.tipo = 'EXTERNO' AND a.retribucion_tipo = 'VALOR_FIJO' THEN
            (a.retribucion_valor * COALESCE(a.horas_reales, a.horas_estimadas, 0))
        ELSE 0
    END as costo_calculado
FROM asignaciones a
LEFT JOIN equipos e ON a.equipo_id = e.id
LEFT JOIN proyectos p ON a.proyecto_id = p.id
LEFT JOIN centros_costo cc ON a.centro_costo_id = cc.id;

-- Insertar datos básicos de centros de costo
INSERT IGNORE INTO centros_costo (id, nombre, codigo, descripcion, responsable, activo) VALUES
('1', 'Operaciones Generales', 'OPG-001', 'Centro de costo para operaciones generales', 'Administrador', TRUE),
('2', 'Proyectos Externos', 'PEX-001', 'Centro de costo para proyectos con clientes externos', 'Gerente Proyectos', TRUE),
('3', 'Mantenimiento', 'MNT-001', 'Centro de costo para mantenimiento de equipos', 'Jefe Mantenimiento', TRUE);

-- Insertar proyecto por defecto
INSERT IGNORE INTO proyectos (id, nombre, tipo, descripcion, estado, costo_hora) VALUES
('1', 'Operaciones Internas', 'INTERNO', 'Proyecto para actividades operativas internas', 'ACTIVO', 50.00);

COMMIT;