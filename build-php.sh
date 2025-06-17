#!/bin/bash
# Script para compilar el proyecto con backend PHP para GEPRO.COM.AR

echo "🚀 Iniciando build PHP para GEPRO.COM.AR..."

# Compilar frontend
echo "📦 Compilando frontend para subdirectorio /equipos..."
cd frontend
npm install
npm run build

# Verificar que se creó la carpeta dist
if [ -d "dist" ]; then
    echo "✅ Frontend compilado exitosamente en frontend/dist/"
else
    echo "❌ Error: No se pudo compilar el frontend"
    exit 1
fi

cd ..

# Crear carpeta de despliegue específica para GEPRO con PHP
echo "📁 Creando carpeta de despliegue PHP para GEPRO..."
mkdir -p deploy-php/equipos
mkdir -p deploy-php/equipos/api

# Copiar frontend compilado
echo "📋 Copiando archivos del frontend..."
cp -r frontend/dist/* deploy-php/equipos/ 2>/dev/null || :

# Copiar backend PHP
echo "📋 Copiando archivos del backend PHP..."
cp -r backend-php/* deploy-php/equipos/api/

# Crear directorio de uploads
echo "📋 Creando directorio de uploads..."
mkdir -p deploy-php/equipos/api/uploads/equipment

# Copiar configuración específica para PHP
echo "📋 Copiando configuración PHP..."
cp frontend-php/.htaccess deploy-php/equipos/

# Copiar base de datos
echo "📋 Copiando scripts de base de datos..."
mkdir -p deploy-php/database
cp database/*.sql deploy-php/database/
cp database/*.md deploy-php/database/

# Crear archivo de configuración específico para GEPRO con PHP
echo "📋 Creando configuración específica para GEPRO PHP..."
cat > deploy-php/GEPRO-PHP-CONFIG.txt << EOF
🎯 CONFIGURACIÓN ESPECÍFICA PARA GEPRO.COM.AR - BACKEND PHP

📍 Ruta del servidor: /home/u302817/domains/gepro.com.ar/public_html/equipos

🗄️ Base de datos:
- Host: 62.72.62.1
- Puerto: 3306  
- Base de datos: u302432817_gchkd
- Usuario: u302432817_ILTEF
- Contraseña: Puertas3489*

🌐 URLs de producción:
- Frontend: https://gepro.com.ar/equipos
- API: https://gepro.com.ar/equipos/api/
- Health Check: https://gepro.com.ar/equipos/api/health.php

📁 Estructura en servidor:
/home/u302817/domains/gepro.com.ar/public_html/equipos/
├── index.html (frontend React)
├── assets/ (CSS, JS compilados)
├── .htaccess (configuración Apache)
└── api/ (backend PHP)
    ├── equipment.php
    ├── projects.php
    ├── cost-centers.php
    ├── assignments.php
    ├── maintenance.php
    ├── health.php
    ├── config/ (configuración BD)
    ├── .htaccess (ruteo API)
    └── uploads/ (imágenes equipos)

✅ VENTAJAS DEL BACKEND PHP:
1. Compatible con alojamiento web compartido
2. No requiere Node.js en el servidor
3. Conexión directa a MySQL
4. Misma funcionalidad que Node.js
5. CORS configurado para GEPRO

⚠️ IMPORTANTE:
1. Las tablas de la BD ya existen
2. Solo crear tablas faltantes con create_missing_tables_gepro.sql
3. Verificar primero con check_existing_tables.sql
4. Los archivos PHP están listos para usar
EOF

echo ""
echo "✅ Build PHP completado para GEPRO!"
echo ""
echo "📂 Archivos listos en la carpeta 'deploy-php/equipos/'"
echo ""
echo "📋 PASOS ESPECÍFICOS PARA GEPRO (BACKEND PHP):"
echo "1. Sube todo 'deploy-php/equipos/' a: /home/u302817/domains/gepro.com.ar/public_html/equipos/"
echo "2. La base de datos ya existe - solo verifica con check_existing_tables.sql"
echo "3. Crea tablas faltantes con create_missing_tables_gepro.sql"
echo "4. NO necesitas configurar Node.js - es PHP nativo"
echo "5. Los permisos de uploads/ deben ser 755"
echo ""
echo "🌐 URL final: https://gepro.com.ar/equipos"
echo ""
echo "📖 Lee 'deploy-php/GEPRO-PHP-CONFIG.txt' para detalles específicos"