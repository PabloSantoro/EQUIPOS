import React, { useState } from 'react';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  DollarSign,
  BarChart3,
  Calendar,
  Settings,
  Filter,
  Download
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Chart, GradientCard } from '../../components/ui/Chart';
import { useAPI } from '../../hooks/useAPI';
import { api } from '../../services/api';

export const EnhancedDashboard: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState('month');
  
  // Fetch real data
  const { data: equipment = [], loading: equipmentLoading, error: equipmentError } = useAPI(() => api.equipment.getAll());
  const { data: projects = [], loading: projectsLoading, error: projectsError } = useAPI(() => api.projects.getAll());
  const { data: costCenters = [], loading: costCentersLoading, error: costCentersError } = useAPI(() => api.costCenters.getAll());
  const { data: assignments = [], loading: assignmentsLoading, error: assignmentsError } = useAPI(() => api.assignments.getAll());

  // Check if any data is still loading
  const isDataLoading = equipmentLoading || projectsLoading || costCentersLoading || assignmentsLoading;
  const hasDataError = equipmentError || projectsError || costCentersError || assignmentsError;

  // Calculate statistics
  const stats = {
    totalEquipment: (equipment || []).length,
    operationalEquipment: (equipment || []).filter(e => e.status === 'OPERATIVO').length,
    maintenanceEquipment: (equipment || []).filter(e => e.status === 'MANTENIMIENTO').length,
    outOfServiceEquipment: (equipment || []).filter(e => e.status === 'FUERA_SERVICIO').length,
    activeProjects: (projects || []).filter(p => p.estado === 'ACTIVO').length,
    totalAssignments: (assignments || []).length,
    totalBudget: (costCenters || []).reduce((sum, cc) => sum + (cc.presupuesto || 0), 0)
  };

  // Equipment status data for charts
  const equipmentStatusData = [
    { name: 'Operativo', value: stats.operationalEquipment, color: 'bg-green-500' },
    { name: 'Mantenimiento', value: stats.maintenanceEquipment, color: 'bg-yellow-500' },
    { name: 'Fuera Servicio', value: stats.outOfServiceEquipment, color: 'bg-red-500' }
  ];

  const equipmentByTypeData = (equipment || []).reduce((acc, eq) => {
    const type = eq.tipoVehiculo || 'Otros';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeChartData = Object.entries(equipmentByTypeData).map(([name, value], index) => ({
    name,
    value,
    color: `hsl(${index * 45}, 70%, 50%)`
  }));

  const recentActivity = [
    { action: 'Nuevo equipo agregado', item: 'CAT 320D', time: '2 horas', type: 'equipment' },
    { action: 'Mantenimiento completado', item: 'Toyota Hilux', time: '4 horas', type: 'maintenance' },
    { action: 'Proyecto iniciado', item: 'Construcción Norte', time: '1 día', type: 'project' },
    { action: 'Asignación creada', item: 'Equipo #15', time: '2 días', type: 'assignment' }
  ];

  const alerts = [
    { 
      id: 1,
      type: 'warning', 
      title: 'Pólizas por vencer', 
      message: '3 equipos requieren renovación de seguro en los próximos 30 días',
      priority: 'high'
    },
    { 
      id: 2,
      type: 'info', 
      title: 'Mantenimiento programado', 
      message: '5 equipos tienen mantenimiento programado para esta semana',
      priority: 'medium'
    },
    { 
      id: 3,
      type: 'error', 
      title: 'Equipo fuera de servicio', 
      message: 'Retroexcavadora CAT-001 requiere atención inmediata',
      priority: 'high'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Show loading state
  if (isDataLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (hasDataError) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
              <p className="text-gray-600 mb-4">No se pudieron cargar los datos del dashboard.</p>
              <Button onClick={() => window.location.reload()}>Reintentar</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Resumen ejecutivo del sistema de equipos</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="quarter">Este trimestre</option>
            <option value="year">Este año</option>
          </select>
          
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <GradientCard
          title="Total Equipos"
          value={stats.totalEquipment}
          subtitle="Inventario completo"
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          icon={<Package className="h-8 w-8" />}
          trend={{ value: 5.2, isPositive: true }}
        />
        
        <GradientCard
          title="Equipos Operativos"
          value={stats.operationalEquipment}
          subtitle={`${Math.round((stats.operationalEquipment / stats.totalEquipment) * 100)}% del total`}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
          icon={<CheckCircle className="h-8 w-8" />}
          trend={{ value: 2.1, isPositive: true }}
        />
        
        <GradientCard
          title="Proyectos Activos"
          value={stats.activeProjects}
          subtitle="En desarrollo"
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          icon={<TrendingUp className="h-8 w-8" />}
          trend={{ value: 8.5, isPositive: true }}
        />
        
        <GradientCard
          title="Presupuesto Total"
          value={formatCurrency(stats.totalBudget)}
          subtitle="Centros de costo"
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
          icon={<DollarSign className="h-8 w-8" />}
          trend={{ value: 3.2, isPositive: false }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Equipment Status Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Estado de Equipos</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full pulse-dot"></div>
              <span className="text-sm text-gray-600">Tiempo real</span>
            </div>
          </div>
          
          <Chart data={equipmentStatusData} type="bar" height={250} />
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Disponibilidad promedio</span>
              <span className="font-medium text-green-600">
                {Math.round((stats.operationalEquipment / stats.totalEquipment) * 100)}%
              </span>
            </div>
          </div>
        </Card>

        {/* Equipment by Type */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Equipos por Tipo</h3>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          
          <Chart data={typeChartData} type="donut" height={200} />
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
            <Button variant="outline" size="sm">Ver todo</Button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'equipment' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'maintenance' ? 'bg-yellow-100 text-yellow-600' :
                  activity.type === 'project' ? 'bg-purple-100 text-purple-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {activity.type === 'equipment' && <Package className="h-5 w-5" />}
                  {activity.type === 'maintenance' && <AlertTriangle className="h-5 w-5" />}
                  {activity.type === 'project' && <BarChart3 className="h-5 w-5" />}
                  {activity.type === 'assignment' && <Calendar className="h-5 w-5" />}
                </div>
                
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.item}</p>
                </div>
                
                <div className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Estadísticas Rápidas</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Equipos en Mantenimiento</span>
              <div className="flex items-center">
                <Badge variant="warning" size="sm">{stats.maintenanceEquipment}</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Asignaciones Activas</span>
              <div className="flex items-center">
                <Badge variant="info" size="sm">{stats.totalAssignments}</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Centros de Costo</span>
              <div className="flex items-center">
                <Badge variant="default" size="sm">{costCenters.length}</Badge>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Próximos Vencimientos</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Pólizas</span>
                  <Badge variant="danger" size="sm">3</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">VTV</span>
                  <Badge variant="warning" size="sm">7</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas y Notificaciones</h3>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-lg border-l-4 ${
                  alert.type === 'error' ? 'bg-red-50 border-red-400' :
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                    alert.type === 'error' ? 'bg-red-400' :
                    alert.type === 'warning' ? 'bg-yellow-400' :
                    'bg-blue-400'
                  }`}>
                    {alert.type === 'error' && <AlertTriangle className="h-3 w-3 text-white" />}
                    {alert.type === 'warning' && <Clock className="h-3 w-3 text-white" />}
                    {alert.type === 'info' && <CheckCircle className="h-3 w-3 text-white" />}
                  </div>
                  
                  <div className="ml-3 flex-1">
                    <h4 className={`text-sm font-medium ${
                      alert.type === 'error' ? 'text-red-800' :
                      alert.type === 'warning' ? 'text-yellow-800' :
                      'text-blue-800'
                    }`}>
                      {alert.title}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      alert.type === 'error' ? 'text-red-600' :
                      alert.type === 'warning' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                  
                  <div className="ml-4">
                    <Badge 
                      variant={alert.priority === 'high' ? 'danger' : alert.priority === 'medium' ? 'warning' : 'default'}
                      size="sm"
                    >
                      {alert.priority === 'high' ? 'Alta' : alert.priority === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};