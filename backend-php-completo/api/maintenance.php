<?php
/**
 * API de Maintenance para GEPRO - Migrado completo desde Node.js con campos JSON
 */
require_once '../config/database.php';
require_once '../config/cors.php';

setCorsHeaders();
logRequest();
checkRateLimit($_SERVER['REMOTE_ADDR'] ?? 'unknown', 100, 15);

$method = $_SERVER['REQUEST_METHOD'];
$urlParts = parseApiUrl();
$maintenance_id = isset($urlParts[0]) ? $urlParts[0] : null;

try {
    switch ($method) {
        case 'GET':
            if ($maintenance_id) {
                getMaintenanceById($maintenance_id);
            } else {
                getAllMaintenance();
            }
            break;
        case 'POST':
            createMaintenance();
            break;
        case 'PUT':
            if ($maintenance_id) {
                updateMaintenance($maintenance_id);
            } else {
                errorResponse('ID de mantenimiento requerido', 400);
            }
            break;
        case 'DELETE':
            if ($maintenance_id) {
                deleteMaintenance($maintenance_id);
            } else {
                errorResponse('ID de mantenimiento requerido', 400);
            }
            break;
        default:
            errorResponse('Método HTTP no permitido', 405);
    }
} catch (Exception $e) {
    error_log("Error en maintenance.php: " . $e->getMessage());
    errorResponse('Error interno del servidor', 500, $e->getMessage());
}

function getAllMaintenance() {
    $status = $_GET['status'] ?? null;
    $type = $_GET['type'] ?? null;
    $equipment_id = $_GET['equipment_id'] ?? null;
    
    $query = "SELECT m.*, 
                     e.dominio as equipo_dominio, e.marca as equipo_marca, e.modelo as equipo_modelo
              FROM mantenimientos m
              LEFT JOIN equipos e ON m.equipment_id = e.id
              WHERE 1=1";
    $params = [];
    
    if ($status) {
        $query .= ' AND m.status = ?';
        $params[] = $status;
    }
    
    if ($type) {
        $query .= ' AND m.type = ?';
        $params[] = $type;
    }
    
    if ($equipment_id) {
        $query .= ' AND m.equipment_id = ?';
        $params[] = $equipment_id;
    }
    
    $query .= ' ORDER BY m.scheduled_date DESC';
    
    try {
        $mantenimientos = executeQuery($query, $params);
        $mantenimientosFormatted = array_map('formatMaintenanceForResponse', $mantenimientos);
        jsonResponse($mantenimientosFormatted);
    } catch (Exception $e) {
        errorResponse('Error obteniendo mantenimientos', 500);
    }
}

function getMaintenanceById($id) {
    try {
        $query = "SELECT m.*, 
                         e.dominio as equipo_dominio, e.marca as equipo_marca, e.modelo as equipo_modelo
                  FROM mantenimientos m
                  LEFT JOIN equipos e ON m.equipment_id = e.id
                  WHERE m.id = ?";
                  
        $mantenimientos = executeQuery($query, [$id]);
        if (empty($mantenimientos)) {
            errorResponse('Mantenimiento no encontrado', 404);
        }
        $mantenimientoFormatted = formatMaintenanceForResponse($mantenimientos[0]);
        jsonResponse($mantenimientoFormatted);
    } catch (Exception $e) {
        errorResponse('Error obteniendo mantenimiento', 500);
    }
}

