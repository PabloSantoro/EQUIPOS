<?php
require_once '../config/database.php';
require_once '../config/cors.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));

// Extraer ID del equipo si está presente
$equipment_id = null;
if (count($path_parts) >= 4 && $path_parts[3] !== '') {
    $equipment_id = $path_parts[3];
}

try {
    switch ($method) {
        case 'GET':
            if ($equipment_id) {
                // GET /api/equipment/{id}
                getEquipment($equipment_id);
            } else {
                // GET /api/equipment
                getAllEquipment();
            }
            break;
            
        case 'POST':
            if ($equipment_id && isset($path_parts[4]) && $path_parts[4] === 'upload-image') {
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
                errorResponse('ID de equipo requerido', 400);
            }
            break;
            
        case 'DELETE':
            if ($equipment_id) {
                if (isset($path_parts[4]) && $path_parts[4] === 'image') {
                    // DELETE /api/equipment/{id}/image
                    deleteEquipmentImage($equipment_id);
                } else {
                    // DELETE /api/equipment/{id}
                    deleteEquipment($equipment_id);
                }
            } else {
                errorResponse('ID de equipo requerido', 400);
            }
            break;
            
        default:
            errorResponse('Método no permitido', 405);
    }
    
} catch (Exception $e) {
    error_log("Error en equipment.php: " . $e->getMessage());
    errorResponse('Error interno del servidor', 500, $e->getMessage());
}

function getAllEquipment() {
    $status = $_GET['status'] ?? null;
    $tipo = $_GET['tipo'] ?? null;
    $search = $_GET['search'] ?? null;
    
    $query = 'SELECT * FROM equipos WHERE 1=1';
    $params = [];
    
    if ($status) {
        $query .= ' AND status = ?';
        $params[] = $status;
    }
    
    if ($tipo) {
        $query .= ' AND tipo_vehiculo = ?';
        $params[] = $tipo;
    }
    
    if ($search) {
        $query .= ' AND (dominio LIKE ? OR marca LIKE ? OR modelo LIKE ?)';
        $searchPattern = "%$search%";
        $params = array_merge($params, [$searchPattern, $searchPattern, $searchPattern]);
    }
    
    $query .= ' ORDER BY dominio ASC';
    
    $equipos = executeQuery($query, $params);
    
    // Formatear fechas para el frontend
    $equiposFormatted = array_map(function($equipo) {
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
            'polizaVto' => $equipo['poliza_vto'] ? date('Y-m-d', strtotime($equipo['poliza_vto'])) : null,
            'vtvVto' => $equipo['vtv_vto'] ? date('Y-m-d', strtotime($equipo['vtv_vto'])) : null,
            'status' => $equipo['status'],
            'observaciones' => $equipo['observaciones'],
            'imagenUrl' => $equipo['imagen_url'],
            'createdAt' => $equipo['created_at'],
            'updatedAt' => $equipo['updated_at']
        ];
    }, $equipos);
    
    jsonResponse($equiposFormatted);
}

function getEquipment($id) {
    $equipos = executeQuery('SELECT * FROM equipos WHERE id = ?', [$id]);
    
    if (empty($equipos)) {
        errorResponse('Equipo no encontrado', 404);
    }
    
    $equipo = $equipos[0];
    $equipoFormatted = [
        'id' => $equipo['id'],
        'dominio' => $equipo['dominio'],
        'marca' => $equipo['marca'],
        'modelo' => $equipo['modelo'],
        'año' => (int)$equipo['año'],
        'tipoVehiculo' => $equipo['tipo_vehiculo'],
        'motor' => $equipo['motor'],
        'chasis' => $equipo['chasis'],
        'polizaNumero' => $equipo['poliza_numero'],
        'polizaVto' => $equipo['poliza_vto'] ? date('Y-m-d', strtotime($equipo['poliza_vto'])) : null,
        'vtvVto' => $equipo['vtv_vto'] ? date('Y-m-d', strtotime($equipo['vtv_vto'])) : null,
        'status' => $equipo['status'],
        'observaciones' => $equipo['observaciones'],
        'imagenUrl' => $equipo['imagen_url'],
        'createdAt' => $equipo['created_at'],
        'updatedAt' => $equipo['updated_at']
    ];
    
    jsonResponse($equipoFormatted);
}

function createEquipment() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        errorResponse('Datos JSON inválidos', 400);
    }
    
    $required = ['dominio', 'marca', 'modelo', 'año', 'tipoVehiculo'];
    $errors = validateRequired($input, $required);
    
    if (!empty($errors)) {
        errorResponse('Errores de validación', 400, $errors);
    }
    
    // Validar año
    $año = (int)$input['año'];
    if ($año < 1900 || $año > (date('Y') + 1)) {
        errorResponse('Año inválido', 400);
    }
    
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
        $año,
        $input['tipoVehiculo'],
        $input['motor'] ?? null,
        $input['chasis'] ?? null,
        $input['polizaNumero'] ?? null,
        $input['polizaVto'] ?? null,
        $input['vtvVto'] ?? null,
        $status,
        $input['observaciones'] ?? null
    ];
    
    try {
        executeQuery($query, $params);
        jsonResponse([
            'message' => 'Equipo creado exitosamente',
            'id' => $id
        ], 201);
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
            errorResponse('Ya existe un equipo con ese dominio', 409);
        } else {
            throw $e;
        }
    }
}

