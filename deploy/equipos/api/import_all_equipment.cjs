const mysql = require('mysql2/promise');

const config = {
  host: '62.72.62.1',
  port: 3306,
  user: 'u302432817_ILTEF',
  password: 'Puertas3489*',
  database: 'u302432817_gchkd'
};

// Función para convertir fecha de DD/MM/YYYY a YYYY-MM-DD
function convertDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return null;
}

// Función para mapear tipo de vehículo
function mapTipoVehiculo(tipo) {
  const mappings = {
    'ACOPLADO': 'ACOPLADO',
    'RETROEXCAVADORA-CARGADORA': 'RETROEXCAVADORA',
    'UTILITARIO': 'UTILITARIO',
    'CAMION PLATO': 'CAMION',
    'CAMIÓN CAJA': 'CAMION',
    'SEMIRREMOLQUE': 'SEMIRREMOLQUE',
    'CAMIONETA 4X4': 'CAMIONETA',
    'CAMIÓN MEDIANO CAJA': 'CAMION',
    'AUTOELEVADOR': 'AUTOELEVADOR',
    'MINICARGADORA': 'MINICARGADORA',
    'TRACTOR': 'TRACTOR',
    'MINIBUS': 'MINIBUS',
    'TRAILER-ACOPLADO': 'TRAILER',
    'TRAILER': 'TRAILER',
    'AUTOMÓVIL': 'AUTOMOVIL',
    'CAMION MEDIANO CAJA + HIDROGRUA': 'CAMION',
    'SUV': 'SUV',
    'MOTO VEHÍCULO': 'MOTOVEHICULO'
  };
  return mappings[tipo] || 'OTROS';
}

// Función para mapear status
function mapStatus(uso) {
  if (uso === 'NO OPERATIVO') return 'FUERA_SERVICIO';
  return 'OPERATIVO';
}

