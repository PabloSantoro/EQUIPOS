import React from 'react';
import { X, Calendar, Clock, User, DollarSign, CheckCircle, AlertTriangle, Wrench, Package } from 'lucide-react';
import { MaintenanceRecord, MaintenanceStatus, MaintenanceType, MaintenancePriority } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface MaintenanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: MaintenanceRecord | null;
  onUpdateStatus?: (recordId: string, newStatus: MaintenanceStatus) => void;
}

export const MaintenanceDetailModal: React.FC<MaintenanceDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  onUpdateStatus
}) => {
  if (!isOpen || !record) return null;

  const getTypeIcon = (type: MaintenanceType) => {
    switch (type) {
      case MaintenanceType.PREVENTIVE:
        return <Calendar className="h-5 w-5 text-green-600" />;
      case MaintenanceType.CORRECTIVE:
        return <Wrench className="h-5 w-5 text-orange-600" />;
      case MaintenanceType.EMERGENCY:
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case MaintenanceType.INSPECTION:
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <Wrench className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: MaintenanceType) => {
    switch (type) {
      case MaintenanceType.PREVENTIVE:
        return 'Preventivo';
      case MaintenanceType.CORRECTIVE:
        return 'Correctivo';
      case MaintenanceType.EMERGENCY:
        return 'Emergencia';
      case MaintenanceType.INSPECTION:
        return 'Inspección';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.SCHEDULED:
        return <Badge variant="info">Programado</Badge>;
      case MaintenanceStatus.IN_PROGRESS:
        return <Badge variant="warning">En Proceso</Badge>;
      case MaintenanceStatus.COMPLETED:
        return <Badge variant="success">Completado</Badge>;
      case MaintenanceStatus.CANCELLED:
        return <Badge variant="default">Cancelado</Badge>;
      case MaintenanceStatus.OVERDUE:
        return <Badge variant="danger">Vencido</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: MaintenancePriority) => {
    switch (priority) {
      case MaintenancePriority.LOW:
        return <Badge variant="default">Baja</Badge>;
      case MaintenancePriority.MEDIUM:
        return <Badge variant="info">Media</Badge>;
      case MaintenancePriority.HIGH:
        return <Badge variant="warning">Alta</Badge>;
      case MaintenancePriority.URGENT:
        return <Badge variant="danger">Urgente</Badge>;
      default:
        return <Badge variant="default">{priority}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTaskProgress = () => {
    if (record.tasks.length === 0) return 0;
    const completedTasks = record.tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / record.tasks.length) * 100);
  };

  const getTotalPartsValue = () => {
    return record.parts.reduce((total, part) => total + part.totalCost, 0);
  };

  const canUpdateStatus = () => {
    return record.status === MaintenanceStatus.SCHEDULED || record.status === MaintenanceStatus.IN_PROGRESS;
  };

  const handleStatusUpdate = (newStatus: MaintenanceStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(record.id, newStatus);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            {getTypeIcon(record.type)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {record.workOrderNumber}
              </h2>
              <p className="text-sm text-gray-600">
                {getTypeLabel(record.type)} • Creado {new Date(record.createdAt).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getPriorityBadge(record.priority)}
            {getStatusBadge(record.status)}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
            <p className="text-gray-700">{record.description}</p>
          </div>

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Fecha Programada</span>
              </div>
              <p className="font-semibold text-gray-900">
                {formatDateTime(record.scheduledDate)}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Duración</span>
              </div>
              <p className="font-semibold text-gray-900">
                {record.actualDuration ? `${record.actualDuration}h (real)` : `~${record.estimatedDuration}h (estimado)`}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Técnico</span>
              </div>
              <p className="font-semibold text-gray-900">{record.technician}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Costo</span>
              </div>
              <p className="font-semibold text-gray-900">{formatCurrency(record.cost)}</p>
            </div>
          </div>

          {/* Service Provider */}
          {record.serviceProvider && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Proveedor de Servicio</h3>
              <p className="text-gray-700">{record.serviceProvider}</p>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Timeline</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Creado: {formatDateTime(record.createdAt)}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  record.status === MaintenanceStatus.SCHEDULED ? 'bg-blue-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-sm text-gray-600">
                  Programado: {formatDateTime(record.scheduledDate)}
                </span>
              </div>

              {record.startDate && (
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    record.status === MaintenanceStatus.IN_PROGRESS || record.status === MaintenanceStatus.COMPLETED 
                      ? 'bg-yellow-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="text-sm text-gray-600">
                    Iniciado: {formatDateTime(record.startDate)}
                  </span>
                </div>
              )}

              {record.completedDate && (
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Completado: {formatDateTime(record.completedDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tasks Progress */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Tareas ({getTaskProgress()}% completado)</h3>
              <span className="text-sm text-gray-600">
                {record.tasks.filter(t => t.completed).length} de {record.tasks.length} completadas
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${getTaskProgress()}%` }}
              ></div>
            </div>

            <div className="space-y-3">
              {record.tasks.map((task) => (
                <div key={task.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                    task.completed ? 'bg-green-100' : 'bg-gray-200'
                  }`}>
                    {task.completed && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                    }`}>
                      {task.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span>Estimado: {task.estimatedDuration}h</span>
                      {task.actualDuration && <span>Real: {task.actualDuration}h</span>}
                      {task.completedBy && <span>Por: {task.completedBy}</span>}
                      {task.completedAt && <span>El: {new Date(task.completedAt).toLocaleDateString('es-ES')}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Parts */}
          {record.parts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Repuestos y Materiales</h3>
                <span className="text-sm font-semibold text-gray-900">
                  Total: {formatCurrency(getTotalPartsValue())}
                </span>
              </div>
              <div className="space-y-2">
                {record.parts.map((part) => (
                  <div key={part.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Package className="h-4 w-4 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">{part.name}</p>
                        <p className="text-sm text-gray-600">
                          Código: {part.partNumber} • Proveedor: {part.supplier}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {part.quantity}x {formatCurrency(part.unitCost)}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(part.totalCost)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Maintenance */}
          {record.nextMaintenanceDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Próximo Mantenimiento</h3>
              <p className="text-blue-800">
                Programado para: {formatDateTime(record.nextMaintenanceDate)}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            Última actualización: {formatDateTime(record.updatedAt)}
          </div>
          
          <div className="flex items-center space-x-3">
            {canUpdateStatus() && record.status === MaintenanceStatus.SCHEDULED && (
              <Button 
                variant="outline" 
                onClick={() => handleStatusUpdate(MaintenanceStatus.IN_PROGRESS)}
              >
                Iniciar Trabajo
              </Button>
            )}
            
            {canUpdateStatus() && record.status === MaintenanceStatus.IN_PROGRESS && (
              <Button 
                variant="outline"
                onClick={() => handleStatusUpdate(MaintenanceStatus.COMPLETED)}
              >
                Marcar Completado
              </Button>
            )}
            
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};