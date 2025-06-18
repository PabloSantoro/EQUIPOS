#!/bin/bash
# Solución rápida para usar subdirectorio /equipos

echo "🚀 Creando solución para gepro.com.ar/equipos..."

# Crear carpeta para subdirectorio  
mkdir -p deploy-subdirectorio

# Copiar frontend
cp -r frontend/dist/* deploy-subdirectorio/

# Crear API
mkdir -p deploy-subdirectorio/api
cp -r backend-php-fixed/config deploy-subdirectorio/api/
cp -r backend-php-fixed/api/* deploy-subdirectorio/api/
mkdir -p deploy-subdirectorio/api/uploads/equipment

# Crear .htaccess para subdirectorio
cat > deploy-subdirectorio/.htaccess << 'EOF'
# .htaccess para React SPA en subdirectorio /equipos
RewriteEngine On

# Manejar las rutas de la API hacia PHP
RewriteRule ^api/equipment(.*)$ api/equipment.php$1 [QSA,L]
RewriteRule ^api/projects(.*)$ api/projects.php$1 [QSA,L] 
RewriteRule ^api/health(.*)$ api/health.php$1 [QSA,L]

# Manejar uploads de imágenes
RewriteRule ^api/uploads/(.*)$ api/uploads/$1 [QSA,L]

# Para todas las otras rutas del frontend React, servir index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/equipos/api/
RewriteRule ^(.*)$ /equipos/index.html [L]
EOF

# Actualizar CORS para subdirectorio
cat > deploy-subdirectorio/api/config/cors.php << 'EOF'
<?php
function setCorsHeaders() {
    $allowed_origins = [
        'https://gepro.com.ar',
        'https://www.gepro.com.ar',
        'http://localhost:5173'
    ];
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
    }
    
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    header("Content-Type: application/json; charset=utf-8");
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

function errorResponse($message, $status = 500, $details = null) {
    $response = ['error' => $message];
    if ($details) {
        $response['details'] = $details;
    }
    jsonResponse($response, $status);
}

function validateRequired($data, $required_fields) {
    $errors = [];
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || (is_string($data[$field]) && empty(trim($data[$field])))) {
            $errors[] = "El campo '$field' es requerido";
        }
    }
    return $errors;
}

function parseApiUrl() {
    $uri = $_SERVER['REQUEST_URI'];
    $path = parse_url($uri, PHP_URL_PATH);
    
    // Remover /equipos/api/ del inicio
    $path = preg_replace('#^/equipos/api/#', '', $path);
    
    $parts = array_filter(explode('/', $path));
    
    return array_values($parts);
}
?>
EOF

echo ""
echo "✅ Solución para SUBDIRECTORIO creada!"
echo ""
echo "📋 PASOS:"
echo "1. En public_html, crear carpeta 'equipos'"
echo "2. Subir contenido de 'deploy-subdirectorio/' a 'public_html/equipos/'"
echo "3. Probar: https://gepro.com.ar/equipos/"
echo "4. Health check: https://gepro.com.ar/equipos/api/health.php"