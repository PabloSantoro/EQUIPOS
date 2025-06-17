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

const equipmentData = [
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
    fechaBaja: null,
    uso: 'OPERATIVO',
    gpsInstalado: 'N/A',
    tipoVehiculo: 'ACOPLADO',
    vtvVto: null,
    fichaMantenimiento: 'FLOTA MANTENIMIENTO.xlsx',
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
    fechaBaja: null,
    uso: 'OPERATIVO',
    gpsInstalado: 'N/A',
    tipoVehiculo: 'RETROEXCAVADORA-CARGADORA',
    vtvVto: null,
    fichaMantenimiento: 'FLOTA MANTENIMIENTO.xlsx',
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
    fechaBaja: null,
    uso: 'OPERATIVO',
    gpsInstalado: 'No',
    tipoVehiculo: 'UTILITARIO',
    vtvVto: null,
    fichaMantenimiento: 'FLOTA MANTENIMIENTO.xlsx',
    deposito: 'BO CANNING',
    observaciones: 'Aguardando confirmacion para transferir doc OK'
  },
  {
    codigoArticulo: 'ACTROD---OHP472',
    dominio: 'OHP472',
    marca: 'FORD',
    modelo: 'CAMIÓN FORD CARGO 2632 - PLATO',
    numeroMotor: '36490395',
    numeroChasis: '9BFZEA1Y2EBS73137',
    año: 2014,
    fechaIncorporacion: '30/1/2024',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    fechaBaja: null,
    uso: 'OPERATIVO',
    gpsInstalado: 'No',
    tipoVehiculo: 'CAMION PLATO',
    vtvVto: null,
    fichaMantenimiento: 'FLOTA MANTENIMIENTO.xlsx',
    deposito: 'LMA- COMIN',
    observaciones: 'Operativo - Ganfeng'
  },
  {
    codigoArticulo: 'ACTROD---OFF861',
    dominio: 'OFF861',
    marca: 'FORD',
    modelo: 'CAMION FORD CARGO 2632 - CAJA',
    numeroMotor: '36483238',
    numeroChasis: '9BFZEA1Y5EBS68983',
    año: 2014,
    fechaIncorporacion: null,
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    fechaBaja: null,
    uso: 'OPERATIVO',
    gpsInstalado: 'Si',
    tipoVehiculo: 'CAMIÓN CAJA',
    vtvVto: null,
    fichaMantenimiento: 'FLOTA MANTENIMIENTO.xlsx',
    deposito: 'BO SALTA - TALLER',
    observaciones: 'Operativo - Salta - Cordinar retiro'
  },
  {
    codigoArticulo: 'ACTROD---OCH483',
    dominio: 'OCH483',
    marca: 'LAMBERT',
    modelo: 'ACOPLADO LAMBERT S12BV',
    numeroMotor: 'NO APLICA',
    numeroChasis: '8E9S0083DEA314177',
    año: 2015,
    fechaIncorporacion: '30/1/2024',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    fechaBaja: null,
    uso: 'OPERATIVO',
    gpsInstalado: 'N/A',
    tipoVehiculo: 'SEMIRREMOLQUE',
    vtvVto: null,
    fichaMantenimiento: 'FLOTA MANTENIMIENTO.xlsx',
    deposito: 'LMA- COMIN',
    observaciones: 'Operativo - Ganfeng'
  }
  // Continúo con más equipos...
];

