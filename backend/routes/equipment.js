import express from 'express';
import { body, validationResult } from 'express-validator';
import { executeQuery } from '../config/database.js';
import { upload, handleMulterError, deleteOldImage, getImageUrl } from '../middleware/upload.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Validaciones
const equipmentValidation = [
  body('dominio').notEmpty().withMessage('El dominio es requerido'),
  body('marca').notEmpty().withMessage('La marca es requerida'),
  body('modelo').notEmpty().withMessage('El modelo es requerido'),
  body('año').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Año inválido'),
  body('tipoVehiculo').notEmpty().withMessage('El tipo de vehículo es requerido')
];

// GET /api/equipment - Obtener todos los equipos
router.get('/', async (req, res) => {
  try {
    const { status, tipo, search } = req.query;
    
    let query = 'SELECT * FROM equipos WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (tipo) {
      query += ' AND tipo_vehiculo = ?';
      params.push(tipo);
    }
    
    if (search) {
      query += ' AND (dominio LIKE ? OR marca LIKE ? OR modelo LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    query += ' ORDER BY dominio ASC';
    
    const equipos = await executeQuery(query, params);
    
    // Convertir campos de fecha al formato esperado por el frontend
    const equiposFormatted = equipos.map(equipo => ({
      id: equipo.id,
      dominio: equipo.dominio,
      marca: equipo.marca,
      modelo: equipo.modelo,
      año: equipo.año,
      tipoVehiculo: equipo.tipo_vehiculo,
      motor: equipo.motor,
      chasis: equipo.chasis,
      polizaNumero: equipo.poliza_numero,
      polizaVto: equipo.poliza_vto ? equipo.poliza_vto.toISOString().split('T')[0] : null,
      vtvVto: equipo.vtv_vto ? equipo.vtv_vto.toISOString().split('T')[0] : null,
      status: equipo.status,
      observaciones: equipo.observaciones,
      imagenUrl: equipo.imagen_url,
      createdAt: equipo.created_at,
      updatedAt: equipo.updated_at
    }));
    
    res.json(equiposFormatted);
  } catch (error) {
    console.error('Error obteniendo equipos:', error);
    res.status(500).json({ error: 'Error obteniendo equipos' });
  }
});

// GET /api/equipment/:id - Obtener un equipo específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const equipos = await executeQuery('SELECT * FROM equipos WHERE id = ?', [id]);
    
    if (equipos.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    
    const equipo = equipos[0];
    const equipoFormatted = {
      id: equipo.id,
      dominio: equipo.dominio,
      marca: equipo.marca,
      modelo: equipo.modelo,
      año: equipo.año,
      tipoVehiculo: equipo.tipo_vehiculo,
      motor: equipo.motor,
      chasis: equipo.chasis,
      polizaNumero: equipo.poliza_numero,
      polizaVto: equipo.poliza_vto ? equipo.poliza_vto.toISOString().split('T')[0] : null,
      vtvVto: equipo.vtv_vto ? equipo.vtv_vto.toISOString().split('T')[0] : null,
      status: equipo.status,
      observaciones: equipo.observaciones,
      createdAt: equipo.created_at,
      updatedAt: equipo.updated_at
    };
    
    res.json(equipoFormatted);
  } catch (error) {
    console.error('Error obteniendo equipo:', error);
    res.status(500).json({ error: 'Error obteniendo equipo' });
  }
});

