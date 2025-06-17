import { executeQuery, testConnection } from '../config/database.js';

const createTables = async () => {
  try {
    console.log('🚀 Inicializando base de datos...');
    
    // Probar conexión
    const connected = await testConnection();
    if (!connected) {
      process.exit(1);
    }

    // Crear tabla de equipos
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS equipos (
        id VARCHAR(50) PRIMARY KEY,
        dominio VARCHAR(20) NOT NULL UNIQUE,
        marca VARCHAR(50) NOT NULL,
        modelo VARCHAR(50) NOT NULL,
        año INT NOT NULL,
        tipo_vehiculo VARCHAR(50) NOT NULL,
        motor VARCHAR(100),
        chasis VARCHAR(100),
        poliza_numero VARCHAR(100),
        poliza_vto DATE,
        vtv_vto DATE,
        status ENUM('OPERATIVO', 'MANTENIMIENTO', 'FUERA_SERVICIO') DEFAULT 'OPERATIVO',
        observaciones TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Crear tabla de proyectos
    await executeQuery(`
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Crear tabla de centros de costo
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS centros_costo (
        id VARCHAR(50) PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        codigo VARCHAR(20) NOT NULL UNIQUE,
        descripcion TEXT,
        responsable VARCHAR(100),
        presupuesto DECIMAL(15,2),
        activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Crear tabla de asignaciones
    await executeQuery(`
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
        FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
        FOREIGN KEY (centro_costo_id) REFERENCES centros_costo(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Crear tabla de mantenimientos
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS mantenimientos (
        id VARCHAR(50) PRIMARY KEY,
        equipment_id VARCHAR(50) NOT NULL,
        work_order_number VARCHAR(50) NOT NULL UNIQUE,
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
        FOREIGN KEY (equipment_id) REFERENCES equipos(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Crear índices para optimizar consultas
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_equipos_status ON equipos(status)`);
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_equipos_tipo ON equipos(tipo_vehiculo)`);
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_proyectos_estado ON proyectos(estado)`);
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_asignaciones_estado ON asignaciones(estado)`);
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_asignaciones_fechas ON asignaciones(fecha_inicio, fecha_fin_prevista)`);
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_mantenimientos_status ON mantenimientos(status)`);
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_mantenimientos_fecha ON mantenimientos(scheduled_date)`);

    console.log('✅ Tablas creadas exitosamente');
    console.log('📋 Tablas disponibles:');
    console.log('   - equipos');
    console.log('   - proyectos');
    console.log('   - centros_costo');
    console.log('   - asignaciones');
    console.log('   - mantenimientos');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    process.exit(1);
  }
};

createTables();