// Función para obtener más equipos (continuando la lista)
function getMoreEquipment() {
  return [
    {
      codigoArticulo: 'BO PREDIO - BAJADA PARA REPARACION',
      dominio: 'AC198CU',
      marca: 'TOYOTA',
      modelo: 'CAMIONETA TOYOTA HILUX 4X4 D/C DX 2.4 TDI 6 M/T',
      numeroMotor: '2GD-C251557',
      numeroChasis: '8AJDB8CD8J1396374',
      año: 2017,
      fechaIncorporacion: null,
      tituloNombre: 'Puertas SRL',
      seguroCompania: 'Federación Patronal',
      polizaVto: '24/01/2026',
      fechaBaja: null,
      uso: 'OPERATIVO',
      gpsInstalado: 'Si',
      tipoVehiculo: 'CAMIONETA 4X4',
      vtvVto: null,
      fichaMantenimiento: 'FLOTA MANTENIMIENTO.xlsx',
      deposito: 'BO TUCUMAN - PREDIO',
      observaciones: ''
    },
    {
      codigoArticulo: 'ACTROD--AD051KJ',
      dominio: 'AD051KJ',
      marca: 'MONTENEGRO',
      modelo: 'CARRETÓN DE TIRO MONTENEGRO 3 EJES',
      numeroMotor: 'NO APLICA',
      numeroChasis: '8A9ACA3MDJANM1086',
      año: 2018,
      fechaIncorporacion: null,
      tituloNombre: 'Puertas SRL',
      seguroCompania: 'Federación Patronal',
      polizaVto: '24/01/2026',
      fechaBaja: null,
      uso: 'OPERATIVO',
      gpsInstalado: 'N/A',
      tipoVehiculo: 'SEMIRREMOLQUE',
      vtvVto: null,
      fichaMantenimiento: 'FLOTA MANTENIMIENTO.xlsx',
      deposito: 'BO TUCUMAN - PREDIO',
      observaciones: 'Operativo'
    },
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
      fechaBaja: null,
      uso: 'OPERATIVO',
      gpsInstalado: 'Si',
      tipoVehiculo: 'CAMIONETA 4X4',
      vtvVto: null,
      fichaMantenimiento: 'FLOTA MANTENIMIENTO.xlsx',
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
      fechaBaja: null,
      uso: 'OPERATIVO',
      gpsInstalado: 'Si',
      tipoVehiculo: 'CAMIÓN MEDIANO CAJA',
      vtvVto: null,
      fichaMantenimiento: 'FLOTA MANTENIMIENTO.xlsx',
      deposito: 'LMA- COMIN',
      observaciones: 'Operativo - Ganfeng'
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
      fechaBaja: null,
      uso: 'NO OPERATIVO',
      gpsInstalado: 'No',
      tipoVehiculo: 'CAMIÓN CAJA',
      vtvVto: null,
      fichaMantenimiento: 'FLOTA MANTENIMIENTO.xlsx',
      deposito: 'BAJA',
      observaciones: 'Vendido'
    }
  ];
}

async function importEquipment() {
  const connection = await mysql.createConnection(config);
  
  try {
    // Limpiar tabla actual
    console.log('🗑️ Limpiando tabla equipos...');
    await connection.execute('DELETE FROM equipos');
    
    // Combinar todos los equipos
    const allEquipment = [...equipmentData, ...getMoreEquipment()];
    
    console.log(`📦 Insertando ${allEquipment.length} equipos...`);
    
    for (const [index, equipo] of allEquipment.entries()) {
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
        convertDate(equipo.fechaBaja),
        equipo.uso,
        equipo.gpsInstalado,
        mapTipoVehiculo(equipo.tipoVehiculo),
        convertDate(equipo.vtvVto),
        equipo.fichaMantenimiento,
        equipo.deposito,
        mapStatus(equipo.uso),
        equipo.observaciones
      ];
      
      await connection.execute(query, values);
      console.log(`✅ ${index + 1}/${allEquipment.length} - ${equipo.dominio} (${equipo.marca} ${equipo.modelo})`);
    }
    
    console.log('\\n🎉 ¡Importación completada exitosamente!');
    
    // Verificar la importación
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM equipos');
    console.log(`📊 Total de equipos en la base de datos: ${countResult[0].total}`);
    
  } catch (error) {
    console.error('❌ Error durante la importación:', error.message);
  } finally {
    await connection.end();
  }
}

importEquipment();