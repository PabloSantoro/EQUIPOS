import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Calendar, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MaintenanceRecord, MaintenanceStatus, MaintenanceType, MaintenancePriority, Equipment } from '../../types';
import { MaintenanceCalendar } from './MaintenanceCalendar';
import { MaintenanceKanban } from './MaintenanceKanban';
import { NewMaintenanceModal } from './NewMaintenanceModal';
import { MaintenanceDetailModal } from './MaintenanceDetailModal';
import { equipmentAPI } from '../../services/api';

// Mock data
const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: '1',
    equipmentId: '1',
    type: MaintenanceType.PREVENTIVE,
    status: MaintenanceStatus.SCHEDULED,
    priority: MaintenancePriority.MEDIUM,
    scheduledDate: '2024-06-15T09:00:00Z',
    estimatedDuration: 4,
    description: 'Mantenimiento preventivo - 500 horas de operación',
    workOrderNumber: 'OM-2024-001',
    technician: 'Carlos López',
    serviceProvider: 'Liebherr Service',
    cost: 15000,
    parts: [],
    tasks: [
      {
        id: 't1',
        description: 'Cambio de aceite hidráulico',
        completed: false,
        estimatedDuration: 1
      },
      {
        id: 't2',
        description: 'Inspección de cables de acero',
        completed: false,
        estimatedDuration: 2
      },
      {
        id: 't3',
        description: 'Revisión sistema eléctrico',
        completed: false,
        estimatedDuration: 1
      }
    ],
    documents: [],
    photos: [],
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z'
  },
  {
    id: '2',
    equipmentId: '2',
    type: MaintenanceType.CORRECTIVE,
    status: MaintenanceStatus.IN_PROGRESS,
    priority: MaintenancePriority.HIGH,
    scheduledDate: '2024-06-12T08:00:00Z',
    startDate: '2024-06-12T08:30:00Z',
    estimatedDuration: 8,
    description: 'Reparación sistema hidráulico - fuga en cilindro principal',
    workOrderNumber: 'OM-2024-002',
    technician: 'Miguel Santos',
    serviceProvider: 'CAT Service Center',
    cost: 25000,
    parts: [
      {
        id: 'p1',
        name: 'Sello hidráulico',
        partNumber: 'CAT-HYD-001',
        quantity: 2,
        unitCost: 1500,
        totalCost: 3000,
        supplier: 'CAT Parts'
      }
    ],
    tasks: [
      {
        id: 't4',
        description: 'Desmontaje cilindro hidráulico',
        completed: true,
        completedBy: 'Miguel Santos',
        completedAt: '2024-06-12T10:00:00Z',
        estimatedDuration: 3,
        actualDuration: 2.5
      },
      {
        id: 't5',
        description: 'Reemplazo de sellos',
        completed: true,
        completedBy: 'Miguel Santos',
        completedAt: '2024-06-12T14:00:00Z',
        estimatedDuration: 2,
        actualDuration: 2
      },
      {
        id: 't6',
        description: 'Montaje y pruebas',
        completed: false,
        estimatedDuration: 3
      }
    ],
    documents: [],
    photos: [],
    createdAt: '2024-06-10T00:00:00Z',
    updatedAt: '2024-06-12T14:00:00Z'
  },
  {
    id: '3',
    equipmentId: '3',
    type: MaintenanceType.INSPECTION,
    status: MaintenanceStatus.COMPLETED,
    priority: MaintenancePriority.LOW,
    scheduledDate: '2024-06-08T10:00:00Z',
    startDate: '2024-06-08T10:15:00Z',
    completedDate: '2024-06-08T12:30:00Z',
    estimatedDuration: 2,
    actualDuration: 2.25,
    description: 'Inspección mensual de seguridad',
    workOrderNumber: 'OM-2024-003',
    technician: 'Ana Martínez',
    cost: 2000,
    parts: [],
    tasks: [
      {
        id: 't7',
        description: 'Revisión frenos',
        completed: true,
        completedBy: 'Ana Martínez',
        completedAt: '2024-06-08T11:00:00Z',
        estimatedDuration: 1,
        actualDuration: 0.75
      },
      {
        id: 't8',
        description: 'Inspección neumáticos',
        completed: true,
        completedBy: 'Ana Martínez',
        completedAt: '2024-06-08T12:30:00Z',
        estimatedDuration: 1,
        actualDuration: 1.5
      }
    ],
    documents: [],
    photos: [],
    nextMaintenanceDate: '2024-07-08T10:00:00Z',
    createdAt: '2024-06-05T00:00:00Z',
    updatedAt: '2024-06-08T12:30:00Z'
  }
];

type ViewMode = 'calendar' | 'list' | 'kanban';

