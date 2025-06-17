import React, { useState } from 'react';
import { Calendar, Plus, Filter, BarChart3, AlertTriangle, CheckCircle, Clock, Package, Truck, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Assignment, AssignmentStatus, Project, CostCenter, ProjectType, RetributionType } from '../../types/assignments';
import { Equipment } from '../../types';
import { AssignmentList } from './AssignmentList';
import { AssignmentCalendar } from './AssignmentCalendar';
import { NewAssignmentModal } from './NewAssignmentModal';
import { AssignmentDetailModal } from './AssignmentDetailModal';
import { useAPI } from '../../hooks/useAPI';
import { api } from '../../services/api';

// Mock data para proyectos y centros de costo
const mockProjects: Project[] = [
  {
    id: 'proj-001',
    nombre: 'Construcción Planta Norte',
    tipo: ProjectType.INTERNO,
    descripcion: 'Proyecto interno de expansión de planta',
    costoHora: 1500,
    porcentajeCosto: 15,
    fechaInicio: '2025-01-01',
    fechaFinPrevista: '2025-06-30',
    responsable: 'Juan Pérez',
    estado: 'ACTIVO',
    presupuesto: 2000000,
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'proj-002',
    nombre: 'Alquiler Ganfeng Lithium',
    tipo: ProjectType.EXTERNO,
    descripcion: 'Servicios de equipos para cliente externo',
    fechaInicio: '2025-01-15',
    cliente: 'Ganfeng Lithium',
    responsable: 'María González',
    estado: 'ACTIVO',
    createdAt: '2024-12-15T00:00:00Z',
    updatedAt: '2024-12-15T00:00:00Z'
  },
  {
    id: 'proj-003',
    nombre: 'Mantenimiento Predio Central',
    tipo: ProjectType.INTERNO,
    descripcion: 'Mantenimiento de instalaciones centrales',
    costoHora: 1200,
    porcentajeCosto: 10,
    fechaInicio: '2025-02-01',
    responsable: 'Carlos López',
    estado: 'ACTIVO',
    createdAt: '2024-12-20T00:00:00Z',
    updatedAt: '2024-12-20T00:00:00Z'
  }
];

