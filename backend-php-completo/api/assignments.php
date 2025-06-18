<?php
/**
 * API de Assignments para GEPRO
 * Migrado completamente desde Node.js con TODAS las funcionalidades del dashboard
 */

require_once '../config/database.php';
require_once '../config/cors.php';

// Configurar CORS y logging
setCorsHeaders();
logRequest();

// Rate limiting
checkRateLimit($_SERVER['REMOTE_ADDR'] ?? 'unknown', 100, 15);

$method = $_SERVER['REQUEST_METHOD'];
$urlParts = parseApiUrl();

// Parsear ruta: /api/assignments[/{id}][/{action}][/{subaction}]
$assignment_id = isset($urlParts[0]) ? $urlParts[0] : null;
$action = isset($urlParts[1]) ? $urlParts[1] : null;
$subaction = isset($urlParts[2]) ? $urlParts[2] : null;

try {
    switch ($method) {
        case 'GET':
            if ($assignment_id === 'stats' && $action === 'dashboard') {
                // GET /api/assignments/stats/dashboard - ENDPOINT CRÍTICO DEL DASHBOARD
                getAssignmentDashboardStats();
            } elseif ($assignment_id) {
                // GET /api/assignments/{id}
                getAssignmentById($assignment_id);
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
                errorResponse('ID de asignación requerido para actualización', 400);
            }
            break;
            
        case 'DELETE':
            if ($assignment_id) {
                // DELETE /api/assignments/{id}
                deleteAssignment($assignment_id);
            } else {
                errorResponse('ID de asignación requerido para eliminación', 400);
            }
            break;
            
        default:
            errorResponse('Método HTTP no permitido', 405);
    }
    
} catch (Exception $e) {
    error_log("Error en assignments.php: " . $e->getMessage());
    errorResponse('Error interno del servidor', 500, $e->getMessage());
}

/**
 * GET /api/assignments/stats/dashboard - ESTADÍSTICAS CRÍTICAS DEL DASHBOARD
 * Migrado exactamente desde Node.js con todos los cálculos agregados
 */
