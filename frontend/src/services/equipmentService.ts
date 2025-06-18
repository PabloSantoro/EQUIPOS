import { API_ENDPOINTS } from '../config/api';
import { Equipment } from '../types';

export const equipmentService = {
  async getAll(filters?: any): Promise<Equipment[]> {
    const url = new URL(API_ENDPOINTS.equipment.list);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Error fetching equipment');
    return response.json();
  },

  async getById(id: string): Promise<Equipment> {
    const response = await fetch(API_ENDPOINTS.equipment.byId(id));
    if (!response.ok) throw new Error('Equipment not found');
    return response.json();
  },

  async create(equipment: Omit<Equipment, 'id'>): Promise<{ id: string }> {
    const response = await fetch(API_ENDPOINTS.equipment.list, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(equipment)
    });
    if (!response.ok) throw new Error('Error creating equipment');
    return response.json();
  },

  async update(id: string, equipment: Partial<Equipment>): Promise<void> {
    const response = await fetch(API_ENDPOINTS.equipment.byId(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(equipment)
    });
    if (!response.ok) throw new Error('Error updating equipment');
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.equipment.byId(id), {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error deleting equipment');
  },

  async getAvailable(): Promise<Equipment[]> {
    const response = await fetch(API_ENDPOINTS.equipment.available);
    if (!response.ok) throw new Error('Error fetching available equipment');
    return response.json();
  },

  async uploadImage(id: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(API_ENDPOINTS.equipment.uploadImage(id), {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Error uploading image');
    return response.json();
  }
};
