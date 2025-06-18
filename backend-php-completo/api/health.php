<?php
/**
 * Health Check para GEPRO - Equivalente completo al de Node.js
 */
require_once '../config/database.php';
require_once '../config/cors.php';

setCorsHeaders();

try {
    // Test de conexión a base de datos (equivalente a testConnection de Node.js)
    $dbTest = dbHealthCheck();
    
    // Información del sistema
    $phpVersion = PHP_VERSION;
    $memoryUsage = memory_get_usage(true);
    $memoryLimit = ini_get('memory_limit');
    $maxExecutionTime = ini_get('max_execution_time');
    $uploadMaxFilesize = ini_get('upload_max_filesize');
    
    // Test de directorio de uploads
    $uploadDir = '../uploads/equipment/';
    $uploadDirExists = is_dir($uploadDir);
    $uploadDirWritable = is_writable($uploadDir);
    
    // Test de tablas principales
    $db = Database::getInstance();
    $requiredTables = ['equipos', 'proyectos', 'centros_costo', 'asignaciones', 'mantenimientos'];
    $tablesStatus = [];
    
    foreach ($requiredTables as $table) {
        $tableExists = $db->tableExists($table);
        $recordCount = 0;
        
        if ($tableExists) {
            try {
                $result = $db->executeQuery("SELECT COUNT(*) as count FROM $table");
                $recordCount = $result[0]['count'];
            } catch (Exception $e) {
                $recordCount = 'Error: ' . $e->getMessage();
            }
        }
        
        $tablesStatus[$table] = [
            'exists' => $tableExists,
            'records' => $recordCount
        ];
    }
    
    // Determinar estado general
    $overallStatus = 'OK';
    $issues = [];
    
    if (!$dbTest['connected']) {
        $overallStatus = 'ERROR';
        $issues[] = 'Base de datos no conectada';
    }
    
    if (!$uploadDirExists) {
        $overallStatus = 'WARNING';
        $issues[] = 'Directorio de uploads no existe';
    }
    
    if (!$uploadDirWritable) {
        $overallStatus = 'WARNING';
        $issues[] = 'Directorio de uploads no tiene permisos de escritura';
    }
    
    foreach ($tablesStatus as $table => $status) {
        if (!$status['exists']) {
            $overallStatus = 'ERROR';
            $issues[] = "Tabla '$table' no existe";
        }
    }
    
    // Respuesta completa del health check
    $response = [
        'status' => $overallStatus,
        'timestamp' => date('c'),
        'server' => 'GEPRO-PHP',
        'version' => '1.0.0',
        'environment' => [
            'php_version' => $phpVersion,
            'memory_usage' => round($memoryUsage / 1024 / 1024, 2) . ' MB',
            'memory_limit' => $memoryLimit,
            'max_execution_time' => $maxExecutionTime . 's',
            'upload_max_filesize' => $uploadMaxFilesize
        ],
        'database' => [
            'status' => $dbTest['connected'] ? 'Connected' : 'Disconnected',
            'database_name' => $dbTest['database'] ?? 'Unknown',
            'server_time' => $dbTest['server_time'] ?? null,
            'tables' => $tablesStatus
        ],
        'uploads' => [
            'directory_exists' => $uploadDirExists,
            'directory_writable' => $uploadDirWritable,
            'path' => $uploadDir
        ],
        'api_endpoints' => [
            'equipment' => '/api/equipment.php',
            'projects' => '/api/projects.php',
            'cost_centers' => '/api/cost-centers.php',
            'assignments' => '/api/assignments.php',
            'maintenance' => '/api/maintenance.php',
            'dashboard_stats' => '/api/assignments.php/stats/dashboard'
        ]
    ];
    
    if (!empty($issues)) {
        $response['issues'] = $issues;
    }
    
    // Log del health check
    error_log("Health check ejecutado - Status: $overallStatus");
    
    $statusCode = match($overallStatus) {
        'OK' => 200,
        'WARNING' => 200, // Funcional pero con advertencias
        'ERROR' => 500
    };
    
    jsonResponse($response, $statusCode);
    
} catch (Exception $e) {
    error_log("Error en health check: " . $e->getMessage());
    
    jsonResponse([
        'status' => 'ERROR',
        'timestamp' => date('c'),
        'server' => 'GEPRO-PHP',
        'error' => 'Error ejecutando health check',
        'details' => $e->getMessage()
    ], 500);
}
?>