function getAssignmentDashboardStats() {
    try {
        // Query compleja para estadísticas (exacta del Node.js)
        $statsQuery = "
            SELECT 
                COUNT(*) as total_asignaciones,
                SUM(CASE WHEN estado = 'ACTIVA' THEN 1 ELSE 0 END) as activas,
                SUM(CASE WHEN estado = 'FINALIZADA' THEN 1 ELSE 0 END) as finalizadas,
                SUM(CASE WHEN estado = 'SUSPENDIDA' THEN 1 ELSE 0 END) as suspendidas,
                SUM(CASE WHEN estado = 'CANCELADA' THEN 1 ELSE 0 END) as canceladas,
                SUM(CASE WHEN costo_total IS NOT NULL THEN costo_total ELSE 0 END) as costo_total_suma,
                SUM(CASE WHEN horas_estimadas IS NOT NULL THEN horas_estimadas ELSE 0 END) as horas_estimadas_total,
                SUM(CASE WHEN horas_reales IS NOT NULL THEN horas_reales ELSE 0 END) as horas_reales_total,
                AVG(CASE WHEN costo_total IS NOT NULL AND costo_total > 0 THEN costo_total ELSE NULL END) as costo_promedio
            FROM asignaciones
        ";
        
        $stats = executeQuery($statsQuery);
        $statsData = $stats[0];
        
        // Estadísticas por proyecto (equivalente a Node.js)
        $projectStatsQuery = "
            SELECT 
                p.id,
                p.nombre,
                p.tipo,
                COUNT(a.id) as total_asignaciones,
                SUM(CASE WHEN a.estado = 'ACTIVA' THEN 1 ELSE 0 END) as activas,
                SUM(CASE WHEN a.costo_total IS NOT NULL THEN a.costo_total ELSE 0 END) as costo_total
            FROM proyectos p
            LEFT JOIN asignaciones a ON p.id = a.proyecto_id
            GROUP BY p.id, p.nombre, p.tipo
            HAVING total_asignaciones > 0
            ORDER BY costo_total DESC
            LIMIT 10
        ";
        
        $projectStats = executeQuery($projectStatsQuery);
        
        // Estadísticas por centro de costo (equivalente a Node.js)
        $costCenterStatsQuery = "
            SELECT 
                cc.id,
                cc.nombre,
                cc.codigo,
                COUNT(a.id) as total_asignaciones,
                SUM(CASE WHEN a.estado = 'ACTIVA' THEN 1 ELSE 0 END) as activas,
                SUM(CASE WHEN a.costo_total IS NOT NULL THEN a.costo_total ELSE 0 END) as costo_total
            FROM centros_costo cc
            LEFT JOIN asignaciones a ON cc.id = a.centro_costo_id
            GROUP BY cc.id, cc.nombre, cc.codigo
            HAVING total_asignaciones > 0
            ORDER BY costo_total DESC
            LIMIT 10
        ";
        
        $costCenterStats = executeQuery($costCenterStatsQuery);
        
        // Asignaciones recientes (últimas 10)
        $recentAssignmentsQuery = "
            SELECT 
                a.id,
                a.estado,
                a.fecha_inicio,
                a.costo_total,
                e.dominio as equipo_dominio,
                p.nombre as proyecto_nombre,
                cc.nombre as centro_costo_nombre
            FROM asignaciones a
            LEFT JOIN equipos e ON a.equipo_id = e.id
            LEFT JOIN proyectos p ON a.proyecto_id = p.id
            LEFT JOIN centros_costo cc ON a.centro_costo_id = cc.id
            ORDER BY a.created_at DESC
            LIMIT 10
        ";
        
        $recentAssignments = executeQuery($recentAssignmentsQuery);
        
        // Tendencias mensuales (último año)
        $trendsQuery = "
            SELECT 
                DATE_FORMAT(fecha_inicio, '%Y-%m') as mes,
                COUNT(*) as total_asignaciones,
                SUM(CASE WHEN estado = 'ACTIVA' THEN 1 ELSE 0 END) as activas,
                SUM(CASE WHEN costo_total IS NOT NULL THEN costo_total ELSE 0 END) as costo_total
            FROM asignaciones
            WHERE fecha_inicio >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(fecha_inicio, '%Y-%m')
            ORDER BY mes DESC
        ";
        
        $trends = executeQuery($trendsQuery);
        
        // Formatear respuesta exactamente como Node.js
        $response = [
            'resumen' => [
                'total_asignaciones' => (int)$statsData['total_asignaciones'],
                'activas' => (int)$statsData['activas'],
                'finalizadas' => (int)$statsData['finalizadas'],
                'suspendidas' => (int)$statsData['suspendidas'],
                'canceladas' => (int)$statsData['canceladas'],
                'costo_total' => (float)$statsData['costo_total_suma'],
                'horas_estimadas_total' => (float)$statsData['horas_estimadas_total'],
                'horas_reales_total' => (float)$statsData['horas_reales_total'],
                'costo_promedio' => $statsData['costo_promedio'] ? (float)$statsData['costo_promedio'] : 0
            ],
            'por_proyecto' => array_map(function($item) {
                return [
                    'proyecto_id' => $item['id'],
                    'proyecto_nombre' => $item['nombre'],
                    'proyecto_tipo' => $item['tipo'],
                    'total_asignaciones' => (int)$item['total_asignaciones'],
                    'activas' => (int)$item['activas'],
                    'costo_total' => (float)$item['costo_total']
                ];
            }, $projectStats),
            'por_centro_costo' => array_map(function($item) {
                return [
                    'centro_costo_id' => $item['id'],
                    'centro_costo_nombre' => $item['nombre'],
                    'centro_costo_codigo' => $item['codigo'],
                    'total_asignaciones' => (int)$item['total_asignaciones'],
                    'activas' => (int)$item['activas'],
                    'costo_total' => (float)$item['costo_total']
                ];
            }, $costCenterStats),
            'asignaciones_recientes' => array_map(function($item) {
                return [
                    'id' => $item['id'],
                    'estado' => $item['estado'],
                    'fecha_inicio' => $item['fecha_inicio'],
                    'costo_total' => $item['costo_total'] ? (float)$item['costo_total'] : null,
                    'equipo_dominio' => $item['equipo_dominio'],
                    'proyecto_nombre' => $item['proyecto_nombre'],
                    'centro_costo_nombre' => $item['centro_costo_nombre']
                ];
            }, $recentAssignments),
            'tendencias_mensuales' => array_map(function($item) {
                return [
                    'mes' => $item['mes'],
                    'total_asignaciones' => (int)$item['total_asignaciones'],
                    'activas' => (int)$item['activas'],
                    'costo_total' => (float)$item['costo_total']
                ];
            }, $trends),
            'calculado_en' => date('c')
        ];
        
        jsonResponse($response);
        
    } catch (Exception $e) {
        error_log("Error en getAssignmentDashboardStats: " . $e->getMessage());
        errorResponse('Error obteniendo estadísticas del dashboard', 500);
    }
}

