import { executeQuery, testConnection } from '../config/database.js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const seedData = async () => {
  try {
    console.log('🌱 Iniciando carga de datos de prueba...');
    
    // Probar conexión
    const connected = await testConnection();
    if (!connected) {
      process.exit(1);
    }

    // Leer datos de equipos desde el frontend
    const equipmentDataPath = join(__dirname, '../../frontend/src/data/mockEquipment.ts');
    let equipmentData;
    
    try {
      const fileContent = await readFile(equipmentDataPath, 'utf-8');
      // Extraer el array de equipos del archivo TypeScript
      const arrayMatch = fileContent.match(/export const mockEquipment.*?= (\[[\s\S]*?\]);/);
      if (arrayMatch) {
        // Reemplazar las propiedades TypeScript por versiones JavaScript válidas
        let cleanedData = arrayMatch[1]
          .replace(/\s+(\w+):/g, ' "$1":')  // Comillas en las claves
          .replace(/'/g, '"');             // Comillas simples por dobles
        
        equipmentData = JSON.parse(cleanedData);
      }
    } catch (error) {
      console.log('No se pudo leer datos de equipos del frontend, usando datos por defecto');
    }

    // Datos por defecto si no se pueden leer del frontend
    if (!equipmentData) {
      equipmentData = [
        {
          id: "1",
          dominio: "AA123BB",
          marca: "Caterpillar",
          modelo: "320D",
          año: 2018,
          tipoVehiculo: "RETROEXCAVADORA",
          motor: "C6.6 ACERT",
          chasis: "CAT00320DLJBS12345",
          polizaNumero: "POL-12345",
          polizaVto: "2025-06-15",
          vtvVto: "2025-03-20",
          status: "OPERATIVO"
        },
        {
          id: "2",
          dominio: "BB456CC",
          marca: "Toyota",
          modelo: "Hilux",
          año: 2020,
          tipoVehiculo: "CAMIONETA",
          motor: "2.8L D-4D",
          chasis: "MR0FB22G101234567",
          polizaNumero: "POL-67890",
          polizaVto: "2025-08-10",
          vtvVto: "2025-05-15",
          status: "OPERATIVO"
        }
      ];
    }

    // Insertar equipos
    console.log('📦 Insertando equipos...');
    for (const equipo of equipmentData) {
      try {
        await executeQuery(`
          INSERT IGNORE INTO equipos (
            id, dominio, marca, modelo, año, tipo_vehiculo, motor, chasis,
            poliza_numero, poliza_vto, vtv_vto, status, observaciones
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          equipo.id,
          equipo.dominio,
          equipo.marca,
          equipo.modelo,
          equipo.año,
          equipo.tipoVehiculo,
          equipo.motor || null,
          equipo.chasis || null,
          equipo.polizaNumero || null,
          equipo.polizaVto || null,
          equipo.vtvVto || null,
          equipo.status || 'OPERATIVO',
          equipo.observaciones || null
        ]);
      } catch (error) {
        console.log(`Error insertando equipo ${equipo.dominio}:`, error.message);
      }
    }

    // Insertar proyectos de prueba
    console.log('🏗️ Insertando proyectos...');
    const proyectos = [
      {
        id: 'proj-001',
        nombre: 'Construcción Planta Norte',
        tipo: 'INTERNO',
        descripcion: 'Proyecto interno de expansión de planta',
        costoHora: 1500,
        porcentajeCosto: 15,
        fechaInicio: '2025-01-01',
        fechaFinPrevista: '2025-06-30',
        responsable: 'Juan Pérez',
        estado: 'ACTIVO',
        presupuesto: 2000000
      },
      {
        id: 'proj-002',
        nombre: 'Alquiler Ganfeng Lithium',
        tipo: 'EXTERNO',
        descripcion: 'Servicios de equipos para cliente externo',
        fechaInicio: '2025-01-15',
        cliente: 'Ganfeng Lithium',
        responsable: 'María González',
        estado: 'ACTIVO'
      },
      {
        id: 'proj-003',
        nombre: 'Mantenimiento Predio Central',
        tipo: 'INTERNO',
        descripcion: 'Mantenimiento de instalaciones centrales',
        costoHora: 1200,
        porcentajeCosto: 10,
        fechaInicio: '2025-02-01',
        responsable: 'Carlos López',
        estado: 'ACTIVO'
      }
    ];

    for (const proyecto of proyectos) {
      try {
        await executeQuery(`
          INSERT IGNORE INTO proyectos (
            id, nombre, tipo, descripcion, costo_hora, porcentaje_costo,
            fecha_inicio, fecha_fin_prevista, responsable, cliente, estado, presupuesto
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          proyecto.id, proyecto.nombre, proyecto.tipo, proyecto.descripcion,
          proyecto.costoHora || null, proyecto.porcentajeCosto || null,
          proyecto.fechaInicio, proyecto.fechaFinPrevista || null,
          proyecto.responsable, proyecto.cliente || null, proyecto.estado,
          proyecto.presupuesto || null
        ]);
      } catch (error) {
        console.log(`Error insertando proyecto ${proyecto.nombre}:`, error.message);
      }
    }

    // Insertar centros de costo
    console.log('🏢 Insertando centros de costo...');
    const centrosCosto = [
      {
        id: 'cc-001',
        nombre: 'Operaciones Tucumán',
        codigo: 'OP-TUC',
        descripcion: 'Centro de costos operaciones Tucumán',
        responsable: 'Ana Martínez',
        presupuesto: 500000,
        activo: true
      },
      {
        id: 'cc-002',
        nombre: 'Proyectos Externos',
        codigo: 'PROJ-EXT',
        descripcion: 'Centro de costos para proyectos externos',
        responsable: 'Roberto Silva',
        presupuesto: 1000000,
        activo: true
      },
      {
        id: 'cc-003',
        nombre: 'Mantenimiento General',
        codigo: 'MANT-GEN',
        descripcion: 'Centro de costos mantenimiento',
        responsable: 'Luis Rodríguez',
        presupuesto: 300000,
        activo: true
      }
    ];

    for (const centro of centrosCosto) {
      try {
        await executeQuery(`
          INSERT IGNORE INTO centros_costo (
            id, nombre, codigo, descripcion, responsable, presupuesto, activo
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          centro.id, centro.nombre, centro.codigo, centro.descripcion,
          centro.responsable, centro.presupuesto, centro.activo
        ]);
      } catch (error) {
        console.log(`Error insertando centro de costo ${centro.nombre}:`, error.message);
      }
    }

    // Insertar algunas asignaciones de ejemplo
    console.log('📋 Insertando asignaciones de ejemplo...');
    const asignaciones = [
      {
        id: 'assign-001',
        equipoId: equipmentData[0]?.id || '1',
        proyectoId: 'proj-001',
        centroCostoId: 'cc-001',
        fechaInicio: '2025-01-10',
        fechaFinPrevista: '2025-03-10',
        retribucionTipo: 'PORCENTAJE',
        retribucionValor: 15,
        horasEstimadas: 400,
        horasReales: 350,
        costoTotal: 78750,
        estado: 'ACTIVA',
        observaciones: 'Asignación para construcción de cimientos',
        creadoPor: 'admin'
      }
    ];

    for (const asignacion of asignaciones) {
      try {
        await executeQuery(`
          INSERT IGNORE INTO asignaciones (
            id, equipo_id, proyecto_id, centro_costo_id, fecha_inicio,
            fecha_fin_prevista, retribucion_tipo, retribucion_valor,
            horas_estimadas, horas_reales, costo_total, estado,
            observaciones, validacion_mantenimiento, creado_por
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          asignacion.id, asignacion.equipoId, asignacion.proyectoId,
          asignacion.centroCostoId, asignacion.fechaInicio, asignacion.fechaFinPrevista,
          asignacion.retribucionTipo, asignacion.retribucionValor,
          asignacion.horasEstimadas, asignacion.horasReales, asignacion.costoTotal,
          asignacion.estado, asignacion.observaciones, true, asignacion.creadoPor
        ]);
      } catch (error) {
        console.log(`Error insertando asignación ${asignacion.id}:`, error.message);
      }
    }

    console.log('✅ Datos de prueba cargados exitosamente');
    console.log(`📦 Equipos insertados: ${equipmentData.length}`);
    console.log(`🏗️ Proyectos insertados: ${proyectos.length}`);
    console.log(`🏢 Centros de costo insertados: ${centrosCosto.length}`);
    console.log(`📋 Asignaciones insertadas: ${asignaciones.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error cargando datos de prueba:', error);
    process.exit(1);
  }
};

seedData();