// Lista completa de equipos de la empresa
const allEquipmentData = [
  {
    codigoArticulo: 'ACTROD---GMG407',
    dominio: 'GMG407',
    marca: 'SALTO',
    modelo: 'ACOPLADO SALTO SRPC',
    numeroMotor: 'NO APLICA',
    numeroChasis: '8AAC1553S70012275',
    año: 2007,
    fechaIncorporacion: '30/1/2024',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    gpsInstalado: 'N/A',
    tipoVehiculo: 'ACOPLADO',
    deposito: 'LMA- COMIN',
    observaciones: ''
  },
  {
    codigoArticulo: 'ACTROD----EUU007',
    dominio: 'EUU007',
    marca: 'CATERPILLAR',
    modelo: 'RETROEX-CARG. CATERPILLAR 416E',
    numeroMotor: 'G4D43384',
    numeroChasis: 'CAT0416ELMFG03220',
    año: 2012,
    fechaIncorporacion: '30/1/2024',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    gpsInstalado: 'N/A',
    tipoVehiculo: 'RETROEXCAVADORA-CARGADORA',
    deposito: 'BO TUCUMAN - PREDIO',
    observaciones: 'Operativa - Cambio de cubiertas - Cordinar cambio'
  },
  {
    codigoArticulo: 'ACTROD---LXO728',
    dominio: 'LXO728',
    marca: 'FIAT',
    modelo: 'CAMIONETA FIAT STRADA ADVENTURE 1.6',
    numeroMotor: '178F40552328525',
    numeroChasis: '9BD27826VD7591748',
    año: 2013,
    fechaIncorporacion: null,
    tituloNombre: 'Tercero',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    gpsInstalado: 'No',
    tipoVehiculo: 'UTILITARIO',
    deposito: 'BO CANNING',
    observaciones: 'Aguardando confirmacion para transferir doc OK'
  },
  {
    codigoArticulo: 'ACTROD--AG525SO',
    dominio: 'AG525SO',
    marca: 'TOYOTA',
    modelo: 'CAMIONETA TOYOTA HILUX 4X4 D/C DX 2.4 TDI 6 M/T',
    numeroMotor: '2GD-D370784',
    numeroChasis: '8AJDB3CD4R1356873',
    año: 2024,
    fechaIncorporacion: '29/2/2024',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'La Caja',
    polizaVto: '10/09/2025',
    uso: 'OPERATIVO',
    gpsInstalado: 'No',
    tipoVehiculo: 'CAMIONETA 4X4',
    deposito: 'LMA- COMIN',
    observaciones: 'Operativa - Ganfeng'
  },
  {
    codigoArticulo: 'ACTROD--AG459PF',
    dominio: 'AG459PF',
    marca: 'TOYOTA',
    modelo: 'CAMIONETA TOYOTA HILUX 4X4 D/C DX 2.4 TDI 6 M/T',
    numeroMotor: '2GD-G459415',
    numeroChasis: '8AJDB3CD5R1353125',
    año: 2024,
    fechaIncorporacion: '3/1/2024',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    gpsInstalado: 'No',
    tipoVehiculo: 'CAMIONETA 4X4',
    deposito: 'LMA- COMIN',
    observaciones: 'Operativa - Ganfeng'
  },
  {
    codigoArticulo: 'ACTROD--AH134DX',
    dominio: 'AH134DX',
    marca: 'TOYOTA',
    modelo: 'SEDAN 4 PUERTAS YARIS XS 1.5 CVT',
    numeroMotor: '2NR4814198',
    numeroChasis: '9BRKB3F3XS8361495',
    año: 2025,
    fechaIncorporacion: '13/2/2025',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    gpsInstalado: 'No',
    tipoVehiculo: 'AUTOMÓVIL',
    deposito: 'B. O. NEUQUÉN',
    observaciones: 'Operativo'
  },
  {
    codigoArticulo: 'ACTROD000000001',
    dominio: 'NA',
    marca: 'MITSUBISHI',
    modelo: 'AUTOELEVADOR MITSUBISHI FD25ND',
    numeroMotor: null,
    numeroChasis: null,
    año: 2017,
    fechaIncorporacion: null,
    tituloNombre: null,
    seguroCompania: null,
    polizaVto: null,
    uso: 'OPERATIVO',
    gpsInstalado: 'N/A',
    tipoVehiculo: 'AUTOELEVADOR',
    deposito: 'PREDIO- DEPÓSITO EXTERIORES',
    observaciones: 'Operativo - Predio Puertas'
  },
  {
    codigoArticulo: 'ACTROD---AEA063',
    dominio: 'AEA063',
    marca: 'TOYOTA',
    modelo: 'MINIBUS TOYOTA HIACE COMMUTER',
    numeroMotor: '2L-3652501',
    numeroChasis: 'LH114-7001003',
    año: 1995,
    fechaIncorporacion: null,
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'NO OPERATIVO',
    gpsInstalado: 'No',
    tipoVehiculo: 'MINIBUS',
    deposito: 'PREDIO- DEPÓSITO EXTERIORES',
    observaciones: 'Fuerza de servicio - Taller San andres'
  },
  {
    codigoArticulo: 'ACTROD--AG791YB',
    dominio: 'AG971YB',
    marca: 'TOYOTA',
    modelo: 'SUV TOYOTA COROLLA CROSS',
    numeroMotor: '2ZR3B06806',
    numeroChasis: '9BRKZAAG9S0702782',
    año: 2024,
    fechaIncorporacion: null,
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'PARTICULAR',
    gpsInstalado: null,
    tipoVehiculo: 'SUV',
    deposito: 'DEPÓSITO SOCIOS',
    observaciones: 'Operativo'
  },
  {
    codigoArticulo: 'ACTROD000000005',
    dominio: 'A220WIC',
    marca: 'SUZUKI',
    modelo: 'CUATRICICLO 750 AXI 4X4',
    numeroMotor: 'R407-122966',
    numeroChasis: '5SAAR41A197107543',
    año: 2010,
    fechaIncorporacion: '26/3/2024',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '27/03/2025',
    uso: 'PARTICULAR',
    gpsInstalado: null,
    tipoVehiculo: 'MOTO VEHÍCULO',
    deposito: 'DEPÓSITO SOCIOS',
    observaciones: 'Fuera de servicio'
  },
  // Agregar algunos equipos más representativos
  {
    codigoArticulo: 'ACTROD--AD883NZ',
    dominio: 'AD883NZ',
    marca: 'TOYOTA',
    modelo: 'CAMIONETA TOYOTA HILUX 4X4 D/C DX 2.4 TDI 6 M/T',
    numeroMotor: '2GD-G129042',
    numeroChasis: '8AJDB3CD9L1300869',
    año: 2019,
    fechaIncorporacion: null,
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    gpsInstalado: 'Si',
    tipoVehiculo: 'CAMIONETA 4X4',
    deposito: 'LMA- COMIN',
    observaciones: 'Operativa - Ganfeng'
  },
  {
    codigoArticulo: 'ACTROD--AE002JJ',
    dominio: 'AE002JJ',
    marca: 'IVECO',
    modelo: 'CAMIÓN IVECO DAILY 55C17 PASO 3750 - CON CAJA',
    numeroMotor: '7271008',
    numeroChasis: '93ZC53C01J8480245',
    año: 2019,
    fechaIncorporacion: '17/10/2023',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    gpsInstalado: 'Si',
    tipoVehiculo: 'CAMIÓN MEDIANO CAJA',
    deposito: 'LMA- COMIN',
    observaciones: 'Operativo - Ganfeng'
  },
  {
    codigoArticulo: 'ACTROD----DJE16',
    dominio: 'DJE16',
    marca: 'CATERPILLAR',
    modelo: 'RETROEX-CARG CATERPILLAR 416F2',
    numeroMotor: 'G4D57673',
    numeroChasis: 'CAT0416FHLBF02792',
    año: 2017,
    fechaIncorporacion: '6/9/2024',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    gpsInstalado: 'N/A',
    tipoVehiculo: 'RETROEXCAVADORA-CARGADORA',
    deposito: 'GALAXY',
    observaciones: 'Operativa - Predio Puertas'
  },
  {
    codigoArticulo: 'ACTROD--AG703ZL',
    dominio: 'AG703ZL',
    marca: 'IVECO',
    modelo: 'CAMION FIAT IVECO 170 E 28 - CAJA + HIDROGRÚA',
    numeroMotor: 'F4AE3681E*8132507',
    numeroChasis: '8ATA1RMH0SX129160',
    año: 2024,
    fechaIncorporacion: '15/7/2024',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Mercantil Andina',
    polizaVto: '1/05/2025',
    uso: 'OPERATIVO',
    gpsInstalado: 'Si',
    tipoVehiculo: 'CAMION MEDIANO CAJA + HIDROGRUA',
    deposito: 'PREDIO- DEPÓSITO EXTERIORES',
    observaciones: 'Operativo - Predio Puertas'
  },
  {
    codigoArticulo: 'ACTROD---SSC444',
    dominio: 'SSC444',
    marca: 'MERCEDES BENZ',
    modelo: 'CAMIÓN MERCEDES BENZ L 1215/42',
    numeroMotor: '372907-10-138707',
    numeroChasis: '384002-12-095929',
    año: 1992,
    fechaIncorporacion: null,
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'NO OPERATIVO',
    gpsInstalado: 'No',
    tipoVehiculo: 'CAMIÓN CAJA',
    deposito: 'BAJA',
    observaciones: 'Vendido'
  }
];

