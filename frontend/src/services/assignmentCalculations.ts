import { Assignment, Project, ProjectType, RetributionType } from '../types/assignments';

/**
 * Servicio para cálculos de asignaciones
 * Implementa las reglas de negocio para cálculo de costos y retribuciones
 */
export class AssignmentCalculationService {
  
  /**
   * Calcula el costo total de una asignación
   * 
   * Reglas:
   * - Proyecto INTERNO + PORCENTAJE: (costo_hora_proyecto * horas) * (porcentaje / 100)
   * - Proyecto EXTERNO + VALOR_FIJO: valor_fijo_por_hora * horas
   */
  static calculateAssignmentCost(assignment: Assignment, project: Project): number {
    const horas = assignment.horasReales || assignment.horasEstimadas || 0;
    
    if (project.tipo === ProjectType.INTERNO && assignment.retribucionTipo === RetributionType.PORCENTAJE) {
      // Proyecto interno: porcentaje del costo asumido
      const costoBase = (project.costoHora || 0) * horas;
      return costoBase * (assignment.retribucionValor / 100);
    }
    
    if (project.tipo === ProjectType.EXTERNO && assignment.retribucionTipo === RetributionType.VALOR_FIJO) {
      // Proyecto externo: valor fijo por hora
      return assignment.retribucionValor * horas;
    }
    
    return 0;
  }

  /**
   * Calcula la rentabilidad de una asignación externa
   * Rentabilidad = (Ingresos - Costos) / Costos * 100
   */
  static calculateProfitability(assignment: Assignment, project: Project, costoPorHora: number): number {
    if (project.tipo !== ProjectType.EXTERNO) {
      return 0; // Solo aplica para proyectos externos
    }
    
    const horas = assignment.horasReales || assignment.horasEstimadas || 0;
    const ingresos = assignment.retribucionValor * horas;
    const costos = costoPorHora * horas;
    
    if (costos === 0) return 0;
    
    return ((ingresos - costos) / costos) * 100;
  }

  /**
   * Calcula la eficiencia de horas
   * Eficiencia = horasEstimadas / horasReales * 100
   */
  static calculateHourEfficiency(assignment: Assignment): number {
    if (!assignment.horasEstimadas || !assignment.horasReales) {
      return 0;
    }
    
    return (assignment.horasEstimadas / assignment.horasReales) * 100;
  }

  /**
   * Calcula días transcurridos de asignación
   */
  static calculateAssignmentDays(assignment: Assignment): number {
    const fechaInicio = new Date(assignment.fechaInicio);
    const fechaFin = assignment.fechaFin ? new Date(assignment.fechaFin) : new Date();
    
    const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Valida si una retribución es válida según el tipo de proyecto
   */
  static validateRetribution(project: Project, retribucionTipo: RetributionType, valor: number): boolean {
    if (project.tipo === ProjectType.INTERNO && retribucionTipo === RetributionType.PORCENTAJE) {
      // Para proyectos internos, el porcentaje debe estar entre 1% y 50%
      return valor >= 1 && valor <= 50;
    }
    
    if (project.tipo === ProjectType.EXTERNO && retribucionTipo === RetributionType.VALOR_FIJO) {
      // Para proyectos externos, el valor debe ser positivo
      return valor > 0;
    }
    
    return false;
  }

  /**
   * Obtiene la retribución sugerida según el tipo de proyecto
   */
  static getSuggestedRetribution(project: Project): { tipo: RetributionType; valor: number } {
    if (project.tipo === ProjectType.INTERNO) {
      return {
        tipo: RetributionType.PORCENTAJE,
        valor: project.porcentajeCosto || 15 // 15% por defecto
      };
    } else {
      return {
        tipo: RetributionType.VALOR_FIJO,
        valor: 1500 // $1500/hora por defecto para externos
      };
    }
  }
}

/**
 * Ejemplos de cálculo
 */
export const AssignmentExamples = {
  
  /**
   * Ejemplo 1: Proyecto Interno
   * Equipo: Retroexcavadora CAT 416E
   * Proyecto: Construcción Planta Norte (Interno)
   * Costo hora proyecto: $1,500
   * Porcentaje asignado: 15%
   * Horas trabajadas: 160h
   * 
   * Cálculo: $1,500 * 160h * 15% = $36,000
   */
  ejemploInterno: {
    proyecto: {
      nombre: 'Construcción Planta Norte',
      tipo: ProjectType.INTERNO,
      costoHora: 1500,
      porcentajeCosto: 15
    },
    asignacion: {
      retribucionTipo: RetributionType.PORCENTAJE,
      retribucionValor: 15,
      horasReales: 160
    },
    resultado: 36000
  },

  /**
   * Ejemplo 2: Proyecto Externo
   * Equipo: Camioneta Toyota Hilux
   * Proyecto: Alquiler Ganfeng Lithium (Externo)
   * Tarifa por hora: $500
   * Horas trabajadas: 200h
   * 
   * Cálculo: $500 * 200h = $100,000
   */
  ejemploExterno: {
    proyecto: {
      nombre: 'Alquiler Ganfeng Lithium',
      tipo: ProjectType.EXTERNO
    },
    asignacion: {
      retribucionTipo: RetributionType.VALOR_FIJO,
      retribucionValor: 500,
      horasReales: 200
    },
    resultado: 100000
  }
};

/**
 * Utilidades para reportes
 */
export class AssignmentReportUtils {
  
  /**
   * Genera reporte de costos por centro de costo
   */
  static generateCostCenterReport(assignments: Assignment[]): Record<string, number> {
    return assignments.reduce((acc, assignment) => {
      const centroId = assignment.centroCostoId;
      const costo = assignment.costoTotal || 0;
      acc[centroId] = (acc[centroId] || 0) + costo;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Genera reporte de utilización de equipos
   */
  static generateEquipmentUtilizationReport(assignments: Assignment[]): Record<string, number> {
    const equipmentHours = assignments.reduce((acc, assignment) => {
      const equipoId = assignment.equipoId;
      const horas = assignment.horasReales || assignment.horasEstimadas || 0;
      acc[equipoId] = (acc[equipoId] || 0) + horas;
      return acc;
    }, {} as Record<string, number>);

    // Calcular porcentaje de utilización (asumiendo 8h/día * 30 días = 240h/mes máximo)
    const maxHorasMes = 240;
    return Object.entries(equipmentHours).reduce((acc, [equipoId, horas]) => {
      acc[equipoId] = Math.min((horas / maxHorasMes) * 100, 100);
      return acc;
    }, {} as Record<string, number>);
  }
}