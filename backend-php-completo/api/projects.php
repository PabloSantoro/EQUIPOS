<?php
/**
 * API de Projects para GEPRO - Migrado completo desde Node.js
 */
require_once '../config/database.php';
require_once '../config/cors.php';

setCorsHeaders();
logRequest();
checkRateLimit($_SERVER['REMOTE_ADDR'] ?? 'unknown', 100, 15);

$method = $_SERVER['REQUEST_METHOD'];
$urlParts = parseApiUrl();
$project_id = isset($urlParts[0]) ? $urlParts[0] : null;

try {
    switch ($method) {
        case 'GET':
            if ($project_id) {
                getProjectById($project_id);
            } else {
                getAllProjects();
            }
            break;
        case 'POST':
            createProject();
            break;
        case 'PUT':
            if ($project_id) {
                updateProject($project_id);
            } else {
                errorResponse('ID de proyecto requerido', 400);
            }
            break;
        case 'DELETE':
            if ($project_id) {
                deleteProject($project_id);
            } else {
                errorResponse('ID de proyecto requerido', 400);
            }
            break;
        default:
            errorResponse('Método HTTP no permitido', 405);
    }
} catch (Exception $e) {
    error_log("Error en projects.php: " . $e->getMessage());
    errorResponse('Error interno del servidor', 500, $e->getMessage());
}

function getAllProjects() {
    $estado = $_GET['estado'] ?? null;
    $tipo = $_GET['tipo'] ?? null;
    
    $query = 'SELECT * FROM proyectos WHERE 1=1';
    $params = [];
    
    if ($estado) {
        $query .= ' AND estado = ?';
        $params[] = $estado;
    }
    
    if ($tipo) {
        $query .= ' AND tipo = ?';
        $params[] = $tipo;
    }
    
    $query .= ' ORDER BY nombre ASC';
    
    try {
        $proyectos = executeQuery($query, $params);
        $proyectosFormatted = array_map('formatProjectForResponse', $proyectos);
        jsonResponse($proyectosFormatted);
    } catch (Exception $e) {
        errorResponse('Error obteniendo proyectos', 500);
    }
}

function getProjectById($id) {
    try {
        $proyectos = executeQuery('SELECT * FROM proyectos WHERE id = ?', [$id]);
        if (empty($proyectos)) {
            errorResponse('Proyecto no encontrado', 404);
        }
        $proyectoFormatted = formatProjectForResponse($proyectos[0]);
        jsonResponse($proyectoFormatted);
    } catch (Exception $e) {
        errorResponse('Error obteniendo proyecto', 500);
    }
}

function createProject() {
    $input = getRequestBody();
    if (!$input) {
        errorResponse('Datos JSON requeridos', 400);
    }
    
    $validationRules = [
        'nombre' => ['required' => true, 'max_length' => 200],
        'tipo' => ['required' => true, 'enum' => ['INTERNO', 'EXTERNO']],
        'responsable' => ['required' => true, 'max_length' => 100]
    ];
    
    $errors = validateRequired($input, $validationRules);
    if (!empty($errors)) {
        errorResponse('Errores de validación', 400, $errors);
    }
    
    try {
        $id = 'proj-' . time();
        $estado = $input['estado'] ?? 'ACTIVO';
        
        $query = "INSERT INTO proyectos (
            id, nombre, tipo, descripcion, costo_hora, porcentaje_costo,
            fecha_inicio, fecha_fin_prevista, responsable, cliente, estado, presupuesto
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $params = [
            $id, $input['nombre'], $input['tipo'], $input['descripcion'] ?? null,
            isset($input['costoHora']) ? (float)$input['costoHora'] : null,
            isset($input['porcentajeCosto']) ? (float)$input['porcentajeCosto'] : null,
            $input['fechaInicio'] ?? null, $input['fechaFinPrevista'] ?? null,
            $input['responsable'], $input['cliente'] ?? null, $estado,
            isset($input['presupuesto']) ? (float)$input['presupuesto'] : null
        ];
        
        executeQuery($query, $params);
        jsonResponse(['message' => 'Proyecto creado exitosamente', 'id' => $id], 201);
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
            errorResponse('Ya existe un proyecto con ese nombre', 409);
        } else {
            errorResponse('Error creando proyecto', 500);
        }
    }
}

