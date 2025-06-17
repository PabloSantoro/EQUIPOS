import { Equipment, MaintenanceRecord, MaintenanceStatus } from '../types';
import { Assignment, AssignmentStatus, CreateAssignmentDTO } from '../types/assignments';

/**
 * Servicio de validación para asignaciones
 * Integra validaciones con el módulo de mantenimiento
 */
export class AssignmentValidationService {

  /**
   * Valida si un equipo puede ser asignado
   * Verifica estado del equipo y mantenimientos pendientes
   */
  static async validateEquipmentForAssignment(
    equipment: Equipment, 
    maintenanceRecords: MaintenanceRecord[]
  ): Promise<{ valid: boolean; reason?: string }> {
    
    // 1. Verificar estado del equipo
    if (equipment.status !== 'OPERATIVO') {
      return {
        valid: false,
        reason: `El equipo ${equipment.dominio} no está en estado operativo (Estado actual: ${equipment.status})`
      };
    }

    // 2. Verificar mantenimientos pendientes
    const pendingMaintenance = maintenanceRecords.filter(record => 
      record.equipmentId === equipment.id && 
      (record.status === MaintenanceStatus.SCHEDULED || record.status === MaintenanceStatus.IN_PROGRESS)
    );

    if (pendingMaintenance.length > 0) {
      const maintenanceList = pendingMaintenance.map(m => m.workOrderNumber).join(', ');
      return {
        valid: false,
        reason: `El equipo ${equipment.dominio} tiene mantenimientos pendientes: ${maintenanceList}`
      };
    }

    // 3. Verificar mantenimientos vencidos
    const overdueMaintenance = maintenanceRecords.filter(record =>
      record.equipmentId === equipment.id &&
      record.status === MaintenanceStatus.OVERDUE
    );

    if (overdueMaintenance.length > 0) {
      return {
        valid: false,
        reason: `El equipo ${equipment.dominio} tiene mantenimientos vencidos que deben resolverse antes de la asignación`
      };
    }

    // 4. Verificar vencimientos de documentación
    const validationErrors = this.validateDocumentation(equipment);
    if (validationErrors.length > 0) {
      return {
        valid: false,
        reason: `Documentación vencida: ${validationErrors.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Valida si un equipo ya tiene una asignación activa
   */
  static validateActiveAssignment(equipmentId: string, activeAssignments: Assignment[]): boolean {
    return !activeAssignments.some(assignment => 
      assignment.equipoId === equipmentId && 
      assignment.estado === AssignmentStatus.ACTIVA
    );
  }

  /**
   * Valida la documentación del equipo
   */
  private static validateDocumentation(equipment: Equipment): string[] {
    const errors: string[] = [];
    const today = new Date();

    // Verificar VTV
    if (equipment.vtvVto) {
      const vtvDate = this.parseDate(equipment.vtvVto);
      if (vtvDate && vtvDate < today) {
        errors.push('VTV vencida');
      }
    }

    // Verificar póliza de seguro
    if (equipment.polizaVto) {
      const polizaDate = this.parseDate(equipment.polizaVto);
      if (polizaDate && polizaDate < today) {
        errors.push('Póliza de seguro vencida');
      }
    }

    return errors;
  }

  /**
   * Parsea fecha en formato DD/MM/YYYY
   */
  private static parseDate(dateString: string): Date | null {
    if (!dateString) return null;
    
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // JavaScript months are 0-indexed
    const year = parseInt(parts[2]);
    
    return new Date(year, month, day);
  }

  /**
   * Valida los datos de creación de asignación
   */
  static validateAssignmentData(data: CreateAssignmentDTO): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar fechas
    const fechaInicio = new Date(data.fechaInicio);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (fechaInicio < today) {
      errors.push('La fecha de inicio no puede ser anterior a hoy');
    }

    if (data.fechaFinPrevista) {
      const fechaFin = new Date(data.fechaFinPrevista);
      if (fechaFin <= fechaInicio) {
        errors.push('La fecha de fin prevista debe ser posterior a la fecha de inicio');
      }
    }

    // Validar horas estimadas
    if (data.horasEstimadas && data.horasEstimadas <= 0) {
      errors.push('Las horas estimadas deben ser un valor positivo');
    }

    // Validar retribución
    if (data.retribucionValor <= 0) {
      errors.push('El valor de retribución debe ser positivo');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Genera alerta de revisión por horas de uso
   */
  static checkMaintenanceAlert(assignment: Assignment, horasLimite: number = 500): boolean {
    const horasUso = assignment.horasReales || 0;
    return horasUso >= horasLimite;
  }

  /**
   * Valida si se puede finalizar una asignación
   */
  static validateAssignmentCompletion(assignment: Assignment): { valid: boolean; reason?: string } {
    if (assignment.estado !== AssignmentStatus.ACTIVA) {
      return {
        valid: false,
        reason: 'Solo se pueden finalizar asignaciones activas'
      };
    }

    // Verificar que tenga horas reales registradas
    if (!assignment.horasReales || assignment.horasReales <= 0) {
      return {
        valid: false,
        reason: 'Debe registrar las horas reales trabajadas antes de finalizar'
      };
    }

    return { valid: true };
  }

  /**
   * Reglas de negocio para modificación de asignaciones
   */
  static validateAssignmentModification(
    assignment: Assignment, 
    modifications: Partial<Assignment>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // No se puede modificar una asignación finalizada
    if (assignment.estado === AssignmentStatus.FINALIZADA) {
      errors.push('No se puede modificar una asignación finalizada');
    }

    // Si se cambia la fecha de fin, debe ser posterior al inicio
    if (modifications.fechaFin) {
      const fechaInicio = new Date(assignment.fechaInicio);
      const fechaFin = new Date(modifications.fechaFin);
      
      if (fechaFin <= fechaInicio) {
        errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    // Si se modifican horas reales, deben ser positivas
    if (modifications.horasReales !== undefined && modifications.horasReales <= 0) {
      errors.push('Las horas reales deben ser un valor positivo');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Interfaz para resultados de validación
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

/**
 * Servicio de alertas automáticas
 */
export class AssignmentAlertService {
  
  /**
   * Genera alertas para asignaciones próximas a vencer
   */
  static getExpiringAssignments(assignments: Assignment[], diasAnticipacion: number = 7): Assignment[] {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + diasAnticipacion);

    return assignments.filter(assignment => {
      if (!assignment.fechaFinPrevista || assignment.estado !== AssignmentStatus.ACTIVA) {
        return false;
      }

      const fechaFin = new Date(assignment.fechaFinPrevista);
      return fechaFin <= fechaLimite;
    });
  }

  /**
   * Genera alertas para equipos que necesitan mantenimiento post-asignación
   */
  static getMaintenanceAlerts(assignments: Assignment[]): Assignment[] {
    return assignments.filter(assignment => 
      assignment.estado === AssignmentStatus.FINALIZADA &&
      this.checkMaintenanceRequired(assignment)
    );
  }

  /**
   * Verifica si un equipo requiere mantenimiento después de una asignación
   */
  private static checkMaintenanceRequired(assignment: Assignment): boolean {
    const horasUso = assignment.horasReales || 0;
    
    // Diferentes umbrales según tipo de equipo (esto podría venir de configuración)
    const umbrales = {
      'RETROEXCAVADORA': 400,
      'CAMIONETA': 300,
      'CAMION': 500,
      'AUTOELEVADOR': 200,
      'TRACTOR': 350
    };

    // Obtener tipo de equipo del código o usar umbral por defecto
    const tipoEquipo = assignment.equipo?.tipoVehiculo || 'DEFAULT';
    const umbral = umbrales[tipoEquipo as keyof typeof umbrales] || 300;

    return horasUso >= umbral;
  }
}