import React from 'react';
import { Eye, Edit, MapPin, Calendar, Truck, Shield, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Equipment, EquipmentStatus, EquipmentUso } from '../../types';

interface EquipmentGridProps {
  equipment: Equipment[];
  onEdit?: (equipment: Equipment) => void;
  onView?: (equipment: Equipment) => void;
}

export const EquipmentGrid: React.FC<EquipmentGridProps> = ({ equipment, onEdit, onView }) => {
  
  // Función para obtener colores pastel por tipo de vehículo
  const getVehicleTypeColor = (tipoVehiculo: string) => {
    const colors = {
      'CAMIONETA': 'from-blue-100 to-blue-200 border-blue-300',
      'CAMION': 'from-orange-100 to-orange-200 border-orange-300', 
      'ACOPLADO': 'from-green-100 to-green-200 border-green-300',
      'SEMIRREMOLQUE': 'from-purple-100 to-purple-200 border-purple-300',
      'UTILITARIO': 'from-pink-100 to-pink-200 border-pink-300',
      'AUTOMOVIL': 'from-indigo-100 to-indigo-200 border-indigo-300',
      'SUV': 'from-teal-100 to-teal-200 border-teal-300',
      'MINIBUS': 'from-yellow-100 to-yellow-200 border-yellow-300',
      'TRACTOR': 'from-red-100 to-red-200 border-red-300',
      'RETROEXCAVADORA': 'from-amber-100 to-amber-200 border-amber-300',
      'MINICARGADORA': 'from-lime-100 to-lime-200 border-lime-300',
      'AUTOELEVADOR': 'from-cyan-100 to-cyan-200 border-cyan-300',
      'TRAILER': 'from-emerald-100 to-emerald-200 border-emerald-300',
      'MOTOVEHICULO': 'from-violet-100 to-violet-200 border-violet-300',
      'default': 'from-gray-100 to-gray-200 border-gray-300'
    };
    return colors[tipoVehiculo as keyof typeof colors] || colors.default;
  };
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
      {equipment.map((item) => {
        const vehicleColors = getVehicleTypeColor(item.tipoVehiculo);
        return (
          <div 
            key={`${item.id}-${item.updatedAt}`} 
            className={`
              bg-gradient-to-br ${vehicleColors}
              rounded-xl shadow-lg hover:shadow-2xl 
              transform hover:-translate-y-2 hover:rotate-1
              transition-all duration-300 ease-in-out
              border border-opacity-50
              backdrop-blur-sm
              relative overflow-hidden
              group cursor-pointer
            `}
            style={{
              boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 6px 12px rgba(0,0,0,0.08)',
            }}
          >
            {/* Equipment Visual - Imagen Prominente */}
            <div className="relative w-full h-48 rounded-t-xl overflow-hidden bg-white/20 backdrop-blur-sm">
              {item.imagenUrl ? (
                <img
                  src={`${item.imagenUrl}?t=${item.updatedAt}`}
                  alt={`${item.marca} ${item.modelo}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const truckIcon = target.parentElement?.querySelector('.fallback-icon');
                    if (truckIcon) {
                      (truckIcon as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div 
                className={`absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center fallback-icon ${item.imagenUrl ? 'hidden' : 'flex'}`}
              >
                <Truck className="h-20 w-20 text-white/60" />
              </div>
              
              {/* Overlay con badges de estado */}
              <div className="absolute top-3 right-3 flex flex-col space-y-2">
                {item.seguroCompania && (
                  <div className={`${isPolizaVencida(item.polizaVto || '') ? 'bg-red-500/90' : 'bg-blue-500/90'} text-white p-2 rounded-full shadow-xl backdrop-blur-sm`}>
                    <Shield className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              {/* Badge de tipo de vehículo */}
              <div className="absolute top-3 left-3">
                <Badge variant="default" className="bg-white/90 text-gray-800 font-semibold backdrop-blur-sm">
                  {item.tipoVehiculo}
                </Badge>
              </div>
            </div>
            
            {/* Content Card */}
            <div className="p-5">
              {/* Header con información principal */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800 text-xl truncate flex items-center">
                    {item.marca}
                    {item.polizaVto && isPolizaVencida(item.polizaVto) && (
                      <AlertTriangle className="h-5 w-5 text-red-600 ml-2" />
                    )}
                  </h3>
                  {getStatusBadge(item.status)}
                </div>
                <p className="text-gray-700 font-medium truncate text-lg">{item.modelo}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="default" className="bg-white/80 text-gray-800 font-bold">{item.dominio}</Badge>
                    <Badge variant="default" className="bg-white/60 text-gray-700">{item.año}</Badge>
                  </div>
                  {item.uso && (
                    <div className="">
                      {getUsoBadge(item.uso)}
                    </div>
                  )}
                </div>
              </div>

              {/* Equipment Details Simplificados */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-700">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="truncate font-medium">{item.deposito}</span>
                </div>
                
                {item.codigoArticulo && (
                  <div className="text-xs text-gray-600 bg-white/50 px-2 py-1 rounded">
                    <span className="font-medium">Código:</span> {item.codigoArticulo}
                  </div>
                )}
              </div>

              {/* Insurance Info - Simplified */}
              {item.seguroCompania && (
                <div className="bg-white/30 rounded-lg p-3 mb-4">
                  <div className="flex items-center text-xs">
                    <Shield className="h-3 w-3 mr-1 text-gray-600" />
                    <span className={`${isPolizaVencida(item.polizaVto || '') ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                      {item.seguroCompania}
                    </span>
                  </div>
                </div>
              )}

              {/* Observations */}
              {item.observaciones && (
                <div className="mb-4">
                  <div className="text-xs text-gray-700 bg-amber-100/70 p-2 rounded border-l-2 border-amber-400">
                    {item.observaciones}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/30">
                <div className="flex items-center space-x-2">
                  {onView && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onView(item)}
                      className="bg-white/80 hover:bg-white text-gray-700 border-gray-300"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                  )}
                  {onEdit && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEdit(item)}
                      className="bg-blue-500/80 hover:bg-blue-600 text-white border-blue-500"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  )}
                </div>
                
                <div className="text-xs text-gray-600 flex items-center bg-white/50 px-2 py-1 rounded">
                  <Calendar className="h-3 w-3 mr-1" />
                  {item.fechaIncorporacion || 'N/A'}
                </div>
              </div>
              
            </div>
          </div>
        );
      })}
      
      {equipment.length === 0 && (
        <div className="col-span-full text-center py-12">
          <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron equipos
          </h3>
          <p className="text-gray-600">
            No hay equipos que coincidan con los filtros aplicados.
          </p>
        </div>
      )}
    </div>
  );
};