import React, { useState } from 'react';
import { Building, Plus, Filter, Users, DollarSign, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAPI, useMutation } from '../../hooks/useAPI';
import { api } from '../../services/api';

interface Project {
  id: string;
  nombre: string;
  tipo: 'INTERNO' | 'EXTERNO';
  descripcion?: string;
  costoHora?: number;
  porcentajeCosto?: number;
  fechaInicio?: string;
  fechaFinPrevista?: string;
  responsable: string;
  cliente?: string;
  estado: 'ACTIVO' | 'FINALIZADO' | 'SUSPENDIDO';
  presupuesto?: number;
  createdAt: string;
  updatedAt: string;
}

export const ProjectsModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    tipo: '',
    estado: ''
  });

  // API calls
  const { data: projects = [], loading, error, refetch } = useAPI(() => api.projects.getAll());
  const createProjectMutation = useMutation(api.projects.create);
  const updateProjectMutation = useMutation(({ id, data }: { id: string; data: any }) => 
    api.projects.update(id, data)
  );
  const deleteProjectMutation = useMutation(api.projects.delete);

  // Filtrar proyectos
  const filteredProjects = (projects || []).filter(project => {
    const matchesSearch = searchTerm === '' || 
      project.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.responsable.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.cliente && project.cliente.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTipo = filters.tipo === '' || project.tipo === filters.tipo;
    const matchesEstado = filters.estado === '' || project.estado === filters.estado;

    return matchesSearch && matchesTipo && matchesEstado;
  });

  // Estadísticas
  const stats = {
    total: (projects || []).length,
    activos: (projects || []).filter(p => p.estado === 'ACTIVO').length,
    internos: (projects || []).filter(p => p.tipo === 'INTERNO').length,
    externos: (projects || []).filter(p => p.tipo === 'EXTERNO').length,
  };

  // Mostrar loading
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Cargando proyectos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar proyectos</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={refetch}>Reintentar</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getTypeBadge = (tipo: string) => {
    return tipo === 'INTERNO' ? 
      <Badge variant="info">Interno</Badge> : 
      <Badge variant="warning">Externo</Badge>;
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
        return <Badge variant="success">Activo</Badge>;
      case 'FINALIZADO':
        return <Badge variant="default">Finalizado</Badge>;
      case 'SUSPENDIDO':
        return <Badge variant="danger">Suspendido</Badge>;
      default:
        return <Badge variant="default">{estado}</Badge>;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Building className="h-6 w-6 mr-3 text-blue-600" />
            Gestión de Proyectos
          </h2>
          <p className="text-gray-600 mt-1">
            Administra proyectos internos y externos
          </p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Proyectos</div>
            </div>
            <Building className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.activos}</div>
              <div className="text-sm text-gray-600">Activos</div>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold">A</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.internos}</div>
              <div className="text-sm text-gray-600">Internos</div>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600">{stats.externos}</div>
              <div className="text-sm text-gray-600">Externos</div>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar proyectos por nombre, responsable o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        {showFilters && (
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={filters.tipo}
                  onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
                >
                  <option value="">Todos</option>
                  <option value="INTERNO">Interno</option>
                  <option value="EXTERNO">Externo</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={filters.estado}
                  onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
                >
                  <option value="">Todos</option>
                  <option value="ACTIVO">Activo</option>
                  <option value="FINALIZADO">Finalizado</option>
                  <option value="SUSPENDIDO">Suspendido</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    setFilters({ tipo: '', estado: '' });
                    setSearchTerm('');
                  }}
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Results Info */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Mostrando {filteredProjects.length} de {stats.total} proyectos
        </div>
      </div>

      {/* Projects List */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proyecto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsable
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fechas
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Presupuesto
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {project.nombre}
                      </div>
                      <div className="text-sm text-gray-500">
                        {project.descripcion}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getTypeBadge(project.tipo)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{project.responsable}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{project.cliente || '-'}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {project.fechaInicio && (
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                          {formatDate(project.fechaInicio)}
                        </div>
                      )}
                      {project.fechaFinPrevista && (
                        <div className="text-xs text-gray-500 mt-1">
                          hasta {formatDate(project.fechaFinPrevista)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(project.estado)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {project.presupuesto ? formatCurrency(project.presupuesto) : '-'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay proyectos
            </h3>
            <p className="text-gray-600">
              No se encontraron proyectos que coincidan con los filtros aplicados.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};