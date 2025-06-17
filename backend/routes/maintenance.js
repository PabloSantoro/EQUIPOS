import express from 'express';
import { body, validationResult } from 'express-validator';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// Validaciones
const maintenanceValidation = [
  body('equipmentId').notEmpty().withMessage('El equipo es requerido'),
  body('workOrderNumber').notEmpty().withMessage('El número de orden es requerido'),
  body('type').isIn(['PREVENTIVO', 'CORRECTIVO', 'PREDICTIVO']).withMessage('Tipo de mantenimiento inválido'),
  body('scheduledDate').isISO8601().withMessage('Fecha programada inválida')
];

// GET /api/maintenance - Obtener todos los mantenimientos
router.get('/', async (req, res) => {
  try {
    const { status, type, equipmentId } = req.query;
    
    let query = `
      SELECT 
        m.*,
        e.dominio as equipo_dominio,
        e.marca as equipo_marca,
        e.modelo as equipo_modelo
      FROM mantenimientos m
      LEFT JOIN equipos e ON m.equipment_id = e.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND m.status = ?';
      params.push(status);
    }
    
    if (type) {
      query += ' AND m.type = ?';
      params.push(type);
    }
    
    if (equipmentId) {
      query += ' AND m.equipment_id = ?';
      params.push(equipmentId);
    }
    
    query += ' ORDER BY m.scheduled_date DESC';
    
    const mantenimientos = await executeQuery(query, params);
    
    const mantenimientosFormatted = mantenimientos.map(mantenimiento => ({
      id: mantenimiento.id,
      equipmentId: mantenimiento.equipment_id,
      workOrderNumber: mantenimiento.work_order_number,
      type: mantenimiento.type,
      priority: mantenimiento.priority,
      status: mantenimiento.status,
      scheduledDate: mantenimiento.scheduled_date,
      completionDate: mantenimiento.completion_date,
      assignedTechnician: mantenimiento.assigned_technician,
      description: mantenimiento.description,
      tasks: mantenimiento.tasks ? JSON.parse(mantenimiento.tasks) : [],
      estimatedHours: parseFloat(mantenimiento.estimated_hours || 0),
      actualHours: parseFloat(mantenimiento.actual_hours || 0),
      cost: parseFloat(mantenimiento.cost || 0),
      partsUsed: mantenimiento.parts_used ? JSON.parse(mantenimiento.parts_used) : [],
      notes: mantenimiento.notes,
      createdBy: mantenimiento.created_by,
      createdAt: mantenimiento.created_at,
      updatedAt: mantenimiento.updated_at,
      equipment: {
        dominio: mantenimiento.equipo_dominio,
        marca: mantenimiento.equipo_marca,
        modelo: mantenimiento.equipo_modelo
      }
    }));
    
    res.json(mantenimientosFormatted);
  } catch (error) {
    console.error('Error obteniendo mantenimientos:', error);
    res.status(500).json({ error: 'Error obteniendo mantenimientos' });
  }
});

// GET /api/maintenance/:id - Obtener un mantenimiento específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mantenimientos = await executeQuery(`
      SELECT 
        m.*,
        e.dominio as equipo_dominio,
        e.marca as equipo_marca,
        e.modelo as equipo_modelo
      FROM mantenimientos m
      LEFT JOIN equipos e ON m.equipment_id = e.id
      WHERE m.id = ?
    `, [id]);
    
    if (mantenimientos.length === 0) {
      return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    }
    
    const mantenimiento = mantenimientos[0];
    const mantenimientoFormatted = {
      id: mantenimiento.id,
      equipmentId: mantenimiento.equipment_id,
      workOrderNumber: mantenimiento.work_order_number,
      type: mantenimiento.type,
      priority: mantenimiento.priority,
      status: mantenimiento.status,
      scheduledDate: mantenimiento.scheduled_date,
      completionDate: mantenimiento.completion_date,
      assignedTechnician: mantenimiento.assigned_technician,
      description: mantenimiento.description,
      tasks: mantenimiento.tasks ? JSON.parse(mantenimiento.tasks) : [],
      estimatedHours: parseFloat(mantenimiento.estimated_hours || 0),
      actualHours: parseFloat(mantenimiento.actual_hours || 0),
      cost: parseFloat(mantenimiento.cost || 0),
      partsUsed: mantenimiento.parts_used ? JSON.parse(mantenimiento.parts_used) : [],
      notes: mantenimiento.notes,
      createdBy: mantenimiento.created_by,
      createdAt: mantenimiento.created_at,
      updatedAt: mantenimiento.updated_at,
      equipment: {
        dominio: mantenimiento.equipo_dominio,
        marca: mantenimiento.equipo_marca,
        modelo: mantenimiento.equipo_modelo
      }
    };
    
    res.json(mantenimientoFormatted);
  } catch (error) {
    console.error('Error obteniendo mantenimiento:', error);
    res.status(500).json({ error: 'Error obteniendo mantenimiento' });
  }
});

// POST /api/maintenance - Crear nuevo mantenimiento
router.post('/', maintenanceValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      equipmentId,
      workOrderNumber,
      type,
      priority = 'MEDIA',
      scheduledDate,
      assignedTechnician,
      description,
      tasks = [],
      estimatedHours,
      cost,
      partsUsed = [],
      notes,
      createdBy = 'sistema'
    } = req.body;
    
    const id = `maint-${Date.now()}`;
    
    await executeQuery(`
      INSERT INTO mantenimientos (
        id, equipment_id, work_order_number, type, priority, scheduled_date,
        assigned_technician, description, tasks, estimated_hours, cost,
        parts_used, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, equipmentId, workOrderNumber, type, priority, scheduledDate,
      assignedTechnician, description, JSON.stringify(tasks), estimatedHours || null,
      cost || null, JSON.stringify(partsUsed), notes, createdBy
    ]);
    
    res.status(201).json({
      message: 'Mantenimiento creado exitosamente',
      id
    });
  } catch (error) {
    console.error('Error creando mantenimiento:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe un mantenimiento con ese número de orden' });
    }
    res.status(500).json({ error: 'Error creando mantenimiento' });
  }
});

// PUT /api/maintenance/:id - Actualizar mantenimiento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      completionDate,
      actualHours,
      cost,
      notes,
      tasks,
      partsUsed
    } = req.body;
    
    const result = await executeQuery(`
      UPDATE mantenimientos SET
        status = COALESCE(?, status),
        completion_date = COALESCE(?, completion_date),
        actual_hours = COALESCE(?, actual_hours),
        cost = COALESCE(?, cost),
        notes = COALESCE(?, notes),
        tasks = COALESCE(?, tasks),
        parts_used = COALESCE(?, parts_used)
      WHERE id = ?
    `, [
      status, completionDate, actualHours, cost, notes,
      tasks ? JSON.stringify(tasks) : null,
      partsUsed ? JSON.stringify(partsUsed) : null,
      id
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    }
    
    res.json({ message: 'Mantenimiento actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando mantenimiento:', error);
    res.status(500).json({ error: 'Error actualizando mantenimiento' });
  }
});

// DELETE /api/maintenance/:id - Eliminar mantenimiento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await executeQuery('DELETE FROM mantenimientos WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    }
    
    res.json({ message: 'Mantenimiento eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando mantenimiento:', error);
    res.status(500).json({ error: 'Error eliminando mantenimiento' });
  }
});

export default router;