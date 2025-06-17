#!/bin/bash
# Script para compilar el proyecto para GEPRO.COM.AR

echo "🚀 Iniciando build para GEPRO.COM.AR..."

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

# Crear carpeta de despliegue específica para GEPRO
echo "📁 Creando carpeta de despliegue para GEPRO..."
mkdir -p deploy/equipos
mkdir -p deploy/equipos/api

# Copiar frontend compilado
echo "📋 Copiando archivos del frontend..."
cp -r frontend/dist/* deploy/equipos/ 2>/dev/null || :

# Copiar backend
echo "📋 Copiando archivos del backend..."
cp -r backend/* deploy/equipos/api/
cp backend/.env.production deploy/equipos/api/.env

# Copiar configuración
echo "📋 Copiando configuración..."
cp .htaccess deploy/equipos/

# Copiar base de datos
echo "📋 Copiando scripts de base de datos..."
mkdir -p deploy/database
cp database/*.sql deploy/database/
cp database/*.md deploy/database/

# Crear archivo de instrucciones específico para GEPRO
echo "📋 Creando instrucciones de despliegue..."
cp deploy-guide.md deploy/

# Crear archivo de configuración específico
echo "📋 Creando configuración específica para GEPRO..."
cat > deploy/GEPRO-CONFIG.txt << EOF
🎯 CONFIGURACIÓN ESPECÍFICA PARA GEPRO.COM.AR

📍 Ruta del servidor: /home/u302817/domains/gepro.com.ar/public_html/equipos

🗄️ Base de datos:
- Host: 62.72.62.1
- Puerto: 3306  
- Base de datos: u302432817_gchkd
- Usuario: u302432817_ILTEF
- Contraseña: Puertas3489*

🌐 URLs de producción:
- Frontend: https://gepro.com.ar/equipos
- API: https://gepro.com.ar/equipos/api
- Health Check: https://gepro.com.ar/equipos/api/health

📁 Estructura en servidor:
/home/u302817/domains/gepro.com.ar/public_html/equipos/
├── index.html (frontend)
├── static/ (assets)
├── .htaccess (configuración)
└── api/ (backend)
    ├── server.js
    ├── .env (con datos reales)
    ├── routes/
    ├── middleware/
    └── uploads/

⚠️ IMPORTANTE:
1. Las tablas de la BD ya existen
2. Solo crear tablas faltantes con create_missing_tables_gepro.sql
3. Verificar primero con check_existing_tables.sql
EOF

echo ""
echo "✅ Build completado para GEPRO!"
echo ""
echo "📂 Archivos listos en la carpeta 'deploy/equipos/'"
echo ""
echo "📋 PASOS ESPECÍFICOS PARA GEPRO:"
echo "1. Sube todo 'deploy/equipos/' a: /home/u302817/domains/gepro.com.ar/public_html/equipos/"
echo "2. La base de datos ya existe - solo verifica con check_existing_tables.sql"
echo "3. Crea tablas faltantes con create_missing_tables_gepro.sql"
echo "4. El archivo .env ya tiene los datos correctos de GEPRO"
echo "5. Configura Node.js apuntando a equipos/api/server.js"
echo ""
echo "🌐 URL final: https://gepro.com.ar/equipos"
echo ""
echo "📖 Lee 'deploy/GEPRO-CONFIG.txt' para detalles específicos"