export const MaintenanceModule: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isNewMaintenanceModalOpen, setIsNewMaintenanceModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState(mockMaintenanceRecords);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [equipmentLoading, setEquipmentLoading] = useState(true);
  const [equipmentError, setEquipmentError] = useState<string | null>(null);

  // Fetch equipment data from API
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setEquipmentLoading(true);
        setEquipmentError(null);
        console.log('Fetching equipment data...');
        const data = await equipmentAPI.getAll();
        console.log('Equipment data received:', data);
        setEquipment(data);
      } catch (error) {
        console.error('Error fetching equipment:', error);
        setEquipmentError('Error al cargar los equipos');
      } finally {
        setEquipmentLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  const statusCounts = {
    scheduled: maintenanceRecords.filter(r => r.status === MaintenanceStatus.SCHEDULED).length,
    inProgress: maintenanceRecords.filter(r => r.status === MaintenanceStatus.IN_PROGRESS).length,
    completed: maintenanceRecords.filter(r => r.status === MaintenanceStatus.COMPLETED).length,
    overdue: maintenanceRecords.filter(r => r.status === MaintenanceStatus.OVERDUE).length,
  };

  const handleNewMaintenance = (maintenanceData: any) => {
    const newRecord: MaintenanceRecord = {
      id: `${Date.now()}`,
      workOrderNumber: `OM-${new Date().getFullYear()}-${String(maintenanceRecords.length + 1).padStart(3, '0')}`,
      status: MaintenanceStatus.SCHEDULED,
      parts: [],
      documents: [],
      photos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...maintenanceData
    };

    setMaintenanceRecords(prev => [...prev, newRecord]);
  };

  const handleViewRecord = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = (recordId: string, newStatus: MaintenanceStatus) => {
    setMaintenanceRecords(prev => 
      prev.map(record => 
        record.id === recordId 
          ? { 
              ...record, 
              status: newStatus,
              startDate: newStatus === MaintenanceStatus.IN_PROGRESS && !record.startDate 
                ? new Date().toISOString() 
                : record.startDate,
              completedDate: newStatus === MaintenanceStatus.COMPLETED 
                ? new Date().toISOString() 
                : record.completedDate,
              updatedAt: new Date().toISOString()
            }
          : record
      )
    );
    
    // Update selected record if it's the one being updated
    if (selectedRecord && selectedRecord.id === recordId) {
      setSelectedRecord(prev => prev ? {
        ...prev,
        status: newStatus,
        startDate: newStatus === MaintenanceStatus.IN_PROGRESS && !prev.startDate 
          ? new Date().toISOString() 
          : prev.startDate,
        completedDate: newStatus === MaintenanceStatus.COMPLETED 
          ? new Date().toISOString() 
          : prev.completedDate,
        updatedAt: new Date().toISOString()
      } : null);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Wrench className="h-6 w-6 mr-3 text-blue-600" />
            Gestión de Mantenimiento
          </h2>
          <p className="text-gray-600 mt-1">
            Programa y supervisa el mantenimiento de equipos
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              Lista
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              Calendario
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              Kanban
            </Button>
          </div>
          
          <Button onClick={() => setIsNewMaintenanceModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Orden
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{statusCounts.scheduled}</div>
              <div className="text-sm text-gray-600">Programados</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.inProgress}</div>
              <div className="text-sm text-gray-600">En Proceso</div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
              <div className="text-sm text-gray-600">Completados</div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{statusCounts.overdue}</div>
              <div className="text-sm text-gray-600">Vencidos</div>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Content Area */}
      {viewMode === 'calendar' && (
        <MaintenanceCalendar records={maintenanceRecords} />
      )}
      
      {viewMode === 'kanban' && (
        <MaintenanceKanban 
          records={maintenanceRecords} 
          onViewRecord={handleViewRecord}
        />
      )}
      
      {viewMode === 'list' && (
        <Card>
          <div className="space-y-4">
            {maintenanceRecords.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(record.type)}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {record.workOrderNumber} - {record.description}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Técnico: {record.technician}
                        {record.serviceProvider && ` • ${record.serviceProvider}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(record.priority)}
                    {getStatusBadge(record.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Fecha Programada:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(record.scheduledDate).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Duración:</span>
                    <p className="font-medium text-gray-900">
                      {record.actualDuration ? `${record.actualDuration}h` : `~${record.estimatedDuration}h`}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Costo:</span>
                    <p className="font-medium text-gray-900">
                      {formatCurrency(record.cost)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Progreso:</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(record.tasks.filter(t => t.completed).length / record.tasks.length) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {record.tasks.filter(t => t.completed).length}/{record.tasks.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tasks */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Tareas:</h4>
                  <div className="space-y-2">
                    {record.tasks.map((task) => (
                      <div key={task.id} className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          task.completed ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {task.completed && <CheckCircle className="h-3 w-3 text-green-600" />}
                        </div>
                        <span className={`text-sm ${
                          task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}>
                          {task.description}
                        </span>
                        {task.completed && task.completedBy && (
                          <span className="text-xs text-gray-500">
                            por {task.completedBy}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Parts */}
                {record.parts.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Repuestos:</h4>
                    <div className="space-y-1">
                      {record.parts.map((part) => (
                        <div key={part.id} className="text-sm text-gray-600">
                          {part.name} (x{part.quantity}) - {formatCurrency(part.totalCost)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Actualizado: {new Date(record.updatedAt).toLocaleString('es-ES')}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewRecord(record)}
                    >
                      Ver Detalles
                    </Button>
                    {record.status === MaintenanceStatus.IN_PROGRESS && (
                      <Button 
                        size="sm"
                        onClick={() => handleUpdateStatus(record.id, MaintenanceStatus.COMPLETED)}
                      >
                        Marcar Completado
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* New Maintenance Modal */}
      <NewMaintenanceModal
        isOpen={isNewMaintenanceModalOpen}
        onClose={() => setIsNewMaintenanceModalOpen(false)}
        onSubmit={handleNewMaintenance}
        equipment={equipment}
        equipmentLoading={equipmentLoading}
        equipmentError={equipmentError}
      />

      {/* Maintenance Detail Modal */}
      <MaintenanceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        record={selectedRecord}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};