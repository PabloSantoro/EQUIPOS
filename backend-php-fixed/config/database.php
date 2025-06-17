<?php
// Configuración de base de datos para GEPRO
class Database {
    private static $instance = null;
    private $connection;
    
    // Configuración específica para GEPRO
    private $host = '62.72.62.1';
    private $port = 3306;
    private $username = 'u302432817_ILTEF';
    private $password = 'Puertas3489*';
    private $database = 'u302432817_gchkd';
    
    private function __construct() {
        try {
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->database};charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];
            
            $this->connection = new PDO($dsn, $this->username, $this->password, $options);
            
        } catch (PDOException $e) {
            error_log("Error de conexión a base de datos: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Error de conexión a la base de datos']);
            exit;
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    public function testConnection() {
        try {
            $stmt = $this->connection->query("SELECT 1");
            return true;
        } catch (PDOException $e) {
            error_log("Error probando conexión: " . $e->getMessage());
            return false;
        }
    }
    
    public function executeQuery($query, $params = []) {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            
            // Si es SELECT, devolver resultados
            if (stripos(trim($query), 'SELECT') === 0) {
                return $stmt->fetchAll();
            }
            
            // Para INSERT, UPDATE, DELETE devolver información de ejecución
            return [
                'success' => true,
                'rowCount' => $stmt->rowCount(),
                'lastInsertId' => $this->connection->lastInsertId()
            ];
            
        } catch (PDOException $e) {
            error_log("Error ejecutando query: " . $e->getMessage());
            throw new Exception("Error en la consulta: " . $e->getMessage());
        }
    }
}

// Función helper para obtener conexión
function getDB() {
    return Database::getInstance();
}

// Función helper para ejecutar queries
function executeQuery($query, $params = []) {
    return Database::getInstance()->executeQuery($query, $params);
}
?>