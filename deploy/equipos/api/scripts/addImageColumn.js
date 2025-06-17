import { executeQuery, testConnection } from '../config/database.js';

const addImageColumn = async () => {
  try {
    console.log('🖼️ Agregando campo de imagen a tabla equipos...');
    
    // Probar conexión
    const connected = await testConnection();
    if (!connected) {
      process.exit(1);
    }

    // Verificar si la columna ya existe
    const columns = await executeQuery(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'equipos' 
      AND COLUMN_NAME = 'imagen_url'
    `);

    if (columns && columns.length > 0) {
      console.log('✅ El campo imagen_url ya existe en la tabla equipos');
      process.exit(0);
    }

    // Agregar columna imagen_url
    await executeQuery(`
      ALTER TABLE equipos 
      ADD COLUMN imagen_url VARCHAR(500) NULL 
      COMMENT 'URL de la imagen del equipo'
    `);

    console.log('✅ Campo imagen_url agregado exitosamente a la tabla equipos');
    console.log('📋 Estructura actualizada:');
    console.log('   - imagen_url: VARCHAR(500) NULL');
    console.log('   - Almacenará URLs de imágenes de equipos');

    // Verificar la estructura actualizada
    const tableStructure = await executeQuery(`
      DESCRIBE equipos
    `);

    console.log('\n📊 Estructura completa de tabla equipos:');
    tableStructure.forEach(column => {
      if (column.Field === 'imagen_url') {
        console.log(`   ✨ ${column.Field}: ${column.Type} (NUEVO)`);
      } else {
        console.log(`      ${column.Field}: ${column.Type}`);
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error agregando campo imagen:', error);
    process.exit(1);
  }
};

addImageColumn();