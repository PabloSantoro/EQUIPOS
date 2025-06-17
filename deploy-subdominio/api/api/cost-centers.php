<?php
require_once '../config/database.php';
require_once '../config/cors.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));

// Extraer ID del centro de costo si está presente
$cost_center_id = null;
if (count($path_parts) >= 4 && $path_parts[3] !== '') {
    $cost_center_id = $path_parts[3];
}

try {
    switch ($method) {
        case 'GET':
            if ($cost_center_id) {
                // GET /api/cost-centers/{id}
                getCostCenter($cost_center_id);
            } else {
                // GET /api/cost-centers
                getAllCostCenters();
            }
            break;
            
        case 'POST':
            // POST /api/cost-centers
            createCostCenter();
            break;
            
        case 'PUT':
            if ($cost_center_id) {
                // PUT /api/cost-centers/{id}
                updateCostCenter($cost_center_id);
            } else {
                errorResponse('ID de centro de costo requerido', 400);
            }
            break;
            
        case 'DELETE':
            if ($cost_center_id) {
                // DELETE /api/cost-centers/{id}
                deleteCostCenter($cost_center_id);
            } else {
                errorResponse('ID de centro de costo requerido', 400);
            }
            break;
            
        default:
            errorResponse('Método no permitido', 405);
    }
    
} catch (Exception $e) {
    error_log("Error en cost-centers.php: " . $e->getMessage());
    errorResponse('Error interno del servidor', 500, $e->getMessage());
}

function getAllCostCenters() {
    $activo = $_GET['activo'] ?? null;
    
    $query = 'SELECT * FROM centros_costo WHERE 1=1';
    $params = [];
    
    if ($activo !== null) {
        $query .= ' AND activo = ?';
        $params[] = $activo === 'true' ? 1 : 0;
    }
    
    $query .= ' ORDER BY nombre ASC';
    
    $centros = executeQuery($query, $params);
    
    // Formatear datos para el frontend
    $centrosFormatted = array_map(function($centro) {
        return [
            'id' => $centro['id'],
            'nombre' => $centro['nombre'],
            'codigo' => $centro['codigo'],
            'descripcion' => $centro['descripcion'],
            'responsable' => $centro['responsable'],
            'presupuesto' => (float)($centro['presupuesto'] ?? 0),
            'activo' => (bool)$centro['activo'],
            'createdAt' => $centro['created_at'],
            'updatedAt' => $centro['updated_at']
        ];
    }, $centros);
    
    jsonResponse($centrosFormatted);
}

function getCostCenter($id) {
    $centros = executeQuery('SELECT * FROM centros_costo WHERE id = ?', [$id]);
    
    if (empty($centros)) {
        errorResponse('Centro de costo no encontrado', 404);
    }
    
    $centro = $centros[0];
    $centroFormatted = [
        'id' => $centro['id'],
        'nombre' => $centro['nombre'],
        'codigo' => $centro['codigo'],
        'descripcion' => $centro['descripcion'],
        'responsable' => $centro['responsable'],
        'presupuesto' => (float)($centro['presupuesto'] ?? 0),
        'activo' => (bool)$centro['activo'],
        'createdAt' => $centro['created_at'],
        'updatedAt' => $centro['updated_at']
    ];
    
    jsonResponse($centroFormatted);
}

function createCostCenter() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        errorResponse('Datos JSON inválidos', 400);
    }
    
    $required = ['nombre', 'codigo'];
    $errors = validateRequired($input, $required);
    
    if (!empty($errors)) {
        errorResponse('Errores de validación', 400, $errors);
    }
    
    $id = 'cc-' . time();
    $activo = $input['activo'] ?? true;
    
    $query = "INSERT INTO centros_costo (
        id, nombre, codigo, descripcion, responsable, presupuesto, activo
    ) VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $params = [
        $id,
        $input['nombre'],
        $input['codigo'],
        $input['descripcion'] ?? null,
        $input['responsable'] ?? null,
        $input['presupuesto'] ?? null,
        $activo ? 1 : 0
    ];
    
    try {
        executeQuery($query, $params);
        jsonResponse([
            'message' => 'Centro de costo creado exitosamente',
            'id' => $id
        ], 201);
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
            errorResponse('Ya existe un centro de costo con ese código', 409);
        } else {
            throw $e;
        }
    }
}

function updateCostCenter($id) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        errorResponse('Datos JSON inválidos', 400);
    }
    
    $required = ['nombre', 'codigo'];
    $errors = validateRequired($input, $required);
    
    if (!empty($errors)) {
        errorResponse('Errores de validación', 400, $errors);
    }
    
    $query = "UPDATE centros_costo SET
        nombre = ?, codigo = ?, descripcion = ?, responsable = ?, 
        presupuesto = ?, activo = ?
    WHERE id = ?";
    
    $params = [
        $input['nombre'],
        $input['codigo'],
        $input['descripcion'] ?? null,
        $input['responsable'] ?? null,
        $input['presupuesto'] ?? null,
        $input['activo'] ? 1 : 0,
        $id
    ];
    
    try {
        $result = executeQuery($query, $params);
        
        if ($result['rowCount'] === 0) {
            errorResponse('Centro de costo no encontrado', 404);
        }
        
        jsonResponse(['message' => 'Centro de costo actualizado exitosamente']);
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
            errorResponse('Ya existe un centro de costo con ese código', 409);
        } else {
            throw $e;
        }
    }
}

function deleteCostCenter($id) {
    // Verificar si tiene asignaciones activas
    $asignaciones = executeQuery(
        'SELECT COUNT(*) as count FROM asignaciones WHERE centro_costo_id = ? AND estado = "ACTIVA"',
        [$id]
    );
    
    if ($asignaciones[0]['count'] > 0) {
        errorResponse('No se puede eliminar el centro de costo porque tiene asignaciones activas', 400);
    }
    
    $result = executeQuery('DELETE FROM centros_costo WHERE id = ?', [$id]);
    
    if ($result['rowCount'] === 0) {
        errorResponse('Centro de costo no encontrado', 404);
    }
    
    jsonResponse(['message' => 'Centro de costo eliminado exitosamente']);
}
?>