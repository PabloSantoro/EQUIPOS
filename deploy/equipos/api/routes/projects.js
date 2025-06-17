import express from 'express';
import { body, validationResult } from 'express-validator';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// Validaciones
const projectValidation = [
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('tipo').isIn(['INTERNO', 'EXTERNO']).withMessage('Tipo de proyecto inválido'),
  body('responsable').notEmpty().withMessage('El responsable es requerido')
];

// GET /api/projects - Obtener todos los proyectos
router.get('/', async (req, res) => {
  try {
    const { estado, tipo } = req.query;
    
    let query = 'SELECT * FROM proyectos WHERE 1=1';
    const params = [];
    
    if (estado) {
      query += ' AND estado = ?';
      params.push(estado);
    }
    
    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }
    
    query += ' ORDER BY nombre ASC';
    
    const proyectos = await executeQuery(query, params);
    
    const proyectosFormatted = proyectos.map(proyecto => ({
      id: proyecto.id,
      nombre: proyecto.nombre,
      tipo: proyecto.tipo,
      descripcion: proyecto.descripcion,
      costoHora: parseFloat(proyecto.costo_hora || 0),
      porcentajeCosto: parseFloat(proyecto.porcentaje_costo || 0),
      fechaInicio: proyecto.fecha_inicio,
      fechaFinPrevista: proyecto.fecha_fin_prevista,
      responsable: proyecto.responsable,
      cliente: proyecto.cliente,
      estado: proyecto.estado,
      presupuesto: parseFloat(proyecto.presupuesto || 0),
      createdAt: proyecto.created_at,
      updatedAt: proyecto.updated_at
    }));
    
    res.json(proyectosFormatted);
  } catch (error) {
    console.error('Error obteniendo proyectos:', error);
    res.status(500).json({ error: 'Error obteniendo proyectos' });
  }
});

// GET /api/projects/:id - Obtener un proyecto específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const proyectos = await executeQuery('SELECT * FROM proyectos WHERE id = ?', [id]);
    
    if (proyectos.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    const proyecto = proyectos[0];
    const proyectoFormatted = {
      id: proyecto.id,
      nombre: proyecto.nombre,
      tipo: proyecto.tipo,
      descripcion: proyecto.descripcion,
      costoHora: parseFloat(proyecto.costo_hora || 0),
      porcentajeCosto: parseFloat(proyecto.porcentaje_costo || 0),
      fechaInicio: proyecto.fecha_inicio,
      fechaFinPrevista: proyecto.fecha_fin_prevista,
      responsable: proyecto.responsable,
      cliente: proyecto.cliente,
      estado: proyecto.estado,
      presupuesto: parseFloat(proyecto.presupuesto || 0),
      createdAt: proyecto.created_at,
      updatedAt: proyecto.updated_at
    };
    
    res.json(proyectoFormatted);
  } catch (error) {
    console.error('Error obteniendo proyecto:', error);
    res.status(500).json({ error: 'Error obteniendo proyecto' });
  }
});

// POST /api/projects - Crear nuevo proyecto
router.post('/', projectValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      nombre,
      tipo,
      descripcion,
      costoHora,
      porcentajeCosto,
      fechaInicio,
      fechaFinPrevista,
      responsable,
      cliente,
      estado = 'ACTIVO',
      presupuesto
    } = req.body;
    
    const id = `proj-${Date.now()}`;
    
    await executeQuery(`
      INSERT INTO proyectos (
        id, nombre, tipo, descripcion, costo_hora, porcentaje_costo,
        fecha_inicio, fecha_fin_prevista, responsable, cliente, estado, presupuesto
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, nombre, tipo, descripcion, costoHora || null, porcentajeCosto || null,
      fechaInicio || null, fechaFinPrevista || null, responsable, cliente || null,
      estado, presupuesto || null
    ]);
    
    res.status(201).json({
      message: 'Proyecto creado exitosamente',
      id
    });
  } catch (error) {
    console.error('Error creando proyecto:', error);
    res.status(500).json({ error: 'Error creando proyecto' });
  }
});

// PUT /api/projects/:id - Actualizar proyecto
router.put('/:id', projectValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const {
      nombre,
      tipo,
      descripcion,
      costoHora,
      porcentajeCosto,
      fechaInicio,
      fechaFinPrevista,
      responsable,
      cliente,
      estado,
      presupuesto
    } = req.body;
    
    const result = await executeQuery(`
      UPDATE proyectos SET
        nombre = ?, tipo = ?, descripcion = ?, costo_hora = ?,
        porcentaje_costo = ?, fecha_inicio = ?, fecha_fin_prevista = ?,
        responsable = ?, cliente = ?, estado = ?, presupuesto = ?
      WHERE id = ?
    `, [
      nombre, tipo, descripcion, costoHora || null, porcentajeCosto || null,
      fechaInicio || null, fechaFinPrevista || null, responsable, cliente || null,
      estado, presupuesto || null, id
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    res.json({ message: 'Proyecto actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando proyecto:', error);
    res.status(500).json({ error: 'Error actualizando proyecto' });
  }
});

// DELETE /api/projects/:id - Eliminar proyecto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el proyecto tiene asignaciones
    const asignaciones = await executeQuery(
      'SELECT COUNT(*) as count FROM asignaciones WHERE proyecto_id = ?',
      [id]
    );
    
    if (asignaciones[0].count > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar el proyecto porque tiene asignaciones asociadas'
      });
    }
    
    const result = await executeQuery('DELETE FROM proyectos WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    res.json({ message: 'Proyecto eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando proyecto:', error);
    res.status(500).json({ error: 'Error eliminando proyecto' });
  }
});

export default router;