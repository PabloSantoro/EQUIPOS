import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Package, Clock, DollarSign } from 'lucide-react';
import { Assignment, Project, AssignmentStatus } from '../../types/assignments';
import { Equipment } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface AssignmentCalendarProps {
  assignments: Assignment[];
  equipment: Equipment[];
  projects: Project[];
  onViewAssignment?: (assignment: Assignment) => void;
}

export const AssignmentCalendar: React.FC<AssignmentCalendarProps> = ({
  assignments,
  equipment,
  projects,
  onViewAssignment
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getMonthData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    while (currentDay <= lastDay || days.length < 35) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const getAssignmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    return assignments.filter(assignment => {
      const startDate = new Date(assignment.fechaInicio);
      const endDate = assignment.fechaFinPrevista ? 
        new Date(assignment.fechaFinPrevista) : 
        assignment.fechaFin ? new Date(assignment.fechaFin) : null;
      
      const checkDate = new Date(dateStr);
      
      if (endDate) {
        return checkDate >= startDate && checkDate <= endDate;
      } else {
        return checkDate >= startDate;
      }
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEquipment = (equipoId: string) => 
    equipment.find(e => e.id === equipoId);
  
  const getProject = (proyectoId: string) => 
    projects.find(p => p.id === proyectoId);

  const getStatusColor = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.ACTIVA:
        return 'bg-green-100 border-green-500 text-green-800';
      case AssignmentStatus.FINALIZADA:
        return 'bg-blue-100 border-blue-500 text-blue-800';
      case AssignmentStatus.SUSPENDIDA:
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case AssignmentStatus.CANCELADA:
        return 'bg-red-100 border-red-500 text-red-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const monthData = getMonthData();
  const today = new Date();
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && 
                         currentDate.getFullYear() === today.getFullYear();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card padding="none">
      {/* Header */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Calendario de Asignaciones
            </h3>
            <div className="text-2xl font-bold text-gray-900">
              {currentDate.toLocaleDateString('es-ES', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              disabled={isCurrentMonth}
            >
              Hoy
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center space-x-4 mt-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Activa</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Finalizada</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Suspendida</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Cancelada</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {monthData.map((date, index) => {
            const dayAssignments = getAssignmentsForDate(date);
            const isToday = date.toDateString() === today.toDateString();
            const isCurrentMonthDay = date.getMonth() === currentDate.getMonth();
            
            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border border-gray-200 ${
                  isCurrentMonthDay ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
              >
                {/* Day Number */}
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'
                } ${isToday ? 'text-blue-600 font-bold' : ''}`}>
                  {date.getDate()}
                </div>

                {/* Assignments */}
                <div className="space-y-1">
                  {dayAssignments.slice(0, 3).map((assignment, idx) => {
                    const equipmentItem = getEquipment(assignment.equipoId);
                    const project = getProject(assignment.proyectoId);
                    
                    return (
                      <div
                        key={idx}
                        onClick={() => onViewAssignment?.(assignment)}
                        className={`p-1 rounded text-xs cursor-pointer border-l-2 ${getStatusColor(assignment.estado)} hover:opacity-80 transition-opacity`}
                        title={`${equipmentItem?.dominio || 'N/A'} - ${project?.nombre || 'N/A'}`}
                      >
                        <div className="flex items-center space-x-1">
                          <Package className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate font-medium">
                            {equipmentItem?.dominio || 'N/A'}
                          </span>
                        </div>
                        <div className="truncate text-xs opacity-75">
                          {project?.nombre || 'N/A'}
                        </div>
                        {assignment.costoTotal && (
                          <div className="flex items-center space-x-1 text-xs">
                            <DollarSign className="h-2 w-2" />
                            <span>{formatCurrency(assignment.costoTotal).replace('$', '').replace(',', 'k')}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {dayAssignments.length > 3 && (
                    <div className="text-xs text-gray-500 px-1">
                      +{dayAssignments.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{assignments.length}</div>
              <div className="text-gray-600">Total Asignaciones</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {assignments.filter(a => a.estado === AssignmentStatus.ACTIVA).length}
              </div>
              <div className="text-gray-600">Activas</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {assignments.reduce((sum, a) => sum + (a.horasEstimadas || 0), 0)}h
              </div>
              <div className="text-gray-600">Horas Estimadas</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {formatCurrency(assignments.reduce((sum, a) => sum + (a.costoTotal || 0), 0))}
              </div>
              <div className="text-gray-600">Costo Total</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};