function updateEquipment($id) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        errorResponse('Datos JSON inválidos', 400);
    }
    
    $required = ['dominio', 'marca', 'modelo', 'año', 'tipoVehiculo'];
    $errors = validateRequired($input, $required);
    
    if (!empty($errors)) {
        errorResponse('Errores de validación', 400, $errors);
    }
    
    // Validar año
    $año = (int)$input['año'];
    if ($año < 1900 || $año > (date('Y') + 1)) {
        errorResponse('Año inválido', 400);
    }
    
    $query = "UPDATE equipos SET
        dominio = ?, marca = ?, modelo = ?, año = ?, tipo_vehiculo = ?,
        motor = ?, chasis = ?, poliza_numero = ?, poliza_vto = ?,
        vtv_vto = ?, status = ?, observaciones = ?
    WHERE id = ?";
    
    $params = [
        $input['dominio'],
        $input['marca'],
        $input['modelo'],
        $año,
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
    
    try {
        $result = executeQuery($query, $params);
        
        if ($result['rowCount'] === 0) {
            errorResponse('Equipo no encontrado', 404);
        }
        
        jsonResponse(['message' => 'Equipo actualizado exitosamente']);
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
            errorResponse('Ya existe un equipo con ese dominio', 409);
        } else {
            throw $e;
        }
    }
}

function deleteEquipment($id) {
    // Verificar si tiene asignaciones activas
    $asignaciones = executeQuery(
        'SELECT COUNT(*) as count FROM asignaciones WHERE equipo_id = ? AND estado = "ACTIVA"',
        [$id]
    );
    
    if ($asignaciones[0]['count'] > 0) {
        errorResponse('No se puede eliminar el equipo porque tiene asignaciones activas', 400);
    }
    
    $result = executeQuery('DELETE FROM equipos WHERE id = ?', [$id]);
    
    if ($result['rowCount'] === 0) {
        errorResponse('Equipo no encontrado', 404);
    }
    
    jsonResponse(['message' => 'Equipo eliminado exitosamente']);
}

function uploadEquipmentImage($id) {
    if (!isset($_FILES['image'])) {
        errorResponse('No se ha subido ningún archivo', 400);
    }
    
    $file = $_FILES['image'];
    
    // Validar archivo
    $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!in_array($file['type'], $allowedTypes)) {
        errorResponse('Tipo de archivo no permitido. Solo JPEG, PNG', 400);
    }
    
    if ($file['size'] > 5 * 1024 * 1024) { // 5MB
        errorResponse('El archivo es demasiado grande. Máximo 5MB', 400);
    }
    
    // Verificar que el equipo existe
    $equipos = executeQuery('SELECT * FROM equipos WHERE id = ?', [$id]);
    if (empty($equipos)) {
        errorResponse('Equipo no encontrado', 404);
    }
    
    // Crear directorio si no existe
    $uploadDir = '../uploads/equipment/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Generar nombre único para el archivo
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = $id . '_' . time() . '.' . $extension;
    $filepath = $uploadDir . $filename;
    
    // Eliminar imagen anterior si existe
    $equipo = $equipos[0];
    if ($equipo['imagen_url']) {
        $oldFilename = basename($equipo['imagen_url']);
        $oldFilepath = $uploadDir . $oldFilename;
        if (file_exists($oldFilepath)) {
            unlink($oldFilepath);
        }
    }
    
    // Mover archivo
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        // Generar URL
        $baseUrl = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'];
        $imageUrl = $baseUrl . '/equipos/api/uploads/equipment/' . $filename;
        
        // Actualizar base de datos
        executeQuery('UPDATE equipos SET imagen_url = ? WHERE id = ?', [$imageUrl, $id]);
        
        jsonResponse([
            'success' => true,
            'message' => 'Imagen subida exitosamente',
            'imageUrl' => $imageUrl,
            'filename' => $filename
        ]);
    } else {
        errorResponse('Error al subir el archivo', 500);
    }
}

function deleteEquipmentImage($id) {
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
    $filename = basename($equipo['imagen_url']);
    $filepath = '../uploads/equipment/' . $filename;
    if (file_exists($filepath)) {
        unlink($filepath);
    }
    
    // Eliminar URL en base de datos
    executeQuery('UPDATE equipos SET imagen_url = NULL WHERE id = ?', [$id]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Imagen eliminada exitosamente'
    ]);
}
?>