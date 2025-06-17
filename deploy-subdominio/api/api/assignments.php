<?php
require_once '../config/database.php';
require_once '../config/cors.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));

// Extraer ID de la asignación si está presente
$assignment_id = null;
if (count($path_parts) >= 4 && $path_parts[3] !== '') {
    $assignment_id = $path_parts[3];
}

try {
    switch ($method) {
        case 'GET':
            if ($assignment_id) {
                // GET /api/assignments/{id}
                getAssignment($assignment_id);
            } else {
                // GET /api/assignments
                getAllAssignments();
            }
            break;
            
        case 'POST':
            // POST /api/assignments
            createAssignment();
            break;
            
        case 'PUT':
            if ($assignment_id) {
                // PUT /api/assignments/{id}
                updateAssignment($assignment_id);
            } else {
                errorResponse('ID de asignación requerido', 400);
            }
            break;
            
        case 'DELETE':
            if ($assignment_id) {
                // DELETE /api/assignments/{id}
                deleteAssignment($assignment_id);
            } else {
                errorResponse('ID de asignación requerido', 400);
            }
            break;
            
        default:
            errorResponse('Método no permitido', 405);
    }
    
} catch (Exception $e) {
    error_log("Error en assignments.php: " . $e->getMessage());
    errorResponse('Error interno del servidor', 500, $e->getMessage());
}

function getAllAssignments() {
    $estado = $_GET['estado'] ?? null;
    $equipo_id = $_GET['equipo_id'] ?? null;
    $proyecto_id = $_GET['proyecto_id'] ?? null;
    
    $query = "SELECT a.*, 
                     e.dominio as equipo_dominio, e.marca as equipo_marca, e.modelo as equipo_modelo,
                     p.nombre as proyecto_nombre, p.tipo as proyecto_tipo,
                     cc.nombre as centro_costo_nombre, cc.codigo as centro_costo_codigo
              FROM asignaciones a
              LEFT JOIN equipos e ON a.equipo_id = e.id
              LEFT JOIN proyectos p ON a.proyecto_id = p.id
              LEFT JOIN centros_costo cc ON a.centro_costo_id = cc.id
              WHERE 1=1";
    $params = [];
    
    if ($estado) {
        $query .= ' AND a.estado = ?';
        $params[] = $estado;
    }
    
    if ($equipo_id) {
        $query .= ' AND a.equipo_id = ?';
        $params[] = $equipo_id;
    }
    
    if ($proyecto_id) {
        $query .= ' AND a.proyecto_id = ?';
        $params[] = $proyecto_id;
    }
    
    $query .= ' ORDER BY a.fecha_inicio DESC';
    
    $asignaciones = executeQuery($query, $params);
    
    // Formatear datos para el frontend
    $asignacionesFormatted = array_map(function($asignacion) {
        return [
            'id' => $asignacion['id'],
            'equipoId' => $asignacion['equipo_id'],
            'proyectoId' => $asignacion['proyecto_id'],
            'centroCostoId' => $asignacion['centro_costo_id'],
            'fechaInicio' => $asignacion['fecha_inicio'],
            'fechaFinPrevista' => $asignacion['fecha_fin_prevista'],
            'fechaFin' => $asignacion['fecha_fin'],
            'retribucionTipo' => $asignacion['retribucion_tipo'],
            'retribucionValor' => (float)($asignacion['retribucion_valor'] ?? 0),
            'horasEstimadas' => (float)($asignacion['horas_estimadas'] ?? 0),
            'horasReales' => (float)($asignacion['horas_reales'] ?? 0),
            'costoTotal' => (float)($asignacion['costo_total'] ?? 0),
            'estado' => $asignacion['estado'],
            'observaciones' => $asignacion['observaciones'],
            'validacionMantenimiento' => (bool)$asignacion['validacion_mantenimiento'],
            'creadoPor' => $asignacion['creado_por'],
            'createdAt' => $asignacion['created_at'],
            'updatedAt' => $asignacion['updated_at'],
            // Datos relacionados
            'equipo' => [
                'dominio' => $asignacion['equipo_dominio'],
                'marca' => $asignacion['equipo_marca'],
                'modelo' => $asignacion['equipo_modelo']
            ],
            'proyecto' => [
                'nombre' => $asignacion['proyecto_nombre'],
                'tipo' => $asignacion['proyecto_tipo']
            ],
            'centroCosto' => [
                'nombre' => $asignacion['centro_costo_nombre'],
                'codigo' => $asignacion['centro_costo_codigo']
            ]
        ];
    }, $asignaciones);
    
    jsonResponse($asignacionesFormatted);
}

