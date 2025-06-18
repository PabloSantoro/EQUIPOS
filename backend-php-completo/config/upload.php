<?php
/**
 * Sistema de upload de archivos para GEPRO
 * Migrado desde Node.js/Multer con todas las funcionalidades
 */

class UploadManager {
    
    // Configuración equivalente a multer de Node.js
    private $config = [
        'max_file_size' => 5 * 1024 * 1024, // 5MB (mismo que Node.js)
        'allowed_types' => [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/webp'
        ],
        'upload_path' => '../uploads/equipment/',
        'url_base' => '/api/uploads/equipment/'
    ];
    
    public function __construct($customConfig = []) {
        $this->config = array_merge($this->config, $customConfig);
        $this->ensureUploadDirectory();
    }
    
    /**
     * Crear directorio de uploads si no existe
     */
    private function ensureUploadDirectory() {
        $fullPath = $this->config['upload_path'];
        
        if (!is_dir($fullPath)) {
            if (!mkdir($fullPath, 0755, true)) {
                throw new Exception("No se pudo crear el directorio de uploads: $fullPath");
            }
        }
        
        // Verificar permisos de escritura
        if (!is_writable($fullPath)) {
            throw new Exception("El directorio de uploads no tiene permisos de escritura: $fullPath");
        }
    }
    
    /**
     * Validar archivo subido (equivalente a multer file filter)
     */
    public function validateFile($file) {
        $errors = [];
        
        // Verificar que se subió correctamente
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errors[] = $this->getUploadErrorMessage($file['error']);
        }
        
        // Verificar tamaño
        if ($file['size'] > $this->config['max_file_size']) {
            $maxSizeMB = round($this->config['max_file_size'] / 1024 / 1024, 1);
            $errors[] = "El archivo es demasiado grande. Máximo permitido: {$maxSizeMB}MB";
        }
        
        // Verificar tipo MIME
        $detectedType = $this->getFileMimeType($file['tmp_name']);
        if (!in_array($detectedType, $this->config['allowed_types'])) {
            $allowedTypes = implode(', ', $this->config['allowed_types']);
            $errors[] = "Tipo de archivo no permitido. Tipos permitidos: $allowedTypes";
        }
        
        // Verificar que es realmente una imagen
        $imageInfo = getimagesize($file['tmp_name']);
        if ($imageInfo === false) {
            $errors[] = "El archivo no es una imagen válida";
        }
        
