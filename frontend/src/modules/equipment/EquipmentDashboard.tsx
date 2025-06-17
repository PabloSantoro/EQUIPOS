import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  MapPin, 
  AlertTriangle, 
  Calendar,
  Settings,
  Wrench,
  Navigation,
  BarChart3,
  MoreVertical
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EquipmentStatus } from '../../types';
import { mockEquipment } from '../../data/mockEquipment';

export const EquipmentDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  // Calculate real metrics from data
  const metrics = {
    totalFleet: mockEquipment.length,
    activeVehicles: mockEquipment.filter(e => e.status === EquipmentStatus.OPERATIVO).length,
    maintenanceNeeded: mockEquipment.filter(e => e.status === EquipmentStatus.NO_OPERATIVO).length,
    expiredInsurance: mockEquipment.filter(e => {
      if (!e.polizaVto) return false;
      const [day, month, year] = e.polizaVto.split('/');
      const polizaDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return polizaDate < new Date();
    }).length,
    byType: mockEquipment.reduce((acc, eq) => {
      acc[eq.tipoVehiculo] = (acc[eq.tipoVehiculo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  const topVehicleTypes = Object.entries(metrics.byType)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const recentActivity = [
    { id: 1, type: 'maintenance', equipment: 'EUU007', message: 'Mantenimiento programado completado', time: '2 horas', status: 'completed' },
    { id: 2, type: 'location', equipment: 'AD883NZ', message: 'Ubicación actualizada: LMA-COMIN', time: '4 horas', status: 'info' },
    { id: 3, type: 'alert', equipment: 'AEA063', message: 'Requiere inspección técnica', time: '6 horas', status: 'warning' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🚗 Fleet Dashboard</h1>
          <p className="text-gray-600 mt-1">Gestión integral de equipos y vehículos - Vista Moderna</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Metrics - Left Side */}
        <div className="lg:col-span-8 space-y-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Fleet */}
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Flota</p>
                  <p className="text-3xl font-bold">{metrics.totalFleet}</p>
                  <p className="text-blue-100 text-xs mt-1">+2 este mes</p>
                </div>
                <div className="w-12 h-12 bg-blue-400 bg-opacity-30 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </Card>

            {/* Active Vehicles */}
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Operativos</p>
                  <p className="text-3xl font-bold">{metrics.activeVehicles}</p>
                  <p className="text-green-100 text-xs mt-1">
                    {((metrics.activeVehicles / metrics.totalFleet) * 100).toFixed(0)}% del total
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-400 bg-opacity-30 rounded-lg flex items-center justify-center">
                  <Truck className="h-6 w-6" />
                </div>
              </div>
            </Card>


            {/* Maintenance Needed */}
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Mantenimiento</p>
                  <p className="text-3xl font-bold">{metrics.maintenanceNeeded}</p>
                  <p className="text-orange-100 text-xs mt-1">Requieren atención</p>
                </div>
                <div className="w-12 h-12 bg-orange-400 bg-opacity-30 rounded-lg flex items-center justify-center">
                  <Wrench className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </div>

          {/* Fleet Overview Chart */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Distribución por Tipo</h3>
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Reporte
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Vehicle Types */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Tipos Principales</h4>
                <div className="space-y-3">
                  {topVehicleTypes.map(([type, count], index) => {
                    const percentage = (count / metrics.totalFleet) * 100;
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
                    return (
                      <div key={type} className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${colors[index]}`}></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">{type}</span>
                            <span className="text-sm text-gray-600">{count} unidades</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${colors[index]}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Distribution */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Estado Operacional</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Operativos</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{metrics.activeVehicles}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">No Operativos</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">{metrics.maintenanceNeeded}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Particulares</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {mockEquipment.filter(e => e.status === EquipmentStatus.PARTICULAR).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Fleet Performance Metrics */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Métricas de Rendimiento</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Tiempo real</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Utilization Rate */}
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-blue-500"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${((metrics.activeVehicles / metrics.totalFleet) * 100)}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">
                      {((metrics.activeVehicles / metrics.totalFleet) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Tasa de Utilización</h4>
                <p className="text-xs text-gray-600">Equipos operativos</p>
              </div>

              {/* GPS Coverage */}
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-purple-500"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${((metrics.gpsTracked / metrics.totalFleet) * 100)}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">
                      {((metrics.gpsTracked / metrics.totalFleet) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Cobertura GPS</h4>
                <p className="text-xs text-gray-600">Equipos rastreados</p>
              </div>

              {/* Maintenance Rate */}
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-orange-500"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${((metrics.maintenanceNeeded / metrics.totalFleet) * 100)}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">
                      {((metrics.maintenanceNeeded / metrics.totalFleet) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Requiere Mantto.</h4>
                <p className="text-xs text-gray-600">No operativos</p>
              </div>
            </div>
          </Card>

          {/* Recent Equipment */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Equipos Recientes</h3>
              <Button variant="outline" size="sm">Ver Todos</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockEquipment.slice(0, 3).map((equipment) => (
                <div key={equipment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={equipment.status === EquipmentStatus.OPERATIVO ? 'success' : 'danger'}>
                      {equipment.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-900 text-sm">{equipment.marca}</h4>
                    <p className="text-xs text-gray-600 truncate">{equipment.modelo}</p>
                    <p className="text-xs text-gray-500 mt-1">{equipment.dominio}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600 truncate">{equipment.deposito}</span>
                    </div>
                    {equipment.gpsInstalado === 'Si' && (
                      <Badge variant="success" size="sm">GPS</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Package className="h-4 w-4 mr-3" />
                Agregar Equipo
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Wrench className="h-4 w-4 mr-3" />
                Programar Mantenimiento
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="h-4 w-4 mr-3" />
                Generar Reporte
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <MapPin className="h-4 w-4 mr-3" />
                Ver Ubicaciones
              </Button>
            </div>
          </Card>

          {/* Alerts */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Alertas</h3>
              <Badge variant="danger">{metrics.expiredInsurance + 2}</Badge>
            </div>
            <div className="space-y-3">
              {metrics.expiredInsurance > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Pólizas Vencidas</p>
                    <p className="text-xs text-red-700">{metrics.expiredInsurance} equipos requieren renovación</p>
                  </div>
                </div>
              )}
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <Calendar className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Mantenimiento Programado</p>
                  <p className="text-xs text-yellow-700">3 equipos requieren servicio esta semana</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <Navigation className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">GPS Desconectado</p>
                  <p className="text-xs text-blue-700">1 equipo sin señal GPS por más de 24h</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'completed' ? 'bg-green-500' :
                    activity.status === 'warning' ? 'bg-yellow-500' :
                    activity.status === 'success' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs font-medium text-blue-600">{activity.equipment}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};