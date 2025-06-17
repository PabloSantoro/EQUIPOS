-- Script para verificar qué tablas ya existen en la base de datos GEPRO
-- Ejecutar en phpMyAdmin para ver la estructura actual

USE u302432817_gchkd;

-- Mostrar todas las tablas existentes
SHOW TABLES;

-- Verificar estructura de tabla equipos si existe
DESCRIBE equipos;

-- Verificar si las otras tablas del sistema existen
SELECT table_name, table_comment 
FROM information_schema.tables 
WHERE table_schema = 'u302432817_gchkd' 
AND table_name IN ('equipos', 'proyectos', 'centros_costo', 'asignaciones', 'mantenimientos');

-- Verificar campos específicos de la tabla equipos
SELECT column_name, data_type, is_nullable, column_default, column_comment
FROM information_schema.columns 
WHERE table_schema = 'u302432817_gchkd' 
AND table_name = 'equipos'
ORDER BY ordinal_position;