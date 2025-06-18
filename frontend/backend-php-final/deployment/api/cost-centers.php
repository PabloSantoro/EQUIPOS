<?php
/**
 * API de Cost Centers para GEPRO - Migrado completo desde Node.js
 */
require_once '../config/database.php';
require_once '../config/cors.php';

setCorsHeaders();
logRequest();
checkRateLimit($_SERVER['REMOTE_ADDR'] ?? 'unknown', 100, 15);

$method = $_SERVER['REQUEST_METHOD'];
$urlParts = parseApiUrl();
$cost_center_id = isset($urlParts[0]) ? $urlParts[0] : null;

try {
    switch ($method) {
        case 'GET':
            if ($cost_center_id) {
                getCostCenterById($cost_center_id);
            } else {
                getAllCostCenters();
            }
            break;
        case 'POST':
            createCostCenter();
            break;
        case 'PUT':
            if ($cost_center_id) {
                updateCostCenter($cost_center_id);
            } else {
                errorResponse('ID de centro de costo requerido', 400);
            }
            break;
        case 'DELETE':
            if ($cost_center_id) {
                deleteCostCenter($cost_center_id);
            } else {
                errorResponse('ID de centro de costo requerido', 400);
            }
            break;
        default:
            errorResponse('Método HTTP no permitido', 405);
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
    
    try {
        $centros = executeQuery($query, $params);
        $centrosFormatted = array_map('formatCostCenterForResponse', $centros);
        jsonResponse($centrosFormatted);
    } catch (Exception $e) {
        errorResponse('Error obteniendo centros de costo', 500);
    }
}

function getCostCenterById($id) {
    try {
        $centros = executeQuery('SELECT * FROM centros_costo WHERE id = ?', [$id]);
        if (empty($centros)) {
            errorResponse('Centro de costo no encontrado', 404);
        }
        $centroFormatted = formatCostCenterForResponse($centros[0]);
        jsonResponse($centroFormatted);
    } catch (Exception $e) {
        errorResponse('Error obteniendo centro de costo', 500);
    }
}

function createCostCenter() {
    $input = getRequestBody();
    if (!$input) {
        errorResponse('Datos JSON requeridos', 400);
    }
    
    $validationRules = [
        'nombre' => ['required' => true, 'max_length' => 200],
        'codigo' => ['required' => true, 'max_length' => 20]
    ];
    
    $errors = validateRequired($input, $validationRules);
    if (!empty($errors)) {
        errorResponse('Errores de validación', 400, $errors);
    }
    
    try {
        $id = 'cc-' . time();
        $activo = isset($input['activo']) ? (int)$input['activo'] : 1;
        
        $query = "INSERT INTO centros_costo (
            id, nombre, codigo, descripcion, responsable, presupuesto, activo
        ) VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $params = [
            $id, $input['nombre'], $input['codigo'], $input['descripcion'] ?? null,
            $input['responsable'] ?? null,
            isset($input['presupuesto']) ? (float)$input['presupuesto'] : null,
            $activo
        ];
        
        executeQuery($query, $params);
        jsonResponse(['message' => 'Centro de costo creado exitosamente', 'id' => $id], 201);
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
            errorResponse('Ya existe un centro de costo con ese código', 409);
        } else {
            errorResponse('Error creando centro de costo', 500);
        }
    }
}

function updateCostCenter($id) {
    $input = getRequestBody();
    if (!$input) {
        errorResponse('Datos JSON requeridos', 400);
    }
    
    $validationRules = [
        'nombre' => ['required' => true, 'max_length' => 200],
        'codigo' => ['required' => true, 'max_length' => 20]
    ];
    
    $errors = validateRequired($input, $validationRules);
    if (!empty($errors)) {
        errorResponse('Errores de validación', 400, $errors);
    }
    
    try {
        $query = "UPDATE centros_costo SET
            nombre = ?, codigo = ?, descripcion = ?, responsable = ?, 
            presupuesto = ?, activo = ?
        WHERE id = ?";
        
        $params = [
            $input['nombre'], $input['codigo'], $input['descripcion'] ?? null,
            $input['responsable'] ?? null,
            isset($input['presupuesto']) ? (float)$input['presupuesto'] : null,
            isset($input['activo']) ? (int)$input['activo'] : 1, $id
        ];
        
        $result = executeQuery($query, $params);
        if ($result['rowCount'] === 0) {
            errorResponse('Centro de costo no encontrado', 404);
        }
        jsonResponse(['message' => 'Centro de costo actualizado exitosamente']);
    } catch (Exception $e) {
        errorResponse('Error actualizando centro de costo', 500);
    }
}

function deleteCostCenter($id) {
    try {
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
    } catch (Exception $e) {
        errorResponse('Error eliminando centro de costo', 500);
    }
}

function formatCostCenterForResponse($centro) {
    return [
        'id' => $centro['id'],
        'nombre' => $centro['nombre'],
        'codigo' => $centro['codigo'],
        'descripcion' => $centro['descripcion'],
        'responsable' => $centro['responsable'],
        'presupuesto' => $centro['presupuesto'] ? (float)$centro['presupuesto'] : null,
        'activo' => (bool)$centro['activo'],
        'createdAt' => $centro['created_at'],
        'updatedAt' => $centro['updated_at']
    ];
}
?>