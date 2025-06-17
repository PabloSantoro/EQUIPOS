import { useState } from 'react';
import { Settings, Wrench, Package, BarChart3, Users, Calendar, Building, Building2, Home } from 'lucide-react';
import { EnhancedDashboard } from './modules/dashboard/EnhancedDashboard';
import { EquipmentModule } from './modules/equipment/EquipmentModule';
import { MaintenanceModule } from './modules/maintenance/MaintenanceModule';
import { AssignmentsModule } from './modules/assignments/AssignmentsModule';
import { ProjectsModule } from './modules/projects/ProjectsModule';
import { CostCentersModule } from './modules/cost-centers/CostCentersModule';
import { ReportsModule } from './modules/reports/ReportsModule';
import { UsersModule } from './modules/users/UsersModule';

type Module = 'dashboard' | 'equipment' | 'maintenance' | 'assignments' | 'projects' | 'cost-centers' | 'reports' | 'users';

function App() {
  const [activeModule, setActiveModule] = useState<Module>('dashboard');

  const modules = [
    {
      id: 'dashboard' as Module,
      name: 'Dashboard',
      icon: Home,
      description: 'Resumen ejecutivo del sistema'
    },
    {
      id: 'equipment' as Module,
      name: 'Equipos',
      icon: Package,
      description: 'Gestión del inventario de equipos'
    },
    {
      id: 'maintenance' as Module,
      name: 'Mantenimiento',
      icon: Wrench,
      description: 'Programación y seguimiento de mantenimientos'
    },
    {
      id: 'assignments' as Module,
      name: 'Asignaciones',
      icon: Calendar,
      description: 'Asignación de equipos a proyectos'
    },
    {
      id: 'projects' as Module,
      name: 'Proyectos',
      icon: Building,
      description: 'Gestión de proyectos internos y externos'
    },
    {
      id: 'cost-centers' as Module,
      name: 'Centros de Costo',
      icon: Building2,
      description: 'Administración de centros de costo'
    },
    {
      id: 'reports' as Module,
      name: 'Reportes',
      icon: BarChart3,
      description: 'Análisis y reportes del sistema'
    },
    {
      id: 'users' as Module,
      name: 'Usuarios',
      icon: Users,
      description: 'Gestión de usuarios y permisos'
    }
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <EnhancedDashboard />;
      case 'equipment':
        return <EquipmentModule />;
      case 'maintenance':
        return <MaintenanceModule />;
      case 'assignments':
        return <AssignmentsModule />;
      case 'projects':
        return <ProjectsModule />;
      case 'cost-centers':
        return <CostCentersModule />;
      case 'reports':
        return <ReportsModule />;
      case 'users':
        return <UsersModule />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow border-b">
        <div className="w-full px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-xl font-bold text-gray-900">
                Control de Equipos
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              Sistema Independiente v1.0
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-6 py-8">
        {/* Module Selector */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`px-4 py-2 rounded-lg border transition-all flex items-center ${
                    isActive
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-4 w-4 mr-2 ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                  <span className="font-medium text-sm">
                    {module.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Module Content */}
        {activeModule === 'dashboard' ? (
          renderModule()
        ) : (
          <div className="bg-white rounded-lg shadow border">
            {renderModule()}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;