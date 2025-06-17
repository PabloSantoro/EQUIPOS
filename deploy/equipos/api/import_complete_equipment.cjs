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

// Función para mapear status según uso
function mapStatus(uso) {
  if (uso === 'NO OPERATIVO') return 'FUERA_SERVICIO';
  return 'OPERATIVO';
}

// Lista COMPLETA de los 51 equipos de Puertas SRL
const completeEquipmentData = [
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
    tipoVehiculo: 'UTILITARIO',
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
    uso: 'OPERATIVO',
    tipoVehiculo: 'CAMION PLATO',
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
    uso: 'OPERATIVO',
    tipoVehiculo: 'CAMIÓN CAJA',
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
    uso: 'OPERATIVO',
    tipoVehiculo: 'SEMIRREMOLQUE',
    deposito: 'LMA- COMIN',
    observaciones: 'Operativo - Ganfeng'
  },
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
    uso: 'OPERATIVO',
    tipoVehiculo: 'CAMIONETA 4X4',
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
    uso: 'OPERATIVO',
    tipoVehiculo: 'SEMIRREMOLQUE',
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
    uso: 'OPERATIVO',
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
    tipoVehiculo: 'CAMIÓN MEDIANO CAJA',
    deposito: 'LMA- COMIN',
    observaciones: 'Operativo - Ganfeng'
  },
  {
    codigoArticulo: 'ACTROD--AE156FW',
    dominio: 'AE156FW',
    marca: 'TOYOTA',
    modelo: 'CAMIONETA TOYOTA HILUX 4X4 D/C DX 2.4 TDI 6 M/T',
    numeroMotor: '2GD-G148563',
    numeroChasis: '8AJDB3CD8L1302323',
    año: 2020,
    fechaIncorporacion: null,
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    tipoVehiculo: 'CAMIONETA 4X4',
    deposito: 'BO GALAXY',
    observaciones: 'Operativa - CONCAT - Replazo de AC198CU - Cordinar entrega reparada'
  },
  {
    codigoArticulo: 'ACTROD--AE133GW',
    dominio: 'AE133GW',
    marca: 'TOYOTA',
    modelo: 'CAMIONETA TOYOTA HILUX 4X4 D/C DX 2.4 TDI 6 M/T',
    numeroMotor: '2GD-0754337',
    numeroChasis: '8AJDB3CD4L1302173',
    año: 2020,
    fechaIncorporacion: null,
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    tipoVehiculo: 'CAMIONETA 4X4',
    deposito: 'LIVENT- CONCAT',
    observaciones: 'Operativa - CONCAT'
  },
  {
    codigoArticulo: 'ACTROD--AF388WH',
    dominio: 'AF388WH',
    marca: 'VOLKSWAGEN',
    modelo: 'CAMIONETA VOLSKW. AMAROK 2,0L TRENDLINE 4X4',
    numeroMotor: 'CNF129361',
    numeroChasis: '8AWDD22H6NA020705',
    año: 2022,
    fechaIncorporacion: null,
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    tipoVehiculo: 'CAMIONETA 4X4',
    deposito: 'LMA- COMIN',
    observaciones: 'Operativa - Ganfeng'
  },
  {
    codigoArticulo: 'ACTROD--AG140CW',
    dominio: 'AG140CW',
    marca: 'TOYOTA',
    modelo: 'CAMIONETA TOYOTA HILUX 4X4 D/C DX 2.4 TDI 6 M/T',
    numeroMotor: '2GD-D217679',
    numeroChasis: '8AJDB3CD5P1342591',
    año: 2023,
    fechaIncorporacion: '23/6/2023',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'La Caja',
    polizaVto: '10/09/2025',
    uso: 'OPERATIVO',
    tipoVehiculo: 'CAMIONETA 4X4',
    deposito: 'LMA- COMIN',
    observaciones: 'Operativa - Ganfeng'
  },
  {
    codigoArticulo: 'ACTROD--AG113CS',
    dominio: 'AG113CS',
    marca: 'TOYOTA',
    modelo: 'CAMIONETA TOYOTA HILUX 4X4 D/C DX 2.4 TDI 6 M/T',
    numeroMotor: '2GD-G408707',
    numeroChasis: '8AJDB3CD0P1342465',
    año: 2023,
    fechaIncorporacion: '30/6/2023',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
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
    tipoVehiculo: 'CAMIONETA 4X4',
    deposito: 'LMA- COMIN',
    observaciones: 'Operativa - Ganfeng'
  },
  {
    codigoArticulo: 'ACTROD--AG480BR',
    dominio: 'AG480BR',
    marca: 'TOYOTA',
    modelo: 'CAMIONETA TOYOTA HILUX 4X4 D/C DX 2.4 TDI 6 M/T',
    numeroMotor: '2GD-G472635',
    numeroChasis: '8AJDB3CD8R1355497',
    año: 2024,
    fechaIncorporacion: null,
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    tipoVehiculo: 'CAMIONETA 4X4',
    deposito: 'LMA- COMIN',
    observaciones: 'Operativa - Ganfeng'
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
    tipoVehiculo: 'CAMIONETA 4X4',
    deposito: 'LMA- COMIN',
    observaciones: 'Operativa - Ganfeng'
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
    tipoVehiculo: 'AUTOELEVADOR',
    deposito: 'PREDIO- DEPÓSITO EXTERIORES',
    observaciones: 'Operativo - Predio Puertas'
  },
  {
    codigoArticulo: 'ACTROD000000002',
    dominio: 'DMN39',
    marca: 'IRON',
    modelo: 'MINIPALA CARGADORA IRON XT740',
    numeroMotor: '16102085',
    numeroChasis: '1706101',
    año: 2017,
    fechaIncorporacion: null,
    tituloNombre: 'Tercero',
    seguroCompania: null,
    polizaVto: '6/08/2025',
    uso: 'OPERATIVO',
    tipoVehiculo: 'MINICARGADORA',
    deposito: 'PREDIO- DEPÓSITO EXTERIORES',
    observaciones: 'Operativa - Predio Puertas'
  },
  {
    codigoArticulo: 'ACTROD000000003',
    dominio: 'CYT75',
    marca: 'MASSEY FERGUSON',
    modelo: 'TRACTOR MASSEY FERGUSON 2625',
    numeroMotor: 'SJ436E07686',
    numeroChasis: 'FY-844603',
    año: 2013,
    fechaIncorporacion: null,
    tituloNombre: 'Tercero',
    seguroCompania: null,
    polizaVto: null,
    uso: 'OPERATIVO',
    tipoVehiculo: 'TRACTOR',
    deposito: 'TAPIA- DEPÓSITO TAPIA',
    observaciones: 'Fuerza de servicio - Coordinar Visita de chequeo'
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
    tipoVehiculo: 'MINIBUS',
    deposito: 'PREDIO- DEPÓSITO EXTERIORES',
    observaciones: 'Fuerza de servicio - Taller San andres'
  },
  {
    codigoArticulo: 'ACTROD--AG692SN',
    dominio: 'AG692SN',
    marca: 'TOYOTA',
    modelo: 'CAMIONETA TOYOTA HILUX 4X4 D/C DX 2.4 TDI 6 M/T',
    numeroMotor: '2GD-G493613',
    numeroChasis: '8AJDB3CD3R1359246',
    año: 2024,
    fechaIncorporacion: '7/5/2024',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'La Caja',
    polizaVto: '10/09/2025',
    uso: 'OPERATIVO',
    tipoVehiculo: 'CAMIONETA 4X4',
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
    tipoVehiculo: 'CAMION MEDIANO CAJA + HIDROGRUA',
    deposito: 'PREDIO- DEPÓSITO EXTERIORES',
    observaciones: 'Operativo - Predio Puertas'
  },
  {
    codigoArticulo: 'ACTROD--AG718ZL',
    dominio: 'AG718ZL',
    marca: 'INDU METAL TRAILERS',
    modelo: 'TRAILER ACOPLADO INDU METAL',
    numeroMotor: 'NO APLICA',
    numeroChasis: '8A9A0720PR1211073',
    año: 2024,
    fechaIncorporacion: '18/6/2024',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    tipoVehiculo: 'TRAILER-ACOPLADO',
    deposito: 'LMA- COMIN',
    observaciones: 'Operativo - Ganfeng'
  },
  {
    codigoArticulo: 'ACTROD--AE357XT',
    dominio: 'AE357XT',
    marca: 'TOYOTA',
    modelo: 'AUTOMOVIL TOYOTA ETIOS',
    numeroMotor: '2NR4464645',
    numeroChasis: '9BRB29BT9L2260378',
    año: 2020,
    fechaIncorporacion: '26/12/2024',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    tipoVehiculo: 'AUTOMÓVIL',
    deposito: 'ENTRE RIOS - SALTO GRANDE',
    observaciones: ''
  },
  {
    codigoArticulo: 'ACTROD---NSA817',
    dominio: 'NSA817',
    marca: 'FIAT',
    modelo: 'AUTOMOVIL FIAT QUBO',
    numeroMotor: '10FSX16589519',
    numeroChasis: 'ZFA225000D0353355',
    año: 2014,
    fechaIncorporacion: null,
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    tipoVehiculo: 'UTILITARIO',
    deposito: 'PREDIO- DEPÓSITO EXTERIORES',
    observaciones: 'Operativa - Movimientos Puertas'
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
    tipoVehiculo: 'RETROEXCAVADORA-CARGADORA',
    deposito: 'GALAXY',
    observaciones: 'Operativa - Predio Puertas'
  },
  {
    codigoArticulo: 'ACTROD----DDM89',
    dominio: 'DDM89',
    marca: 'BOBCAT',
    modelo: 'MINICARGADORA BOBCAT S630',
    numeroMotor: null,
    numeroChasis: null,
    año: 2017,
    fechaIncorporacion: null,
    tituloNombre: 'Tercero',
    seguroCompania: null,
    polizaVto: null,
    uso: 'OPERATIVO',
    tipoVehiculo: 'MINICARGADORA',
    deposito: 'TAPIA- DEPÓSITO TAPIA',
    observaciones: 'Operativa - Tapia'
  },
  {
    codigoArticulo: 'ACTROD000000007',
    dominio: 'AG825BL',
    marca: 'HIZA TRAILERS',
    modelo: 'TRAILER PLAYO 1EJE CARGA MÁX. 500KG',
    numeroMotor: 'NO APLICA',
    numeroChasis: '8B9A0310MRBHZT026',
    año: 2024,
    fechaIncorporacion: '1/8/2024',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    tipoVehiculo: 'TRAILER',
    deposito: 'DEPÓSITO SOCIOS',
    observaciones: 'Operativo'
  },
  {
    codigoArticulo: 'ACTROD--AG777SV',
    dominio: 'AG777SV',
    marca: 'TOYOTA',
    modelo: 'CAMIONETA TOYOTA HILUX 4X4 D/C DX 2.4 TDI 6 M/T',
    numeroMotor: '1GD-J013451',
    numeroChasis: '8AJBA3FS5S0371415',
    año: 2024,
    fechaIncorporacion: '7/8/2024',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'La Caja',
    polizaVto: '10/09/2025',
    uso: 'OPERATIVO',
    tipoVehiculo: 'CAMIONETA 4X4',
    deposito: 'GALAXY',
    observaciones: 'Operativa - Predio Puertas'
  },
  {
    codigoArticulo: 'ACTROD---OHJ206',
    dominio: 'OHJ206',
    marca: 'FIAT',
    modelo: 'AUTOMOVIL FIAT QUBO (ROWING)',
    numeroMotor: '10FSX16620414',
    numeroChasis: 'ZFA225000E6825253',
    año: 2014,
    fechaIncorporacion: '26/12/2024',
    tituloNombre: 'Tercero',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    tipoVehiculo: 'UTILITARIO',
    deposito: 'BO CANNING',
    observaciones: ''
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
    tipoVehiculo: 'AUTOMÓVIL',
    deposito: 'B. O. NEUQUÉN',
    observaciones: 'Operativo'
  },
  {
    codigoArticulo: 'ACTROD--AF758EE',
    dominio: 'AF758EE',
    marca: 'TOYOTA',
    modelo: 'CAMIONETA TOYOTA HILUX 4X4 DC DX 2.4 TDI 6 MT',
    numeroMotor: '2GD-G357055',
    numeroChasis: '8AJDB3CD4P1332361',
    año: 2023,
    fechaIncorporacion: null,
    tituloNombre: 'PMIN SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    tipoVehiculo: 'CAMIONETA 4X4',
    deposito: 'GALAXY',
    observaciones: 'Operativo - Predio Puertas'
  },
  {
    codigoArticulo: 'ACTROD---EWY667',
    dominio: 'EWY667',
    marca: 'FORD',
    modelo: 'CAMIÓN FORD F 4000 D - CAJA + HIDROGRUA',
    numeroMotor: '30690134',
    numeroChasis: '9BFLF47G35B015499',
    año: 2005,
    fechaIncorporacion: '5/2/2025',
    tituloNombre: 'Tercero',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    tipoVehiculo: 'CAMION MEDIANO CAJA + HIDROGRUA',
    deposito: 'PREDIO- DEPÓSITO EXTERIORES',
    observaciones: 'Operativo'
  },
  {
    codigoArticulo: 'ACTROD--AD733ME',
    dominio: 'AD733ME',
    marca: 'TOYOTA',
    modelo: 'ETIOS X 1,5 6M/T SEDAN 4 PUERTAS',
    numeroMotor: '2NR4315860',
    numeroChasis: '9BRB29BT5K2235055',
    año: 2019,
    fechaIncorporacion: null,
    tituloNombre: 'Tercero',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    tipoVehiculo: 'AUTOMÓVIL',
    deposito: 'PREDIO- DEPÓSITO EXTERIORES',
    observaciones: 'Operativo - Predio Puertas'
  },
  {
    codigoArticulo: 'ACTROD--AH269FP',
    dominio: 'AH269FP',
    marca: 'TOYOTA',
    modelo: 'HILUX 4X4 DC DX 2,4 TDI 6 MT',
    numeroMotor: '2GD-G575633',
    numeroChasis: '8AJDB3CD3S1374528',
    año: 2025,
    fechaIncorporacion: '27/2/2025',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'La Caja',
    polizaVto: '10/09/2025',
    uso: 'OPERATIVO',
    tipoVehiculo: 'CAMIONETA 4X4',
    deposito: 'PREDIO- DEPÓSITO EXTERIORES',
    observaciones: 'Operativa'
  },
  {
    codigoArticulo: 'ACTROD--AB835TX',
    dominio: 'AB835TX',
    marca: 'RENAULT',
    modelo: 'AUTOMOVIL RENAULT LOGAN',
    numeroMotor: 'K7MA812Q024230',
    numeroChasis: '8A14SRBE4JL059182',
    año: 2017,
    fechaIncorporacion: '10/3/2024',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    tipoVehiculo: 'AUTOMÓVIL',
    deposito: 'BO CANNING',
    observaciones: ''
  },
  {
    codigoArticulo: 'ACTROD--AF046OA',
    dominio: 'AF046OA',
    marca: 'TOYOTA',
    modelo: 'HILUX 4X4 DC DX 2,4 TDI 6 MT',
    numeroMotor: '2GD-G258922',
    numeroChasis: '8AJDB3CDXM1314975',
    año: 2021,
    fechaIncorporacion: '22/4/2025',
    tituloNombre: 'Tercero',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    tipoVehiculo: 'CAMIONETA 4X4',
    deposito: 'PREDIO- DEPÓSITO EXTERIORES',
    observaciones: 'Operativa - Predio Puertas'
  },
  {
    codigoArticulo: 'ACTROD--AD417MW',
    dominio: 'AD417MW',
    marca: 'TOYOTA',
    modelo: 'HILUX 4X4 D/C SRX 2,8 TDI 6A/T',
    numeroMotor: '1GD-G068537',
    numeroChasis: '8AJBAJCD0K1616587',
    año: 2019,
    fechaIncorporacion: '28/4/2025',
    tituloNombre: 'Tercero',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'OPERATIVO',
    tipoVehiculo: 'CAMIONETA 4X4',
    deposito: null,
    observaciones: ''
  },
  {
    codigoArticulo: 'ACTROD--AD826UN',
    dominio: 'AD826UN',
    marca: 'NISSAN',
    modelo: 'AUTOMOVIL NISSAN NOTE ADVANCE',
    numeroMotor: 'HR16601602T',
    numeroChasis: '3N1CE2CD3KL353382',
    año: 2019,
    fechaIncorporacion: '30/5/2023',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'PARTICULAR',
    tipoVehiculo: 'AUTOMÓVIL',
    deposito: 'DEPÓSITO SOCIOS',
    observaciones: ''
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
    tipoVehiculo: 'SUV',
    deposito: 'DEPÓSITO SOCIOS',
    observaciones: 'Operativo'
  },
  {
    codigoArticulo: 'ACTROD--AH282WG',
    dominio: 'AH282WG',
    marca: 'VOLKSWAGEN',
    modelo: 'AMAROK EXTREME V6 AT 4X4 G2',
    numeroMotor: 'DDX 246627',
    numeroChasis: '8AWJW62H0SA016553',
    año: 2025,
    fechaIncorporacion: null,
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'PARTICULAR',
    tipoVehiculo: 'CAMIONETA 4X4',
    deposito: null,
    observaciones: ''
  },
  {
    codigoArticulo: 'ACTROD--AF334YR',
    dominio: 'AF334YR',
    marca: 'VOLKSWAGEN',
    modelo: 'CAMIONETA VOLKSW. AMAROK V6',
    numeroMotor: 'DDX 188882',
    numeroChasis: '8AWDW22H2NA019366',
    año: 2022,
    fechaIncorporacion: null,
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'PARTICULAR',
    tipoVehiculo: 'CAMIONETA 4X4',
    deposito: 'BO CANNING',
    observaciones: 'Operativa - Cordinando Retiro - Se coloco parabrisa'
  },
  {
    codigoArticulo: 'ACTROD--AG777ST',
    dominio: 'AG777ST',
    marca: 'TOYOTA',
    modelo: 'SUV TOYOTA SW4 SRX 2.8',
    numeroMotor: '1GD-J013451',
    numeroChasis: '8AJBA3FS5S0371415',
    año: 2024,
    fechaIncorporacion: null,
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'PARTICULAR',
    tipoVehiculo: 'SUV',
    deposito: 'DEPÓSITO SOCIOS',
    observaciones: 'Operativa'
  },
  {
    codigoArticulo: 'ACTROD000000004',
    dominio: 'A220WIB',
    marca: 'YAMAHA',
    modelo: 'CUATRICICLO YFM125A',
    numeroMotor: 'E365E-036881',
    numeroChasis: 'JY4AE02W59C012971',
    año: 2009,
    fechaIncorporacion: '26/3/2024',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '20/11/2025',
    uso: 'PARTICULAR',
    tipoVehiculo: 'MOTO VEHÍCULO',
    deposito: 'DEPÓSITO SOCIOS',
    observaciones: ''
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
    tipoVehiculo: 'MOTO VEHÍCULO',
    deposito: 'DEPÓSITO SOCIOS',
    observaciones: 'Fuera de servicio'
  },
  {
    codigoArticulo: 'ACTROD000000008',
    dominio: 'A021AIN',
    marca: 'CAN AM',
    modelo: 'CUATRICICLO 854',
    numeroMotor: 'M9667667',
    numeroChasis: '3JBLPAU28GJ001015',
    año: 2016,
    fechaIncorporacion: '4/10/2024',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '6/11/2025',
    uso: 'PARTICULAR',
    tipoVehiculo: 'MOTO VEHÍCULO',
    deposito: 'DEPÓSITO SOCIOS',
    observaciones: ''
  },
  {
    codigoArticulo: 'ACTROD--AE852VW',
    dominio: 'AE852UW',
    marca: 'TOYOTA',
    modelo: 'SUV TOYOTA SW4 S 4X4 SRX 2,8',
    numeroMotor: '1GD-4977510',
    numeroChasis: '8AJBA3FS3M0295308',
    año: 2021,
    fechaIncorporacion: '6/7/2023',
    tituloNombre: 'Puertas SRL',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'PARTICULAR',
    tipoVehiculo: 'SUV',
    deposito: 'DEPÓSITO SOCIOS',
    observaciones: 'Operativa'
  },
  {
    codigoArticulo: 'ACTROD--AC866BS',
    dominio: 'AC866BS',
    marca: 'NISSAN',
    modelo: 'SUV NISSAN KICKS EXCLUSIVE',
    numeroMotor: 'HR16477368T',
    numeroChasis: '94DFCAP15KB202386',
    año: 2018,
    fechaIncorporacion: null,
    tituloNombre: 'Tercero',
    seguroCompania: 'Federación Patronal',
    polizaVto: '24/01/2026',
    uso: 'PARTICULAR',
    tipoVehiculo: 'SUV',
    deposito: 'DEPÓSITO SOCIOS',
    observaciones: 'Operativa'
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
    tipoVehiculo: 'CAMIÓN CAJA',
    deposito: 'BAJA',
    observaciones: 'Vendido'
  }
];

