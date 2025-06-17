import React, { useState } from 'react';
import { Building2, Plus, Filter, Users, DollarSign, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAPI, useMutation } from '../../hooks/useAPI';
import { api } from '../../services/api';

interface CostCenter {
  id: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
  responsable: string;
  presupuesto?: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export const CostCentersModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    activo: ''
  });

  // API calls
  const { data: costCenters = [], loading, error, refetch } = useAPI(() => api.costCenters.getAll());
  const createCostCenterMutation = useMutation(api.costCenters.create);
  const updateCostCenterMutation = useMutation(({ id, data }: { id: string; data: any }) => 
    api.costCenters.update(id, data)
  );
  const deleteCostCenterMutation = useMutation(api.costCenters.delete);

  // Filtrar centros de costo
  const filteredCostCenters = (costCenters || []).filter((center: CostCenter) => {
    const matchesSearch = searchTerm === '' || 
      center.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.responsable.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesActivo = filters.activo === '' || 
      (filters.activo === 'true' && center.activo) ||
      (filters.activo === 'false' && !center.activo);

    return matchesSearch && matchesActivo;
  });

  // Estadísticas
  const stats = {
    total: (costCenters || []).length,
    activos: (costCenters || []).filter((c: CostCenter) => c.activo).length,
    inactivos: (costCenters || []).filter((c: CostCenter) => !c.activo).length,
    presupuestoTotal: (costCenters || []).reduce((sum: number, c: CostCenter) => sum + (c.presupuesto || 0), 0),
  };

  // Mostrar loading
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Cargando centros de costo...</p>
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
              <Building2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar centros de costo</h3>
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

  const getActiveBadge = (activo: boolean) => {
    return activo ? 
      <Badge variant="success">Activo</Badge> : 
      <Badge variant="default">Inactivo</Badge>;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Building2 className="h-6 w-6 mr-3 text-blue-600" />
            Gestión de Centros de Costo
          </h2>
          <p className="text-gray-600 mt-1">
            Administra los centros de costo y presupuestos
          </p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Centro de Costo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Centros</div>
            </div>
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.activos}</div>
              <div className="text-sm text-gray-600">Activos</div>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-600">{stats.inactivos}</div>
              <div className="text-sm text-gray-600">Inactivos</div>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-600 font-bold">I</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.presupuestoTotal)}</div>
              <div className="text-sm text-gray-600">Presupuesto Total</div>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar centros de costo por nombre, código o responsable..."
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
                  Estado
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={filters.activo}
                  onChange={(e) => setFilters(prev => ({ ...prev, activo: e.target.value }))}
                >
                  <option value="">Todos</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
                </select>
              </div>
              
              <div className="flex items-end md:col-span-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    setFilters({ activo: '' });
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
          Mostrando {filteredCostCenters.length} de {stats.total} centros de costo
        </div>
      </div>

      {/* Cost Centers List */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Centro de Costo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsable
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Presupuesto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Creación
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCostCenters.map((center) => (
                <tr key={center.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {center.nombre}
                      </div>
                      <div className="text-sm text-gray-500">
                        {center.descripcion}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">{center.codigo}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{center.responsable}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {center.presupuesto ? formatCurrency(center.presupuesto) : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getActiveBadge(center.activo)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(center.createdAt)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCostCenters.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay centros de costo
            </h3>
            <p className="text-gray-600">
              No se encontraron centros de costo que coincidan con los filtros aplicados.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};