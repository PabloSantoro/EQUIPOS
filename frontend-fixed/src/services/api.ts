// Configuración base de la API
const API_BASE_URL = import.meta.env.PROD 
  ? '/api'  // En producción subdominio equipos.gepro.com.ar
  : 'http://localhost:3001/api';  // En desarrollo, usar localhost

// Función helper para hacer requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const requestOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// API para equipos
export const equipmentAPI = {
  // Obtener todos los equipos
  getAll: (filters?: { status?: string; tipo?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.tipo) params.append('tipo', filters.tipo);
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString();
    return apiRequest(`/equipment.php${query ? `?${query}` : ''}`);
  },
  
  // Obtener equipo por ID
  getById: (id: string) => apiRequest(`/equipment.php/${id}`),
  
  // Crear nuevo equipo
  create: (equipment: any) => apiRequest('/equipment.php', {
    method: 'POST',
    body: JSON.stringify(equipment),
  }),
  
  // Actualizar equipo
  update: (id: string, equipment: any) => apiRequest(`/equipment.php/${id}`, {
    method: 'PUT',
    body: JSON.stringify(equipment),
  }),
  
  // Eliminar equipo
  delete: (id: string) => apiRequest(`/equipment.php/${id}`, {
    method: 'DELETE',
  }),
  
  // Obtener equipos disponibles para asignación
  getAvailableForAssignment: () => apiRequest('/equipment.php/available/assignments'),
  
  // Subir imagen de equipo
  uploadImage: (id: string, formData: FormData) => {
    return fetch(`${API_BASE_URL}/equipment.php/${id}/upload-image`, {
      method: 'POST',
      body: formData,
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  },
  
  // Eliminar imagen de equipo
  deleteImage: (id: string) => apiRequest(`/equipment.php/${id}/image`, {
    method: 'DELETE',
  }),
};

// API para proyectos
export const projectsAPI = {
  // Obtener todos los proyectos
  getAll: (filters?: { estado?: string; tipo?: string }) => {
    const params = new URLSearchParams();
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.tipo) params.append('tipo', filters.tipo);
    
    const query = params.toString();
    return apiRequest(`/projects.php${query ? `?${query}` : ''}`);
  },
  
  // Obtener proyecto por ID
  getById: (id: string) => apiRequest(`/projects.php/${id}`),
  
  // Crear nuevo proyecto
  create: (project: any) => apiRequest('/projects.php', {
    method: 'POST',
    body: JSON.stringify(project),
  }),
  
  // Actualizar proyecto
  update: (id: string, project: any) => apiRequest(`/projects.php/${id}`, {
    method: 'PUT',
    body: JSON.stringify(project),
  }),
  
  // Eliminar proyecto
  delete: (id: string) => apiRequest(`/projects.php/${id}`, {
    method: 'DELETE',
  }),
};

// API para centros de costo
export const costCentersAPI = {
  // Obtener todos los centros de costo
  getAll: (filters?: { activo?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.activo !== undefined) params.append('activo', filters.activo.toString());
    
    const query = params.toString();
    return apiRequest(`/cost-centers.php${query ? `?${query}` : ''}`);
  },
  
  // Obtener centro de costo por ID
  getById: (id: string) => apiRequest(`/cost-centers.php/${id}`),
  
  // Crear nuevo centro de costo
  create: (costCenter: any) => apiRequest('/cost-centers.php', {
    method: 'POST',
    body: JSON.stringify(costCenter),
  }),
  
  // Actualizar centro de costo
  update: (id: string, costCenter: any) => apiRequest(`/cost-centers.php/${id}`, {
    method: 'PUT',
    body: JSON.stringify(costCenter),
  }),
  
  // Eliminar centro de costo
  delete: (id: string) => apiRequest(`/cost-centers.php/${id}`, {
    method: 'DELETE',
  }),
};

// API para asignaciones
export const assignmentsAPI = {
  // Obtener todas las asignaciones
  getAll: (filters?: { 
    estado?: string; 
    proyectoId?: string; 
    equipoId?: string; 
    centroCostoId?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.proyectoId) params.append('proyecto_id', filters.proyectoId);
    if (filters?.equipoId) params.append('equipo_id', filters.equipoId);
    if (filters?.centroCostoId) params.append('centro_costo_id', filters.centroCostoId);
    
    const query = params.toString();
    return apiRequest(`/assignments.php${query ? `?${query}` : ''}`);
  },
  
  // Obtener asignación por ID
  getById: (id: string) => apiRequest(`/assignments.php/${id}`),
  
  // Crear nueva asignación
  create: (assignment: any) => apiRequest('/assignments.php', {
    method: 'POST',
    body: JSON.stringify(assignment),
  }),
  
  // Actualizar asignación
  update: (id: string, assignment: any) => apiRequest(`/assignments.php/${id}`, {
    method: 'PUT',
    body: JSON.stringify(assignment),
  }),
  
  // Eliminar asignación
  delete: (id: string) => apiRequest(`/assignments.php/${id}`, {
    method: 'DELETE',
  }),
  
  // Obtener estadísticas del dashboard
  getStats: () => apiRequest('/assignments.php/stats/dashboard'),
};

// API para mantenimientos
export const maintenanceAPI = {
  // Obtener todos los mantenimientos
  getAll: (filters?: { status?: string; type?: string; equipmentId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.equipmentId) params.append('equipment_id', filters.equipmentId);
    
    const query = params.toString();
    return apiRequest(`/maintenance.php${query ? `?${query}` : ''}`);
  },
  
  // Obtener mantenimiento por ID
  getById: (id: string) => apiRequest(`/maintenance.php/${id}`),
  
  // Crear nuevo mantenimiento
  create: (maintenance: any) => apiRequest('/maintenance.php', {
    method: 'POST',
    body: JSON.stringify(maintenance),
  }),
  
  // Actualizar mantenimiento
  update: (id: string, maintenance: any) => apiRequest(`/maintenance.php/${id}`, {
    method: 'PUT',
    body: JSON.stringify(maintenance),
  }),
  
  // Eliminar mantenimiento
  delete: (id: string) => apiRequest(`/maintenance.php/${id}`, {
    method: 'DELETE',
  }),
};

// API para health check
export const healthAPI = {
  check: () => apiRequest('/health.php'),
};

// Exportar API completa
export const api = {
  equipment: equipmentAPI,
  projects: projectsAPI,
  costCenters: costCentersAPI,
  assignments: assignmentsAPI,
  maintenance: maintenanceAPI,
  health: healthAPI,
};