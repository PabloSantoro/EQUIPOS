import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, Wrench, User } from 'lucide-react';
import { MaintenanceRecord, MaintenanceStatus, MaintenanceType, MaintenancePriority } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface MaintenanceKanbanProps {
  records: MaintenanceRecord[];
  onViewRecord: (record: MaintenanceRecord) => void;
}

export const MaintenanceKanban: React.FC<MaintenanceKanbanProps> = ({ records, onViewRecord }) => {
  const columns = [
    {
      id: 'scheduled',
      title: 'Programado',
      status: MaintenanceStatus.SCHEDULED,
      color: 'bg-blue-50 border-blue-200',
      headerColor: 'bg-blue-100'
    },
    {
      id: 'in_progress',
      title: 'En Proceso',
      status: MaintenanceStatus.IN_PROGRESS,
      color: 'bg-yellow-50 border-yellow-200',
      headerColor: 'bg-yellow-100'
    },
    {
      id: 'completed',
      title: 'Completado',
      status: MaintenanceStatus.COMPLETED,
      color: 'bg-green-50 border-green-200',
      headerColor: 'bg-green-100'
    },
    {
      id: 'overdue',
      title: 'Vencido',
      status: MaintenanceStatus.OVERDUE,
      color: 'bg-red-50 border-red-200',
      headerColor: 'bg-red-100'
    }
  ];

  const getRecordsForStatus = (status: MaintenanceStatus) => {
    return records.filter(record => record.status === status);
  };

  const getTypeIcon = (type: MaintenanceType) => {
    switch (type) {
      case MaintenanceType.PREVENTIVE:
        return <Calendar className="h-4 w-4 text-green-600" />;
      case MaintenanceType.CORRECTIVE:
        return <Wrench className="h-4 w-4 text-orange-600" />;
      case MaintenanceType.EMERGENCY:
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case MaintenanceType.INSPECTION:
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Wrench className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: MaintenancePriority) => {
    switch (priority) {
      case MaintenancePriority.LOW:
        return <Badge variant="default" size="sm">Baja</Badge>;
      case MaintenancePriority.MEDIUM:
        return <Badge variant="info" size="sm">Media</Badge>;
      case MaintenancePriority.HIGH:
        return <Badge variant="warning" size="sm">Alta</Badge>;
      case MaintenancePriority.URGENT:
        return <Badge variant="danger" size="sm">Urgente</Badge>;
      default:
        return <Badge variant="default" size="sm">{priority}</Badge>;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTaskProgress = (tasks: any[]) => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  return (
    <div className="flex space-x-6 overflow-x-auto pb-6">
      {columns.map(column => {
        const columnRecords = getRecordsForStatus(column.status);
        
        return (
          <div
            key={column.id}
            className={`flex-shrink-0 w-80 ${column.color} border rounded-lg`}
          >
            {/* Column Header */}
            <div className={`${column.headerColor} px-4 py-3 rounded-t-lg border-b`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <span className="bg-white text-gray-700 text-sm font-medium px-2 py-1 rounded-full">
                  {columnRecords.length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {columnRecords.map(record => (
                <div
                  key={record.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(record.type)}
                      <span className="font-medium text-gray-900 text-sm">
                        {record.workOrderNumber}
                      </span>
                    </div>
                    {getPriorityBadge(record.priority)}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {record.description}
                  </p>

                  {/* Info Grid */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(record.scheduledDate)}
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-600">
                      <Clock className="h-3 w-3 mr-1" />
                      {record.actualDuration ? `${record.actualDuration}h` : `~${record.estimatedDuration}h`}
                    </div>

                    <div className="flex items-center text-xs text-gray-600">
                      <User className="h-3 w-3 mr-1" />
                      {record.technician}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {record.tasks.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progreso</span>
                        <span>{getTaskProgress(record.tasks)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${getTaskProgress(record.tasks)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Cost */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(record.cost)}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewRecord(record)}
                    >
                      Ver
                    </Button>
                  </div>

                  {/* Service Provider */}
                  {record.serviceProvider && (
                    <div className="mt-2 text-xs text-gray-500">
                      {record.serviceProvider}
                    </div>
                  )}
                </div>
              ))}

              {columnRecords.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-sm">No hay órdenes en esta columna</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};