function createMaintenance() {
    $input = getRequestBody();
    if (!$input) {
        errorResponse('Datos JSON requeridos', 400);
    }
    
    $validationRules = [
        'equipmentId' => ['required' => true],
        'workOrderNumber' => ['required' => true, 'max_length' => 50],
        'type' => ['required' => true, 'enum' => ['PREVENTIVO', 'CORRECTIVO', 'PREDICTIVO']],
        'scheduledDate' => ['required' => true, 'type' => 'date']
    ];
    
    $errors = validateRequired($input, $validationRules);
    if (!empty($errors)) {
        errorResponse('Errores de validación', 400, $errors);
    }
    
    // Validar prioridad
    $priority = $input['priority'] ?? 'MEDIA';
    if (!in_array($priority, ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'])) {
        errorResponse('Prioridad inválida', 400);
    }
    
    try {
        // Verificar número de orden único
        $existente = executeQuery(
            'SELECT COUNT(*) as count FROM mantenimientos WHERE work_order_number = ?',
            [$input['workOrderNumber']]
        );
        
        if ($existente[0]['count'] > 0) {
            errorResponse('Ya existe un mantenimiento con ese número de orden de trabajo', 409);
        }
        
        $id = 'mnt-' . time();
        $status = $input['status'] ?? 'SCHEDULED';
        
        $query = "INSERT INTO mantenimientos (
            id, equipment_id, work_order_number, type, priority, status, scheduled_date,
            assigned_technician, description, tasks, estimated_hours, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $params = [
            $id, $input['equipmentId'], $input['workOrderNumber'], $input['type'],
            $priority, $status, $input['scheduledDate'], $input['assignedTechnician'] ?? null,
            $input['description'] ?? null,
            isset($input['tasks']) ? json_encode($input['tasks']) : null,
            isset($input['estimatedHours']) ? (float)$input['estimatedHours'] : null,
            $input['notes'] ?? null, $input['createdBy'] ?? null
        ];
        
        executeQuery($query, $params);
        jsonResponse(['message' => 'Mantenimiento creado exitosamente', 'id' => $id], 201);
    } catch (Exception $e) {
        errorResponse('Error creando mantenimiento', 500);
    }
}

function updateMaintenance($id) {
    $input = getRequestBody();
    if (!$input) {
        errorResponse('Datos JSON requeridos', 400);
    }
    
    $validationRules = [
        'equipmentId' => ['required' => true],
        'workOrderNumber' => ['required' => true, 'max_length' => 50],
        'type' => ['required' => true, 'enum' => ['PREVENTIVO', 'CORRECTIVO', 'PREDICTIVO']],
        'scheduledDate' => ['required' => true, 'type' => 'date']
    ];
    
    $errors = validateRequired($input, $validationRules);
    if (!empty($errors)) {
        errorResponse('Errores de validación', 400, $errors);
    }
    
    // Validaciones adicionales
    if (!in_array($input['priority'], ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'])) {
        errorResponse('Prioridad inválida', 400);
    }
    
    if (!in_array($input['status'], ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE'])) {
        errorResponse('Estado inválido', 400);
    }
    
    try {
        $query = "UPDATE mantenimientos SET
            equipment_id = ?, work_order_number = ?, type = ?, priority = ?, status = ?,
            scheduled_date = ?, completion_date = ?, assigned_technician = ?, description = ?,
            tasks = ?, estimated_hours = ?, actual_hours = ?, cost = ?, parts_used = ?, notes = ?
        WHERE id = ?";
        
        $params = [
            $input['equipmentId'], $input['workOrderNumber'], $input['type'],
            $input['priority'], $input['status'], $input['scheduledDate'],
            $input['completionDate'] ?? null, $input['assignedTechnician'] ?? null,
            $input['description'] ?? null,
            isset($input['tasks']) ? json_encode($input['tasks']) : null,
            isset($input['estimatedHours']) ? (float)$input['estimatedHours'] : null,
            isset($input['actualHours']) ? (float)$input['actualHours'] : null,
            isset($input['cost']) ? (float)$input['cost'] : null,
            isset($input['partsUsed']) ? json_encode($input['partsUsed']) : null,
            $input['notes'] ?? null, $id
        ];
        
        $result = executeQuery($query, $params);
        if ($result['rowCount'] === 0) {
            errorResponse('Mantenimiento no encontrado', 404);
        }
        jsonResponse(['message' => 'Mantenimiento actualizado exitosamente']);
    } catch (Exception $e) {
        errorResponse('Error actualizando mantenimiento', 500);
    }
}

function deleteMaintenance($id) {
    try {
        $result = executeQuery('DELETE FROM mantenimientos WHERE id = ?', [$id]);
        if ($result['rowCount'] === 0) {
            errorResponse('Mantenimiento no encontrado', 404);
        }
        jsonResponse(['message' => 'Mantenimiento eliminado exitosamente']);
    } catch (Exception $e) {
        errorResponse('Error eliminando mantenimiento', 500);
    }
}

function formatMaintenanceForResponse($mantenimiento) {
    return [
        'id' => $mantenimiento['id'],
        'equipmentId' => $mantenimiento['equipment_id'],
        'workOrderNumber' => $mantenimiento['work_order_number'],
        'type' => $mantenimiento['type'],
        'priority' => $mantenimiento['priority'],
        'status' => $mantenimiento['status'],
        'scheduledDate' => $mantenimiento['scheduled_date'],
        'completionDate' => $mantenimiento['completion_date'],
        'assignedTechnician' => $mantenimiento['assigned_technician'],
        'description' => $mantenimiento['description'],
        'tasks' => $mantenimiento['tasks'] ? json_decode($mantenimiento['tasks'], true) : null,
        'estimatedHours' => $mantenimiento['estimated_hours'] ? (float)$mantenimiento['estimated_hours'] : null,
        'actualHours' => $mantenimiento['actual_hours'] ? (float)$mantenimiento['actual_hours'] : null,
        'cost' => $mantenimiento['cost'] ? (float)$mantenimiento['cost'] : null,
        'partsUsed' => $mantenimiento['parts_used'] ? json_decode($mantenimiento['parts_used'], true) : null,
        'notes' => $mantenimiento['notes'],
        'createdBy' => $mantenimiento['created_by'],
        'createdAt' => $mantenimiento['created_at'],
        'updatedAt' => $mantenimiento['updated_at'],
        'equipment' => [
            'dominio' => $mantenimiento['equipo_dominio'],
            'marca' => $mantenimiento['equipo_marca'],
            'modelo' => $mantenimiento['equipo_modelo']
        ]
    ];
}
?>