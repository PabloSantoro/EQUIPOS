<?php
/**
 * Configuración avanzada de base de datos para GEPRO
 * Migrado desde Node.js con todas las funcionalidades
 */

class Database {
    private static $instance = null;
    private $connection;
    
    // Configuración específica para GEPRO (misma que Node.js)
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
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
                PDO::ATTR_TIMEOUT => 60,
                PDO::ATTR_PERSISTENT => false
            ];
            
            $this->connection = new PDO($dsn, $this->username, $this->password, $options);
            $this->connection->exec("SET time_zone = '+00:00'");
            
        } catch (PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'error' => 'Error de conexión a la base de datos',
                'timestamp' => date('c')
            ]);
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
            $stmt = $this->connection->query("SELECT 1 as test, DATABASE() as db_name, NOW() as server_time");
            $result = $stmt->fetch();
            return [
                'connected' => true,
                'database' => $result['db_name'],
                'server_time' => $result['server_time']
            ];
        } catch (PDOException $e) {
            error_log("Connection test failed: " . $e->getMessage());
            return [
                'connected' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Ejecutar query simple (equivalente a executeQuery de Node.js)
     */
    public function executeQuery($query, $params = []) {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            
            // Si es SELECT, devolver resultados
            if (stripos(trim($query), 'SELECT') === 0) {
                return $stmt->fetchAll();
            }
            
            // Para INSERT, UPDATE, DELETE
            return [
                'success' => true,
                'rowCount' => $stmt->rowCount(),
                'lastInsertId' => $this->connection->lastInsertId()
            ];
            
        } catch (PDOException $e) {
            error_log("Query execution error: " . $e->getMessage() . " | Query: " . $query);
            throw new Exception("Error en la consulta: " . $e->getMessage());
        }
    }
    
    /**
     * Ejecutar transacción (equivalente a executeTransaction de Node.js)
     */
    public function executeTransaction($queries) {
        try {
            $this->connection->beginTransaction();
            
            $results = [];
            foreach ($queries as $queryData) {
                $query = $queryData['query'];
                $params = $queryData['params'] ?? [];
                
                $stmt = $this->connection->prepare($query);
                $stmt->execute($params);
                
                if (stripos(trim($query), 'SELECT') === 0) {
                    $results[] = $stmt->fetchAll();
                } else {
                    $results[] = [
                        'rowCount' => $stmt->rowCount(),
                        'lastInsertId' => $this->connection->lastInsertId()
                    ];
                }
            }
            
            $this->connection->commit();
            return $results;
            
        } catch (PDOException $e) {
            $this->connection->rollback();
            error_log("Transaction error: " . $e->getMessage());
            throw new Exception("Error en la transacción: " . $e->getMessage());
        }
    }
    
    /**
     * Verificar si una tabla existe
     */
    public function tableExists($tableName) {
        try {
            $query = "SELECT COUNT(*) as count FROM information_schema.tables 
                     WHERE table_schema = ? AND table_name = ?";
            $result = $this->executeQuery($query, [$this->database, $tableName]);
            return $result[0]['count'] > 0;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Obtener información de columnas de una tabla
     */
    public function getTableColumns($tableName) {
        try {
            $query = "SELECT column_name, data_type, is_nullable, column_default, column_comment
                     FROM information_schema.columns 
                     WHERE table_schema = ? AND table_name = ?
                     ORDER BY ordinal_position";
            return $this->executeQuery($query, [$this->database, $tableName]);
        } catch (Exception $e) {
            return [];
        }
    }
}

/**
 * Funciones helper globales (equivalentes a las de Node.js)
 */
function getDB() {
    return Database::getInstance();
}

function executeQuery($query, $params = []) {
    return Database::getInstance()->executeQuery($query, $params);
}

function executeTransaction($queries) {
    return Database::getInstance()->executeTransaction($queries);
}

function dbHealthCheck() {
    return Database::getInstance()->testConnection();
}
?>