#!/bin/bash
# Script para compilar el proyecto con backend PHP para SUBDOMINIO equipos.gepro.com.ar

echo "🚀 Iniciando build PHP para SUBDOMINIO equipos.gepro.com.ar..."

# Compilar frontend
echo "📦 Compilando frontend para subdominio equipos.gepro.com.ar..."
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

# Crear carpeta de despliegue específica para subdominio
echo "📁 Creando carpeta de despliegue para subdominio..."
mkdir -p deploy-subdominio
mkdir -p deploy-subdominio/api

# Copiar frontend compilado al root del subdominio
echo "📋 Copiando archivos del frontend..."
cp -r frontend/dist/* deploy-subdominio/ 2>/dev/null || :

# Copiar backend PHP
echo "📋 Copiando archivos del backend PHP..."
cp -r backend-php/* deploy-subdominio/api/

# Crear directorio de uploads
echo "📋 Creando directorio de uploads..."
mkdir -p deploy-subdominio/api/uploads/equipment

# Copiar configuración específica para subdominio
echo "📋 Copiando configuración subdominio..."
cp frontend-subdominio/.htaccess deploy-subdominio/

# Copiar base de datos
echo "📋 Copiando scripts de base de datos..."
mkdir -p deploy-subdominio/database
cp database/*.sql deploy-subdominio/database/
cp database/*.md deploy-subdominio/database/

# Crear archivo de configuración específico para subdominio
echo "📋 Creando configuración específica para subdominio..."
cat > deploy-subdominio/SUBDOMINIO-CONFIG.txt << EOF
🎯 CONFIGURACIÓN PARA SUBDOMINIO equipos.gepro.com.ar

📍 Ruta del servidor: /domains/equipos.gepro.com.ar/public_html/

🗄️ Base de datos (MISMA):
- Host: 62.72.62.1
- Puerto: 3306  
- Base de datos: u302432817_gchkd
- Usuario: u302432817_ILTEF
- Contraseña: Puertas3489*

🌐 URLs de producción:
- Frontend: https://equipos.gepro.com.ar/
- API: https://equipos.gepro.com.ar/api/
- Health Check: https://equipos.gepro.com.ar/api/health.php

📁 Estructura en servidor:
/domains/equipos.gepro.com.ar/public_html/
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

✅ VENTAJAS DEL SUBDOMINIO:
1. URLs más limpias (/api/ en lugar de /equipos/api/)
2. Separación clara del dominio principal
3. Mejor SEO y organización
4. Mismo backend PHP compatible

⚠️ IMPORTANTE:
1. Configurar el subdominio en el panel de Hostinger
2. Apuntar a /domains/equipos.gepro.com.ar/public_html/
3. Usar la misma base de datos existente
4. Crear tablas faltantes con create_missing_tables_gepro.sql
5. Los permisos de uploads/ deben ser 755
EOF

echo ""
echo "✅ Build SUBDOMINIO completado!"
echo ""
echo "📂 Archivos listos en la carpeta 'deploy-subdominio/'"
echo ""
echo "📋 PASOS ESPECÍFICOS PARA SUBDOMINIO:"
echo "1. Configura el subdominio 'equipos' en cPanel de Hostinger"
echo "2. Sube todo 'deploy-subdominio/' a: /domains/equipos.gepro.com.ar/public_html/"
echo "3. Usar la misma base de datos que ya tienes configurada"
echo "4. Crear tablas faltantes con create_missing_tables_gepro.sql"
echo "5. Los permisos de uploads/ deben ser 755"
echo ""
echo "🌐 URL final: https://equipos.gepro.com.ar/"
echo ""
echo "📖 Lee 'deploy-subdominio/SUBDOMINIO-CONFIG.txt' para detalles"