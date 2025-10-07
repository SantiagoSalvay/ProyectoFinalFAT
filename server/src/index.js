import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import authRoutes from './routes/auth.js';
import oauthRoutes from './routes/oauth.js';
import forumRoutes from './routes/forum.js';
import ongsRoutes from './routes/ongs.js';
import mercadopagoRoutes from './routes/mercadopago.js';
import passport from './config/passport.js';

// Cargar variables de entorno desde el directorio raíz
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar CORS para permitir frontend en 3000 y 3002
const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3002'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests de herramientas (sin origin) y de orígenes permitidos
    if (!origin || allowedOrigins.includes(origin)) {
      console.log('✅ CORS permitido para:', origin || 'sin origin');
      return callback(null, true);
    }
    console.log('❌ CORS denegado para:', origin);
    return callback(new Error('CORS not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Middleware para parsear JSON con límite aumentado para imágenes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
app.use('/api/forum', forumRoutes);
app.use('/api/ongs', ongsRoutes);
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