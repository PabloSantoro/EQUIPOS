import express from 'express';
import { body, validationResult } from 'express-validator';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// Validaciones
const costCenterValidation = [
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('codigo').notEmpty().withMessage('El código es requerido'),
  body('responsable').notEmpty().withMessage('El responsable es requerido')
];

// GET /api/cost-centers - Obtener todos los centros de costo
router.get('/', async (req, res) => {
  try {
    const { activo } = req.query;
    
    let query = 'SELECT * FROM centros_costo WHERE 1=1';
    const params = [];
    
    if (activo !== undefined) {
      query += ' AND activo = ?';
      params.push(activo === 'true');
    }
    
    query += ' ORDER BY nombre ASC';
    
    const centrosCosto = await executeQuery(query, params);
    
    const centrosCostoFormatted = centrosCosto.map(centro => ({
      id: centro.id,
      nombre: centro.nombre,
      codigo: centro.codigo,
      descripcion: centro.descripcion,
      responsable: centro.responsable,
      presupuesto: parseFloat(centro.presupuesto || 0),
      activo: Boolean(centro.activo),
      createdAt: centro.created_at,
      updatedAt: centro.updated_at
    }));
    
    res.json(centrosCostoFormatted);
  } catch (error) {
    console.error('Error obteniendo centros de costo:', error);
    res.status(500).json({ error: 'Error obteniendo centros de costo' });
  }
});

// GET /api/cost-centers/:id - Obtener un centro de costo específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const centrosCosto = await executeQuery('SELECT * FROM centros_costo WHERE id = ?', [id]);
    
    if (centrosCosto.length === 0) {
      return res.status(404).json({ error: 'Centro de costo no encontrado' });
    }
    
    const centro = centrosCosto[0];
    const centroFormatted = {
      id: centro.id,
      nombre: centro.nombre,
      codigo: centro.codigo,
      descripcion: centro.descripcion,
      responsable: centro.responsable,
      presupuesto: parseFloat(centro.presupuesto || 0),
      activo: Boolean(centro.activo),
      createdAt: centro.created_at,
      updatedAt: centro.updated_at
    };
    
    res.json(centroFormatted);
  } catch (error) {
    console.error('Error obteniendo centro de costo:', error);
    res.status(500).json({ error: 'Error obteniendo centro de costo' });
  }
});

// POST /api/cost-centers - Crear nuevo centro de costo
router.post('/', costCenterValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      nombre,
      codigo,
      descripcion,
      responsable,
      presupuesto,
      activo = true
    } = req.body;
    
    const id = `cc-${Date.now()}`;
    
    await executeQuery(`
      INSERT INTO centros_costo (
        id, nombre, codigo, descripcion, responsable, presupuesto, activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, nombre, codigo, descripcion, responsable, presupuesto || null, activo]);
    
    res.status(201).json({
      message: 'Centro de costo creado exitosamente',
      id
    });
  } catch (error) {
    console.error('Error creando centro de costo:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe un centro de costo con ese código' });
    }
    res.status(500).json({ error: 'Error creando centro de costo' });
  }
});

// PUT /api/cost-centers/:id - Actualizar centro de costo
router.put('/:id', costCenterValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const {
      nombre,
      codigo,
      descripcion,
      responsable,
      presupuesto,
      activo
    } = req.body;
    
    const result = await executeQuery(`
      UPDATE centros_costo SET
        nombre = ?, codigo = ?, descripcion = ?, responsable = ?,
        presupuesto = ?, activo = ?
      WHERE id = ?
    `, [nombre, codigo, descripcion, responsable, presupuesto || null, activo, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Centro de costo no encontrado' });
    }
    
    res.json({ message: 'Centro de costo actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando centro de costo:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe un centro de costo con ese código' });
    }
    res.status(500).json({ error: 'Error actualizando centro de costo' });
  }
});

// DELETE /api/cost-centers/:id - Eliminar centro de costo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el centro de costo tiene asignaciones
    const asignaciones = await executeQuery(
      'SELECT COUNT(*) as count FROM asignaciones WHERE centro_costo_id = ?',
      [id]
    );
    
    if (asignaciones[0].count > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar el centro de costo porque tiene asignaciones asociadas'
      });
    }
    
    const result = await executeQuery('DELETE FROM centros_costo WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Centro de costo no encontrado' });
    }
    
    res.json({ message: 'Centro de costo eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando centro de costo:', error);
    res.status(500).json({ error: 'Error eliminando centro de costo' });
  }
});

export default router;