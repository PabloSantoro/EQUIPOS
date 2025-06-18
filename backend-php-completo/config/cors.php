<?php
/**
 * Configuración CORS y utilidades globales para GEPRO
 * Migrado desde Node.js con funcionalidades avanzadas
 */

/**
 * Configurar headers CORS (equivalente a configuración de Node.js)
 */
function setCorsHeaders() {
    $allowed_origins = [
        'https://equipos.gepro.com.ar',
        'https://www.equipos.gepro.com.ar',
        'https://gepro.com.ar',
        'https://www.gepro.com.ar',
        'http://localhost:5173',  // Desarrollo
        'http://localhost:3000',  // Desarrollo alternativo
        'http://127.0.0.1:5173'   // IP local
    ];
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        // En producción, permitir solo dominios específicos
        header("Access-Control-Allow-Origin: https://equipos.gepro.com.ar");
    }
    
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-HTTP-Method-Override");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400"); // Cache preflight por 24 horas
    header("Content-Type: application/json; charset=utf-8");
    
    // Manejar preflight requests (OPTIONS)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

/**
 * Respuesta JSON estandarizada (equivalente a res.json de Express)
 */
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    
    // Agregar metadata como en Node.js
    $response = [
        'data' => $data,
        'status' => $status,
        'timestamp' => date('c'),
        'server' => 'GEPRO-PHP'
    ];
    
    // Si es un error, restructurar
    if ($status >= 400) {
        $response = [
            'error' => is_array($data) ? $data : ['message' => $data],
            'status' => $status,
            'timestamp' => date('c'),
            'server' => 'GEPRO-PHP'
        ];
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION);
    exit();
}

/**
 * Respuesta de error estandarizada (equivalente a manejo de errores de Express)
 */
function errorResponse($message, $status = 500, $details = null) {
    $error = [
        'message' => $message,
        'code' => $status
    ];
    
    if ($details) {
        if (is_array($details)) {
            $error['details'] = $details;
        } else {
            $error['details'] = ['info' => $details];
        }
    }
    
    // Log del error para debugging
    error_log("API Error [$status]: $message" . ($details ? " | Details: " . json_encode($details) : ""));
    
    jsonResponse($error, $status);
}

/**
 * Validación de campos requeridos (equivalente a express-validator)
 */
function validateRequired($data, $required_fields) {
    $errors = [];
    
    foreach ($required_fields as $field => $rules) {
        $fieldName = is_numeric($field) ? $rules : $field;
        $fieldRules = is_array($rules) ? $rules : ['required' => true];
        
        $value = $data[$fieldName] ?? null;
        
        // Verificar campo requerido
        if (isset($fieldRules['required']) && $fieldRules['required']) {
            if ($value === null || $value === '' || (is_string($value) && trim($value) === '')) {
                $errors[] = [
                    'field' => $fieldName,
                    'message' => "El campo '$fieldName' es requerido",
                    'code' => 'REQUIRED'
                ];
                continue;
            }
        }
        
        // Validaciones adicionales si el campo tiene valor
        if ($value !== null && $value !== '') {
            // Validar tipo
            if (isset($fieldRules['type'])) {
                $isValid = match($fieldRules['type']) {
                    'email' => filter_var($value, FILTER_VALIDATE_EMAIL) !== false,
                    'int' => filter_var($value, FILTER_VALIDATE_INT) !== false,
                    'float' => filter_var($value, FILTER_VALIDATE_FLOAT) !== false,
                    'date' => DateTime::createFromFormat('Y-m-d', $value) !== false,
                    'datetime' => DateTime::createFromFormat('Y-m-d H:i:s', $value) !== false || DateTime::createFromFormat('c', $value) !== false,
                    'string' => is_string($value),
                    'array' => is_array($value),
                    default => true
                };
                
                if (!$isValid) {
                    $errors[] = [
                        'field' => $fieldName,
                        'message' => "El campo '$fieldName' debe ser de tipo {$fieldRules['type']}",
                        'code' => 'INVALID_TYPE'
                    ];
                }
            }
            
            // Validar valores permitidos (enum)
            if (isset($fieldRules['enum']) && !in_array($value, $fieldRules['enum'])) {
                $allowedValues = implode(', ', $fieldRules['enum']);
                $errors[] = [
                    'field' => $fieldName,
                    'message' => "El campo '$fieldName' debe ser uno de: $allowedValues",
                    'code' => 'INVALID_ENUM'
                ];
            }
            
            // Validar longitud mínima
            if (isset($fieldRules['min_length']) && strlen($value) < $fieldRules['min_length']) {
                $errors[] = [
                    'field' => $fieldName,
                    'message' => "El campo '$fieldName' debe tener al menos {$fieldRules['min_length']} caracteres",
                    'code' => 'MIN_LENGTH'
                ];
            }
            
            // Validar longitud máxima
            if (isset($fieldRules['max_length']) && strlen($value) > $fieldRules['max_length']) {
                $errors[] = [
                    'field' => $fieldName,
                    'message' => "El campo '$fieldName' no puede tener más de {$fieldRules['max_length']} caracteres",
                    'code' => 'MAX_LENGTH'
                ];
            }
            
            // Validar rango numérico
            if (isset($fieldRules['min']) && $value < $fieldRules['min']) {
                $errors[] = [
                    'field' => $fieldName,
                    'message' => "El campo '$fieldName' debe ser mayor o igual a {$fieldRules['min']}",
                    'code' => 'MIN_VALUE'
                ];
            }
            
            if (isset($fieldRules['max']) && $value > $fieldRules['max']) {
                $errors[] = [
                    'field' => $fieldName,
                    'message' => "El campo '$fieldName' debe ser menor o igual a {$fieldRules['max']}",
                    'code' => 'MAX_VALUE'
                ];
            }
        }
    }
    
    return $errors;
}

