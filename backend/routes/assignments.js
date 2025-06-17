import express from 'express';
import { body, validationResult } from 'express-validator';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// Validaciones
const assignmentValidation = [
  body('equipoId').notEmpty().withMessage('El equipo es requerido'),
  body('proyectoId').notEmpty().withMessage('El proyecto es requerido'),
  body('centroCostoId').notEmpty().withMessage('El centro de costo es requerido'),
  body('fechaInicio').isISO8601().withMessage('Fecha de inicio inválida'),
  body('retribucionTipo').isIn(['PORCENTAJE', 'VALOR_FIJO']).withMessage('Tipo de retribución inválido'),
  body('retribucionValor').isFloat({ min: 0 }).withMessage('Valor de retribución inválido'),
  body('horasEstimadas').isFloat({ min: 0 }).withMessage('Horas estimadas inválidas')
];

// GET /api/assignments - Obtener todas las asignaciones
router.get('/', async (req, res) => {
  try {
    const { estado, proyectoId, equipoId, centroCostoId } = req.query;
    
    let query = `
      SELECT 
        a.*,
        e.dominio as equipo_dominio,
        e.marca as equipo_marca,
        e.modelo as equipo_modelo,
        p.nombre as proyecto_nombre,
        p.tipo as proyecto_tipo,
        cc.nombre as centro_costo_nombre,
        cc.codigo as centro_costo_codigo
      FROM asignaciones a
      LEFT JOIN equipos e ON a.equipo_id = e.id
      LEFT JOIN proyectos p ON a.proyecto_id = p.id
      LEFT JOIN centros_costo cc ON a.centro_costo_id = cc.id
      WHERE 1=1
    `;
    const params = [];
    
    if (estado) {
      query += ' AND a.estado = ?';
      params.push(estado);
    }
    
    if (proyectoId) {
      query += ' AND a.proyecto_id = ?';
      params.push(proyectoId);
    }
    
    if (equipoId) {
      query += ' AND a.equipo_id = ?';
      params.push(equipoId);
    }
    
    if (centroCostoId) {
      query += ' AND a.centro_costo_id = ?';
      params.push(centroCostoId);
    }
    
    query += ' ORDER BY a.created_at DESC';
    
    const asignaciones = await executeQuery(query, params);
    
    const asignacionesFormatted = asignaciones.map(asignacion => ({
      id: asignacion.id,
      equipoId: asignacion.equipo_id,
      proyectoId: asignacion.proyecto_id,
      centroCostoId: asignacion.centro_costo_id,
      fechaInicio: asignacion.fecha_inicio,
      fechaFinPrevista: asignacion.fecha_fin_prevista,
      fechaFin: asignacion.fecha_fin,
      retribucionTipo: asignacion.retribucion_tipo,
      retribucionValor: parseFloat(asignacion.retribucion_valor),
      horasEstimadas: parseFloat(asignacion.horas_estimadas || 0),
      horasReales: parseFloat(asignacion.horas_reales || 0),
      costoTotal: parseFloat(asignacion.costo_total || 0),
      estado: asignacion.estado,
      observaciones: asignacion.observaciones,
      validacionMantenimiento: Boolean(asignacion.validacion_mantenimiento),
      creadoPor: asignacion.creado_por,
      createdAt: asignacion.created_at,
      updatedAt: asignacion.updated_at,
      // Datos relacionados
      equipo: {
        dominio: asignacion.equipo_dominio,
        marca: asignacion.equipo_marca,
        modelo: asignacion.equipo_modelo
      },
      proyecto: {
        nombre: asignacion.proyecto_nombre,
        tipo: asignacion.proyecto_tipo
      },
      centroCosto: {
        nombre: asignacion.centro_costo_nombre,
        codigo: asignacion.centro_costo_codigo
      }
    }));
    
    res.json(asignacionesFormatted);
  } catch (error) {
    console.error('Error obteniendo asignaciones:', error);
    res.status(500).json({ error: 'Error obteniendo asignaciones' });
  }
});