/**
 * GET /api/assignments - Obtener todas las asignaciones con filtros
 * Equivalente completo a la función de Node.js
 */
function getAllAssignments() {
    $estado = $_GET['estado'] ?? null;
    $equipo_id = $_GET['equipo_id'] ?? null;
    $proyecto_id = $_GET['proyecto_id'] ?? null;
    $centro_costo_id = $_GET['centro_costo_id'] ?? null;
    
    // Query con joins completos (exacto del Node.js)
    $query = "
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
    ";
    
    $params = [];
    
    // Aplicar filtros
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
    
    if ($centro_costo_id) {
        $query .= ' AND a.centro_costo_id = ?';
        $params[] = $centro_costo_id;
    }
    
    $query .= ' ORDER BY a.fecha_inicio DESC';
    
    try {
        $asignaciones = executeQuery($query, $params);
        
        // Formatear respuesta exactamente como Node.js
        $asignacionesFormatted = array_map('formatAssignmentForResponse', $asignaciones);
        
        jsonResponse($asignacionesFormatted);
        
    } catch (Exception $e) {
        error_log("Error en getAllAssignments: " . $e->getMessage());
        errorResponse('Error obteniendo asignaciones', 500);
    }
}

/**
 * GET /api/assignments/{id} - Obtener asignación específica
 */
function getAssignmentById($id) {
    try {
        $query = "
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
        ";
        
        $asignaciones = executeQuery($query, [$id]);
        
        if (empty($asignaciones)) {
            errorResponse('Asignación no encontrada', 404);
        }
        
        $asignacionFormatted = formatAssignmentForResponse($asignaciones[0]);
        jsonResponse($asignacionFormatted);
        
    } catch (Exception $e) {
        error_log("Error en getAssignmentById: " . $e->getMessage());
        errorResponse('Error obteniendo asignación', 500);
    }
}

/**
 * POST /api/assignments - Crear nueva asignación
 * Equivalente completo con todas las validaciones de Node.js
 */
function createAssignment() {
    $input = getRequestBody();
    
    if (!$input) {
        errorResponse('Datos JSON requeridos', 400);
    }
    
    // Validaciones complejas equivalentes a express-validator
    $validationRules = [
        'equipoId' => ['required' => true],
        'proyectoId' => ['required' => true],
        'centroCostoId' => ['required' => true],
        'fechaInicio' => ['required' => true, 'type' => 'date'],
        'retribucionTipo' => ['required' => true, 'enum' => ['PORCENTAJE', 'VALOR_FIJO']],
        'retribucionValor' => ['required' => true, 'type' => 'float', 'min' => 0]
    ];
    
    $errors = validateRequired($input, $validationRules);
    
    if (!empty($errors)) {
        errorResponse('Errores de validación', 400, $errors);
    }
    
    try {
        // Verificar que el equipo no tenga asignaciones activas (lógica de Node.js)
        $asignacionesActivas = executeQuery(
            'SELECT COUNT(*) as count FROM asignaciones WHERE equipo_id = ? AND estado = "ACTIVA"',
            [$input['equipoId']]
        );
        
        if ($asignacionesActivas[0]['count'] > 0) {
            errorResponse('El equipo ya tiene una asignación activa', 400, [
                'equipo_id' => $input['equipoId'],
                'asignaciones_activas' => (int)$asignacionesActivas[0]['count']
            ]);
        }
        
        // Generar ID único
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
            (float)$input['retribucionValor'],
            isset($input['horasEstimadas']) ? (float)$input['horasEstimadas'] : null,
            $estado,
            $input['observaciones'] ?? null,
            isset($input['validacionMantenimiento']) ? (int)$input['validacionMantenimiento'] : 0,
            $input['creadoPor'] ?? null
        ];
        
        executeQuery($query, $params);
        
        jsonResponse([
            'message' => 'Asignación creada exitosamente',
            'id' => $id
        ], 201);
        
    } catch (Exception $e) {
        error_log("Error en createAssignment: " . $e->getMessage());
        errorResponse('Error creando asignación', 500);
    }
}

