import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  FileText, 
  Plus,
  Eye,
  Package,
  Wrench,
  Building,
  Users
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAPI } from '../../hooks/useAPI';
import { api } from '../../services/api';

export const ReportsModule: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [generatedReports, setGeneratedReports] = useState<Array<{
    id: string;
    name: string;
    date: string;
    type: string;
    fileName: string;
  }>>([]);

  // Fetch real data
  const { data: equipment = [], loading: equipmentLoading, error: equipmentError } = useAPI(() => api.equipment.getAll());
  const { data: projects = [], loading: projectsLoading, error: projectsError } = useAPI(() => api.projects.getAll());
  const { data: costCenters = [], loading: costCentersLoading, error: costCentersError } = useAPI(() => api.costCenters.getAll());
  const { data: assignments = [], loading: assignmentsLoading, error: assignmentsError } = useAPI(() => api.assignments.getAll());

  // Check if any data is still loading
  const isDataLoading = equipmentLoading || projectsLoading || costCentersLoading || assignmentsLoading;
  const hasDataError = equipmentError || projectsError || costCentersError || assignmentsError;

  const reportTypes = [
    {
      id: 'fleet-overview',
      name: 'Resumen de Flota',
      description: 'Estado general de todos los equipos y vehículos',
      icon: Package,
      estimatedRows: (equipment || []).length
    },
    {
      id: 'equipment-status',
      name: 'Estado de Equipos',
      description: 'Distribución detallada de equipos por estado',
      icon: BarChart3,
      estimatedRows: (equipment || []).length
    },
    {
      id: 'projects-report',
      name: 'Reporte de Proyectos',
      description: 'Lista completa de proyectos con detalles',
      icon: Building,
      estimatedRows: (projects || []).length
    },
    {
      id: 'assignments-report',
      name: 'Asignaciones de Equipos',
      description: 'Equipos asignados a proyectos y centros de costo',
      icon: Calendar,
      estimatedRows: (assignments || []).length
    },
    {
      id: 'cost-centers-report',
      name: 'Centros de Costo',
      description: 'Información detallada de centros de costo',
      icon: Users,
      estimatedRows: (costCenters || []).length
    },
    {
      id: 'maintenance-report',
      name: 'Programa de Mantenimiento',
      description: 'Equipos que requieren mantenimiento',
      icon: Wrench,
      estimatedRows: (equipment || []).filter(e => e.status === 'MANTENIMIENTO').length
    }
  ];

  const generateFleetOverviewReport = () => {
    const headers = [
      'ID', 'Dominio', 'Marca', 'Modelo', 'Año', 'Tipo Vehículo',
      'Estado', 'Uso', 'Depósito', 'GPS Instalado', 'Seguro Compañía',
      'Póliza Vto', 'VTV Vto', 'Observaciones'
    ];
    
    const csvData = [
      headers.join(','),
      ...(equipment || []).map(eq => [
        `"${eq.id}"`,
        `"${eq.dominio}"`,
        `"${eq.marca}"`,
        `"${eq.modelo}"`,
        eq.anoModelo || '',
        `"${eq.tipoVehiculo}"`,
        `"${eq.status}"`,
        `"${eq.uso}"`,
        `"${eq.deposito || ''}"`,
        `"${eq.gpsInstalado || ''}"`,
        `"${eq.seguroCompania || ''}"`,
        `"${eq.polizaVto || ''}"`,
        `"${eq.vtvVto || ''}"`,
        `"${eq.observaciones || ''}"`
      ].join(','))
    ].join('\n');

    return csvData;
  };

  const generateEquipmentStatusReport = () => {
    const statusCount = (equipment || []).reduce((acc, eq) => {
      acc[eq.status] = (acc[eq.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const headers = ['Estado', 'Cantidad', 'Porcentaje'];
    const total = (equipment || []).length;
    
    const csvData = [
      headers.join(','),
      ...Object.entries(statusCount).map(([status, count]) => [
        `"${status}"`,
        count,
        `"${((count / total) * 100).toFixed(1)}%"`
      ].join(','))
    ].join('\n');

    return csvData;
  };

  const generateProjectsReport = () => {
    const headers = [
      'ID', 'Nombre', 'Tipo', 'Descripción', 'Responsable', 'Cliente',
      'Estado', 'Fecha Inicio', 'Fecha Fin Prevista', 'Presupuesto',
      'Costo Hora', 'Porcentaje Costo'
    ];
    
    const csvData = [
      headers.join(','),
      ...(projects || []).map(proj => [
        `"${proj.id}"`,
        `"${proj.nombre}"`,
        `"${proj.tipo}"`,
        `"${proj.descripcion || ''}"`,
        `"${proj.responsable}"`,
        `"${proj.cliente || ''}"`,
        `"${proj.estado}"`,
        `"${proj.fechaInicio || ''}"`,
        `"${proj.fechaFinPrevista || ''}"`,
        proj.presupuesto || 0,
        proj.costoHora || 0,
        proj.porcentajeCosto || 0
      ].join(','))
    ].join('\n');

    return csvData;
  };

  const generateAssignmentsReport = () => {
    const headers = [
      'ID', 'Equipo ID', 'Proyecto ID', 'Centro Costo ID', 'Fecha Inicio',
      'Fecha Fin Prevista', 'Fecha Fin Real', 'Estado', 'Horas Estimadas',
      'Horas Reales', 'Costo Total', 'Observaciones'
    ];
    
    const csvData = [
      headers.join(','),
      ...(assignments || []).map(assign => [
        `"${assign.id}"`,
        `"${assign.equipoId}"`,
        `"${assign.proyectoId}"`,
        `"${assign.centroCostoId}"`,
        `"${assign.fechaInicio || ''}"`,
        `"${assign.fechaFinPrevista || ''}"`,
        `"${assign.fechaFin || ''}"`,
        `"${assign.estado}"`,
        assign.horasEstimadas || 0,
        assign.horasReales || 0,
        assign.costoTotal || 0,
        `"${assign.observaciones || ''}"`
      ].join(','))
    ].join('\n');

    return csvData;
  };

  const generateCostCentersReport = () => {
    const headers = [
      'ID', 'Nombre', 'Código', 'Descripción', 'Responsable',
      'Presupuesto', 'Activo', 'Fecha Creación'
    ];
    
    const csvData = [
      headers.join(','),
      ...(costCenters || []).map(cc => [
        `"${cc.id}"`,
        `"${cc.nombre}"`,
        `"${cc.codigo}"`,
        `"${cc.descripcion || ''}"`,
        `"${cc.responsable}"`,
        cc.presupuesto || 0,
        cc.activo ? 'Sí' : 'No',
        `"${new Date(cc.createdAt).toLocaleDateString('es-ES')}"`
      ].join(','))
    ].join('\n');

    return csvData;
  };

  const generateMaintenanceReport = () => {
    const maintenanceEquipment = (equipment || []).filter(e => 
      e.status === 'MANTENIMIENTO' || 
      e.status === 'FUERA_SERVICIO' ||
      (e.polizaVto && isDateExpired(e.polizaVto)) ||
      (e.vtvVto && isDateExpired(e.vtvVto))
    );

    const headers = [
      'ID', 'Dominio', 'Marca', 'Modelo', 'Estado', 'Motivo Mantenimiento',
      'Póliza Vto', 'VTV Vto', 'Última Revisión', 'Próxima Revisión'
    ];
    
    const csvData = [
      headers.join(','),
      ...maintenanceEquipment.map(eq => [
        `"${eq.id}"`,
        `"${eq.dominio}"`,
        `"${eq.marca}"`,
        `"${eq.modelo}"`,
        `"${eq.status}"`,
        `"${getMaintenanceReason(eq)}"`,
        `"${eq.polizaVto || ''}"`,
        `"${eq.vtvVto || ''}"`,
        `"${eq.fechaUltimaRevision || ''}"`,
        `"${eq.fechaProximaRevision || ''}"`
      ].join(','))
    ].join('\n');

    return csvData;
  };

  const isDateExpired = (dateString: string): boolean => {
    if (!dateString) return false;
    const [day, month, year] = dateString.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date < new Date();
  };

  const getMaintenanceReason = (equipment: any): string => {
    const reasons = [];
    if (equipment.status === 'MANTENIMIENTO') reasons.push('En mantenimiento');
    if (equipment.status === 'FUERA_SERVICIO') reasons.push('Fuera de servicio');
    if (equipment.polizaVto && isDateExpired(equipment.polizaVto)) reasons.push('Póliza vencida');
    if (equipment.vtvVto && isDateExpired(equipment.vtvVto)) reasons.push('VTV vencida');
    return reasons.join(', ') || 'N/A';
  };

  const downloadCSV = (csvData: string, fileName: string) => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateReport = async (reportType: string) => {
    setIsGenerating(reportType);
    
    try {
      let csvData = '';
      let fileName = '';
      let reportName = '';

      switch (reportType) {
        case 'fleet-overview':
          csvData = generateFleetOverviewReport();
          fileName = `resumen_flota_${new Date().toISOString().split('T')[0]}.csv`;
          reportName = 'Resumen de Flota';
          break;
        case 'equipment-status':
          csvData = generateEquipmentStatusReport();
          fileName = `estado_equipos_${new Date().toISOString().split('T')[0]}.csv`;
          reportName = 'Estado de Equipos';
          break;
        case 'projects-report':
          csvData = generateProjectsReport();
          fileName = `reporte_proyectos_${new Date().toISOString().split('T')[0]}.csv`;
          reportName = 'Reporte de Proyectos';
          break;
        case 'assignments-report':
          csvData = generateAssignmentsReport();
          fileName = `asignaciones_equipos_${new Date().toISOString().split('T')[0]}.csv`;
          reportName = 'Asignaciones de Equipos';
          break;
        case 'cost-centers-report':
          csvData = generateCostCentersReport();
          fileName = `centros_costo_${new Date().toISOString().split('T')[0]}.csv`;
          reportName = 'Centros de Costo';
          break;
        case 'maintenance-report':
          csvData = generateMaintenanceReport();
          fileName = `programa_mantenimiento_${new Date().toISOString().split('T')[0]}.csv`;
          reportName = 'Programa de Mantenimiento';
          break;
        default:
          throw new Error('Tipo de reporte no válido');
      }

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Download the CSV
      downloadCSV(csvData, fileName);

      // Add to generated reports list
      const newReport = {
        id: Date.now().toString(),
        name: reportName,
        date: new Date().toLocaleDateString('es-ES'),
        type: reportType,
        fileName: fileName
      };
      
      setGeneratedReports(prev => [newReport, ...prev]);
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error al generar el reporte');
    } finally {
      setIsGenerating(null);
    }
  };

  // Show loading state
  if (isDataLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Cargando datos para reportes...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (hasDataError) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
              <p className="text-gray-600 mb-4">No se pudieron cargar los datos necesarios para generar reportes.</p>
              <Button onClick={() => window.location.reload()}>Reintentar</Button>
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
            <BarChart3 className="h-6 w-6 mr-3 text-blue-600" />
            Reportes y Análisis
          </h2>
          <p className="text-gray-600 mt-1">
            Genera reportes detallados sobre equipos y operaciones
          </p>
        </div>
        
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Reporte
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{reportTypes.length}</div>
              <div className="text-sm text-gray-600">Plantillas</div>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{generatedReports.length}</div>
              <div className="text-sm text-gray-600">Generados (7 días)</div>
            </div>
            <BarChart3 className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">{(equipment || []).length}</div>
              <div className="text-sm text-gray-600">Equipos Totales</div>
            </div>
            <Package className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">{(equipment || []).length + (projects || []).length + (costCenters || []).length + (assignments || []).length}</div>
              <div className="text-sm text-gray-600">Total Registros</div>
            </div>
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Report Templates */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Plantillas de Reportes</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900">{report.name}</h4>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mb-4">
                  ~{report.estimatedRows} registros
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    disabled={isGenerating !== null}
                    onClick={() => handleGenerateReport(report.id)}
                  >
                    {isGenerating === report.id ? 'Generando...' : 'Generar'}
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Reports */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reportes Generados</h3>
        
        {generatedReports.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay reportes generados
            </h3>
            <p className="text-gray-600">
              Genera tu primer reporte usando las plantillas de arriba.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {generatedReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{report.name}</p>
                    <p className="text-sm text-gray-600">{report.date}</p>
                    <p className="text-xs text-gray-500">{report.fileName}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="success">Completado</Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Re-generate and download the same report
                      handleGenerateReport(report.type);
                    }}
                    title="Descargar nuevamente"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};