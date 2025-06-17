// Configuración base de la API
const API_BASE_URL = 'http://localhost:3001/api';

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
    return apiRequest(`/equipment${query ? `?${query}` : ''}`);
  },
  
  // Obtener equipo por ID
  getById: (id: string) => apiRequest(`/equipment/${id}`),
  
  // Crear nuevo equipo
  create: (equipment: any) => apiRequest('/equipment', {
    method: 'POST',
    body: JSON.stringify(equipment),
  }),
  
  // Actualizar equipo
  update: (id: string, equipment: any) => apiRequest(`/equipment/${id}`, {
    method: 'PUT',
    body: JSON.stringify(equipment),
  }),
  
  // Eliminar equipo
  delete: (id: string) => apiRequest(`/equipment/${id}`, {
    method: 'DELETE',
  }),
  
  // Obtener equipos disponibles para asignación
  getAvailableForAssignment: () => apiRequest('/equipment/available/assignments'),
  
  // Subir imagen de equipo
  uploadImage: (id: string, formData: FormData) => {
    return fetch(`${API_BASE_URL}/equipment/${id}/upload-image`, {
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
  deleteImage: (id: string) => apiRequest(`/equipment/${id}/image`, {
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
    return apiRequest(`/projects${query ? `?${query}` : ''}`);
  },
  
  // Obtener proyecto por ID
  getById: (id: string) => apiRequest(`/projects/${id}`),
  
  // Crear nuevo proyecto
  create: (project: any) => apiRequest('/projects', {
    method: 'POST',
    body: JSON.stringify(project),
  }),
  
  // Actualizar proyecto
  update: (id: string, project: any) => apiRequest(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(project),
  }),
  
  // Eliminar proyecto
  delete: (id: string) => apiRequest(`/projects/${id}`, {
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
    return apiRequest(`/cost-centers${query ? `?${query}` : ''}`);
  },
  
  // Obtener centro de costo por ID
  getById: (id: string) => apiRequest(`/cost-centers/${id}`),
  
  // Crear nuevo centro de costo
  create: (costCenter: any) => apiRequest('/cost-centers', {
    method: 'POST',
    body: JSON.stringify(costCenter),
  }),
  
  // Actualizar centro de costo
  update: (id: string, costCenter: any) => apiRequest(`/cost-centers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(costCenter),
  }),
  
  // Eliminar centro de costo
  delete: (id: string) => apiRequest(`/cost-centers/${id}`, {
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
    if (filters?.proyectoId) params.append('proyectoId', filters.proyectoId);
    if (filters?.equipoId) params.append('equipoId', filters.equipoId);
    if (filters?.centroCostoId) params.append('centroCostoId', filters.centroCostoId);
    
    const query = params.toString();
    return apiRequest(`/assignments${query ? `?${query}` : ''}`);
  },
  
  // Obtener asignación por ID
  getById: (id: string) => apiRequest(`/assignments/${id}`),
  
  // Crear nueva asignación
  create: (assignment: any) => apiRequest('/assignments', {
    method: 'POST',
    body: JSON.stringify(assignment),
  }),
  
  // Actualizar asignación
  update: (id: string, assignment: any) => apiRequest(`/assignments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(assignment),
  }),
  
  // Eliminar asignación
  delete: (id: string) => apiRequest(`/assignments/${id}`, {
    method: 'DELETE',
  }),
  
  // Obtener estadísticas del dashboard
  getStats: () => apiRequest('/assignments/stats/dashboard'),
};

// API para mantenimientos
export const maintenanceAPI = {
  // Obtener todos los mantenimientos
  getAll: (filters?: { status?: string; type?: string; equipmentId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.equipmentId) params.append('equipmentId', filters.equipmentId);
    
    const query = params.toString();
    return apiRequest(`/maintenance${query ? `?${query}` : ''}`);
  },
  
  // Obtener mantenimiento por ID
  getById: (id: string) => apiRequest(`/maintenance/${id}`),
  
  // Crear nuevo mantenimiento
  create: (maintenance: any) => apiRequest('/maintenance', {
    method: 'POST',
    body: JSON.stringify(maintenance),
  }),
  
  // Actualizar mantenimiento
  update: (id: string, maintenance: any) => apiRequest(`/maintenance/${id}`, {
    method: 'PUT',
    body: JSON.stringify(maintenance),
  }),
  
  // Eliminar mantenimiento
  delete: (id: string) => apiRequest(`/maintenance/${id}`, {
    method: 'DELETE',
  }),
};

// API para health check
export const healthAPI = {
  check: () => apiRequest('/health'),
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