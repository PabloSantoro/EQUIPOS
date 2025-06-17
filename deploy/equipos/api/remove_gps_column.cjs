const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'adminpassword123',
  database: process.env.DB_DATABASE || 'equipos_db'
};

async function removeGpsColumn() {
  let connection;
  
  try {
    console.log('📡 Conectando a la base de datos...');
    connection = await mysql.createConnection(config);
    
    console.log('🔍 Verificando si existe la columna gps_instalado...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'equipos' 
        AND COLUMN_NAME = 'gps_instalado'
    `, [config.database]);
    
    if (columns.length > 0) {
      console.log('📋 Columna gps_instalado encontrada. Eliminando...');
      
      await connection.execute(`
        ALTER TABLE equipos 
        DROP COLUMN gps_instalado
      `);
      
      console.log('✅ Columna gps_instalado eliminada exitosamente');
    } else {
      console.log('ℹ️ La columna gps_instalado no existe en la tabla equipos');
    }
    
    console.log('🔍 Verificando estructura actual de la tabla equipos...');
    const [currentColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'equipos' 
      ORDER BY ORDINAL_POSITION
    `, [config.database]);
    
    console.log('📊 Estructura actual de la tabla equipos:');
    currentColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('📴 Conexión cerrada');
    }
  }
}

removeGpsColumn();