async function importCompleteEquipment() {
  const connection = await mysql.createConnection(config);
  
  try {
    // Limpiar tabla actual
    console.log('🗑️ Limpiando tabla equipos...');
    await connection.execute('DELETE FROM equipos');
    
    console.log(`📦 Insertando ${completeEquipmentData.length} equipos COMPLETOS de la lista oficial...`);
    
    for (const [index, equipo] of completeEquipmentData.entries()) {
      const query = `
        INSERT INTO equipos (
          id, codigo_articulo, dominio, marca, modelo, numero_motor, numero_chasis,
          año, fecha_incorporacion, titulo_nombre, seguro_compania, poliza_vto, 
          fecha_baja, uso, tipo_vehiculo, vtv_vto, ficha_mantenimiento,
          deposito, status, observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        mapTipoVehiculo(equipo.tipoVehiculo),
        null, // vtv_vto
        'FLOTA MANTENIMIENTO.xlsx',
        equipo.deposito,
        mapStatus(equipo.uso),
        equipo.observaciones || ''
      ];
      
      await connection.execute(query, values);
      console.log(`✅ ${index + 1}/${completeEquipmentData.length} - ${equipo.dominio} (${equipo.marca} ${equipo.modelo.substring(0, 25)}...)`);
    }
    
    console.log('\\n🎉 ¡Importación COMPLETA de 51 equipos exitosa!');
    
    // Verificar la importación
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM equipos');
    console.log(`📊 Total de equipos en la base de datos: ${countResult[0].total}`);
    
    // Mostrar estadísticas por estado
    const [statusStats] = await connection.execute(`
      SELECT status, COUNT(*) as count 
      FROM equipos 
      GROUP BY status
    `);
    
    console.log('\\n📈 Estadísticas por estado:');
    statusStats.forEach(stat => {
      console.log(`   ${stat.status}: ${stat.count} equipos`);
    });
    
    // Mostrar estadísticas por uso
    const [usoStats] = await connection.execute(`
      SELECT uso, COUNT(*) as count 
      FROM equipos 
      GROUP BY uso
    `);
    
    console.log('\\n🏷️ Estadísticas por uso:');
    usoStats.forEach(stat => {
      console.log(`   ${stat.uso}: ${stat.count} equipos`);
    });
    
    // Mostrar estadísticas por tipo
    const [tipoStats] = await connection.execute(`
      SELECT tipo_vehiculo, COUNT(*) as count 
      FROM equipos 
      GROUP BY tipo_vehiculo
      ORDER BY count DESC
    `);
    
    console.log('\\n🚛 Estadísticas por tipo de vehículo:');
    tipoStats.forEach(stat => {
      console.log(`   ${stat.tipo_vehiculo}: ${stat.count} equipos`);
    });
    
  } catch (error) {
    console.error('❌ Error durante la importación:', error.message);
  } finally {
    await connection.end();
  }
}

importCompleteEquipment();