/**
 * PUT /api/assignments/{id} - Actualizar asignación
 */
function updateAssignment($id) {
    $input = getRequestBody();
    
    if (!$input) {
        errorResponse('Datos JSON requeridos', 400);
    }
    
    // Validaciones similares a create
    $validationRules = [
        'equipoId' => ['required' => true],
        'proyectoId' => ['required' => true],
        'centroCostoId' => ['required' => true],
        'fechaInicio' => ['required' => true, 'type' => 'date'],
        'retribucionTipo' => ['required' => true, 'enum' => ['PORCENTAJE', 'VALOR_FIJO']],
        'retribucionValor' => ['required' => true, 'type' => 'float', 'min' => 0]
    ];
    
    $errors = validateRequired($input, $validationRules);
    
    if (!empty($errors)) {
        errorResponse('Errores de validación', 400, $errors);
    }
    
    try {
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
            (float)$input['retribucionValor'],
            isset($input['horasEstimadas']) ? (float)$input['horasEstimadas'] : null,
            isset($input['horasReales']) ? (float)$input['horasReales'] : null,
            isset($input['costoTotal']) ? (float)$input['costoTotal'] : null,
            $input['estado'],
            $input['observaciones'] ?? null,
            isset($input['validacionMantenimiento']) ? (int)$input['validacionMantenimiento'] : 0,
            $id
        ];
        
        $result = executeQuery($query, $params);
        
        if ($result['rowCount'] === 0) {
            errorResponse('Asignación no encontrada', 404);
        }
        
        jsonResponse(['message' => 'Asignación actualizada exitosamente']);
        
    } catch (Exception $e) {
        error_log("Error en updateAssignment: " . $e->getMessage());
        errorResponse('Error actualizando asignación', 500);
    }
}

/**
 * DELETE /api/assignments/{id} - Eliminar asignación
 */
function deleteAssignment($id) {
    try {
        $result = executeQuery('DELETE FROM asignaciones WHERE id = ?', [$id]);
        
        if ($result['rowCount'] === 0) {
            errorResponse('Asignación no encontrada', 404);
        }
        
        jsonResponse(['message' => 'Asignación eliminada exitosamente']);
        
    } catch (Exception $e) {
        error_log("Error en deleteAssignment: " . $e->getMessage());
        errorResponse('Error eliminando asignación', 500);
    }
}

/**
 * Formatear asignación para respuesta (equivalente al formateo de Node.js)
 */
function formatAssignmentForResponse($asignacion) {
    return [
        'id' => $asignacion['id'],
        'equipoId' => $asignacion['equipo_id'],
        'proyectoId' => $asignacion['proyecto_id'],
        'centroCostoId' => $asignacion['centro_costo_id'],
        'fechaInicio' => $asignacion['fecha_inicio'],
        'fechaFinPrevista' => $asignacion['fecha_fin_prevista'],
        'fechaFin' => $asignacion['fecha_fin'],
        'retribucionTipo' => $asignacion['retribucion_tipo'],
        'retribucionValor' => $asignacion['retribucion_valor'] ? (float)$asignacion['retribucion_valor'] : null,
        'horasEstimadas' => $asignacion['horas_estimadas'] ? (float)$asignacion['horas_estimadas'] : null,
        'horasReales' => $asignacion['horas_reales'] ? (float)$asignacion['horas_reales'] : null,
        'costoTotal' => $asignacion['costo_total'] ? (float)$asignacion['costo_total'] : null,
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
}
?>