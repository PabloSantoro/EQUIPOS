<?php
/**
 * API de Equipment para GEPRO
 * Migrado completamente desde Node.js con TODAS las funcionalidades
 */

require_once '../config/database.php';
require_once '../config/cors.php';
require_once '../config/upload.php';

// Configurar CORS y logging
setCorsHeaders();
logRequest();

// Rate limiting básico
checkRateLimit($_SERVER['REMOTE_ADDR'] ?? 'unknown', 100, 15);

$method = $_SERVER['REQUEST_METHOD'];
$urlParts = parseApiUrl();

// Parsear ruta: /api/equipment[/{id}][/{action}]
$equipment_id = isset($urlParts[0]) ? $urlParts[0] : null;
$action = isset($urlParts[1]) ? $urlParts[1] : null;
$subaction = isset($urlParts[2]) ? $urlParts[2] : null;

try {
    switch ($method) {
        case 'GET':
            if ($equipment_id === 'available' && $action === 'assignments') {
                // GET /api/equipment/available/assignments
                getAvailableEquipmentForAssignments();
            } elseif ($equipment_id) {
                // GET /api/equipment/{id}
                getEquipmentById($equipment_id);
            } else {
                // GET /api/equipment
                getAllEquipment();
            }
            break;
            
        case 'POST':
            if ($equipment_id && $action === 'upload-image') {
                // POST /api/equipment/{id}/upload-image
                uploadEquipmentImage($equipment_id);
            } else {
                // POST /api/equipment
                createEquipment();
            }
            break;
            
        case 'PUT':
            if ($equipment_id) {
                // PUT /api/equipment/{id}
                updateEquipment($equipment_id);
            } else {
                errorResponse('ID de equipo requerido para actualización', 400);
            }
            break;
            
        case 'DELETE':
            if ($equipment_id && $action === 'image') {
                // DELETE /api/equipment/{id}/image
                deleteEquipmentImage($equipment_id);
            } elseif ($equipment_id) {
                // DELETE /api/equipment/{id}
                deleteEquipment($equipment_id);
            } else {
                errorResponse('ID de equipo requerido para eliminación', 400);
            }
            break;
            
        default:
            errorResponse('Método HTTP no permitido', 405);
    }
    
} catch (Exception $e) {
    error_log("Error en equipment.php: " . $e->getMessage());
    errorResponse('Error interno del servidor', 500, $e->getMessage());
}

/**
 * GET /api/equipment - Obtener todos los equipos con filtros
 * Equivalente completo a la función de Node.js
 */
function getAllEquipment() {
    $status = $_GET['status'] ?? null;
    $tipo = $_GET['tipo'] ?? null;
    $search = $_GET['search'] ?? null;
    
    $query = 'SELECT * FROM equipos WHERE 1=1';
    $params = [];
    
    // Filtro por status (mismo que Node.js)
    if ($status) {
        $query .= ' AND status = ?';
        $params[] = $status;
    }
    
    // Filtro por tipo de vehículo (mismo que Node.js)
    if ($tipo) {
        $query .= ' AND tipo_vehiculo = ?';
        $params[] = $tipo;
    }
    
    // Búsqueda por texto (mismo que Node.js)
    if ($search) {
        $query .= ' AND (dominio LIKE ? OR marca LIKE ? OR modelo LIKE ?)';
        $searchPattern = "%$search%";
        $params = array_merge($params, [$searchPattern, $searchPattern, $searchPattern]);
    }
    
    $query .= ' ORDER BY dominio ASC';
    
    try {
        $equipos = executeQuery($query, $params);
        
        // Formatear respuesta exactamente como Node.js
        $equiposFormatted = array_map('formatEquipmentForResponse', $equipos);
        
        jsonResponse($equiposFormatted);
        
    } catch (Exception $e) {
        error_log("Error en getAllEquipment: " . $e->getMessage());
        errorResponse('Error obteniendo equipos', 500);
    }
}

/**
 * GET /api/equipment/{id} - Obtener equipo específico
 * Equivalente completo a la función de Node.js
 */
function getEquipmentById($id) {
    try {
        $equipos = executeQuery('SELECT * FROM equipos WHERE id = ?', [$id]);
        
        if (empty($equipos)) {
            errorResponse('Equipo no encontrado', 404);
        }
        
        $equipoFormatted = formatEquipmentForResponse($equipos[0]);
        jsonResponse($equipoFormatted);
        
    } catch (Exception $e) {
        error_log("Error en getEquipmentById: " . $e->getMessage());
        errorResponse('Error obteniendo equipo', 500);
    }
}

/**
 * GET /api/equipment/available/assignments - Equipos disponibles para asignación
 * Equivalente completo a la función de Node.js
 */
