import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { CLIENT_URL } from './src/config/env.js';
import swaggerSpec from './src/config/swagger.js';

import authRoutes from './src/routes/authRoutes.js';
import vehicleRoutes from './src/routes/vehicleRoutes.js';
import driverRoutes from './src/routes/driverRoutes.js';
import tripRoutes from './src/routes/tripRoutes.js';
import gpsRoutes from './src/routes/gpsRoutes.js';
import geofenceRoutes from './src/routes/geofenceRoutes.js';
import sosRoutes from './src/routes/sosRoutes.js';
import alertRoutes from './src/routes/alertRoutes.js';
import fuelRoutes from './src/routes/fuelRoutes.js';
import maintenanceRoutes from './src/routes/maintenanceRoutes.js';
import documentRoutes from './src/routes/documentRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import salaryRoutes from './src/routes/salaryRoutes.js';
import auditRoutes from './src/routes/auditRoutes.js';
import forecastRoutes from './src/routes/forecastRoutes.js';
import routeRoutes from './src/routes/routeRoutes.js';
import mlInsightRoutes from './src/routes/mlInsightRoutes.js';
import { checkDatabaseConnection } from './src/repositories/store.js';

import { notFound, errorHandler } from './src/middleware/errorMiddleware.js';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
const allowedOrigins = [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Swagger Interactive Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Base Health Check
app.get('/', (req, res) => {
  res.json({
    ok: true,
    name: 'SmartFleet AI Backend API',
    version: '1.0.0',
    docs: '/api/docs',
    health: '/api/health'
  });
});

app.get('/api/health', async (req, res) => {
  const dbStatus = await checkDatabaseConnection();
  res.json({
    ok: true,
    name: 'SmartFleet AI Telemetry Gateway',
    status: 'Healthy',
    database: {
      provider: 'Supabase PostgreSQL',
      orm: 'Prisma ORM',
      ...dbStatus
    }
  });
});

// Feature API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/gps', gpsRoutes);
app.use('/api/geofences', geofenceRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/ml-insights', mlInsightRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