const mockCostCenters: CostCenter[] = [
  {
    id: 'cc-001',
    nombre: 'Operaciones Tucumán',
    codigo: 'OP-TUC',
    descripcion: 'Centro de costos operaciones Tucumán',
    responsable: 'Ana Martínez',
    presupuesto: 500000,
    activo: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cc-002',
    nombre: 'Proyectos Externos',
    codigo: 'PROJ-EXT',
    descripcion: 'Centro de costos para proyectos externos',
    responsable: 'Roberto Silva',
    presupuesto: 1000000,
    activo: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cc-003',
    nombre: 'Mantenimiento General',
    codigo: 'MANT-GEN',
    descripcion: 'Centro de costos mantenimiento',
    responsable: 'Luis Rodríguez',
    presupuesto: 300000,
    activo: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockAssignments: Assignment[] = [
  {
    id: 'assign-001',
    equipoId: '2', // CAT 416E
    proyectoId: 'proj-001',
    centroCostoId: 'cc-001',
    fechaInicio: '2025-01-10',
    fechaFinPrevista: '2025-03-10',
    retribucionTipo: RetributionType.PORCENTAJE,
    retribucionValor: 15,
    horasEstimadas: 400,
    horasReales: 350,
    estado: AssignmentStatus.ACTIVA,
    observaciones: 'Asignación para construcción de cimientos',
    costoTotal: 78750,
    validacionMantenimiento: true,
    creadoPor: 'admin',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: 'assign-002',
    equipoId: '9', // Toyota Hilux AD883NZ
    proyectoId: 'proj-002',
    centroCostoId: 'cc-002',
    fechaInicio: '2025-01-15',
    fechaFinPrevista: '2025-04-15',
    retribucionTipo: RetributionType.VALOR_FIJO,
    retribucionValor: 500,
    horasEstimadas: 600,
    horasReales: 580,
    estado: AssignmentStatus.ACTIVA,
    observaciones: 'Transporte para proyecto Ganfeng',
    costoTotal: 290000,
    validacionMantenimiento: true,
    creadoPor: 'admin',
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z'
  },
  {
    id: 'assign-003',
    equipoId: '10', // Iveco Daily AE002JJ
    proyectoId: 'proj-003',
    centroCostoId: 'cc-003',
    fechaInicio: '2024-12-01',
    fechaFin: '2024-12-31',
    retribucionTipo: RetributionType.PORCENTAJE,
    retribucionValor: 10,
    horasEstimadas: 200,
    horasReales: 220,
    estado: AssignmentStatus.FINALIZADA,
    observaciones: 'Mantenimiento completado',
    costoTotal: 26400,
    validacionMantenimiento: true,
    creadoPor: 'admin',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-31T00:00:00Z'
  }
];

type ViewMode = 'list' | 'calendar' | 'dashboard';

export const AssignmentsModule: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isNewAssignmentModalOpen, setIsNewAssignmentModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [assignments, setAssignments] = useState(mockAssignments);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    estado: '',
    proyectoId: '',
    equipoId: '',
    centroCostoId: ''
  });

  // Fetch real equipment data from database
  const { data: equipment = [], loading: equipmentLoading, error: equipmentError } = useAPI(() => api.equipment.getAll());

  // Equipos disponibles (no asignados activamente)
  const equiposAsignados = (assignments || [])
    .filter(a => a.estado === AssignmentStatus.ACTIVA)
    .map(a => a.equipoId);
  const equiposDisponibles = (equipment || []).filter((e: Equipment) => 
    !equiposAsignados.includes(e.id) && e.status === 'OPERATIVO'
  );

  // Estadísticas
  const stats = {
    total: (assignments || []).length,
    activas: (assignments || []).filter(a => a.estado === AssignmentStatus.ACTIVA).length,
    finalizadas: (assignments || []).filter(a => a.estado === AssignmentStatus.FINALIZADA).length,
    suspendidas: (assignments || []).filter(a => a.estado === AssignmentStatus.SUSPENDIDA).length,
    costoTotal: (assignments || []).reduce((sum, a) => sum + (a.costoTotal || 0), 0),
    // Estadísticas de equipos
    totalEquipos: (equipment || []).length,
    equiposAsignados: equiposAsignados.length,
    equiposDisponibles: equiposDisponibles.length,
    equiposOperativos: (equipment || []).filter((e: Equipment) => e.status === 'OPERATIVO').length
  };

  const handleNewAssignment = (assignmentData: any) => {
    const newAssignment: Assignment = {
      id: `assign-${Date.now()}`,
      validacionMantenimiento: true,
      creadoPor: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estado: AssignmentStatus.ACTIVA,
      ...assignmentData
    };
    
    setAssignments(prev => [...prev, newAssignment]);
  };

  const handleViewAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsDetailModalOpen(true);
  };

  const handleUpdateAssignment = (updatedAssignment: Assignment) => {
    setAssignments(prev => 
      prev.map(a => a.id === updatedAssignment.id ? updatedAssignment : a)
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Filtrar asignaciones
  const filteredAssignments = (assignments || []).filter(assignment => {
    const matchesEstado = filters.estado === '' || assignment.estado === filters.estado;
    const matchesProyecto = filters.proyectoId === '' || assignment.proyectoId === filters.proyectoId;
    const matchesEquipo = filters.equipoId === '' || assignment.equipoId === filters.equipoId;
    const matchesCentro = filters.centroCostoId === '' || assignment.centroCostoId === filters.centroCostoId;
    
    return matchesEstado && matchesProyecto && matchesEquipo && matchesCentro;
  });

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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-6 w-6 mr-3 text-blue-600" />
            Asignación de Equipos
          </h2>
          <p className="text-gray-600 mt-1">
            Gestiona la asignación de equipos a proyectos y centros de costo
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
              variant={viewMode === 'dashboard' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('dashboard')}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
          
          <Button onClick={() => setIsNewAssignmentModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Asignación
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Equipos Totales */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalEquipos}</div>
              <div className="text-sm text-gray-600">Total Equipos</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.equiposOperativos} operativos
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Equipos Asignados */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.equiposAsignados}</div>
              <div className="text-sm text-gray-600">Equipos Asignados</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.activas} asignaciones activas
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        {/* Equipos Disponibles */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.equiposDisponibles}</div>
              <div className="text-sm text-gray-600">Equipos Disponibles</div>
              <div className="text-xs text-gray-500 mt-1">
                Para nueva asignación
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Costo Total */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.costoTotal)}</div>
              <div className="text-sm text-gray-600">Costo Total</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.total} asignaciones
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-bold text-lg">$</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-green-700">{stats.activas}</div>
              <div className="text-sm text-green-600">Asignaciones Activas</div>
            </div>
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-blue-700">{stats.finalizadas}</div>
              <div className="text-sm text-blue-600">Finalizadas</div>
            </div>
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-yellow-700">{stats.suspendidas}</div>
              <div className="text-sm text-yellow-600">Suspendidas</div>
            </div>
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
        </Card>

        <Card className="bg-gray-50 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-gray-700">{((stats.equiposAsignados / stats.equiposOperativos) * 100).toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Utilización</div>
            </div>
            <BarChart3 className="h-6 w-6 text-gray-600" />
          </div>
        </Card>
      </div>

      {/* Equipment Status Alert */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-900 font-medium">
                Estado de Flota de Equipos
              </p>
              <div className="flex items-center space-x-6 mt-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700">
                    <strong>{stats.equiposDisponibles}</strong> disponibles
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-orange-700">
                    <strong>{stats.equiposAsignados}</strong> asignados
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-700">
                    <strong>{stats.totalEquipos - stats.equiposOperativos}</strong> fuera de servicio
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {((stats.equiposAsignados / stats.equiposOperativos) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Utilización</div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filters.estado}
                onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                <option value={AssignmentStatus.ACTIVA}>Activa</option>
                <option value={AssignmentStatus.FINALIZADA}>Finalizada</option>
                <option value={AssignmentStatus.SUSPENDIDA}>Suspendida</option>
                <option value={AssignmentStatus.CANCELADA}>Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proyecto
              </label>
              <select
                value={filters.proyectoId}
                onChange={(e) => setFilters(prev => ({ ...prev, proyectoId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {mockProjects.map(project => (
                  <option key={project.id} value={project.id}>{project.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipo
              </label>
              <select
                value={filters.equipoId}
                onChange={(e) => setFilters(prev => ({ ...prev, equipoId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {equipmentLoading ? (
                  <option disabled>Cargando equipos...</option>
                ) : equipmentError ? (
                  <option disabled>Error al cargar equipos</option>
                ) : (
                  (equipment || []).map((eq: Equipment) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.dominio} - {eq.marca} {eq.modelo}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Centro de Costo
              </label>
              <select
                value={filters.centroCostoId}
                onChange={(e) => setFilters(prev => ({ ...prev, centroCostoId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {mockCostCenters.map(center => (
                  <option key={center.id} value={center.id}>{center.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Content */}
      {viewMode === 'list' && (
        <AssignmentList
          assignments={filteredAssignments}
          equipment={equipment || []}
          projects={mockProjects}
          costCenters={mockCostCenters}
          onViewAssignment={handleViewAssignment}
        />
      )}

      {viewMode === 'calendar' && (
        <AssignmentCalendar
          assignments={filteredAssignments}
          equipment={equipment || []}
          projects={mockProjects}
          onViewAssignment={handleViewAssignment}
        />
      )}

      {viewMode === 'dashboard' && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Dashboard en Desarrollo
          </h3>
          <p className="text-gray-600">
            Los reportes y análisis avanzados estarán disponibles próximamente.
          </p>
        </div>
      )}

      {/* Modals */}
      <NewAssignmentModal
        isOpen={isNewAssignmentModalOpen}
        onClose={() => setIsNewAssignmentModalOpen(false)}
        onSave={handleNewAssignment}
        availableEquipment={equiposDisponibles}
        projects={mockProjects}
        costCenters={mockCostCenters}
        equipmentLoading={equipmentLoading}
        equipmentError={equipmentError}
      />

      <AssignmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        assignment={selectedAssignment}
        equipment={equipment || []}
        projects={mockProjects}
        costCenters={mockCostCenters}
        onUpdate={handleUpdateAssignment}
      />
    </div>
  );
};