// Equipment Types - Estructura Real
export interface Equipment {
  id: string;
  codigoArticulo?: string; // Codigo de Articulo ACT
  dominio: string; // DOMINIO
  marca: string; // Marca
  modelo: string; // MODELO
  numeroMotor?: string; // N° Motor
  numeroChasis?: string; // N° Chasis
  año: number; // AÑO Modelo
  motor?: string; // N° Motor (alias)
  chasis?: string; // N° Chasis (alias) 
  fechaIncorporacion?: string; // Fecha Incorporación
  tituloNombre?: string; // Título a nombre de:
  seguroCompania?: string; // Seguro Compañía
  polizaVto?: string; // Póliza Vto.
  fechaBaja?: string; // Fecha de Baja
  uso?: EquipmentUso; // USO
  tipoVehiculo: string; // Tipo Vehículo
  vtvVto?: string; // VTV Vto.
  fichaMantenimiento?: string; // Ficha Mantenimiento Link
  deposito?: string; // DEPOSITO
  observaciones?: string; // Observaciones
  imagenUrl?: string; // URL de la imagen del equipo
  status: EquipmentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export enum EquipmentUso {
  OPERATIVO = 'OPERATIVO',
  NO_OPERATIVO = 'NO OPERATIVO',
  PARTICULAR = 'PARTICULAR'
}

export enum EquipmentStatus {
  OPERATIVO = 'OPERATIVO',
  NO_OPERATIVO = 'NO OPERATIVO',
  PARTICULAR = 'PARTICULAR',
  BAJA = 'BAJA'
}

export enum TipoVehiculo {
  ACOPLADO = 'ACOPLADO',
  RETROEXCAVADORA_CARGADORA = 'RETROEXCAVADORA-CARGADORA',
  UTILITARIO = 'UTILITARIO',
  CAMION_PLATO = 'CAMION PLATO',
  CAMION_CAJA = 'CAMIÓN CAJA',
  SEMIRREMOLQUE = 'SEMIRREMOLQUE',
  CAMIONETA_4X4 = 'CAMIONETA 4X4',
  CAMION_MEDIANO_CAJA = 'CAMIÓN MEDIANO CAJA',
  AUTOELEVADOR = 'AUTOELEVADOR',
  MINICARGADORA = 'MINICARGADORA',
  TRACTOR = 'TRACTOR',
  MINIBUS = 'MINIBUS',
  TRAILER_ACOPLADO = 'TRAILER-ACOPLADO',
  AUTOMOVIL = 'AUTOMÓVIL',
  TRAILER = 'TRAILER',
  CAMION_MEDIANO_CAJA_HIDROGRUA = 'CAMION MEDIANO CAJA + HIDROGRUA',
  SUV = 'SUV',
  MOTO_VEHICULO = 'MOTO VEHÍCULO'
}

export enum Depositos {
  LMA_COMIN = 'LMA- COMIN',
  BO_TUCUMAN_PREDIO = 'BO TUCUMAN - PREDIO',
  BO_CANNING = 'BO CANNING',
  BO_SALTA_TALLER = 'BO SALTA - TALLER',
  LIVENT_CONCAT = 'LIVENT- CONCAT',
  BO_GALAXY = 'BO GALAXY',
  GALAXY = 'GALAXY',
  PREDIO_DEPOSITO_EXTERIORES = 'PREDIO- DEPÓSITO EXTERIORES',
  TAPIA_DEPOSITO_TAPIA = 'TAPIA- DEPÓSITO TAPIA',
  ENTRE_RIOS_SALTO_GRANDE = 'ENTRE RIOS - SALTO GRANDE',
  DEPOSITO_SOCIOS = 'DEPÓSITO SOCIOS',
  BO_NEUQUEN = 'B. O. NEUQUÉN',
  BAJA = 'BAJA'
}

// Maintenance Types
export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  scheduledDate: string;
  startDate?: string;
  completedDate?: string;
  estimatedDuration: number;
  actualDuration?: number;
  description: string;
  workOrderNumber: string;
  technician: string;
  serviceProvider?: string;
  cost: number;
  parts: MaintenancePart[];
  tasks: MaintenanceTask[];
  notes?: string;
  nextMaintenanceDate?: string;
  documents: Document[];
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
  EMERGENCY = 'EMERGENCY',
  INSPECTION = 'INSPECTION'
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE'
}

export enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface MaintenancePart {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier?: string;
}

export interface MaintenanceTask {
  id: string;
  description: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
  estimatedDuration: number;
  actualDuration?: number;
  notes?: string;
}

// Common Types
export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  size: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  phone?: string;
  active: boolean;
  createdAt: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  TECHNICIAN = 'TECHNICIAN',
  OPERATOR = 'OPERATOR',
  VIEWER = 'VIEWER'
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

// Filter Types
export interface EquipmentFilters {
  search?: string;
  marca?: string;
  tipoVehiculo?: string;
  uso?: EquipmentUso;
  deposito?: string;
  seguroCompania?: string;
}

export interface MaintenanceFilters {
  search?: string;
  equipmentId?: string;
  type?: MaintenanceType;
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
  dateFrom?: string;
  dateTo?: string;
  technician?: string;
}