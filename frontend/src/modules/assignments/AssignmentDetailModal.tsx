import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Edit, 
  Calendar, 
  Clock, 
  Package, 
  Building, 
  DollarSign, 
  User, 
  FileText,
  AlertTriangle,
  CheckCircle,
  Activity,
  Truck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Equipment } from '../../types';
import { 
  Assignment, 
  Project, 
  CostCenter, 
  AssignmentStatus, 
  RetributionType 
} from '../../types/assignments';
import { AssignmentCalculationService } from '../../services/assignmentCalculations';

interface AssignmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  equipment: Equipment[];
  projects: Project[];
  costCenters: CostCenter[];
  onUpdate: (assignment: Assignment) => void;
}

export const AssignmentDetailModal: React.FC<AssignmentDetailModalProps> = ({
  isOpen,
  onClose,
  assignment,
  equipment,
  projects,
  costCenters,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Assignment>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (assignment) {
      setEditData(assignment);
    }
  }, [assignment]);

  if (!isOpen || !assignment) return null;

  const equipmentItem = equipment.find(e => e.id === assignment.equipoId);
  const project = projects.find(p => p.id === assignment.proyectoId);
  const costCenter = costCenters.find(cc => cc.id === assignment.centroCostoId);

  const handleInputChange = (field: keyof Assignment, value: string | number) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (editData.horasReales !== undefined && editData.horasReales < 0) {
      newErrors.horasReales = 'Las horas reales no pueden ser negativas';
    }

    if (editData.fechaFin && editData.fechaInicio) {
      const inicio = new Date(editData.fechaInicio);
      const fin = new Date(editData.fechaFin);
      
      if (fin <= inicio) {
        newErrors.fechaFin = 'La fecha de fin debe ser posterior al inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const updatedAssignment: Assignment = {
      ...assignment,
      ...editData,
      updatedAt: new Date().toISOString()
    };

    // Recalcular costo si cambió algún valor relevante
    if (project && (
      editData.horasReales !== assignment.horasReales ||
      editData.retribucionValor !== assignment.retribucionValor
    )) {
      const newCost = AssignmentCalculationService.calculateAssignmentCost(updatedAssignment, project);
      updatedAssignment.costoTotal = newCost;
    }

    onUpdate(updatedAssignment);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(assignment);
    setErrors({});
    setIsEditing(false);
  };

  const getStatusBadge = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.ACTIVA:
        return <Badge variant="success">Activa</Badge>;
      case AssignmentStatus.FINALIZADA:
        return <Badge variant="default">Finalizada</Badge>;
      case AssignmentStatus.SUSPENDIDA:
        return <Badge variant="warning">Suspendida</Badge>;
      case AssignmentStatus.CANCELADA:
        return <Badge variant="danger">Cancelada</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getProjectTypeBadge = (project: Project) => {
    return project.tipo === 'INTERNO' ? 
      <Badge variant="info">Interno</Badge> : 
      <Badge variant="warning">Externo</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateProgress = () => {
    if (!assignment.horasEstimadas) return 0;
    const horasUsadas = (editData.horasReales ?? assignment.horasReales) || 0;
    return Math.min((horasUsadas / assignment.horasEstimadas) * 100, 100);
  };

  const getDaysRemaining = () => {
    if (!assignment.fechaFinPrevista || assignment.estado !== AssignmentStatus.ACTIVA) {
      return null;
    }
    
    const today = new Date();
    const endDate = new Date(assignment.fechaFinPrevista);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const progress = calculateProgress();
  const daysRemaining = getDaysRemaining();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-blue-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Package className="h-6 w-6 mr-3 text-blue-600" />
              Detalle de Asignación
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              ID: {assignment.id} • Creada el {formatDate(assignment.createdAt)}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing && assignment.estado === AssignmentStatus.ACTIVA && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Status and Progress */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Estado</div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(assignment.estado)}
                    {assignment.validacionMantenimiento && (
                      <Badge variant="success" size="sm">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Validado
                      </Badge>
                    )}
                  </div>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Progreso</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(progress)}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {(editData.horasReales ?? assignment.horasReales) || 0}h / {assignment.horasEstimadas}h
                  </div>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-gray-200 flex items-center justify-center relative">
                  <div
                    className="absolute inset-0 rounded-full border-4 border-transparent"
                    style={{
                      background: `conic-gradient(from 0deg, #3b82f6 0deg, #3b82f6 ${progress * 3.6}deg, transparent ${progress * 3.6}deg)`
                    }}
                  />
                  <Clock className="h-6 w-6 text-gray-600 z-10" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Costo Total</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(assignment.costoTotal || 0)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {assignment.retribucionTipo === RetributionType.PORCENTAJE ? 
                      `${assignment.retribucionValor}% del costo` : 
                      `$${assignment.retribucionValor}/hora`
                    }
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </Card>
          </div>

          {/* Alert for days remaining */}
          {daysRemaining !== null && assignment.estado === AssignmentStatus.ACTIVA && (
            <Card className={`mb-6 ${
              daysRemaining < 7 ? 'bg-red-50 border-red-200' : 
              daysRemaining < 30 ? 'bg-yellow-50 border-yellow-200' : 
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center space-x-3">
                <AlertTriangle className={`h-5 w-5 ${
                  daysRemaining < 7 ? 'text-red-600' : 
                  daysRemaining < 30 ? 'text-yellow-600' : 
                  'text-blue-600'
                }`} />
                <div>
                  <p className={`font-medium ${
                    daysRemaining < 7 ? 'text-red-900' : 
                    daysRemaining < 30 ? 'text-yellow-900' : 
                    'text-blue-900'
                  }`}>
                    {daysRemaining > 0 ? 
                      `${daysRemaining} días restantes para finalización` : 
                      'Asignación vencida'
                    }
                  </p>
                  <p className={`text-sm ${
                    daysRemaining < 7 ? 'text-red-700' : 
                    daysRemaining < 30 ? 'text-yellow-700' : 
                    'text-blue-700'
                  }`}>
                    Fecha prevista de finalización: {formatDate(assignment.fechaFinPrevista!)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Equipment Information */}
            <Card>
              <div className="flex items-center mb-4">
                <Truck className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Información del Equipo</h3>
              </div>
              
              {equipmentItem ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{equipmentItem.dominio}</div>
                      <div className="text-sm text-gray-600">
                        {equipmentItem.marca} {equipmentItem.modelo}
                      </div>
                      <div className="text-xs text-gray-500">{equipmentItem.tipoVehiculo}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Año:</span>
                      <span className="ml-2 font-medium">{equipmentItem.año}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Estado:</span>
                      <span className="ml-2">
                        <Badge variant={equipmentItem.status === 'OPERATIVO' ? 'success' : 'warning'}>
                          {equipmentItem.status}
                        </Badge>
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Motor:</span>
                      <span className="ml-2 font-medium">{equipmentItem.motor}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Chasis:</span>
                      <span className="ml-2 font-medium">{equipmentItem.chasis}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Información del equipo no disponible</p>
              )}
            </Card>

            {/* Project Information */}
            <Card>
              <div className="flex items-center mb-4">
                <Building className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Información del Proyecto</h3>
              </div>
              
              {project ? (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900">{project.nombre}</span>
                      {getProjectTypeBadge(project)}
                    </div>
                    <p className="text-sm text-gray-600">{project.descripcion}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Responsable:</span>
                      <span className="ml-2 font-medium">{project.responsable}</span>
                    </div>
                    {project.cliente && (
                      <div>
                        <span className="text-gray-600">Cliente:</span>
                        <span className="ml-2 font-medium">{project.cliente}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Estado:</span>
                      <span className="ml-2">
                        <Badge variant={project.estado === 'ACTIVO' ? 'success' : 'default'}>
                          {project.estado}
                        </Badge>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Información del proyecto no disponible</p>
              )}
            </Card>

            {/* Assignment Details */}
            <Card>
              <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Detalles de la Asignación</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Inicio
                    </label>
                    <div className="text-sm text-gray-900">{formatDate(assignment.fechaInicio)}</div>
                  </div>
                  
                  {assignment.fechaFinPrevista && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Fin Prevista
                      </label>
                      <div className="text-sm text-gray-900">{formatDate(assignment.fechaFinPrevista)}</div>
                    </div>
                  )}
                  
                  {assignment.fechaFin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Finalización Real
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editData.fechaFin ? editData.fechaFin.split('T')[0] : ''}
                          onChange={(e) => handleInputChange('fechaFin', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.fechaFin ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      ) : (
                        <div className="text-sm text-gray-900">{formatDate(assignment.fechaFin)}</div>
                      )}
                      {errors.fechaFin && (
                        <p className="text-red-500 text-sm mt-1">{errors.fechaFin}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Hours and Cost Center */}
            <Card>
              <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Horas y Centro de Costo</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horas Estimadas
                    </label>
                    <div className="text-sm text-gray-900">{assignment.horasEstimadas}h</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horas Reales
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editData.horasReales ?? assignment.horasReales ?? 0}
                        onChange={(e) => handleInputChange('horasReales', parseFloat(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.horasReales ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{assignment.horasReales || 0}h</div>
                    )}
                    {errors.horasReales && (
                      <p className="text-red-500 text-sm mt-1">{errors.horasReales}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Centro de Costo
                  </label>
                  {costCenter ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900">{costCenter.nombre}</div>
                      <div className="text-xs text-gray-500">{costCenter.codigo}</div>
                      <div className="text-xs text-gray-500">Responsable: {costCenter.responsable}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Centro de costo no disponible</div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Observations */}
          {(assignment.observaciones || isEditing) && (
            <Card className="mt-6">
              <div className="flex items-center mb-4">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Observaciones</h3>
              </div>
              
              {isEditing ? (
                <textarea
                  value={editData.observaciones ?? assignment.observaciones ?? ''}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Observaciones sobre la asignación..."
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {assignment.observaciones || 'Sin observaciones'}
                </p>
              )}
            </Card>
          )}

          {/* Audit Trail */}
          <Card className="mt-6">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Información de Auditoría</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Creado por:</span>
                <span className="ml-2 font-medium">{assignment.creadoPor}</span>
              </div>
              <div>
                <span className="text-gray-600">Fecha de creación:</span>
                <span className="ml-2 font-medium">{formatDate(assignment.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-600">Última actualización:</span>
                <span className="ml-2 font-medium">{formatDate(assignment.updatedAt)}</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          {isEditing ? (
            <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t">
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};