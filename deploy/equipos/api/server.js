import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar rutas
import equipmentRoutes from './routes/equipment.js';
import projectRoutes from './routes/projects.js';
import costCenterRoutes from './routes/costCenters.js';
import assignmentRoutes from './routes/assignments.js';
import maintenanceRoutes from './routes/maintenance.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración específica para Hostinger
const isProduction = process.env.NODE_ENV === 'production';

// Middleware de seguridad
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana de tiempo
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
});
app.use(limiter);

// CORS - Configuración para GEPRO
app.use(cors({
  origin: isProduction 
    ? ['https://gepro.com.ar', 'https://www.gepro.com.ar', process.env.CORS_ORIGIN] 
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes de equipos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas de la API
app.use('/api/equipment', equipmentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/cost-centers', costCenterRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Ruta de health check
app.get('/api/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'Connected' : 'Disconnected',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'Error',
      error: error.message
    });
  }
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  // Error de validación
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: error.message
    });
  }
  
  // Error de base de datos
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Registro duplicado',
      details: 'Ya existe un registro con estos datos'
    });
  }
  
  // Error genérico del servidor
  res.status(500).json({
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Contacte al administrador'
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log('🚀 Servidor iniciado exitosamente');
      console.log(`📡 Puerto: ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📊 Base de datos: ${process.env.DB_DATABASE}`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

startServer();