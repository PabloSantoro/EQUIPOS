import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Equipment } from '../../types';
import { 
  Assignment, 
  Project, 
  CostCenter, 
  CreateAssignmentDTO, 
  RetributionType, 
  ProjectType 
} from '../../types/assignments';
import { AssignmentCalculationService } from '../../services/assignmentCalculations';
import { AssignmentValidationService } from '../../services/assignmentValidation';

interface NewAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignment: CreateAssignmentDTO) => void;
  availableEquipment: Equipment[];
  projects: Project[];
  costCenters: CostCenter[];
  equipmentLoading?: boolean;
  equipmentError?: any;
}

export const NewAssignmentModal: React.FC<NewAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  availableEquipment,
  projects,
  costCenters,
  equipmentLoading = false,
  equipmentError = null
}) => {
  const [formData, setFormData] = useState<CreateAssignmentDTO>({
    equipoId: '',
    proyectoId: '',
    centroCostoId: '',
    fechaInicio: '',
    fechaFinPrevista: '',
    retribucionTipo: RetributionType.PORCENTAJE,
    retribucionValor: 15,
    horasEstimadas: 0,
    observaciones: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<number>(0);

  useEffect(() => {
    if (formData.proyectoId) {
      const project = projects.find(p => p.id === formData.proyectoId);
      setSelectedProject(project || null);
      
      if (project) {
        // Sugerir retribución según tipo de proyecto
        const suggested = AssignmentCalculationService.getSuggestedRetribution(project);
        setFormData(prev => ({
          ...prev,
          retribucionTipo: suggested.tipo,
          retribucionValor: suggested.valor
        }));
      }
    }
  }, [formData.proyectoId, projects]);

  useEffect(() => {
    // Calcular costo estimado
    if (selectedProject && formData.horasEstimadas && formData.horasEstimadas > 0) {
      const mockAssignment = {
        retribucionTipo: formData.retribucionTipo,
        retribucionValor: formData.retribucionValor,
        horasEstimadas: formData.horasEstimadas
      } as Assignment;
      
      const cost = AssignmentCalculationService.calculateAssignmentCost(mockAssignment, selectedProject);
      setEstimatedCost(cost);
    } else {
      setEstimatedCost(0);
    }
  }, [selectedProject, formData.retribucionTipo, formData.retribucionValor, formData.horasEstimadas]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof CreateAssignmentDTO, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const newWarnings: string[] = [];

    // Validaciones básicas
    if (!formData.equipoId) newErrors.equipoId = 'Seleccione un equipo';
    if (!formData.proyectoId) newErrors.proyectoId = 'Seleccione un proyecto';
    if (!formData.centroCostoId) newErrors.centroCostoId = 'Seleccione un centro de costo';
    if (!formData.fechaInicio) newErrors.fechaInicio = 'Seleccione fecha de inicio';

    // Validar fechas
    if (formData.fechaInicio && formData.fechaFinPrevista) {
      const inicio = new Date(formData.fechaInicio);
      const fin = new Date(formData.fechaFinPrevista);
      
      if (fin <= inicio) {
        newErrors.fechaFinPrevista = 'La fecha de fin debe ser posterior al inicio';
      }
    }

    // Validar retribución
    if (selectedProject) {
      const isValid = AssignmentCalculationService.validateRetribution(
        selectedProject, 
        formData.retribucionTipo, 
        formData.retribucionValor
      );
      
      if (!isValid) {
        if (selectedProject.tipo === ProjectType.INTERNO) {
          newErrors.retribucionValor = 'Para proyectos internos el porcentaje debe estar entre 1% y 50%';
        } else {
          newErrors.retribucionValor = 'Para proyectos externos el valor debe ser positivo';
        }
      }
    }

    // Validar horas estimadas
    if (!formData.horasEstimadas || formData.horasEstimadas <= 0) {
      newErrors.horasEstimadas = 'Las horas estimadas deben ser mayor a 0';
    }

    // Warnings
    if (formData.horasEstimadas && formData.horasEstimadas > 1000) {
      newWarnings.push('Las horas estimadas son muy altas (>1000h)');
    }

    if (estimatedCost > 500000) {
      newWarnings.push('El costo estimado es muy alto (>$500,000)');
    }

    setErrors(newErrors);
    setWarnings(newWarnings);
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSave(formData);
    handleCancel();
  };

  const handleCancel = () => {
    setFormData({
      equipoId: '',
      proyectoId: '',
      centroCostoId: '',
      fechaInicio: '',
      fechaFinPrevista: '',
      retribucionTipo: RetributionType.PORCENTAJE,
      retribucionValor: 15,
      horasEstimadas: 0,
      observaciones: ''
    });
    setErrors({});
    setWarnings([]);
    setSelectedProject(null);
    setEstimatedCost(0);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-blue-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Nueva Asignación de Equipo
            </h2>
            <p className="text-sm text-gray-600">
              Asigna un equipo a un proyecto y centro de costo
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Equipment Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selección de Equipo</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipo Disponible <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.equipoId}
                onChange={(e) => handleInputChange('equipoId', e.target.value)}
                disabled={equipmentLoading}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.equipoId ? 'border-red-500' : 'border-gray-300'
                } ${equipmentLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {equipmentLoading ? 'Cargando equipos...' : 
                   equipmentError ? 'Error al cargar equipos' : 
                   'Seleccionar equipo...'}
                </option>
                {!equipmentLoading && !equipmentError && availableEquipment.map((equipment) => (
                  <option key={equipment.id} value={equipment.id}>
                    {equipment.dominio} - {equipment.marca} {equipment.modelo} ({equipment.tipoVehiculo})
                  </option>
                ))}
              </select>
              {errors.equipoId && (
                <p className="text-red-500 text-sm mt-1">{errors.equipoId}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Solo se muestran equipos operativos sin asignaciones activas
              </p>
            </div>
          </div>

          {/* Project and Cost Center */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Proyecto y Centro de Costo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proyecto <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.proyectoId}
                  onChange={(e) => handleInputChange('proyectoId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.proyectoId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar proyecto...</option>
                  {projects.filter(p => p.estado === 'ACTIVO').map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.nombre} ({project.tipo})
                    </option>
                  ))}
                </select>
                {errors.proyectoId && (
                  <p className="text-red-500 text-sm mt-1">{errors.proyectoId}</p>
                )}
                
                {selectedProject && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={selectedProject.tipo === 'INTERNO' ? 'info' : 'warning'}>
                        {selectedProject.tipo}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Responsable: {selectedProject.responsable}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{selectedProject.descripcion}</p>
                    {selectedProject.cliente && (
                      <p className="text-sm text-gray-600">Cliente: {selectedProject.cliente}</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Centro de Costo <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.centroCostoId}
                  onChange={(e) => handleInputChange('centroCostoId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.centroCostoId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar centro de costo...</option>
                  {costCenters.filter(cc => cc.activo).map((center) => (
                    <option key={center.id} value={center.id}>
                      {center.nombre} ({center.codigo})
                    </option>
                  ))}
                </select>
                {errors.centroCostoId && (
                  <p className="text-red-500 text-sm mt-1">{errors.centroCostoId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Programación</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={getMinDate()}
                  value={formData.fechaInicio}
                  onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fechaInicio ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.fechaInicio && (
                  <p className="text-red-500 text-sm mt-1">{errors.fechaInicio}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin Prevista
                </label>
                <input
                  type="date"
                  min={formData.fechaInicio || getMinDate()}
                  value={formData.fechaFinPrevista}
                  onChange={(e) => handleInputChange('fechaFinPrevista', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fechaFinPrevista ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.fechaFinPrevista && (
                  <p className="text-red-500 text-sm mt-1">{errors.fechaFinPrevista}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horas Estimadas <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={formData.horasEstimadas}
                  onChange={(e) => handleInputChange('horasEstimadas', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.horasEstimadas ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.horasEstimadas && (
                  <p className="text-red-500 text-sm mt-1">{errors.horasEstimadas}</p>
                )}
              </div>
            </div>
          </div>

          {/* Retribution */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Retribución</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Retribución
                </label>
                <select
                  value={formData.retribucionTipo}
                  onChange={(e) => handleInputChange('retribucionTipo', e.target.value as RetributionType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!selectedProject} // Auto-seleccionado según tipo de proyecto
                >
                  <option value={RetributionType.PORCENTAJE}>Porcentaje del Costo</option>
                  <option value={RetributionType.VALOR_FIJO}>Valor Fijo por Hora</option>
                </select>
                {selectedProject && (
                  <p className="text-sm text-blue-600 mt-1">
                    Auto-seleccionado según tipo de proyecto
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step={formData.retribucionTipo === RetributionType.PORCENTAJE ? "0.1" : "1"}
                    value={formData.retribucionValor}
                    onChange={(e) => handleInputChange('retribucionValor', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.retribucionValor ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">
                      {formData.retribucionTipo === RetributionType.PORCENTAJE ? '%' : '$/h'}
                    </span>
                  </div>
                </div>
                {errors.retribucionValor && (
                  <p className="text-red-500 text-sm mt-1">{errors.retribucionValor}</p>
                )}
              </div>
            </div>

            {/* Cost Estimation */}
            {estimatedCost > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Costo Estimado</span>
                </div>
                <p className="text-green-800 text-lg font-bold mt-1">
                  {formatCurrency(estimatedCost)}
                </p>
                <p className="text-green-700 text-sm">
                  Basado en {formData.horasEstimadas}h × {formData.retribucionTipo === RetributionType.PORCENTAJE ? 
                    `${formData.retribucionValor}% de $${selectedProject?.costoHora || 0}/h` : 
                    `$${formData.retribucionValor}/h`
                  }
                </p>
              </div>
            )}
          </div>

          {/* Observations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cualquier observación sobre la asignación..."
            />
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Advertencias</span>
              </div>
              <ul className="text-yellow-800 text-sm space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Crear Asignación
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};