function getAssignment($id) {
    $query = "SELECT a.*, 
                     e.dominio as equipo_dominio, e.marca as equipo_marca, e.modelo as equipo_modelo,
                     p.nombre as proyecto_nombre, p.tipo as proyecto_tipo,
                     cc.nombre as centro_costo_nombre, cc.codigo as centro_costo_codigo
              FROM asignaciones a
              LEFT JOIN equipos e ON a.equipo_id = e.id
              LEFT JOIN proyectos p ON a.proyecto_id = p.id
              LEFT JOIN centros_costo cc ON a.centro_costo_id = cc.id
              WHERE a.id = ?";
              
    $asignaciones = executeQuery($query, [$id]);
    
    if (empty($asignaciones)) {
        errorResponse('Asignación no encontrada', 404);
    }
    
    $asignacion = $asignaciones[0];
    $asignacionFormatted = [
        'id' => $asignacion['id'],
        'equipoId' => $asignacion['equipo_id'],
        'proyectoId' => $asignacion['proyecto_id'],
        'centroCostoId' => $asignacion['centro_costo_id'],
        'fechaInicio' => $asignacion['fecha_inicio'],
        'fechaFinPrevista' => $asignacion['fecha_fin_prevista'],
        'fechaFin' => $asignacion['fecha_fin'],
        'retribucionTipo' => $asignacion['retribucion_tipo'],
        'retribucionValor' => (float)($asignacion['retribucion_valor'] ?? 0),
        'horasEstimadas' => (float)($asignacion['horas_estimadas'] ?? 0),
        'horasReales' => (float)($asignacion['horas_reales'] ?? 0),
        'costoTotal' => (float)($asignacion['costo_total'] ?? 0),
        'estado' => $asignacion['estado'],
        'observaciones' => $asignacion['observaciones'],
        'validacionMantenimiento' => (bool)$asignacion['validacion_mantenimiento'],
        'creadoPor' => $asignacion['creado_por'],
        'createdAt' => $asignacion['created_at'],
        'updatedAt' => $asignacion['updated_at'],
        // Datos relacionados
        'equipo' => [
            'dominio' => $asignacion['equipo_dominio'],
            'marca' => $asignacion['equipo_marca'],
            'modelo' => $asignacion['equipo_modelo']
        ],
        'proyecto' => [
            'nombre' => $asignacion['proyecto_nombre'],
            'tipo' => $asignacion['proyecto_tipo']
        ],
        'centroCosto' => [
            'nombre' => $asignacion['centro_costo_nombre'],
            'codigo' => $asignacion['centro_costo_codigo']
        ]
    ];
    
    jsonResponse($asignacionFormatted);
}

function createAssignment() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        errorResponse('Datos JSON inválidos', 400);
    }
    
    $required = ['equipoId', 'proyectoId', 'centroCostoId', 'fechaInicio', 'retribucionTipo', 'retribucionValor'];
    $errors = validateRequired($input, $required);
    
    if (!empty($errors)) {
        errorResponse('Errores de validación', 400, $errors);
    }
    
    // Validar tipo de retribución
    if (!in_array($input['retribucionTipo'], ['PORCENTAJE', 'VALOR_FIJO'])) {
        errorResponse('Tipo de retribución inválido', 400);
    }
    
    // Verificar que el equipo no tenga asignaciones activas
    $asignacionesActivas = executeQuery(
        'SELECT COUNT(*) as count FROM asignaciones WHERE equipo_id = ? AND estado = "ACTIVA"',
        [$input['equipoId']]
    );
    
    if ($asignacionesActivas[0]['count'] > 0) {
        errorResponse('El equipo ya tiene una asignación activa', 400);
    }
    
    $id = 'assign-' . time();
    $estado = $input['estado'] ?? 'ACTIVA';
    
    $query = "INSERT INTO asignaciones (
        id, equipo_id, proyecto_id, centro_costo_id, fecha_inicio, fecha_fin_prevista,
        retribucion_tipo, retribucion_valor, horas_estimadas, estado, observaciones,
        validacion_mantenimiento, creado_por
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $params = [
        $id,
        $input['equipoId'],
        $input['proyectoId'],
        $input['centroCostoId'],
        $input['fechaInicio'],
        $input['fechaFinPrevista'] ?? null,
        $input['retribucionTipo'],
        $input['retribucionValor'],
        $input['horasEstimadas'] ?? null,
        $estado,
        $input['observaciones'] ?? null,
        $input['validacionMantenimiento'] ? 1 : 0,
        $input['creadoPor'] ?? null
    ];
    
    executeQuery($query, $params);
    jsonResponse([
        'message' => 'Asignación creada exitosamente',
        'id' => $id
    ], 201);
}

function updateAssignment($id) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        errorResponse('Datos JSON inválidos', 400);
    }
    
    $required = ['equipoId', 'proyectoId', 'centroCostoId', 'fechaInicio', 'retribucionTipo', 'retribucionValor'];
    $errors = validateRequired($input, $required);
    
    if (!empty($errors)) {
        errorResponse('Errores de validación', 400, $errors);
    }
    
    // Validar tipo de retribución
    if (!in_array($input['retribucionTipo'], ['PORCENTAJE', 'VALOR_FIJO'])) {
        errorResponse('Tipo de retribución inválido', 400);
    }
    
    $query = "UPDATE asignaciones SET
        equipo_id = ?, proyecto_id = ?, centro_costo_id = ?, fecha_inicio = ?,
        fecha_fin_prevista = ?, fecha_fin = ?, retribucion_tipo = ?, retribucion_valor = ?,
        horas_estimadas = ?, horas_reales = ?, costo_total = ?, estado = ?,
        observaciones = ?, validacion_mantenimiento = ?
    WHERE id = ?";
    
    $params = [
        $input['equipoId'],
        $input['proyectoId'],
        $input['centroCostoId'],
        $input['fechaInicio'],
        $input['fechaFinPrevista'] ?? null,
        $input['fechaFin'] ?? null,
        $input['retribucionTipo'],
        $input['retribucionValor'],
        $input['horasEstimadas'] ?? null,
        $input['horasReales'] ?? null,
        $input['costoTotal'] ?? null,
        $input['estado'],
        $input['observaciones'] ?? null,
        $input['validacionMantenimiento'] ? 1 : 0,
        $id
    ];
    
    $result = executeQuery($query, $params);
    
    if ($result['rowCount'] === 0) {
        errorResponse('Asignación no encontrada', 404);
    }
    
    jsonResponse(['message' => 'Asignación actualizada exitosamente']);
}

function deleteAssignment($id) {
    $result = executeQuery('DELETE FROM asignaciones WHERE id = ?', [$id]);
    
    if ($result['rowCount'] === 0) {
        errorResponse('Asignación no encontrada', 404);
    }
    
    jsonResponse(['message' => 'Asignación eliminada exitosamente']);
}
?>