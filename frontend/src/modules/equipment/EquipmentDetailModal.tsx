import React, { useState } from 'react';
import { X, MapPin, Calendar, Truck, Shield, Package, User, FileText, AlertTriangle, Camera } from 'lucide-react';
import { Equipment, EquipmentStatus, EquipmentUso } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface EquipmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  onEdit?: (equipment: Equipment) => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  isOpen,
  onClose,
  equipment,
  onEdit
}) => {
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(equipment?.imagenUrl || null);
  
  if (!isOpen || !equipment) return null;

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
        return <Badge variant="success">Operativo</Badge>;
      case EquipmentUso.NO_OPERATIVO:
        return <Badge variant="danger">No Operativo</Badge>;
      case EquipmentUso.PARTICULAR:
        return <Badge variant="info">Particular</Badge>;
      default:
        return <Badge variant="default">{uso}</Badge>;
    }
  };


  const isPolizaVencida = (polizaVto: string) => {
    if (!polizaVto) return false;
    const [day, month, year] = polizaVto.split('/');
    const polizaDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return polizaDate < new Date();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return dateString;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {equipment.dominio} - {equipment.marca} {equipment.modelo}
              </h2>
              <p className="text-sm text-gray-600">
                {equipment.codigoArticulo}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(equipment.status)}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Equipment Image - Solo Vista */}
          {currentImageUrl && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Camera className="h-5 w-5 mr-2 text-gray-600" />
                Fotografía del Equipo
              </h3>
              <div className="max-w-md">
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border">
                  <img
                    src={currentImageUrl}
                    alt={`${equipment.marca} ${equipment.modelo}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Truck className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Vehículo</span>
                </div>
                <p className="font-semibold text-gray-900">{equipment.marca}</p>
                <p className="text-sm text-gray-600">{equipment.modelo}</p>
                <p className="text-xs text-gray-500">{equipment.tipoVehiculo}</p>
                <p className="text-xs text-gray-500">Año: {equipment.año}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Identificación</span>
                </div>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Dominio:</span> {equipment.dominio}
                </p>
                {equipment.numeroMotor && equipment.numeroMotor !== 'NO APLICA' && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Motor:</span> {equipment.numeroMotor}
                  </p>
                )}
                {equipment.numeroChasis && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Chasis:</span> {equipment.numeroChasis}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Ubicación</span>
                </div>
                <p className="font-semibold text-gray-900">{equipment.deposito}</p>
              </div>
            </div>
          </div>

          {/* Status and Usage */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado y Uso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Estado:</span>
                    <div className="mt-1">{getStatusBadge(equipment.status)}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Uso:</span>
                    <div className="mt-1">{getUsoBadge(equipment.uso)}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  {equipment.fechaIncorporacion && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        Incorporación: {formatDate(equipment.fechaIncorporacion)}
                      </span>
                    </div>
                  )}
                  {equipment.fechaBaja && (
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">
                        Fecha de Baja: {formatDate(equipment.fechaBaja)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Ownership and Legal */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Legal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Titular</span>
                </div>
                <p className="font-semibold text-gray-900">
                  {equipment.tituloNombre || 'No especificado'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Seguro</span>
                </div>
                {equipment.seguroCompania ? (
                  <>
                    <p className="font-semibold text-gray-900">{equipment.seguroCompania}</p>
                    {equipment.polizaVto && (
                      <p className={`text-sm mt-1 ${
                        isPolizaVencida(equipment.polizaVto) 
                          ? 'text-red-600 font-medium' 
                          : 'text-gray-600'
                      }`}>
                        {isPolizaVencida(equipment.polizaVto) && (
                          <AlertTriangle className="h-3 w-3 inline mr-1" />
                        )}
                        Vencimiento: {equipment.polizaVto}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">No especificado</p>
                )}
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles Técnicos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Inspecciones</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">VTV:</span> {equipment.vtvVto || 'No especificado'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Mantenimiento</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Ficha:</span> {equipment.fichaMantenimiento || 'No especificado'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Observations */}
          {equipment.observaciones && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-900">{equipment.observaciones}</p>
              </div>
            </div>
          )}

          {/* Audit Information */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Auditoría</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Creado:</span> {new Date(equipment.createdAt).toLocaleString('es-ES')}
              </div>
              <div>
                <span className="font-medium">Actualizado:</span> {new Date(equipment.updatedAt).toLocaleString('es-ES')}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          {onEdit && (
            <Button onClick={() => onEdit(equipment)}>
              Editar Equipo
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};