function getAvailableEquipmentForAssignments() {
    try {
        $query = "SELECT * FROM equipos 
                  WHERE status = 'OPERATIVO' 
                  AND id NOT IN (
                      SELECT equipo_id FROM asignaciones WHERE estado = 'ACTIVA'
                  )
                  ORDER BY dominio ASC";
        
        $equipos = executeQuery($query);
        
        // Formatear para lista simplificada (como en Node.js)
        $equiposFormatted = array_map(function($equipo) {
            return [
                'id' => $equipo['id'],
                'dominio' => $equipo['dominio'],
                'marca' => $equipo['marca'],
                'modelo' => $equipo['modelo'],
                'año' => (int)$equipo['año'],
                'tipoVehiculo' => $equipo['tipo_vehiculo'],
                'status' => $equipo['status']
            ];
        }, $equipos);
        
        jsonResponse($equiposFormatted);
        
    } catch (Exception $e) {
        error_log("Error en getAvailableEquipmentForAssignments: " . $e->getMessage());
        errorResponse('Error obteniendo equipos disponibles', 500);
    }
}

/**
 * POST /api/equipment - Crear nuevo equipo
 * Equivalente completo a la función de Node.js con validaciones
 */
function createEquipment() {
    $input = getRequestBody();
    
    if (!$input) {
        errorResponse('Datos JSON requeridos', 400);
    }
    
    // Validaciones equivalentes a express-validator de Node.js
    $validationRules = [
        'dominio' => ['required' => true, 'max_length' => 10],
        'marca' => ['required' => true, 'max_length' => 50],
        'modelo' => ['required' => true, 'max_length' => 50],
        'año' => ['required' => true, 'type' => 'int', 'min' => 1900, 'max' => date('Y') + 1],
        'tipoVehiculo' => ['required' => true, 'enum' => [
            'AUTOMOVIL', 'CAMIONETA', 'CAMION', 'UTILITARIO', 'MOTOCICLETA', 
            'ACOPLADO', 'MAQUINARIA', 'HERRAMIENTA', 'OTRO'
        ]]
    ];
    
    $errors = validateRequired($input, $validationRules);
    
    if (!empty($errors)) {
        errorResponse('Errores de validación', 400, $errors);
    }
    
    try {
        // Generar ID único (mismo formato que Node.js)
        $id = 'eq-' . time();
        $status = $input['status'] ?? 'OPERATIVO';
        
        $query = "INSERT INTO equipos (
            id, dominio, marca, modelo, año, tipo_vehiculo, motor, chasis,
            poliza_numero, poliza_vto, vtv_vto, status, observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $params = [
            $id,
            $input['dominio'],
            $input['marca'],
            $input['modelo'],
            (int)$input['año'],
            $input['tipoVehiculo'],
            $input['motor'] ?? null,
            $input['chasis'] ?? null,
            $input['polizaNumero'] ?? null,
            $input['polizaVto'] ?? null,
            $input['vtvVto'] ?? null,
            $status,
            $input['observaciones'] ?? null
        ];
        
        executeQuery($query, $params);
        
        jsonResponse([
            'message' => 'Equipo creado exitosamente',
            'id' => $id
        ], 201);
        
    } catch (Exception $e) {
        // Manejo de duplicados como en Node.js
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
            errorResponse('Ya existe un equipo con ese dominio', 409);
        } else {
            error_log("Error en createEquipment: " . $e->getMessage());
            errorResponse('Error creando equipo', 500);
        }
    }
}

/**
 * PUT /api/equipment/{id} - Actualizar equipo
 * Equivalente completo a la función de Node.js
 */
function updateEquipment($id) {
    $input = getRequestBody();
    
    if (!$input) {
        errorResponse('Datos JSON requeridos', 400);
    }
    
    // Mismas validaciones que create
    $validationRules = [
        'dominio' => ['required' => true, 'max_length' => 10],
        'marca' => ['required' => true, 'max_length' => 50],
        'modelo' => ['required' => true, 'max_length' => 50],
        'año' => ['required' => true, 'type' => 'int', 'min' => 1900, 'max' => date('Y') + 1],
        'tipoVehiculo' => ['required' => true, 'enum' => [
            'AUTOMOVIL', 'CAMIONETA', 'CAMION', 'UTILITARIO', 'MOTOCICLETA', 
            'ACOPLADO', 'MAQUINARIA', 'HERRAMIENTA', 'OTRO'
        ]]
    ];
    
    $errors = validateRequired($input, $validationRules);
    
    if (!empty($errors)) {
        errorResponse('Errores de validación', 400, $errors);
    }
    
    try {
        $query = "UPDATE equipos SET
            dominio = ?, marca = ?, modelo = ?, año = ?, tipo_vehiculo = ?,
            motor = ?, chasis = ?, poliza_numero = ?, poliza_vto = ?,
            vtv_vto = ?, status = ?, observaciones = ?
        WHERE id = ?";
        
        $params = [
            $input['dominio'],
            $input['marca'],
            $input['modelo'],
            (int)$input['año'],
            $input['tipoVehiculo'],
            $input['motor'] ?? null,
            $input['chasis'] ?? null,
            $input['polizaNumero'] ?? null,
            $input['polizaVto'] ?? null,
            $input['vtvVto'] ?? null,
            $input['status'],
            $input['observaciones'] ?? null,
            $id
        ];
        
        $result = executeQuery($query, $params);
        
        if ($result['rowCount'] === 0) {
            errorResponse('Equipo no encontrado', 404);
        }
        
        jsonResponse(['message' => 'Equipo actualizado exitosamente']);
        
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
            errorResponse('Ya existe un equipo con ese dominio', 409);
        } else {
            error_log("Error en updateEquipment: " . $e->getMessage());
            errorResponse('Error actualizando equipo', 500);
        }
    }
}