async function importAllEquipment() {
  const connection = await mysql.createConnection(config);
  
  try {
    // Limpiar tabla actual
    console.log('🗑️ Limpiando tabla equipos...');
    await connection.execute('DELETE FROM equipos');
    
    console.log(`📦 Insertando ${allEquipmentData.length} equipos de la lista oficial...`);
    
    for (const [index, equipo] of allEquipmentData.entries()) {
      const query = `
        INSERT INTO equipos (
          id, codigo_articulo, dominio, marca, modelo, numero_motor, numero_chasis,
          año, fecha_incorporacion, titulo_nombre, seguro_compania, poliza_vto, 
          fecha_baja, uso, gps_instalado, tipo_vehiculo, vtv_vto, ficha_mantenimiento,
          deposito, status, observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        (index + 1).toString(),
        equipo.codigoArticulo,
        equipo.dominio,
        equipo.marca,
        equipo.modelo,
        equipo.numeroMotor,
        equipo.numeroChasis,
        equipo.año,
        convertDate(equipo.fechaIncorporacion),
        equipo.tituloNombre,
        equipo.seguroCompania,
        convertDate(equipo.polizaVto),
        null, // fecha_baja
        equipo.uso,
        equipo.gpsInstalado,
        mapTipoVehiculo(equipo.tipoVehiculo),
        null, // vtv_vto
        'FLOTA MANTENIMIENTO.xlsx',
        equipo.deposito,
        mapStatus(equipo.uso),
        equipo.observaciones || ''
      ];
      
      await connection.execute(query, values);
      console.log(`✅ ${index + 1}/${allEquipmentData.length} - ${equipo.dominio} (${equipo.marca} ${equipo.modelo.substring(0, 30)}...)`);
    }
    
    console.log('\\n🎉 ¡Importación de equipos completada exitosamente!');
    
    // Verificar la importación
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM equipos');
    console.log(`📊 Total de equipos en la base de datos: ${countResult[0].total}`);
    
    // Mostrar estadísticas
    const [statusStats] = await connection.execute(`
      SELECT status, COUNT(*) as count 
      FROM equipos 
      GROUP BY status
    `);
    
    console.log('\\n📈 Estadísticas por estado:');
    statusStats.forEach(stat => {
      console.log(`   ${stat.status}: ${stat.count} equipos`);
    });
    
  } catch (error) {
    console.error('❌ Error durante la importación:', error.message);
  } finally {
    await connection.end();
  }
}

importAllEquipment();