function updateProject($id) {
    $input = getRequestBody();
    if (!$input) {
        errorResponse('Datos JSON requeridos', 400);
    }
    
    $validationRules = [
        'nombre' => ['required' => true, 'max_length' => 200],
        'tipo' => ['required' => true, 'enum' => ['INTERNO', 'EXTERNO']],
        'responsable' => ['required' => true, 'max_length' => 100]
    ];
    
    $errors = validateRequired($input, $validationRules);
    if (!empty($errors)) {
        errorResponse('Errores de validación', 400, $errors);
    }
    
    try {
        $query = "UPDATE proyectos SET
            nombre = ?, tipo = ?, descripcion = ?, costo_hora = ?, porcentaje_costo = ?,
            fecha_inicio = ?, fecha_fin_prevista = ?, responsable = ?, cliente = ?, 
            estado = ?, presupuesto = ?
        WHERE id = ?";
        
        $params = [
            $input['nombre'], $input['tipo'], $input['descripcion'] ?? null,
            isset($input['costoHora']) ? (float)$input['costoHora'] : null,
            isset($input['porcentajeCosto']) ? (float)$input['porcentajeCosto'] : null,
            $input['fechaInicio'] ?? null, $input['fechaFinPrevista'] ?? null,
            $input['responsable'], $input['cliente'] ?? null, $input['estado'],
            isset($input['presupuesto']) ? (float)$input['presupuesto'] : null, $id
        ];
        
        $result = executeQuery($query, $params);
        if ($result['rowCount'] === 0) {
            errorResponse('Proyecto no encontrado', 404);
        }
        jsonResponse(['message' => 'Proyecto actualizado exitosamente']);
    } catch (Exception $e) {
        errorResponse('Error actualizando proyecto', 500);
    }
}

function deleteProject($id) {
    try {
        $asignaciones = executeQuery(
            'SELECT COUNT(*) as count FROM asignaciones WHERE proyecto_id = ? AND estado = "ACTIVA"',
            [$id]
        );
        
        if ($asignaciones[0]['count'] > 0) {
            errorResponse('No se puede eliminar el proyecto porque tiene asignaciones activas', 400);
        }
        
        $result = executeQuery('DELETE FROM proyectos WHERE id = ?', [$id]);
        if ($result['rowCount'] === 0) {
            errorResponse('Proyecto no encontrado', 404);
        }
        jsonResponse(['message' => 'Proyecto eliminado exitosamente']);
    } catch (Exception $e) {
        errorResponse('Error eliminando proyecto', 500);
    }
}

function formatProjectForResponse($proyecto) {
    return [
        'id' => $proyecto['id'],
        'nombre' => $proyecto['nombre'],
        'tipo' => $proyecto['tipo'],
        'descripcion' => $proyecto['descripcion'],
        'costoHora' => $proyecto['costo_hora'] ? (float)$proyecto['costo_hora'] : null,
        'porcentajeCosto' => $proyecto['porcentaje_costo'] ? (float)$proyecto['porcentaje_costo'] : null,
        'fechaInicio' => $proyecto['fecha_inicio'],
        'fechaFinPrevista' => $proyecto['fecha_fin_prevista'],
        'responsable' => $proyecto['responsable'],
        'cliente' => $proyecto['cliente'],
        'estado' => $proyecto['estado'],
        'presupuesto' => $proyecto['presupuesto'] ? (float)$proyecto['presupuesto'] : null,
        'createdAt' => $proyecto['created_at'],
        'updatedAt' => $proyecto['updated_at']
    ];
}
?>