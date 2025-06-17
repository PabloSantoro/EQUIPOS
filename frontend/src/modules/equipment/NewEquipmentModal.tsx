import React, { useState } from 'react';
import { X, Save, Package } from 'lucide-react';
import { Equipment, EquipmentStatus, EquipmentUso } from '../../types';
import { Button } from '../../components/ui/Button';

interface NewEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (equipment: Equipment) => void;
}

export const NewEquipmentModal: React.FC<NewEquipmentModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    codigoArticulo: '',
    dominio: '',
    marca: '',
    modelo: '',
    numeroMotor: '',
    numeroChasis: '',
    año: new Date().getFullYear(),
    fechaIncorporacion: '',
    tituloNombre: '',
    seguroCompania: '',
    polizaVto: '',
    fechaBaja: '',
    uso: EquipmentUso.OPERATIVO,
    tipoVehiculo: '',
    vtvVto: '',
    fichaMantenimiento: '',
    deposito: '',
    observaciones: '',
    status: EquipmentStatus.OPERATIVO
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
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

    if (!formData.codigoArticulo.trim()) newErrors.codigoArticulo = 'Código de artículo es requerido';
    if (!formData.dominio.trim()) newErrors.dominio = 'Dominio es requerido';
    if (!formData.marca.trim()) newErrors.marca = 'Marca es requerida';
    if (!formData.modelo.trim()) newErrors.modelo = 'Modelo es requerido';
    if (!formData.tipoVehiculo.trim()) newErrors.tipoVehiculo = 'Tipo de vehículo es requerido';
    if (!formData.deposito.trim()) newErrors.deposito = 'Depósito es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const newEquipment: Equipment = {
      id: `${Date.now()}`,
      codigoArticulo: formData.codigoArticulo.trim(),
      dominio: formData.dominio.trim(),
      marca: formData.marca.trim(),
      modelo: formData.modelo.trim(),
      numeroMotor: formData.numeroMotor.trim(),
      numeroChasis: formData.numeroChasis.trim(),
      año: formData.año,
      fechaIncorporacion: formData.fechaIncorporacion,
      tituloNombre: formData.tituloNombre.trim(),
      seguroCompania: formData.seguroCompania.trim(),
      polizaVto: formData.polizaVto,
      fechaBaja: formData.fechaBaja,
      uso: formData.uso,
      tipoVehiculo: formData.tipoVehiculo.trim(),
      vtvVto: formData.vtvVto,
      fichaMantenimiento: formData.fichaMantenimiento.trim(),
      deposito: formData.deposito.trim(),
      observaciones: formData.observaciones.trim(),
      status: formData.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(newEquipment);
    handleCancel();
  };

  const handleCancel = () => {
    setFormData({
      codigoArticulo: '',
      dominio: '',
      marca: '',
      modelo: '',
      numeroMotor: '',
      numeroChasis: '',
      año: new Date().getFullYear(),
      fechaIncorporacion: '',
      tituloNombre: '',
      seguroCompania: '',
      polizaVto: '',
      fechaBaja: '',
      uso: EquipmentUso.OPERATIVO,
        tipoVehiculo: '',
      vtvVto: '',
      fichaMantenimiento: '',
      deposito: '',
      observaciones: '',
      status: EquipmentStatus.OPERATIVO
    });
    setErrors({});
    onClose();
  };

  const getCurrentDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-blue-50">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Agregar Nuevo Equipo
              </h2>
              <p className="text-sm text-gray-600">
                Registra un nuevo equipo en el sistema
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                  placeholder="ACTROD---ABC123"
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
                  placeholder="ABC123"
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
                  placeholder="Toyota"
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
                  placeholder="Hilux DX 4x4"
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
                  value={formData.año}
                  onChange={(e) => handleInputChange('año', parseInt(e.target.value) || new Date().getFullYear())}
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
                  placeholder="CAMIONETA 4X4"
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
                  placeholder="123456789"
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
                  placeholder="9BFXXXXXXXXXXXXXX"
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
                  placeholder="DEPÓSITO PRINCIPAL"
                />
                {errors.deposito && (
                  <p className="text-red-500 text-sm mt-1">{errors.deposito}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Incorporación
              </label>
              <input
                type="text"
                value={formData.fechaIncorporacion}
                onChange={(e) => handleInputChange('fechaIncorporacion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`DD/MM/YYYY (ej: ${getCurrentDate()})`}
              />
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
                  placeholder="Puertas SRL"
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
                  placeholder="Federación Patronal"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vencimiento Póliza
                </label>
                <input
                  type="text"
                  value={formData.polizaVto}
                  onChange={(e) => handleInputChange('polizaVto', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="DD/MM/YYYY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vencimiento VTV
                </label>
                <input
                  type="text"
                  value={formData.vtvVto}
                  onChange={(e) => handleInputChange('vtvVto', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="DD/MM/YYYY"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ficha de Mantenimiento
                </label>
                <input
                  type="text"
                  value={formData.fichaMantenimiento}
                  onChange={(e) => handleInputChange('fichaMantenimiento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="FLOTA MANTENIMIENTO.xlsx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Cualquier observación adicional sobre el equipo..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Agregar Equipo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};