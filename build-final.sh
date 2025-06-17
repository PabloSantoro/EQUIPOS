#!/bin/bash
# Script FINAL para crear estructura de equipos.gepro.com.ar

echo "🚀 Creando estructura FINAL para equipos.gepro.com.ar..."

# Crear carpeta final
mkdir -p deploy-final

# Copiar frontend compilado (ignorando errores de TS pero el build funciona)
echo "📦 Copiando frontend compilado..."
cp -r frontend/dist/* deploy-final/ 2>/dev/null || :

# Crear API con estructura correcta
echo "📋 Creando estructura API..."
mkdir -p deploy-final/api
mkdir -p deploy-final/api/config
mkdir -p deploy-final/api/uploads/equipment

# Copiar backend PHP corregido
cp backend-php-fixed/config/* deploy-final/api/config/
cp backend-php-fixed/api/* deploy-final/api/

# Crear otros archivos PHP necesarios
echo "📋 Creando archivos PHP adicionales..."

# projects.php
cat > deploy-final/api/projects.php << 'EOF'
<?php
require_once 'config/database.php';
require_once 'config/cors.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$urlParts = parseApiUrl();

$project_id = isset($urlParts[0]) ? $urlParts[0] : null;

try {
    switch ($method) {
        case 'GET':
            if ($project_id) {
                getProject($project_id);
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
    
    executeQuery($query, $params);
    jsonResponse([
        'message' => 'Proyecto creado exitosamente',
        'id' => $id
    ], 201);
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
    
    $result = executeQuery($query, $params);
    
    if ($result['rowCount'] === 0) {
        errorResponse('Proyecto no encontrado', 404);
    }
    
    jsonResponse(['message' => 'Proyecto actualizado exitosamente']);
}

function deleteProject($id) {
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
EOF

# health.php
cat > deploy-final/api/health.php << 'EOF'
<?php
require_once 'config/database.php';
require_once 'config/cors.php';

setCorsHeaders();

try {
    $db = Database::getInstance();
    $connected = $db->testConnection();
    
    $response = [
        'status' => 'OK',
        'timestamp' => date('c'),
        'database' => $connected ? 'Connected' : 'Disconnected',
        'version' => '1.0.0',
        'backend' => 'PHP',
        'subdominio' => 'equipos.gepro.com.ar'
    ];
    
    if ($connected) {
        jsonResponse($response);
    } else {
        jsonResponse([
            'status' => 'ERROR',
            'timestamp' => date('c'),
            'database' => 'Error',
            'error' => 'No se pudo conectar a la base de datos'
        ], 500);
    }
    
} catch (Exception $e) {
    error_log("Error en health check: " . $e->getMessage());
    jsonResponse([
        'status' => 'ERROR',
        'timestamp' => date('c'),
        'database' => 'Error',
        'error' => $e->getMessage()
    ], 500);
}
?>
EOF

# Crear .htaccess principal
cat > deploy-final/.htaccess << 'EOF'
# .htaccess para React SPA con API PHP en subdominio equipos.gepro.com.ar
RewriteEngine On

# Manejar las rutas de la API hacia PHP
RewriteRule ^api/equipment(.*)$ api/equipment.php$1 [QSA,L]
RewriteRule ^api/projects(.*)$ api/projects.php$1 [QSA,L] 
RewriteRule ^api/cost-centers(.*)$ api/cost-centers.php$1 [QSA,L]
RewriteRule ^api/assignments(.*)$ api/assignments.php$1 [QSA,L]
RewriteRule ^api/maintenance(.*)$ api/maintenance.php$1 [QSA,L]
RewriteRule ^api/health(.*)$ api/health.php$1 [QSA,L]

# Manejar uploads de imágenes
RewriteRule ^api/uploads/(.*)$ api/uploads/$1 [QSA,L]

# Para todas las otras rutas del frontend React, servir index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule ^(.*)$ /index.html [L]

# Configuración de compresión
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Configuración de caché
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Configuración CORS para API
<IfModule mod_headers.c>
    # Permitir CORS desde el subdominio
    Header always set Access-Control-Allow-Origin "https://equipos.gepro.com.ar"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    Header always set Access-Control-Allow-Credentials "true"
    
    # Seguridad
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options SAMEORIGIN
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
EOF

# Crear .htaccess para API
cat > deploy-final/api/.htaccess << 'EOF'
# .htaccess para API PHP
RewriteEngine On

# Configurar API endpoints
RewriteRule ^equipment/?(.*)$ equipment.php [QSA,L]
RewriteRule ^projects/?(.*)$ projects.php [QSA,L]
RewriteRule ^cost-centers/?(.*)$ cost-centers.php [QSA,L]
RewriteRule ^assignments/?(.*)$ assignments.php [QSA,L]
RewriteRule ^maintenance/?(.*)$ maintenance.php [QSA,L]
RewriteRule ^health/?$ health.php [QSA,L]

# Servir uploads de imágenes
RewriteRule ^uploads/(.*)$ uploads/$1 [QSA,L]

# Configuración PHP
php_value upload_max_filesize 5M
php_value post_max_size 5M
php_value max_execution_time 30
php_value max_input_time 30

# Ocultar información del servidor
ServerSignature Off

# Configuración de errores
php_flag display_errors Off
php_flag log_errors On
EOF

# Crear archivo de instrucciones
cat > deploy-final/INSTRUCCIONES.txt << 'EOF'
🎯 INSTRUCCIONES PARA SUBIR A equipos.gepro.com.ar

📍 UBICACIÓN: /domains/equipos.gepro.com.ar/public_html/

📂 COPIAR TODO EL CONTENIDO DE deploy-final/ A:
/domains/equipos.gepro.com.ar/public_html/

📋 ESTRUCTURA FINAL EN EL SERVIDOR:
/domains/equipos.gepro.com.ar/public_html/
├── index.html (archivo principal React)
├── assets/ (CSS y JS compilados) 
├── vite.svg (favicon)
├── .htaccess (configuración Apache)
└── api/ (backend PHP)
    ├── equipment.php (API equipos)
    ├── projects.php (API proyectos) 
    ├── health.php (health check)
    ├── config/ (configuración BD)
    │   ├── database.php
    │   └── cors.php
    ├── uploads/ (imágenes)
    │   └── equipment/
    └── .htaccess (ruteo API)

🗄️ BASE DE DATOS (YA CONFIGURADA):
- Host: 62.72.62.1
- DB: u302432817_gchkd  
- User: u302432817_ILTEF
- Pass: Puertas3489*

✅ PERMISOS NECESARIOS:
chmod 755 api/uploads/
chmod 755 api/uploads/equipment/

🌐 URLS FINALES:
- Aplicación: https://equipos.gepro.com.ar/
- Health Check: https://equipos.gepro.com.ar/api/health.php

🔧 PASOS:
1. Crear subdominio 'equipos' en cPanel
2. Subir contenido de deploy-final/ 
3. Configurar permisos uploads/
4. Probar health check
5. ¡Listo!
EOF

echo ""
echo "✅ Estructura FINAL creada en deploy-final/"
echo ""
echo "📋 QUE COPIAR A equipos.gepro.com.ar/public_html/:"
echo "→ TODO el contenido de la carpeta 'deploy-final/'"
echo ""
echo "📖 Lee INSTRUCCIONES.txt para detalles completos"