/**
 * Sanitizar entrada (equivalente a sanitización de express-validator)
 */
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    
    if (is_string($data)) {
        // Limpiar espacios y caracteres especiales
        $data = trim($data);
        $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
        return $data;
    }
    
    return $data;
}

/**
 * Parsear URL para obtener parámetros de ruta (equivalente a req.params)
 */
function parseApiUrl($basePath = '') {
    $uri = $_SERVER['REQUEST_URI'];
    $path = parse_url($uri, PHP_URL_PATH);
    
    // Remover query string si existe
    $path = strtok($path, '?');
    
    // Remover el base path si se especifica
    if ($basePath) {
        $path = preg_replace('#^' . preg_quote($basePath, '#') . '#', '', $path);
    }
    
    // Remover /api/ del inicio
    $path = preg_replace('#^/api/#', '', $path);
    
    // Dividir en partes y filtrar vacías
    $parts = array_filter(explode('/', $path));
    
    return array_values($parts);
}

/**
 * Obtener datos del body (equivalente a req.body)
 */
function getRequestBody() {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    
    if (strpos($contentType, 'application/json') !== false) {
        $rawBody = file_get_contents('php://input');
        $data = json_decode($rawBody, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            errorResponse('JSON inválido: ' . json_last_error_msg(), 400);
        }
        
        return $data;
    }
    
    // Para form-data o form-urlencoded
    return $_POST;
}

/**
 * Logging de requests (equivalente al middleware de logging de Express)
 */
function logRequest() {
    $method = $_SERVER['REQUEST_METHOD'];
    $uri = $_SERVER['REQUEST_URI'];
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
    
    $logMessage = sprintf(
        "[%s] %s %s - IP: %s - UA: %s",
        date('Y-m-d H:i:s'),
        $method,
        $uri,
        $ip,
        substr($userAgent, 0, 100)
    );
    
    error_log($logMessage);
}

/**
 * Rate limiting básico (equivalente al rate limiting de Express)
 */
function checkRateLimit($identifier = null, $maxRequests = 100, $windowMinutes = 15) {
    $identifier = $identifier ?? ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $windowSeconds = $windowMinutes * 60;
    $cacheKey = "rate_limit_" . md5($identifier);
    
    // Usar archivo para cache simple (en producción usar Redis/Memcached)
    $cacheFile = sys_get_temp_dir() . "/$cacheKey.cache";
    
    $currentTime = time();
    $requests = [];
    
    // Leer cache existente
    if (file_exists($cacheFile)) {
        $data = file_get_contents($cacheFile);
        $requests = json_decode($data, true) ?? [];
    }
    
    // Filtrar requests dentro de la ventana de tiempo
    $requests = array_filter($requests, function($timestamp) use ($currentTime, $windowSeconds) {
        return ($currentTime - $timestamp) < $windowSeconds;
    });
    
    // Verificar límite
    if (count($requests) >= $maxRequests) {
        errorResponse('Demasiadas solicitudes. Intenta de nuevo más tarde.', 429, [
            'limit' => $maxRequests,
            'window' => $windowMinutes . ' minutos',
            'retry_after' => $windowSeconds
        ]);
    }
    
    // Agregar request actual
    $requests[] = $currentTime;
    
    // Guardar cache
    file_put_contents($cacheFile, json_encode($requests));
}

/**
 * Validar formato de fecha ISO8601 (como en Node.js)
 */
function validateISO8601Date($date) {
    if (!$date) return false;
    
    $formats = [
        'Y-m-d\TH:i:s\Z',      // 2023-12-25T10:30:00Z
        'Y-m-d\TH:i:s.u\Z',    // 2023-12-25T10:30:00.000Z
        'Y-m-d\TH:i:sP',       // 2023-12-25T10:30:00+00:00
        'Y-m-d H:i:s',         // 2023-12-25 10:30:00
        'Y-m-d'                // 2023-12-25
    ];
    
    foreach ($formats as $format) {
        $dateTime = DateTime::createFromFormat($format, $date);
        if ($dateTime !== false) {
            return true;
        }
    }
    
    return false;
}

/**
 * Formatear fecha para respuesta (como en Node.js)
 */
function formatDateForResponse($date, $format = 'Y-m-d') {
    if (!$date) return null;
    
    if (is_string($date)) {
        $dateTime = new DateTime($date);
    } else {
        $dateTime = $date;
    }
    
    return $dateTime->format($format);
}
?>