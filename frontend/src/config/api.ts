// Configuración de API para PHP backend en Hostinger
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://equipos.gepro.com.ar/api'
  : 'http://localhost/proyecto-equipos/backend-php/api';

export const API_ENDPOINTS = {
  // Equipment endpoints
  equipment: {
    list: `${API_BASE_URL}/equipment.php`,
    byId: (id: string) => `${API_BASE_URL}/equipment.php/${id}`,
    available: `${API_BASE_URL}/equipment.php/available/assignments`,
    uploadImage: (id: string) => `${API_BASE_URL}/equipment.php/${id}/upload-image`,
    getImage: (id: string) => `${API_BASE_URL}/equipment.php/${id}/image`
  },
  
  // Projects endpoints
  projects: {
    list: `${API_BASE_URL}/projects.php`,
    byId: (id: string) => `${API_BASE_URL}/projects.php/${id}`
  },
  
  // Cost Centers endpoints
  costCenters: {
    list: `${API_BASE_URL}/cost-centers.php`,
    byId: (id: string) => `${API_BASE_URL}/cost-centers.php/${id}`
  },
  
  // Assignments endpoints
  assignments: {
    list: `${API_BASE_URL}/assignments.php`,
    byId: (id: string) => `${API_BASE_URL}/assignments.php/${id}`,
    dashboardStats: `${API_BASE_URL}/assignments.php/stats/dashboard`
  },
  
  // Maintenance endpoints
  maintenance: {
    list: `${API_BASE_URL}/maintenance.php`,
    byId: (id: string) => `${API_BASE_URL}/maintenance.php/${id}`
  },
  
  // System endpoints
  health: `${API_BASE_URL}/health.php`
};

export default API_BASE_URL;