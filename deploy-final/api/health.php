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