// POST /api/equipment - Crear nuevo equipo
router.post('/', equipmentValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      dominio,
      marca,
      modelo,
      año,
      tipoVehiculo,
      motor,
      chasis,
      polizaNumero,
      polizaVto,
      vtvVto,
      status = 'OPERATIVO',
      observaciones
    } = req.body;
    
    const id = `eq-${Date.now()}`;
    
    await executeQuery(`
      INSERT INTO equipos (
        id, dominio, marca, modelo, año, tipo_vehiculo, motor, chasis,
        poliza_numero, poliza_vto, vtv_vto, status, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, dominio, marca, modelo, año, tipoVehiculo, motor, chasis,
      polizaNumero, polizaVto || null, vtvVto || null, status, observaciones
    ]);
    
    res.status(201).json({
      message: 'Equipo creado exitosamente',
      id
    });
  } catch (error) {
    console.error('Error creando equipo:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe un equipo con ese dominio' });
    }
    res.status(500).json({ error: 'Error creando equipo' });
  }
});

// PUT /api/equipment/:id - Actualizar equipo
router.put('/:id', equipmentValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const {
      dominio,
      marca,
      modelo,
      año,
      tipoVehiculo,
      motor,
      chasis,
      polizaNumero,
      polizaVto,
      vtvVto,
      status,
      observaciones
    } = req.body;
    
    const result = await executeQuery(`
      UPDATE equipos SET
        dominio = ?, marca = ?, modelo = ?, año = ?, tipo_vehiculo = ?,
        motor = ?, chasis = ?, poliza_numero = ?, poliza_vto = ?,
        vtv_vto = ?, status = ?, observaciones = ?
      WHERE id = ?
    `, [
      dominio, marca, modelo, año, tipoVehiculo, motor, chasis,
      polizaNumero, polizaVto || null, vtvVto || null, status, observaciones, id
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    
    res.json({ message: 'Equipo actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando equipo:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe un equipo con ese dominio' });
    }
    res.status(500).json({ error: 'Error actualizando equipo' });
  }
});

// DELETE /api/equipment/:id - Eliminar equipo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el equipo tiene asignaciones activas
    const asignaciones = await executeQuery(
      'SELECT COUNT(*) as count FROM asignaciones WHERE equipo_id = ? AND estado = "ACTIVA"',
      [id]
    );
    
    if (asignaciones[0].count > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar el equipo porque tiene asignaciones activas'
      });
    }
    
    const result = await executeQuery('DELETE FROM equipos WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    
    res.json({ message: 'Equipo eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando equipo:', error);
    res.status(500).json({ error: 'Error eliminando equipo' });
  }
});

// GET /api/equipment/available/assignments - Obtener equipos disponibles para asignación
router.get('/available/assignments', async (req, res) => {
  try {
    const equipos = await executeQuery(`
      SELECT * FROM equipos 
      WHERE status = 'OPERATIVO' 
      AND id NOT IN (
        SELECT equipo_id FROM asignaciones WHERE estado = 'ACTIVA'
      )
      ORDER BY dominio ASC
    `);
    
    const equiposFormatted = equipos.map(equipo => ({
      id: equipo.id,
      dominio: equipo.dominio,
      marca: equipo.marca,
      modelo: equipo.modelo,
      año: equipo.año,
      tipoVehiculo: equipo.tipo_vehiculo,
      status: equipo.status
    }));
    
    res.json(equiposFormatted);
  } catch (error) {
    console.error('Error obteniendo equipos disponibles:', error);
    res.status(500).json({ error: 'Error obteniendo equipos disponibles' });
  }
});

// POST /api/equipment/:id/upload-image - Subir imagen de equipo
router.post('/:id/upload-image', upload.single('image'), handleMulterError, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha subido ningún archivo'
      });
    }

    // Verificar que el equipo existe
    const [equipo] = await executeQuery('SELECT * FROM equipos WHERE id = ?', [id]);
    if (!equipo) {
      // Eliminar archivo subido si el equipo no existe
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }

    // Eliminar imagen anterior si existe
    if (equipo.imagen_url) {
      const oldImagePath = path.join(path.dirname(req.file.path), path.basename(equipo.imagen_url));
      deleteOldImage(oldImagePath);
    }

    // Generar URL de la imagen
    const imageUrl = getImageUrl(req.file.filename, req);

    // Actualizar URL de imagen en la base de datos
    await executeQuery(
      'UPDATE equipos SET imagen_url = ? WHERE id = ?',
      [imageUrl, id]
    );

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      imageUrl: imageUrl,
      filename: req.file.filename
    });

  } catch (error) {
    // Eliminar archivo en caso de error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error subiendo imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/equipment/:id/image - Eliminar imagen de equipo
router.delete('/:id/image', async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener información del equipo
    const [equipo] = await executeQuery('SELECT imagen_url FROM equipos WHERE id = ?', [id]);
    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }

    if (!equipo.imagen_url) {
      return res.status(400).json({
        success: false,
        message: 'El equipo no tiene imagen asignada'
      });
    }

    // Eliminar archivo físico
    const filename = path.basename(equipo.imagen_url);
    const imagePath = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'uploads', 'equipment', filename);
    deleteOldImage(imagePath);

    // Eliminar URL de imagen en la base de datos
    await executeQuery('UPDATE equipos SET imagen_url = NULL WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

export default router;