        return $errors;
    }
    
    /**
     * Generar nombre único para archivo (equivalente a la lógica de Node.js)
     */
    public function generateFileName($originalName, $prefix = '') {
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $timestamp = time();
        $random = mt_rand(1000, 9999);
        
        // Formato: equipo_48_1750131171542_1234.jpg (similar a Node.js)
        return $prefix . '_' . $timestamp . '_' . $random . '.' . $extension;
    }
    
    /**
     * Subir archivo (equivalente a multer.single())
     */
    public function uploadFile($file, $prefix = 'file') {
        try {
            // Validar archivo
            $errors = $this->validateFile($file);
            if (!empty($errors)) {
                throw new Exception("Errores de validación: " . implode(', ', $errors));
            }
            
            // Generar nombre único
            $fileName = $this->generateFileName($file['name'], $prefix);
            $targetPath = $this->config['upload_path'] . $fileName;
            
            // Mover archivo
            if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
                throw new Exception("Error al mover el archivo al directorio de destino");
            }
            
            // Establecer permisos correctos
            chmod($targetPath, 0644);
            
            return [
                'success' => true,
                'filename' => $fileName,
                'path' => $targetPath,
                'url' => $this->generateFileUrl($fileName),
                'size' => $file['size'],
                'type' => $this->getFileMimeType($targetPath)
            ];
            
        } catch (Exception $e) {
            // Limpiar archivo temporal si existe
            if (isset($targetPath) && file_exists($targetPath)) {
                unlink($targetPath);
            }
            
            throw $e;
        }
    }
    
    /**
     * Eliminar archivo existente (equivalente a deleteOldImage de Node.js)
     */
    public function deleteFile($fileName) {
        if (!$fileName) {
            return false;
        }
        
        // Si es una URL completa, extraer solo el nombre del archivo
        if (strpos($fileName, '/') !== false) {
            $fileName = basename($fileName);
        }
        
        $filePath = $this->config['upload_path'] . $fileName;
        
        if (file_exists($filePath)) {
            return unlink($filePath);
        }
        
        return false; // Archivo no existe
    }
    
    /**
     * Generar URL pública del archivo (equivalente a getImageUrl de Node.js)
     */
    public function generateFileUrl($fileName) {
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        
        return $protocol . '://' . $host . $this->config['url_base'] . $fileName;
    }
    
    /**
     * Obtener tipo MIME real del archivo
     */
    private function getFileMimeType($filePath) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $filePath);
        finfo_close($finfo);
        
        return $mimeType;
    }
    
    /**
     * Convertir códigos de error de upload a mensajes legibles
     */
    private function getUploadErrorMessage($errorCode) {
        return match($errorCode) {
            UPLOAD_ERR_INI_SIZE => 'El archivo excede el tamaño máximo permitido por el servidor',
            UPLOAD_ERR_FORM_SIZE => 'El archivo excede el tamaño máximo permitido por el formulario',
            UPLOAD_ERR_PARTIAL => 'El archivo se subió parcialmente',
            UPLOAD_ERR_NO_FILE => 'No se subió ningún archivo',
            UPLOAD_ERR_NO_TMP_DIR => 'Falta el directorio temporal',
            UPLOAD_ERR_CANT_WRITE => 'Error al escribir el archivo al disco',
            UPLOAD_ERR_EXTENSION => 'Una extensión de PHP detuvo la subida del archivo',
            default => 'Error desconocido en la subida del archivo'
        };
    }
    
    /**
     * Obtener información de un archivo existente
     */
    public function getFileInfo($fileName) {
        if (!$fileName) {
            return null;
        }
        
        // Si es una URL completa, extraer solo el nombre del archivo
        if (strpos($fileName, '/') !== false) {
            $fileName = basename($fileName);
        }
        
        $filePath = $this->config['upload_path'] . $fileName;
        
        if (!file_exists($filePath)) {
            return null;
        }
        
        $size = filesize($filePath);
        $type = $this->getFileMimeType($filePath);
        $lastModified = filemtime($filePath);
        
        return [
            'filename' => $fileName,
            'path' => $filePath,
            'url' => $this->generateFileUrl($fileName),
            'size' => $size,
            'type' => $type,
            'last_modified' => date('c', $lastModified)
        ];
    }
    
    /**
     * Limpiar archivos antiguos (funcionalidad adicional)
     */
    public function cleanupOldFiles($maxAge = 86400) { // 24 horas por defecto
        $uploadDir = $this->config['upload_path'];
        $currentTime = time();
        $deletedCount = 0;
        
        if (is_dir($uploadDir)) {
            $files = scandir($uploadDir);
            
            foreach ($files as $file) {
                if ($file === '.' || $file === '..') continue;
                
                $filePath = $uploadDir . $file;
                $fileAge = $currentTime - filemtime($filePath);
                
                if ($fileAge > $maxAge) {
                    if (unlink($filePath)) {
                        $deletedCount++;
                    }
                }
            }
        }
        
        return $deletedCount;
    }
}

/**
 * Función helper para manejo de uploads de equipos (equivalente al middleware de Node.js)
 */
function handleEquipmentImageUpload($equipmentId) {
    if (!isset($_FILES['image'])) {
        errorResponse('No se ha subido ningún archivo', 400);
    }
    
    try {
        $uploadManager = new UploadManager();
        $result = $uploadManager->uploadFile($_FILES['image'], "equipo_$equipmentId");
        
        return $result;
        
    } catch (Exception $e) {
        errorResponse('Error al subir la imagen: ' . $e->getMessage(), 500);
    }
}

/**
 * Función helper para eliminar imagen de equipo
 */
function deleteEquipmentImage($imageUrl) {
    try {
        $uploadManager = new UploadManager();
        return $uploadManager->deleteFile($imageUrl);
        
    } catch (Exception $e) {
        error_log("Error eliminando imagen: " . $e->getMessage());
        return false;
    }
}

/**
 * Middleware para servir archivos estáticos (equivalente a express.static)
 */
function serveStaticFile($fileName, $uploadPath = '../uploads/equipment/') {
    $filePath = $uploadPath . basename($fileName);
    
    if (!file_exists($filePath)) {
        http_response_code(404);
        echo json_encode(['error' => 'Archivo no encontrado']);
        exit;
    }
    
    $mimeType = mime_content_type($filePath);
    $fileSize = filesize($filePath);
    
    // Headers para servir el archivo
    header("Content-Type: $mimeType");
    header("Content-Length: $fileSize");
    header("Cache-Control: public, max-age=31536000"); // Cache por 1 año
    header("Expires: " . date('D, d M Y H:i:s', time() + 31536000) . ' GMT');
    
    // Servir el archivo
    readfile($filePath);
    exit;
}
?>