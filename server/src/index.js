import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import oauthRoutes from "./routes/oauth.js";
import forumRoutes from "./routes/forum.js";
import ongsRoutes from "./routes/ongs.js";
import categoriesRoutes from "./routes/categories.js";
import adminRoutes from "./routes/admin.js";
import paymentsRoutes from "./routes/payments.js";
import notificationsRoutes from "./routes/notifications.js";
import passport from "./config/passport.js";
import { PrismaClient } from "@prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient();

// Configurar CORS para permitir frontend en 3000 y 3002
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3002",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3002",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests de herramientas (sin origin) y de orígenes permitidos
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200,
  }),
);

// Middleware para parsear JSON con límite aumentado para imágenes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Servir archivos estáticos (imágenes subidas)
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Configurar sesiones para Passport
app.use(
  session({
    secret: process.env.JWT_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Cambiar a true en producción con HTTPS
  }),
);

// Inicializar Passport
app.use(passport.initialize());
// Rutas
app.use("/auth", authRoutes);
app.use("/api/auth", oauthRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/ongs", ongsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/notifications", notificationsRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API de Demos+ funcionando correctamente" });
});

// Healthcheck de base de datos
app.get("/health/db", async (req, res) => {
  try {
    // 1) comprobar conexión
    await prisma.$queryRaw`SELECT 1`;

    // 2) validar tablas esenciales
    const result =
      await prisma.$queryRaw`SELECT to_regclass('"public"."Usuario"') AS usuario, to_regclass('"public"."TipoUsuario"') AS tipousuario`;
    const row = Array.isArray(result) ? result[0] : result;
    const missing = [];
    if (!row?.usuario) missing.push("public.Usuario");
    if (!row?.tipousuario) missing.push("public.TipoUsuario");
    if (missing.length) {
      return res
        .status(500)
        .json({ ok: false, reason: "missing_tables", details: { missing } });
    }

    res.json({ ok: true });
  } catch (err) {
    const code = err?.code;
    const map = {
      P1001: "No se pudo conectar al servidor de base de datos (P1001).",
      P1003: "La base de datos especificada no existe (P1003).",
    };
    res.status(500).json({
      ok: false,
      reason: "db_error",
      code,
      message: map[code] || err?.message || "Error de conexión",
    });
  }
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Error interno del servidor: " + err.message });
});

// Iniciar servidor solo fuera de test
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    // Server started successfully
  });
}

export default app;
