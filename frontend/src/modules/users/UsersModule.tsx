import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Shield, 
  Mail,
  Phone,
  Edit,
  UserCheck,
  UserX
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone?: string;
  active: boolean;
}

export const UsersModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Carlos López',
      email: 'carlos.lopez@empresa.com',
      role: 'Administrador',
      department: 'Administración',
      phone: '+54 11 4567-8901',
      active: true
    },
    {
      id: '2',
      name: 'Ana Martínez',
      email: 'ana.martinez@empresa.com',
      role: 'Gerente',
      department: 'Mantenimiento',
      phone: '+54 11 4567-8902',
      active: true
    },
    {
      id: '3',
      name: 'Miguel Santos',
      email: 'miguel.santos@empresa.com',
      role: 'Técnico',
      department: 'Taller',
      phone: '+54 11 4567-8903',
      active: true
    },
    {
      id: '4',
      name: 'Laura García',
      email: 'laura.garcia@empresa.com',
      role: 'Operador',
      department: 'Operaciones',
      phone: '+54 11 4567-8904',
      active: false
    }
  ];

  const filteredUsers = mockUsers.filter(user => 
    searchTerm === '' || 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userStats = {
    total: mockUsers.length,
    active: mockUsers.filter(u => u.active).length,
    inactive: mockUsers.filter(u => !u.active).length,
    admins: mockUsers.filter(u => u.role === 'Administrador').length
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Administrador':
        return <Badge variant="danger">Administrador</Badge>;
      case 'Gerente':
        return <Badge variant="warning">Gerente</Badge>;
      case 'Técnico':
        return <Badge variant="info">Técnico</Badge>;
      case 'Operador':
        return <Badge variant="success">Operador</Badge>;
      default:
        return <Badge variant="default">{role}</Badge>;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-6 w-6 mr-3 text-blue-600" />
            Gestión de Usuarios
          </h2>
          <p className="text-gray-600 mt-1">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{userStats.total}</div>
              <div className="text-sm text-gray-600">Total Usuarios</div>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{userStats.active}</div>
              <div className="text-sm text-gray-600">Activos</div>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{userStats.admins}</div>
              <div className="text-sm text-gray-600">Administradores</div>
            </div>
            <Shield className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-600">{userStats.inactive}</div>
              <div className="text-sm text-gray-600">Inactivos</div>
            </div>
            <UserX className="h-8 w-8 text-gray-600" />
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Results Info */}
      <div className="mb-4 text-sm text-gray-600">
        Mostrando {filteredUsers.length} de {mockUsers.length} usuarios
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white ${
                  user.active ? 'bg-blue-500' : 'bg-gray-400'
                }`}>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{user.name}</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              {user.active ? (
                <Badge variant="success" size="sm">Activo</Badge>
              ) : (
                <Badge variant="default" size="sm">Inactivo</Badge>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rol:</span>
                {getRoleBadge(user.role)}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Departamento:</span>
                <span className="font-medium">{user.department}</span>
              </div>
              {user.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Edit className="h-3 w-3 mr-2" />
                Editar
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" className={user.active ? 'text-red-600' : 'text-green-600'}>
                {user.active ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron usuarios
            </h3>
            <p className="text-gray-600">
              No hay usuarios que coincidan con la búsqueda.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};