/**
 * DELETE /api/equipment/{id} - Eliminar equipo
 * Equivalente completo a la función de Node.js con validaciones de integridad
 */
function deleteEquipment($id) {
    try {
        // Verificar asignaciones activas (mismo que Node.js)
        $asignaciones = executeQuery(
            'SELECT COUNT(*) as count FROM asignaciones WHERE equipo_id = ? AND estado = "ACTIVA"',
            [$id]
        );
        
        if ($asignaciones[0]['count'] > 0) {
            errorResponse('No se puede eliminar el equipo porque tiene asignaciones activas', 400, [
                'active_assignments' => (int)$asignaciones[0]['count']
            ]);
        }
        
        // Obtener información del equipo para eliminar imagen
        $equipos = executeQuery('SELECT imagen_url FROM equipos WHERE id = ?', [$id]);
        
        if (!empty($equipos) && $equipos[0]['imagen_url']) {
            deleteEquipmentImage($id);
        }
        
        $result = executeQuery('DELETE FROM equipos WHERE id = ?', [$id]);
        
        if ($result['rowCount'] === 0) {
            errorResponse('Equipo no encontrado', 404);
        }
        
        jsonResponse(['message' => 'Equipo eliminado exitosamente']);
        
    } catch (Exception $e) {
        error_log("Error en deleteEquipment: " . $e->getMessage());
        errorResponse('Error eliminando equipo', 500);
    }
}

/**
 * POST /api/equipment/{id}/upload-image - Subir imagen de equipo
 * Equivalente completo al sistema de multer de Node.js
 */
function uploadEquipmentImage($id) {
    try {
        // Verificar que el equipo existe
        $equipos = executeQuery('SELECT * FROM equipos WHERE id = ?', [$id]);
        if (empty($equipos)) {
            errorResponse('Equipo no encontrado', 404);
        }
        
        $equipo = $equipos[0];
        
        // Subir nueva imagen usando el sistema de uploads
        $uploadResult = handleEquipmentImageUpload($id);
        
        // Eliminar imagen anterior si existe
        if ($equipo['imagen_url']) {
            deleteEquipmentImage($id);
        }
        
        // Actualizar URL en base de datos
        executeQuery(
            'UPDATE equipos SET imagen_url = ? WHERE id = ?',
            [$uploadResult['url'], $id]
        );
        
        jsonResponse([
            'success' => true,
            'message' => 'Imagen subida exitosamente',
            'imageUrl' => $uploadResult['url'],
            'filename' => $uploadResult['filename']
        ]);
        
    } catch (Exception $e) {
        error_log("Error en uploadEquipmentImage: " . $e->getMessage());
        errorResponse('Error subiendo imagen', 500, $e->getMessage());
    }
}

/**
 * DELETE /api/equipment/{id}/image - Eliminar imagen de equipo
 * Equivalente completo a la función de Node.js
 */
function deleteEquipmentImage($id) {
    try {
        // Obtener información del equipo
        $equipos = executeQuery('SELECT imagen_url FROM equipos WHERE id = ?', [$id]);
        if (empty($equipos)) {
            errorResponse('Equipo no encontrado', 404);
        }
        
        $equipo = $equipos[0];
        if (!$equipo['imagen_url']) {
            errorResponse('El equipo no tiene imagen asignada', 400);
        }
        
        // Eliminar archivo físico
        $deleted = deleteEquipmentImage($equipo['imagen_url']);
        
        // Eliminar URL en base de datos
        executeQuery('UPDATE equipos SET imagen_url = NULL WHERE id = ?', [$id]);
        
        jsonResponse([
            'success' => true,
            'message' => 'Imagen eliminada exitosamente',
            'file_deleted' => $deleted
        ]);
        
    } catch (Exception $e) {
        error_log("Error en deleteEquipmentImage: " . $e->getMessage());
        errorResponse('Error eliminando imagen', 500);
    }
}

/**
 * Formatear equipo para respuesta (equivalente al formateo de Node.js)
 */
function formatEquipmentForResponse($equipo) {
    return [
        'id' => $equipo['id'],
        'dominio' => $equipo['dominio'],
        'marca' => $equipo['marca'],
        'modelo' => $equipo['modelo'],
        'año' => (int)$equipo['año'],
        'tipoVehiculo' => $equipo['tipo_vehiculo'],
        'motor' => $equipo['motor'],
        'chasis' => $equipo['chasis'],
        'polizaNumero' => $equipo['poliza_numero'],
        'polizaVto' => formatDateForResponse($equipo['poliza_vto']),
        'vtvVto' => formatDateForResponse($equipo['vtv_vto']),
        'status' => $equipo['status'],
        'observaciones' => $equipo['observaciones'],
        'imagenUrl' => $equipo['imagen_url'],
        'createdAt' => $equipo['created_at'],
        'updatedAt' => $equipo['updated_at']
    ];
}
?>