import React, { useState } from 'react';
import { X, Calendar, Wrench, AlertTriangle, CheckCircle, User, Clock, DollarSign } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { MaintenanceType, MaintenancePriority, Equipment } from '../../types';

interface NewMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (maintenanceData: any) => void;
  equipment: Equipment[];
  equipmentLoading?: boolean;
  equipmentError?: string | null;
}

export const NewMaintenanceModal: React.FC<NewMaintenanceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  equipment,
  equipmentLoading = false,
  equipmentError = null
}) => {
  const [formData, setFormData] = useState({
    equipmentId: '',
    type: MaintenanceType.PREVENTIVE,
    priority: MaintenancePriority.MEDIUM,
    scheduledDate: '',
    scheduledTime: '',
    estimatedDuration: '',
    description: '',
    technician: '',
    serviceProvider: '',
    estimatedCost: '',
    tasks: [''],
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
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

  const handleTaskChange = (index: number, value: string) => {
    const newTasks = [...formData.tasks];
    newTasks[index] = value;
    setFormData(prev => ({
      ...prev,
      tasks: newTasks
    }));
  };

  const addTask = () => {
    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, '']
    }));
  };

  const removeTask = (index: number) => {
    if (formData.tasks.length > 1) {
      const newTasks = formData.tasks.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        tasks: newTasks
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.equipmentId) newErrors.equipmentId = 'Seleccione un equipo';
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Seleccione una fecha';
    if (!formData.scheduledTime) newErrors.scheduledTime = 'Seleccione una hora';
    if (!formData.description.trim()) newErrors.description = 'Ingrese una descripción';
    if (!formData.technician.trim()) newErrors.technician = 'Ingrese el técnico responsable';
    if (!formData.estimatedDuration) newErrors.estimatedDuration = 'Ingrese la duración estimada';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    
    const maintenanceData = {
      equipmentId: formData.equipmentId,
      type: formData.type,
      priority: formData.priority,
      scheduledDate: scheduledDateTime.toISOString(),
      estimatedDuration: parseInt(formData.estimatedDuration),
      description: formData.description.trim(),
      technician: formData.technician.trim(),
      serviceProvider: formData.serviceProvider.trim() || undefined,
      cost: formData.estimatedCost ? parseInt(formData.estimatedCost) : 0,
      tasks: formData.tasks
        .filter(task => task.trim())
        .map((task, index) => ({
          id: `task-${index + 1}`,
          description: task.trim(),
          completed: false,
          estimatedDuration: 1
        })),
      notes: formData.notes.trim()
    };

    onSubmit(maintenanceData);
    onClose();
    
    // Reset form
    setFormData({
      equipmentId: '',
      type: MaintenanceType.PREVENTIVE,
      priority: MaintenancePriority.MEDIUM,
      scheduledDate: '',
      scheduledTime: '',
      estimatedDuration: '',
      description: '',
      technician: '',
      serviceProvider: '',
      estimatedCost: '',
      tasks: [''],
      notes: ''
    });
    setErrors({});
  };

  const getTypeIcon = (type: MaintenanceType) => {
    switch (type) {
      case MaintenanceType.PREVENTIVE:
        return <Calendar className="h-4 w-4" />;
      case MaintenanceType.CORRECTIVE:
        return <Wrench className="h-4 w-4" />;
      case MaintenanceType.EMERGENCY:
        return <AlertTriangle className="h-4 w-4" />;
      case MaintenanceType.INSPECTION:
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Wrench className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Nueva Orden de Mantenimiento</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Equipment and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipo <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.equipmentId}
                onChange={(e) => handleInputChange('equipmentId', e.target.value)}
                disabled={equipmentLoading}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.equipmentId ? 'border-red-500' : 'border-gray-300'
                } ${equipmentLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                {equipmentLoading ? (
                  <option value="">Cargando equipos...</option>
                ) : equipmentError ? (
                  <option value="">Error cargando equipos</option>
                ) : (
                  <>
                    <option value="">Seleccionar equipo...</option>
                    {equipment.map((eq: any) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.dominio} - {eq.marca} {eq.modelo}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {errors.equipmentId && (
                <p className="text-red-500 text-sm mt-1">{errors.equipmentId}</p>
              )}
              {equipmentError && (
                <p className="text-red-500 text-sm mt-1">{equipmentError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Mantenimiento
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as MaintenanceType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={MaintenanceType.PREVENTIVE}>Preventivo</option>
                <option value={MaintenanceType.CORRECTIVE}>Correctivo</option>
                <option value={MaintenanceType.EMERGENCY}>Emergencia</option>
                <option value={MaintenanceType.INSPECTION}>Inspección</option>
              </select>
            </div>
          </div>

          {/* Priority and Technician */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value as MaintenancePriority)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={MaintenancePriority.LOW}>Baja</option>
                <option value={MaintenancePriority.MEDIUM}>Media</option>
                <option value={MaintenancePriority.HIGH}>Alta</option>
                <option value={MaintenancePriority.URGENT}>Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Técnico Responsable <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.technician}
                onChange={(e) => handleInputChange('technician', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.technician ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nombre del técnico"
              />
              {errors.technician && (
                <p className="text-red-500 text-sm mt-1">{errors.technician}</p>
              )}
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Programada <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.scheduledDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.scheduledDate && (
                <p className="text-red-500 text-sm mt-1">{errors.scheduledDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.scheduledTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.scheduledTime && (
                <p className="text-red-500 text-sm mt-1">{errors.scheduledTime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración Estimada (horas) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={formData.estimatedDuration}
                onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.estimatedDuration ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="8"
              />
              {errors.estimatedDuration && (
                <p className="text-red-500 text-sm mt-1">{errors.estimatedDuration}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe el trabajo a realizar..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Service Provider and Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proveedor de Servicio (Opcional)
              </label>
              <input
                type="text"
                value={formData.serviceProvider}
                onChange={(e) => handleInputChange('serviceProvider', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Empresa externa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo Estimado (Opcional)
              </label>
              <input
                type="number"
                min="0"
                value={formData.estimatedCost}
                onChange={(e) => handleInputChange('estimatedCost', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Tareas a Realizar
              </label>
              <Button type="button" variant="outline" size="sm" onClick={addTask}>
                Agregar Tarea
              </Button>
            </div>
            <div className="space-y-2">
              {formData.tasks.map((task, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => handleTaskChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Tarea ${index + 1}`}
                  />
                  {formData.tasks.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTask(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cualquier información adicional..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Orden de Mantenimiento
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};