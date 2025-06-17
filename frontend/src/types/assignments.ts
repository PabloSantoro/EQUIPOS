import { Equipment } from '../types';

// Enum para tipos de proyecto
export enum ProjectType {
  INTERNO = 'INTERNO',
  EXTERNO = 'EXTERNO'
}

// Enum para estados de asignación
export enum AssignmentStatus {
  ACTIVA = 'ACTIVA',
  FINALIZADA = 'FINALIZADA',
  SUSPENDIDA = 'SUSPENDIDA',
  CANCELADA = 'CANCELADA'
}

// Enum para tipos de retribución
export enum RetributionType {
  PORCENTAJE = 'PORCENTAJE',
  VALOR_FIJO = 'VALOR_FIJO'
}

// Entidad Proyecto
export interface Project {
  id: string;
  nombre: string;
  tipo: ProjectType;
  descripcion: string;
  costoHora?: number; // Para proyectos internos
  porcentajeCosto?: number; // Para proyectos internos (%)
  fechaInicio: string;
  fechaFinPrevista?: string;
  cliente?: string; // Para proyectos externos
  responsable: string;
  estado: 'ACTIVO' | 'SUSPENDIDO' | 'FINALIZADO';
  presupuesto?: number;
  createdAt: string;
  updatedAt: string;
}

// Entidad Centro de Costo
export interface CostCenter {
  id: string;
  nombre: string;
  codigo: string;
  descripcion: string;
  responsable: string;
  presupuesto?: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

// Entidad Asignación
export interface Assignment {
  id: string;
  equipoId: string;
  equipo?: Equipment; // Poblado en consultas
  proyectoId: string;
  proyecto?: Project; // Poblado en consultas
  centroCostoId: string;
  centroCosto?: CostCenter; // Poblado en consultas
  fechaInicio: string;
  fechaFin?: string;
  fechaFinPrevista?: string;
  retribucionTipo: RetributionType;
  retribucionValor: number; // Valor fijo por hora o porcentaje
  horasEstimadas?: number;
  horasReales?: number;
  estado: AssignmentStatus;
  observaciones?: string;
  costoTotal?: number; // Calculado
  validacionMantenimiento: boolean; // Si pasó validación de mantenimiento
  // Auditoría
  creadoPor: string;
  modificadoPor?: string;
  createdAt: string;
  updatedAt: string;
}

// DTO para crear asignación
export interface CreateAssignmentDTO {
  equipoId: string;
  proyectoId: string;
  centroCostoId: string;
  fechaInicio: string;
  fechaFinPrevista?: string;
  retribucionTipo: RetributionType;
  retribucionValor: number;
  horasEstimadas?: number;
  observaciones?: string;
}

// DTO para actualizar asignación
export interface UpdateAssignmentDTO {
  fechaFin?: string;
  fechaFinPrevista?: string;
  retribucionTipo?: RetributionType;
  retribucionValor?: number;
  horasReales?: number;
  estado?: AssignmentStatus;
  observaciones?: string;
}

// Reporte de asignación
export interface AssignmentReport {
  asignacion: Assignment;
  costoCalculado: number;
  diasAsignados: number;
  eficienciaHoras: number; // horasReales / horasEstimadas
  rentabilidad?: number; // Para proyectos externos
}

// Filtros para búsqueda
export interface AssignmentFilters {
  equipoId?: string;
  proyectoId?: string;
  centroCostoId?: string;
  estado?: AssignmentStatus;
  fechaDesde?: string;
  fechaHasta?: string;
  tipoProyecto?: ProjectType;
}