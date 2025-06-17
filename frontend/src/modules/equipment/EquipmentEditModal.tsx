import React, { useState, useEffect } from 'react';
import { X, Save, Camera } from 'lucide-react';
import { Equipment, EquipmentStatus, EquipmentUso } from '../../types';
import { Button } from '../../components/ui/Button';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { api } from '../../services/api';
import { useMutation } from '../../hooks/useAPI';

interface EquipmentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  onSave: (equipment: Equipment) => void;
}

export const EquipmentEditModal: React.FC<EquipmentEditModalProps> = ({
  isOpen,
  onClose,
  equipment,
  onSave
}) => {
  const [formData, setFormData] = useState<Equipment | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const uploadImageMutation = useMutation(async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.equipment.uploadImage(equipment!.id, formData);
    return response;
  });
  
  const deleteImageMutation = useMutation(async () => {
    await api.equipment.deleteImage(equipment!.id);
  });

  useEffect(() => {
    if (equipment) {
      setFormData({ ...equipment });
      setCurrentImageUrl(equipment.imagenUrl || null);
    }
  }, [equipment]);

  if (!isOpen || !formData) return null;

  const handleInputChange = (field: keyof Equipment, value: string) => {
    setFormData(prev => prev ? {
      ...prev,
      [field]: value
    } : null);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigoArticulo?.trim()) newErrors.codigoArticulo = 'Código de artículo es requerido';
    if (!formData.dominio?.trim()) newErrors.dominio = 'Dominio es requerido';
    if (!formData.marca?.trim()) newErrors.marca = 'Marca es requerida';
    if (!formData.modelo?.trim()) newErrors.modelo = 'Modelo es requerido';
    if (!formData.tipoVehiculo?.trim()) newErrors.tipoVehiculo = 'Tipo de vehículo es requerido';
    if (!formData.deposito?.trim()) newErrors.deposito = 'Depósito es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    
    const updatedEquipment = {
      ...formData,
      imagenUrl: currentImageUrl || undefined, // Incluir la imagen actualizada
      updatedAt: new Date().toISOString()
    };

    try {
      await onSave(updatedEquipment);
    } catch (error) {
      console.error('Error saving equipment:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(equipment ? { ...equipment } : null);
    setCurrentImageUrl(equipment?.imagenUrl || null);
    setErrors({});
    setImageError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Editar Equipo - {formData.dominio}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Equipment Image */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Camera className="h-5 w-5 mr-2 text-gray-600" />
              Fotografía del Equipo
            </h3>
            <div className="max-w-md">
              <ImageUpload
                currentImageUrl={currentImageUrl}
                onImageUpload={async (file) => {
                  try {
                    setImageError(null);
                    const result = await uploadImageMutation.mutateAsync(file);
                    setCurrentImageUrl(result.imageUrl);
                    // Actualizar también el formData
                    setFormData(prev => prev ? { ...prev, imagenUrl: result.imageUrl } : null);
                  } catch (error) {
                    setImageError('Error al subir la imagen. Intenta nuevamente.');
                  }
                }}
                onImageRemove={async () => {
                  try {
                    setImageError(null);
                    await deleteImageMutation.mutateAsync();
                    setCurrentImageUrl(null);
                    // Actualizar también el formData
                    setFormData(prev => prev ? { ...prev, imagenUrl: undefined } : null);
                  } catch (error) {
                    setImageError('Error al eliminar la imagen. Intenta nuevamente.');
                  }
                }}
                loading={uploadImageMutation.isLoading || deleteImageMutation.isLoading}
                error={imageError}
                placeholder="Subir fotografía del equipo"
              />
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Artículo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.codigoArticulo}
                  onChange={(e) => handleInputChange('codigoArticulo', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.codigoArticulo ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.codigoArticulo && (
                  <p className="text-red-500 text-sm mt-1">{errors.codigoArticulo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dominio <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.dominio}
                  onChange={(e) => handleInputChange('dominio', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.dominio ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.dominio && (
                  <p className="text-red-500 text-sm mt-1">{errors.dominio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Vehículo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.marca}
                  onChange={(e) => handleInputChange('marca', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.marca ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.marca && (
                  <p className="text-red-500 text-sm mt-1">{errors.marca}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => handleInputChange('modelo', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.modelo ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.modelo && (
                  <p className="text-red-500 text-sm mt-1">{errors.modelo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año Modelo
                </label>
                <input
                  type="number"
                  min="1990"
                  max="2030"
                  value={formData.anoModelo}
                  onChange={(e) => handleInputChange('anoModelo', parseInt(e.target.value) as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Vehículo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tipoVehiculo}
                  onChange={(e) => handleInputChange('tipoVehiculo', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.tipoVehiculo ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.tipoVehiculo && (
                  <p className="text-red-500 text-sm mt-1">{errors.tipoVehiculo}</p>
                )}
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles Técnicos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Motor
                </label>
                <input
                  type="text"
                  value={formData.numeroMotor}
                  onChange={(e) => handleInputChange('numeroMotor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Chasis
                </label>
                <input
                  type="text"
                  value={formData.numeroChasis}
                  onChange={(e) => handleInputChange('numeroChasis', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Status and Location */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado y Ubicación</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as EquipmentStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={EquipmentStatus.OPERATIVO}>Operativo</option>
                  <option value={EquipmentStatus.NO_OPERATIVO}>No Operativo</option>
                  <option value={EquipmentStatus.PARTICULAR}>Particular</option>
                  <option value={EquipmentStatus.BAJA}>Baja</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uso
                </label>
                <select
                  value={formData.uso}
                  onChange={(e) => handleInputChange('uso', e.target.value as EquipmentUso)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={EquipmentUso.OPERATIVO}>Operativo</option>
                  <option value={EquipmentUso.NO_OPERATIVO}>No Operativo</option>
                  <option value={EquipmentUso.PARTICULAR}>Particular</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Depósito <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.deposito}
                  onChange={(e) => handleInputChange('deposito', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.deposito ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.deposito && (
                  <p className="text-red-500 text-sm mt-1">{errors.deposito}</p>
                )}
              </div>
            </div>
          </div>

          {/* Legal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Legal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titular
                </label>
                <input
                  type="text"
                  value={formData.tituloNombre}
                  onChange={(e) => handleInputChange('tituloNombre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compañía de Seguro
                </label>
                <input
                  type="text"
                  value={formData.seguroCompania}
                  onChange={(e) => handleInputChange('seguroCompania', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vencimiento Póliza
                </label>
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={formData.polizaVto}
                  onChange={(e) => handleInputChange('polizaVto', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vencimiento VTV
                </label>
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={formData.vtvVto}
                  onChange={(e) => handleInputChange('vtvVto', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Incorporación
                </label>
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={formData.fechaIncorporacion}
                  onChange={(e) => handleInputChange('fechaIncorporacion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Observations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cualquier observación adicional..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};