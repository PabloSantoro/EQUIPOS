import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, Grid, List, FileSpreadsheet, BarChart3 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Equipment, EquipmentStatus, EquipmentUso } from '../../types';
import { useAPI, useMutation } from '../../hooks/useAPI';
import { api } from '../../services/api';
import { EquipmentList } from './EquipmentList';
import { EquipmentGrid } from './EquipmentGrid';
import { EquipmentDashboard } from './EquipmentDashboard';
import { EquipmentDetailModal } from './EquipmentDetailModal';
import { EquipmentEditModal } from './EquipmentEditModal';
import { NewEquipmentModal } from './NewEquipmentModal';

type ViewMode = 'dashboard' | 'grid' | 'list';

export const EquipmentModule: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewEquipmentModalOpen, setIsNewEquipmentModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  
  // API calls
  const { data: equipment = [], loading, error, refetch } = useAPI(() => api.equipment.getAll());
  const createEquipmentMutation = useMutation(api.equipment.create);
  const updateEquipmentMutation = useMutation(({ id, data }: { id: string; data: any }) => 
    api.equipment.update(id, data)
  );
  const deleteEquipmentMutation = useMutation(api.equipment.delete);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    marca: '',
    tipoVehiculo: '',
    status: ''
  });

  const filteredEquipment = (equipment || []).filter(eq => {
    const matchesSearch = searchTerm === '' || 
      eq.dominio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.tipoVehiculo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMarca = filters.marca === '' || eq.marca === filters.marca;
    const matchesTipo = filters.tipoVehiculo === '' || eq.tipoVehiculo === filters.tipoVehiculo;
    const matchesStatus = filters.status === '' || eq.status === filters.status;

    return matchesSearch && matchesMarca && matchesTipo && matchesStatus;
  });

  const statusCounts = {
    operativo: (equipment || []).filter(e => e.status === 'OPERATIVO').length,
    mantenimiento: (equipment || []).filter(e => e.status === 'MANTENIMIENTO').length,
    fueraServicio: (equipment || []).filter(e => e.status === 'FUERA_SERVICIO').length,
  };

  const handleViewEquipment = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setIsDetailModalOpen(true);
  };

  const handleEditEquipment = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setIsEditModalOpen(true);
  };

  const handleSaveEquipment = async (updatedEquipment: Equipment) => {
    try {
      const result = await updateEquipmentMutation.mutate({ id: updatedEquipment.id, data: updatedEquipment });
      
      // Recargar datos
      await refetch();
      
      // Cerrar modal después de guardar exitosamente
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating equipment:', error);
      alert('Error al guardar el equipo. Por favor, inténtalo de nuevo.');
    }
  };

  const handleEditFromDetail = (eq: Equipment) => {
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleAddEquipment = async (newEquipment: Equipment) => {
    try {
      await createEquipmentMutation.mutate(newEquipment);
      refetch(); // Recargar datos
    } catch (error) {
      console.error('Error creating equipment:', error);
    }
  };

  const handleDeleteEquipment = async (equipment: Equipment) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el equipo ${equipment.dominio}?`)) {
      try {
        await deleteEquipmentMutation.mutate(equipment.id);
        refetch(); // Recargar datos
      } catch (error) {
        console.error('Error deleting equipment:', error);
        alert('Error al eliminar el equipo. Puede que tenga asignaciones activas.');
      }
    }
  };

  const handleExportData = () => {
    // Convert equipment data to CSV
    const headers = [
      'ID', 'Dominio', 'Marca', 'Modelo', 'Año', 'Tipo Vehículo',
      'Motor', 'Chasis', 'Estado', 'Póliza Número', 'Póliza Vto', 'VTV Vto', 'Observaciones'
    ];
    
    const csvData = [
      headers.join(','),
      ...(equipment || []).map(eq => [
        `"${eq.id}"`,
        `"${eq.dominio}"`,
        `"${eq.marca}"`,
        `"${eq.modelo}"`,
        eq.año,
        `"${eq.tipoVehiculo}"`,
        `"${eq.motor || ''}"`,
        `"${eq.chasis || ''}"`,
        `"${eq.status}"`,
        `"${eq.polizaNumero || ''}"`,
        `"${eq.polizaVto || ''}"`,
        `"${eq.vtvVto || ''}"`,
        `"${eq.observaciones || ''}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `equipos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Contadores adicionales basados en datos disponibles
  const totalEquipment = (equipment || []).length;

  // Get unique values for filters
  const uniqueMarcas = [...new Set((equipment || []).map(e => e.marca))].sort();
  const uniqueTipos = [...new Set((equipment || []).map(e => e.tipoVehiculo))].sort();
  const uniqueStatus = [...new Set((equipment || []).map(e => e.status))].sort();

  const clearFilters = () => {
    setFilters({
      marca: '',
      tipoVehiculo: '',
      status: ''
    });
    setSearchTerm('');
  };

  // Mostrar loading
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Cargando equipos...</p>
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
              <Package className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar equipos</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={refetch}>Reintentar</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Package className="h-6 w-6 mr-3 text-blue-600" />
            Gestión de Equipos y Vehículos
          </h2>
          <p className="text-gray-600 mt-1">
            Administra el inventario completo de equipos, vehículos y maquinaria
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'dashboard' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('dashboard')}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="outline" onClick={handleExportData}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          <Button onClick={() => setIsNewEquipmentModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Equipo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{equipment.length}</div>
              <div className="text-sm text-gray-600">Total Equipos</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{statusCounts.operativo}</div>
              <div className="text-sm text-gray-600">Operativos</div>
            </div>
            <Badge variant="success">{statusCounts.operativo}</Badge>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.mantenimiento}</div>
              <div className="text-sm text-gray-600">En Mantenimiento</div>
            </div>
            <Badge variant="warning">{statusCounts.mantenimiento}</Badge>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{statusCounts.fueraServicio}</div>
              <div className="text-sm text-gray-600">Fuera de Servicio</div>
            </div>
            <Badge variant="danger">{statusCounts.fueraServicio}</Badge>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalEquipment}</div>
              <div className="text-sm text-gray-600">Total Equipos</div>
            </div>
            <Badge variant="info">{totalEquipment}</Badge>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">{uniqueMarcas.length}</div>
              <div className="text-sm text-gray-600">Marcas Diferentes</div>
            </div>
            <Badge variant="default">{uniqueMarcas.length}</Badge>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por código, dominio, marca, modelo o depósito..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={filters.marca}
                  onChange={(e) => setFilters(prev => ({ ...prev, marca: e.target.value }))}
                >
                  <option value="">Todas</option>
                  {uniqueMarcas.map(marca => (
                    <option key={marca} value={marca}>{marca}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo Vehículo
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={filters.tipoVehiculo}
                  onChange={(e) => setFilters(prev => ({ ...prev, tipoVehiculo: e.target.value }))}
                >
                  <option value="">Todos</option>
                  {uniqueTipos.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">Todos</option>
                  {uniqueStatus.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <Button variant="outline" className="w-full" onClick={clearFilters}>
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
          Mostrando {filteredEquipment.length} de {totalEquipment} equipos
        </div>
        {(searchTerm || Object.values(filters).some(v => v)) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpiar búsqueda y filtros
          </Button>
        )}
      </div>

      {/* Equipment Content */}
      {viewMode === 'dashboard' ? (
        <EquipmentDashboard />
      ) : viewMode === 'grid' ? (
        <EquipmentGrid 
          equipment={filteredEquipment} 
          onView={handleViewEquipment}
          onEdit={handleEditEquipment}
        />
      ) : (
        <EquipmentList 
          equipment={filteredEquipment} 
          onViewEquipment={handleViewEquipment}
          onEditEquipment={handleEditEquipment}
          onDeleteEquipment={handleDeleteEquipment}
        />
      )}

      {/* Equipment Detail Modal */}
      <EquipmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        equipment={selectedEquipment}
        onEdit={handleEditFromDetail}
      />

      {/* Equipment Edit Modal */}
      <EquipmentEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        equipment={selectedEquipment}
        onSave={handleSaveEquipment}
      />

      {/* New Equipment Modal */}
      <NewEquipmentModal
        isOpen={isNewEquipmentModalOpen}
        onClose={() => setIsNewEquipmentModalOpen(false)}
        onSave={handleAddEquipment}
      />
    </div>
  );
};