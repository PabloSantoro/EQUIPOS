-- Script para eliminar la columna gps_instalado de la tabla equipos
-- Este script elimina completamente el seguimiento de GPS del sistema

USE equipos_db;

-- Verificar que la columna existe antes de eliminarla
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'equipos_db' 
  AND TABLE_NAME = 'equipos' 
  AND COLUMN_NAME = 'gps_instalado';

-- Eliminar la columna gps_instalado
ALTER TABLE equipos 
DROP COLUMN IF EXISTS gps_instalado;

-- Verificar que la columna fue eliminada
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'equipos_db' 
  AND TABLE_NAME = 'equipos' 
ORDER BY ORDINAL_POSITION;