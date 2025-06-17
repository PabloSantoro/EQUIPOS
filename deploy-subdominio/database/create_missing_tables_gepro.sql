-- Script para crear las tablas faltantes en GEPRO
-- Solo crea las tablas que no existen, mantiene la tabla equipos existente
-- Ejecutar después de verificar qué tablas ya existen

USE u302432817_gchkd;

-- Tabla de proyectos (crear solo si no existe)
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

-- Tabla de centros de costo (crear solo si no existe)
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

-- Tabla de asignaciones (crear solo si no existe)
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
    
    -- Foreign Keys (solo si la tabla equipos existe)
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

-- Tabla de mantenimientos (crear solo si no existe)
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
    
    -- Foreign Key (solo si la tabla equipos existe)
    FOREIGN KEY (equipment_id) REFERENCES equipos(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_equipment_id (equipment_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar si necesitamos agregar columnas a la tabla equipos existente
-- (ejecutar solo si la columna no existe)

-- Agregar columna imagen_url si no existe
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_schema = 'u302432817_gchkd' 
     AND table_name = 'equipos' 
     AND column_name = 'imagen_url') = 0,
    'ALTER TABLE equipos ADD COLUMN imagen_url VARCHAR(500) NULL',
    'SELECT "La columna imagen_url ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Insertar datos básicos de centros de costo
INSERT IGNORE INTO centros_costo (id, nombre, codigo, descripcion, responsable, activo) VALUES
('1', 'Operaciones Generales', 'OPG-001', 'Centro de costo para operaciones generales de GEPRO', 'Administrador', TRUE),
('2', 'Proyectos Externos', 'PEX-001', 'Centro de costo para proyectos con clientes externos', 'Gerente Proyectos', TRUE),
('3', 'Mantenimiento', 'MNT-001', 'Centro de costo para mantenimiento de equipos', 'Jefe Mantenimiento', TRUE),
('4', 'Ganfeng', 'GAN-001', 'Centro de costo para proyectos Ganfeng', 'Coordinador Ganfeng', TRUE),
('5', 'Concat', 'CON-001', 'Centro de costo para proyectos Concat', 'Coordinador Concat', TRUE);

-- Insertar proyectos básicos
INSERT IGNORE INTO proyectos (id, nombre, tipo, descripcion, estado, costo_hora) VALUES
('1', 'Operaciones Internas GEPRO', 'INTERNO', 'Proyecto para actividades operativas internas de GEPRO', 'ACTIVO', 75.00),
('2', 'Proyecto Ganfeng', 'EXTERNO', 'Proyecto externo para cliente Ganfeng', 'ACTIVO', 100.00),
('3', 'Proyecto Concat', 'EXTERNO', 'Proyecto externo para cliente Concat', 'ACTIVO', 85.00),
('4', 'Mantenimiento General', 'INTERNO', 'Proyecto para actividades de mantenimiento', 'ACTIVO', 50.00);

COMMIT;