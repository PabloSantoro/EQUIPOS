<?php
require_once '../config/database.php';
require_once '../config/cors.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));

// Extraer ID del mantenimiento si está presente
$maintenance_id = null;
if (count($path_parts) >= 4 && $path_parts[3] !== '') {
    $maintenance_id = $path_parts[3];
}

try {
    switch ($method) {
        case 'GET':
            if ($maintenance_id) {
                // GET /api/maintenance/{id}
                getMaintenance($maintenance_id);
            } else {
                // GET /api/maintenance
                getAllMaintenance();
            }
            break;
            
        case 'POST':
            // POST /api/maintenance
            createMaintenance();
            break;
            
        case 'PUT':
            if ($maintenance_id) {
                // PUT /api/maintenance/{id}
                updateMaintenance($maintenance_id);
            } else {
                errorResponse('ID de mantenimiento requerido', 400);
            }
            break;
            
        case 'DELETE':
            if ($maintenance_id) {
                // DELETE /api/maintenance/{id}
                deleteMaintenance($maintenance_id);
            } else {
                errorResponse('ID de mantenimiento requerido', 400);
            }
            break;
            
        default:
            errorResponse('Método no permitido', 405);
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
    
    $mantenimientos = executeQuery($query, $params);
    
    // Formatear datos para el frontend
    $mantenimientosFormatted = array_map(function($mantenimiento) {
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
            'estimatedHours' => (float)($mantenimiento['estimated_hours'] ?? 0),
            'actualHours' => (float)($mantenimiento['actual_hours'] ?? 0),
            'cost' => (float)($mantenimiento['cost'] ?? 0),
            'partsUsed' => $mantenimiento['parts_used'] ? json_decode($mantenimiento['parts_used'], true) : null,
            'notes' => $mantenimiento['notes'],
            'createdBy' => $mantenimiento['created_by'],
            'createdAt' => $mantenimiento['created_at'],
            'updatedAt' => $mantenimiento['updated_at'],
            // Datos del equipo
            'equipment' => [
                'dominio' => $mantenimiento['equipo_dominio'],
                'marca' => $mantenimiento['equipo_marca'],
                'modelo' => $mantenimiento['equipo_modelo']
            ]
        ];
    }, $mantenimientos);
    
    jsonResponse($mantenimientosFormatted);
}

function getMaintenance($id) {
    $query = "SELECT m.*, 
                     e.dominio as equipo_dominio, e.marca as equipo_marca, e.modelo as equipo_modelo
              FROM mantenimientos m
              LEFT JOIN equipos e ON m.equipment_id = e.id
              WHERE m.id = ?";
              
    $mantenimientos = executeQuery($query, [$id]);
    
    if (empty($mantenimientos)) {
        errorResponse('Mantenimiento no encontrado', 404);
    }
    
    $mantenimiento = $mantenimientos[0];
    $mantenimientoFormatted = [
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
        'estimatedHours' => (float)($mantenimiento['estimated_hours'] ?? 0),
        'actualHours' => (float)($mantenimiento['actual_hours'] ?? 0),
        'cost' => (float)($mantenimiento['cost'] ?? 0),
        'partsUsed' => $mantenimiento['parts_used'] ? json_decode($mantenimiento['parts_used'], true) : null,
        'notes' => $mantenimiento['notes'],
        'createdBy' => $mantenimiento['created_by'],
        'createdAt' => $mantenimiento['created_at'],
        'updatedAt' => $mantenimiento['updated_at'],
        // Datos del equipo
        'equipment' => [
            'dominio' => $mantenimiento['equipo_dominio'],
            'marca' => $mantenimiento['equipo_marca'],
            'modelo' => $mantenimiento['equipo_modelo']
        ]
    ];
    
    jsonResponse($mantenimientoFormatted);
}

function createMaintenance() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        errorResponse('Datos JSON inválidos', 400);
    }
    
    $required = ['equipmentId', 'workOrderNumber', 'type', 'scheduledDate'];
    $errors = validateRequired($input, $required);
    
    if (!empty($errors)) {
        errorResponse('Errores de validación', 400, $errors);
    }
    
    // Validar tipo de mantenimiento
    if (!in_array($input['type'], ['PREVENTIVO', 'CORRECTIVO', 'PREDICTIVO'])) {
        errorResponse('Tipo de mantenimiento inválido', 400);
    }
    
    // Validar prioridad
    $priority = $input['priority'] ?? 'MEDIA';
    if (!in_array($priority, ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'])) {
        errorResponse('Prioridad inválida', 400);
    }
    
    // Verificar que no exista otro mantenimiento con el mismo número de orden
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
        $id,
        $input['equipmentId'],
        $input['workOrderNumber'],
        $input['type'],
        $priority,
        $status,
        $input['scheduledDate'],
        $input['assignedTechnician'] ?? null,
        $input['description'] ?? null,
        $input['tasks'] ? json_encode($input['tasks']) : null,
        $input['estimatedHours'] ?? null,
        $input['notes'] ?? null,
        $input['createdBy'] ?? null
    ];
    
    executeQuery($query, $params);
    jsonResponse([
        'message' => 'Mantenimiento creado exitosamente',
        'id' => $id
    ], 201);
}

function updateMaintenance($id) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        errorResponse('Datos JSON inválidos', 400);
    }
    
    $required = ['equipmentId', 'workOrderNumber', 'type', 'scheduledDate'];
    $errors = validateRequired($input, $required);
    
    if (!empty($errors)) {
        errorResponse('Errores de validación', 400, $errors);
    }
    
    // Validaciones
    if (!in_array($input['type'], ['PREVENTIVO', 'CORRECTIVO', 'PREDICTIVO'])) {
        errorResponse('Tipo de mantenimiento inválido', 400);
    }
    
    if (!in_array($input['priority'], ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'])) {
        errorResponse('Prioridad inválida', 400);
    }
    
    if (!in_array($input['status'], ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE'])) {
        errorResponse('Estado inválido', 400);
    }
    
    $query = "UPDATE mantenimientos SET
        equipment_id = ?, work_order_number = ?, type = ?, priority = ?, status = ?,
        scheduled_date = ?, completion_date = ?, assigned_technician = ?, description = ?,
        tasks = ?, estimated_hours = ?, actual_hours = ?, cost = ?, parts_used = ?, notes = ?
    WHERE id = ?";
    
    $params = [
        $input['equipmentId'],
        $input['workOrderNumber'],
        $input['type'],
        $input['priority'],
        $input['status'],
        $input['scheduledDate'],
        $input['completionDate'] ?? null,
        $input['assignedTechnician'] ?? null,
        $input['description'] ?? null,
        $input['tasks'] ? json_encode($input['tasks']) : null,
        $input['estimatedHours'] ?? null,
        $input['actualHours'] ?? null,
        $input['cost'] ?? null,
        $input['partsUsed'] ? json_encode($input['partsUsed']) : null,
        $input['notes'] ?? null,
        $id
    ];
    
    $result = executeQuery($query, $params);
    
    if ($result['rowCount'] === 0) {
        errorResponse('Mantenimiento no encontrado', 404);
    }
    
    jsonResponse(['message' => 'Mantenimiento actualizado exitosamente']);
}

function deleteMaintenance($id) {
    $result = executeQuery('DELETE FROM mantenimientos WHERE id = ?', [$id]);
    
    if ($result['rowCount'] === 0) {
        errorResponse('Mantenimiento no encontrado', 404);
    }
    
    jsonResponse(['message' => 'Mantenimiento eliminado exitosamente']);
}
?>