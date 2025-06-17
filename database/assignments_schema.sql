-- Esquema de Base de Datos para Módulo de Asignación de Equipos

-- Tabla de Proyectos
CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    tipo ENUM('INTERNO', 'EXTERNO') NOT NULL,
    descripcion TEXT,
    costo_hora DECIMAL(10,2), -- Para proyectos internos
    porcentaje_costo DECIMAL(5,2), -- Para proyectos internos (0-100)
    fecha_inicio DATE NOT NULL,
    fecha_fin_prevista DATE,
    cliente VARCHAR(200), -- Para proyectos externos
    responsable VARCHAR(100) NOT NULL,
    estado ENUM('ACTIVO', 'SUSPENDIDO', 'FINALIZADO') DEFAULT 'ACTIVO',
    presupuesto DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_tipo (tipo),
    INDEX idx_estado (estado),
    INDEX idx_fecha_inicio (fecha_inicio),
    INDEX idx_responsable (responsable)
);

-- Tabla de Centros de Costo
CREATE TABLE cost_centers (
    id VARCHAR(36) PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descripcion TEXT,
    responsable VARCHAR(100) NOT NULL,
    presupuesto DECIMAL(12,2),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_codigo (codigo),
    INDEX idx_activo (activo),
    INDEX idx_responsable (responsable)
);

