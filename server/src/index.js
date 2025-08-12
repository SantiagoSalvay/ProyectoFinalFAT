import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import mercadopagoRoutes from '../routes/mercadopago.js';

// Cargar variables de entorno
dotenv.config();

// Debug: Mostrar variables de entorno cargadas
console.log('🔍 [DEBUG] Variables de entorno cargadas:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'CONFIGURADO' : 'NO_CONFIGURADO');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'CONFIGURADO' : 'NO_CONFIGURADO');
console.log('SMTP_HOST:', process.env.SMTP_HOST || 'NO_CONFIGURADO');
console.log('SMTP_PORT:', process.env.SMTP_PORT || 'NO_CONFIGURADO');
console.log('SMTP_USER:', process.env.SMTP_USER ? 'CONFIGURADO' : 'NO_CONFIGURADO');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'CONFIGURADO' : 'NO_CONFIGURADO');

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar CORS
app.use(cors({
  origin: 'http://localhost:3000', // URL del frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/auth', authRoutes);
app.use('/mercadopago', mercadopagoRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Demos+ funcionando correctamente' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor: ' + err.message });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
}); 