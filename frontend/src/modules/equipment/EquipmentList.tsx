import React from 'react';
import { Eye, Edit, Trash2, MapPin, Calendar, Truck, Shield, Package } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Equipment, EquipmentStatus, EquipmentUso } from '../../types';

interface EquipmentListProps {
  equipment: Equipment[];
  onViewEquipment: (equipment: Equipment) => void;
  onEditEquipment: (equipment: Equipment) => void;
  onDeleteEquipment?: (equipment: Equipment) => void;
}

export const EquipmentList: React.FC<EquipmentListProps> = ({ equipment, onViewEquipment, onEditEquipment, onDeleteEquipment }) => {
  const getStatusBadge = (status: EquipmentStatus) => {
    switch (status) {
      case EquipmentStatus.OPERATIVO:
        return <Badge variant="success">Operativo</Badge>;
      case EquipmentStatus.NO_OPERATIVO:
        return <Badge variant="danger">No Operativo</Badge>;
      case EquipmentStatus.PARTICULAR:
        return <Badge variant="info">Particular</Badge>;
      case EquipmentStatus.BAJA:
        return <Badge variant="default">Baja</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getUsoBadge = (uso: EquipmentUso) => {
    switch (uso) {
      case EquipmentUso.OPERATIVO:
        return <Badge variant="success" size="sm">Operativo</Badge>;
      case EquipmentUso.NO_OPERATIVO:
        return <Badge variant="danger" size="sm">No Operativo</Badge>;
      case EquipmentUso.PARTICULAR:
        return <Badge variant="info" size="sm">Particular</Badge>;
      default:
        return <Badge variant="default" size="sm">{uso}</Badge>;
    }
  };


  const isPolizaVencida = (polizaVto: string) => {
    if (!polizaVto) return false;
    const [day, month, year] = polizaVto.split('/');
    const polizaDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return polizaDate < new Date();
  };

  return (
    <Card padding="none">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código / Dominio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Identificación
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado / Uso
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seguro
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Observaciones
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {equipment.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.codigoArticulo}
                    </div>
                    <div className="text-sm text-gray-500 font-semibold">
                      {item.dominio}
                    </div>
                    <div className="text-xs text-gray-400">
                      {item.anoModelo}
                    </div>
                  </div>
                </td>
                
                <td className="px-4 py-4">
                  <div className="max-w-xs">
                    <div className="text-sm font-medium text-gray-900">
                      {item.marca}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {item.modelo}
                    </div>
                    <div className="flex items-center mt-1">
                      <Truck className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500 truncate">
                        {item.tipoVehiculo}
                      </span>
                    </div>
                  </div>
                </td>
                
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-xs text-gray-600">
                    {item.numeroMotor && (
                      <div><span className="font-medium">Motor:</span> {item.numeroMotor}</div>
                    )}
                    {item.numeroChasis && (
                      <div><span className="font-medium">Chasis:</span> {item.numeroChasis}</div>
                    )}
                    {item.tituloNombre && (
                      <div className="mt-1">
                        <span className="font-medium">Titular:</span> {item.tituloNombre}
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {getStatusBadge(item.status)}
                    {getUsoBadge(item.uso)}
                  </div>
                </td>
                
                <td className="px-4 py-4">
                  <div className="max-w-xs">
                    <div className="flex items-start">
                      <MapPin className="h-3 w-3 text-gray-400 mr-1 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-900 truncate">
                        {item.deposito}
                      </span>
                    </div>
                    {item.fechaIncorporacion && (
                      <div className="flex items-center mt-1">
                        <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">
                          Incorp: {item.fechaIncorporacion}
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {item.seguroCompania && (
                      <div className="flex items-center">
                        <Shield className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-600 truncate max-w-24">
                          {item.seguroCompania}
                        </span>
                      </div>
                    )}
                    {item.polizaVto && (
                      <div className={`text-xs ${isPolizaVencida(item.polizaVto) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                        Vto: {item.polizaVto}
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-4 py-4">
                  <div className="max-w-xs">
                    <div className="text-xs text-gray-600 truncate">
                      {item.observaciones || '-'}
                    </div>
                    {item.fichaMantenimiento && (
                      <div className="text-xs text-blue-600 truncate mt-1">
                        📋 {item.fichaMantenimiento}
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewEquipment(item)}
                      title="Ver detalles"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEditEquipment(item)}
                      title="Editar equipo"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    {onDeleteEquipment && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onDeleteEquipment(item)}
                        title="Eliminar equipo"
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {equipment.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron equipos
          </h3>
          <p className="text-gray-600">
            No hay equipos que coincidan con los filtros aplicados.
          </p>
        </div>
      )}
    </Card>
  );
};