-- Tabla de Asignaciones
CREATE TABLE assignments (
    id VARCHAR(36) PRIMARY KEY,
    equipo_id VARCHAR(36) NOT NULL,
    proyecto_id VARCHAR(36) NOT NULL,
    centro_costo_id VARCHAR(36) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    fecha_fin_prevista DATE,
    retribucion_tipo ENUM('PORCENTAJE', 'VALOR_FIJO') NOT NULL,
    retribucion_valor DECIMAL(10,2) NOT NULL,
    horas_estimadas DECIMAL(8,2),
    horas_reales DECIMAL(8,2),
    estado ENUM('ACTIVA', 'FINALIZADA', 'SUSPENDIDA', 'CANCELADA') DEFAULT 'ACTIVA',
    observaciones TEXT,
    costo_total DECIMAL(12,2), -- Campo calculado
    validacion_mantenimiento BOOLEAN DEFAULT FALSE,
    creado_por VARCHAR(100) NOT NULL,
    modificado_por VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    FOREIGN KEY (proyecto_id) REFERENCES projects(id) ON DELETE RESTRICT,
    FOREIGN KEY (centro_costo_id) REFERENCES cost_centers(id) ON DELETE RESTRICT,
    
    -- Índices
    INDEX idx_equipo_id (equipo_id),
    INDEX idx_proyecto_id (proyecto_id),
    INDEX idx_centro_costo_id (centro_costo_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_inicio (fecha_inicio),
    INDEX idx_fecha_fin (fecha_fin),
    
    -- Restricción única: Un equipo solo puede tener una asignación activa
    UNIQUE KEY uk_equipo_activo (equipo_id, estado) -- Solo si estado = 'ACTIVA'
);

-- Tabla de Histórico de Asignaciones (para auditoría)
CREATE TABLE assignment_history (
    id VARCHAR(36) PRIMARY KEY,
    assignment_id VARCHAR(36) NOT NULL,
    campo_modificado VARCHAR(50) NOT NULL,
    valor_anterior TEXT,
    valor_nuevo TEXT,
    modificado_por VARCHAR(100) NOT NULL,
    motivo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    INDEX idx_assignment_id (assignment_id),
    INDEX idx_fecha (created_at)
);

-- Vista para consultas optimizadas
CREATE VIEW v_assignments_complete AS
SELECT 
    a.*,
    p.nombre as proyecto_nombre,
    p.tipo as proyecto_tipo,
    p.costo_hora as proyecto_costo_hora,
    p.porcentaje_costo as proyecto_porcentaje_costo,
    cc.nombre as centro_costo_nombre,
    cc.codigo as centro_costo_codigo,
    -- Cálculo de días asignados
    DATEDIFF(COALESCE(a.fecha_fin, CURDATE()), a.fecha_inicio) as dias_asignados,
    -- Cálculo de costo según tipo de proyecto
    CASE 
        WHEN p.tipo = 'INTERNO' AND a.retribucion_tipo = 'PORCENTAJE' THEN
            (p.costo_hora * COALESCE(a.horas_reales, a.horas_estimadas, 0) * a.retribucion_valor / 100)
        WHEN p.tipo = 'EXTERNO' AND a.retribucion_tipo = 'VALOR_FIJO' THEN
            (a.retribucion_valor * COALESCE(a.horas_reales, a.horas_estimadas, 0))
        ELSE 0
    END as costo_calculado
FROM assignments a
LEFT JOIN projects p ON a.proyecto_id = p.id
LEFT JOIN cost_centers cc ON a.centro_costo_id = cc.id;

-- Trigger para validar regla de negocio: un equipo solo puede tener una asignación activa
DELIMITER //
CREATE TRIGGER tr_check_active_assignment 
BEFORE INSERT ON assignments
FOR EACH ROW
BEGIN
    DECLARE active_count INT;
    
    IF NEW.estado = 'ACTIVA' THEN
        SELECT COUNT(*) INTO active_count
        FROM assignments 
        WHERE equipo_id = NEW.equipo_id 
        AND estado = 'ACTIVA' 
        AND id != NEW.id;
        
        IF active_count > 0 THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'El equipo ya tiene una asignación activa';
        END IF;
    END IF;
END//
DELIMITER ;

-- Trigger para actualizar costo_total automáticamente
DELIMITER //
CREATE TRIGGER tr_update_costo_total
BEFORE UPDATE ON assignments
FOR EACH ROW
BEGIN
    DECLARE proyecto_tipo VARCHAR(20);
    DECLARE proyecto_costo_hora DECIMAL(10,2);
    DECLARE proyecto_porcentaje DECIMAL(5,2);
    
    -- Obtener datos del proyecto
    SELECT p.tipo, p.costo_hora, p.porcentaje_costo
    INTO proyecto_tipo, proyecto_costo_hora, proyecto_porcentaje
    FROM projects p
    WHERE p.id = NEW.proyecto_id;
    
    -- Calcular costo total
    IF proyecto_tipo = 'INTERNO' AND NEW.retribucion_tipo = 'PORCENTAJE' THEN
        SET NEW.costo_total = (proyecto_costo_hora * COALESCE(NEW.horas_reales, NEW.horas_estimadas, 0) * NEW.retribucion_valor / 100);
    ELSEIF proyecto_tipo = 'EXTERNO' AND NEW.retribucion_tipo = 'VALOR_FIJO' THEN
        SET NEW.costo_total = (NEW.retribucion_valor * COALESCE(NEW.horas_reales, NEW.horas_estimadas, 0));
    END IF;
END//
DELIMITER ;

-- Datos de ejemplo
INSERT INTO projects (id, nombre, tipo, descripcion, costo_hora, porcentaje_costo, fecha_inicio, responsable) VALUES
('proj-001', 'Construcción Planta Norte', 'INTERNO', 'Proyecto interno de expansión', 1500.00, 15.00, '2025-01-01', 'Juan Pérez'),
('proj-002', 'Alquiler Ganfeng Lithium', 'EXTERNO', 'Servicios para cliente externo', NULL, NULL, '2025-01-15', 'María González'),
('proj-003', 'Mantenimiento Predio Central', 'INTERNO', 'Mantenimiento de instalaciones', 1200.00, 10.00, '2025-02-01', 'Carlos López');

INSERT INTO cost_centers (id, nombre, codigo, descripcion, responsable, presupuesto, activo) VALUES
('cc-001', 'Operaciones Tucumán', 'OP-TUC', 'Centro de costos operaciones Tucumán', 'Ana Martínez', 500000.00, TRUE),
('cc-002', 'Proyectos Externos', 'PROJ-EXT', 'Centro de costos para proyectos externos', 'Roberto Silva', 1000000.00, TRUE),
('cc-003', 'Mantenimiento General', 'MANT-GEN', 'Centro de costos mantenimiento', 'Luis Rodríguez', 300000.00, TRUE);