// GET /api/assignments/:id - Obtener una asignación específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const asignaciones = await executeQuery(`
      SELECT 
        a.*,
        e.dominio as equipo_dominio,
        e.marca as equipo_marca,
        e.modelo as equipo_modelo,
        p.nombre as proyecto_nombre,
        p.tipo as proyecto_tipo,
        cc.nombre as centro_costo_nombre,
        cc.codigo as centro_costo_codigo
      FROM asignaciones a
      LEFT JOIN equipos e ON a.equipo_id = e.id
      LEFT JOIN proyectos p ON a.proyecto_id = p.id
      LEFT JOIN centros_costo cc ON a.centro_costo_id = cc.id
      WHERE a.id = ?
    `, [id]);
    
    if (asignaciones.length === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }
    
    const asignacion = asignaciones[0];
    const asignacionFormatted = {
      id: asignacion.id,
      equipoId: asignacion.equipo_id,
      proyectoId: asignacion.proyecto_id,
      centroCostoId: asignacion.centro_costo_id,
      fechaInicio: asignacion.fecha_inicio,
      fechaFinPrevista: asignacion.fecha_fin_prevista,
      fechaFin: asignacion.fecha_fin,
      retribucionTipo: asignacion.retribucion_tipo,
      retribucionValor: parseFloat(asignacion.retribucion_valor),
      horasEstimadas: parseFloat(asignacion.horas_estimadas || 0),
      horasReales: parseFloat(asignacion.horas_reales || 0),
      costoTotal: parseFloat(asignacion.costo_total || 0),
      estado: asignacion.estado,
      observaciones: asignacion.observaciones,
      validacionMantenimiento: Boolean(asignacion.validacion_mantenimiento),
      creadoPor: asignacion.creado_por,
      createdAt: asignacion.created_at,
      updatedAt: asignacion.updated_at,
      equipo: {
        dominio: asignacion.equipo_dominio,
        marca: asignacion.equipo_marca,
        modelo: asignacion.equipo_modelo
      },
      proyecto: {
        nombre: asignacion.proyecto_nombre,
        tipo: asignacion.proyecto_tipo
      },
      centroCosto: {
        nombre: asignacion.centro_costo_nombre,
        codigo: asignacion.centro_costo_codigo
      }
    };
    
    res.json(asignacionFormatted);
  } catch (error) {
    console.error('Error obteniendo asignación:', error);
    res.status(500).json({ error: 'Error obteniendo asignación' });
  }
});

// POST /api/assignments - Crear nueva asignación
router.post('/', assignmentValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      equipoId,
      proyectoId,
      centroCostoId,
      fechaInicio,
      fechaFinPrevista,
      retribucionTipo,
      retribucionValor,
      horasEstimadas,
      observaciones,
      costoTotal = 0,
      creadoPor = 'sistema'
    } = req.body;
    
    // Verificar que el equipo no tenga asignaciones activas
    const asignacionesActivas = await executeQuery(
      'SELECT COUNT(*) as count FROM asignaciones WHERE equipo_id = ? AND estado = "ACTIVA"',
      [equipoId]
    );
    
    if (asignacionesActivas[0].count > 0) {
      return res.status(400).json({
        error: 'El equipo ya tiene una asignación activa'
      });
    }
    
    const id = `assign-${Date.now()}`;
    
    await executeQuery(`
      INSERT INTO asignaciones (
        id, equipo_id, proyecto_id, centro_costo_id, fecha_inicio,
        fecha_fin_prevista, retribucion_tipo, retribucion_valor,
        horas_estimadas, observaciones, costo_total, creado_por,
        validacion_mantenimiento
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, equipoId, proyectoId, centroCostoId, fechaInicio,
      fechaFinPrevista || null, retribucionTipo, retribucionValor,
      horasEstimadas, observaciones, costoTotal, creadoPor, true
    ]);
    
    res.status(201).json({
      message: 'Asignación creada exitosamente',
      id
    });
  } catch (error) {
    console.error('Error creando asignación:', error);
    res.status(500).json({ error: 'Error creando asignación' });
  }
});

// PUT /api/assignments/:id - Actualizar asignación
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fechaFinPrevista,
      fechaFin,
      horasReales,
      costoTotal,
      estado,
      observaciones
    } = req.body;
    
    const result = await executeQuery(`
      UPDATE asignaciones SET
        fecha_fin_prevista = COALESCE(?, fecha_fin_prevista),
        fecha_fin = COALESCE(?, fecha_fin),
        horas_reales = COALESCE(?, horas_reales),
        costo_total = COALESCE(?, costo_total),
        estado = COALESCE(?, estado),
        observaciones = COALESCE(?, observaciones)
      WHERE id = ?
    `, [fechaFinPrevista, fechaFin, horasReales, costoTotal, estado, observaciones, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }
    
    res.json({ message: 'Asignación actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando asignación:', error);
    res.status(500).json({ error: 'Error actualizando asignación' });
  }
});

// DELETE /api/assignments/:id - Eliminar asignación
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await executeQuery('DELETE FROM asignaciones WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }
    
    res.json({ message: 'Asignación eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando asignación:', error);
    res.status(500).json({ error: 'Error eliminando asignación' });
  }
});

// GET /api/assignments/stats/dashboard - Obtener estadísticas del dashboard
router.get('/stats/dashboard', async (req, res) => {
  try {
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'ACTIVA' THEN 1 ELSE 0 END) as activas,
        SUM(CASE WHEN estado = 'FINALIZADA' THEN 1 ELSE 0 END) as finalizadas,
        SUM(CASE WHEN estado = 'SUSPENDIDA' THEN 1 ELSE 0 END) as suspendidas,
        SUM(CASE WHEN estado = 'CANCELADA' THEN 1 ELSE 0 END) as canceladas,
        SUM(COALESCE(costo_total, 0)) as costo_total,
        SUM(COALESCE(horas_estimadas, 0)) as horas_estimadas,
        SUM(COALESCE(horas_reales, 0)) as horas_reales
      FROM asignaciones
    `);
    
    const statsFormatted = {
      total: parseInt(stats[0].total),
      activas: parseInt(stats[0].activas),
      finalizadas: parseInt(stats[0].finalizadas),
      suspendidas: parseInt(stats[0].suspendidas),
      canceladas: parseInt(stats[0].canceladas),
      costoTotal: parseFloat(stats[0].costo_total || 0),
      horasEstimadas: parseFloat(stats[0].horas_estimadas || 0),
      horasReales: parseFloat(stats[0].horas_reales || 0)
    };
    
    res.json(statsFormatted);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

export default router;