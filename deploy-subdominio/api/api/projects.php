<?php
require_once '../config/database.php';
require_once '../config/cors.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));

// Extraer ID del proyecto si está presente
$project_id = null;
if (count($path_parts) >= 4 && $path_parts[3] !== '') {
    $project_id = $path_parts[3];
}

try {
    switch ($method) {
        case 'GET':
            if ($project_id) {
                // GET /api/projects/{id}
                getProject($project_id);
            } else {
                // GET /api/projects
                getAllProjects();
            }
            break;
            
        case 'POST':
            // POST /api/projects
            createProject();
            break;
            
        case 'PUT':
            if ($project_id) {
                // PUT /api/projects/{id}
                updateProject($project_id);
            } else {
                errorResponse('ID de proyecto requerido', 400);
            }
            break;
            
        case 'DELETE':
            if ($project_id) {
                // DELETE /api/projects/{id}
                deleteProject($project_id);
            } else {
                errorResponse('ID de proyecto requerido', 400);
            }
            break;
            
        default:
            errorResponse('Método no permitido', 405);
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
    
    $proyectos = executeQuery($query, $params);
    
    // Formatear datos para el frontend
    $proyectosFormatted = array_map(function($proyecto) {
        return [
            'id' => $proyecto['id'],
            'nombre' => $proyecto['nombre'],
            'tipo' => $proyecto['tipo'],
            'descripcion' => $proyecto['descripcion'],
            'costoHora' => (float)($proyecto['costo_hora'] ?? 0),
            'porcentajeCosto' => (float)($proyecto['porcentaje_costo'] ?? 0),
            'fechaInicio' => $proyecto['fecha_inicio'],
            'fechaFinPrevista' => $proyecto['fecha_fin_prevista'],
            'responsable' => $proyecto['responsable'],
            'cliente' => $proyecto['cliente'],
            'estado' => $proyecto['estado'],
            'presupuesto' => (float)($proyecto['presupuesto'] ?? 0),
            'createdAt' => $proyecto['created_at'],
            'updatedAt' => $proyecto['updated_at']
        ];
    }, $proyectos);
    
    jsonResponse($proyectosFormatted);
}

function getProject($id) {
    $proyectos = executeQuery('SELECT * FROM proyectos WHERE id = ?', [$id]);
    
    if (empty($proyectos)) {
        errorResponse('Proyecto no encontrado', 404);
    }
    
    $proyecto = $proyectos[0];
    $proyectoFormatted = [
        'id' => $proyecto['id'],
        'nombre' => $proyecto['nombre'],
        'tipo' => $proyecto['tipo'],
        'descripcion' => $proyecto['descripcion'],
        'costoHora' => (float)($proyecto['costo_hora'] ?? 0),
        'porcentajeCosto' => (float)($proyecto['porcentaje_costo'] ?? 0),
        'fechaInicio' => $proyecto['fecha_inicio'],
        'fechaFinPrevista' => $proyecto['fecha_fin_prevista'],
        'responsable' => $proyecto['responsable'],
        'cliente' => $proyecto['cliente'],
        'estado' => $proyecto['estado'],
        'presupuesto' => (float)($proyecto['presupuesto'] ?? 0),
        'createdAt' => $proyecto['created_at'],
        'updatedAt' => $proyecto['updated_at']
    ];
    
    jsonResponse($proyectoFormatted);
}

function createProject() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        errorResponse('Datos JSON inválidos', 400);
    }
    
    $required = ['nombre', 'tipo', 'responsable'];
    $errors = validateRequired($input, $required);
    
    if (!empty($errors)) {
        errorResponse('Errores de validación', 400, $errors);
    }
    
    // Validar tipo de proyecto
    if (!in_array($input['tipo'], ['INTERNO', 'EXTERNO'])) {
        errorResponse('Tipo de proyecto inválido', 400);
    }
    
    $id = 'proj-' . time();
    $estado = $input['estado'] ?? 'ACTIVO';
    
    $query = "INSERT INTO proyectos (
        id, nombre, tipo, descripcion, costo_hora, porcentaje_costo,
        fecha_inicio, fecha_fin_prevista, responsable, cliente, estado, presupuesto
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $params = [
        $id,
        $input['nombre'],
        $input['tipo'],
        $input['descripcion'] ?? null,
        $input['costoHora'] ?? null,
        $input['porcentajeCosto'] ?? null,
        $input['fechaInicio'] ?? null,
        $input['fechaFinPrevista'] ?? null,
        $input['responsable'],
        $input['cliente'] ?? null,
        $estado,
        $input['presupuesto'] ?? null
    ];
    
    try {
        executeQuery($query, $params);
        jsonResponse([
            'message' => 'Proyecto creado exitosamente',
            'id' => $id
        ], 201);
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
            errorResponse('Ya existe un proyecto con ese nombre', 409);
        } else {
            throw $e;
        }
    }
}

function updateProject($id) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        errorResponse('Datos JSON inválidos', 400);
    }
    
    $required = ['nombre', 'tipo', 'responsable'];
    $errors = validateRequired($input, $required);
    
    if (!empty($errors)) {
        errorResponse('Errores de validación', 400, $errors);
    }
    
    // Validar tipo de proyecto
    if (!in_array($input['tipo'], ['INTERNO', 'EXTERNO'])) {
        errorResponse('Tipo de proyecto inválido', 400);
    }
    
    $query = "UPDATE proyectos SET
        nombre = ?, tipo = ?, descripcion = ?, costo_hora = ?, porcentaje_costo = ?,
        fecha_inicio = ?, fecha_fin_prevista = ?, responsable = ?, cliente = ?, 
        estado = ?, presupuesto = ?
    WHERE id = ?";
    
    $params = [
        $input['nombre'],
        $input['tipo'],
        $input['descripcion'] ?? null,
        $input['costoHora'] ?? null,
        $input['porcentajeCosto'] ?? null,
        $input['fechaInicio'] ?? null,
        $input['fechaFinPrevista'] ?? null,
        $input['responsable'],
        $input['cliente'] ?? null,
        $input['estado'],
        $input['presupuesto'] ?? null,
        $id
    ];
    
    try {
        $result = executeQuery($query, $params);
        
        if ($result['rowCount'] === 0) {
            errorResponse('Proyecto no encontrado', 404);
        }
        
        jsonResponse(['message' => 'Proyecto actualizado exitosamente']);
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
            errorResponse('Ya existe un proyecto con ese nombre', 409);
        } else {
            throw $e;
        }
    }
}

function deleteProject($id) {
    // Verificar si tiene asignaciones activas
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
}
?>