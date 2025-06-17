<?php
// Configuración CORS para GEPRO
function setCorsHeaders() {
    $allowed_origins = [
        'https://equipos.gepro.com.ar',
        'https://www.equipos.gepro.com.ar', 
        'http://localhost:5173' // Para desarrollo
    ];
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
    }
    
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    header("Content-Type: application/json; charset=utf-8");
    
    // Manejar preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// Función para responder con JSON
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

// Función para responder con error
function errorResponse($message, $status = 500, $details = null) {
    $response = ['error' => $message];
    if ($details) {
        $response['details'] = $details;
    }
    jsonResponse($response, $status);
}

// Función para validar datos requeridos
function validateRequired($data, $required_fields) {
    $errors = [];
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || (is_string($data[$field]) && empty(trim($data[$field])))) {
            $errors[] = "El campo '$field' es requerido";
        }
    }
    return $errors;
}

// Función para sanitizar entrada
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

// Función para parsear la URL y obtener parámetros
function parseApiUrl() {
    $uri = $_SERVER['REQUEST_URI'];
    $path = parse_url($uri, PHP_URL_PATH);
    
    // Remover /api/ del inicio
    $path = preg_replace('#^/api/#', '', $path);
    
    // Dividir en partes
    $parts = array_filter(explode('/', $path));
    
    return array_values($parts);
}
?>