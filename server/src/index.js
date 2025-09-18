import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import authRoutes from './routes/auth.js';
import oauthRoutes from './routes/oauth.js';
import mercadopagoRoutes from '../routes/mercadopago.js';
import passport from './config/passport.js';

// Cargar variables de entorno desde el directorio raíz
dotenv.config({ path: '../.env' });

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

// Configurar sesiones para Passport
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Cambiar a true en producción con HTTPS
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Rutas
app.use('/auth', authRoutes);
app.use('/api/auth', oauthRoutes);
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
  // Server started successfully
}); 