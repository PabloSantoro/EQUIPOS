import React from 'react';
import { Eye, Clock, Calendar, Package, Building, DollarSign } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Assignment, AssignmentStatus, Project, CostCenter } from '../../types/assignments';
import { Equipment } from '../../types';

interface AssignmentListProps {
  assignments: Assignment[];
  equipment: Equipment[];
  projects: Project[];
  costCenters: CostCenter[];
  onViewAssignment: (assignment: Assignment) => void;
}

export const AssignmentList: React.FC<AssignmentListProps> = ({
  assignments,
  equipment,
  projects,
  costCenters,
  onViewAssignment
}) => {
  const getEquipment = (equipoId: string) => 
    equipment.find(e => e.id === equipoId);
  
  const getProject = (proyectoId: string) => 
    projects.find(p => p.id === proyectoId);
  
  const getCostCenter = (centroCostoId: string) => 
    costCenters.find(cc => cc.id === centroCostoId);

  const getStatusBadge = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.ACTIVA:
        return <Badge variant="success">Activa</Badge>;
      case AssignmentStatus.FINALIZADA:
        return <Badge variant="default">Finalizada</Badge>;
      case AssignmentStatus.SUSPENDIDA:
        return <Badge variant="warning">Suspendida</Badge>;
      case AssignmentStatus.CANCELADA:
        return <Badge variant="danger">Cancelada</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getProjectTypeBadge = (project: Project) => {
    return project.tipo === 'INTERNO' ? 
      <Badge variant="info" size="sm">Interno</Badge> : 
      <Badge variant="warning" size="sm">Externo</Badge>;
  };

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

  const calculateProgress = (assignment: Assignment) => {
    if (!assignment.horasEstimadas) return 0;
    const horasUsadas = assignment.horasReales || 0;
    return Math.min((horasUsadas / assignment.horasEstimadas) * 100, 100);
  };

  const getDaysRemaining = (assignment: Assignment) => {
    if (!assignment.fechaFinPrevista || assignment.estado !== AssignmentStatus.ACTIVA) {
      return null;
    }
    
    const today = new Date();
    const endDate = new Date(assignment.fechaFinPrevista);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return (
    <Card padding="none">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proyecto
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Centro de Costo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Período
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progreso
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Costo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.map((assignment) => {
              const equipmentItem = getEquipment(assignment.equipoId);
              const project = getProject(assignment.proyectoId);
              const costCenter = getCostCenter(assignment.centroCostoId);
              const progress = calculateProgress(assignment);
              const daysRemaining = getDaysRemaining(assignment);

              return (
                <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                  {/* Equipo */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {equipmentItem?.dominio || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {equipmentItem?.marca} {equipmentItem?.modelo}
                        </div>
                        <div className="text-xs text-gray-400">
                          {equipmentItem?.tipoVehiculo}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Proyecto */}
                  <td className="px-4 py-4">
                    <div className="max-w-xs">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {project?.nombre || 'N/A'}
                        </span>
                        {project && getProjectTypeBadge(project)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Responsable: {project?.responsable || 'N/A'}
                      </div>
                      {project?.cliente && (
                        <div className="text-xs text-gray-500">
                          Cliente: {project.cliente}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Centro de Costo */}
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {costCenter?.nombre || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {costCenter?.codigo || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Período */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div>{formatDate(assignment.fechaInicio)}</div>
                        {assignment.fechaFinPrevista && (
                          <div className="text-xs text-gray-500">
                            hasta {formatDate(assignment.fechaFinPrevista)}
                          </div>
                        )}
                        {daysRemaining !== null && (
                          <div className={`text-xs ${
                            daysRemaining < 7 ? 'text-red-600 font-medium' : 
                            daysRemaining < 30 ? 'text-yellow-600' : 'text-gray-500'
                          }`}>
                            {daysRemaining > 0 ? `${daysRemaining} días restantes` : 'Vencida'}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Progreso */}
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-900">
                            {assignment.horasReales || 0}h / {assignment.horasEstimadas || 0}h
                          </span>
                          <span className="text-gray-500">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              progress >= 100 ? 'bg-green-600' : 
                              progress >= 80 ? 'bg-yellow-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Costo */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(assignment.costoTotal || 0)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {assignment.retribucionTipo === 'PORCENTAJE' ? 
                            `${assignment.retribucionValor}%` : 
                            `$${assignment.retribucionValor}/h`
                          }
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {getStatusBadge(assignment.estado)}
                      {assignment.validacionMantenimiento && (
                        <Badge variant="success" size="sm">
                          ✓ Validado
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewAssignment(assignment)}
                      title="Ver detalles"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay asignaciones
          </h3>
          <p className="text-gray-600">
            No se encontraron asignaciones que coincidan con los filtros aplicados.
          </p>
        </div>
      )}
    </Card>
  );
};