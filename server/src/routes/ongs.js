import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { encryptSecret } from "../../lib/encryption-service.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const prisma = new PrismaClient();

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../../public/uploads/profiles");
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "ong-" + req.user.id_usuario + "-" + uniqueSuffix + ext);
  },
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)",
      ),
    );
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: fileFilter,
});

// Obtener todas las ONGs (usuarios tipo 2)
router.get("/", async (req, res) => {
  try {
    const { type, location } = req.query;

    // Construir filtros
    const whereClause = {
      id_tipo_usuario: 2, // Solo usuarios tipo ONG
    };

    // Aplicar filtros si se proporcionan
    if (location) {
      whereClause.ubicacion = {
        contains: location,
        mode: "insensitive",
      };
    }

    const ongs = await prisma.Usuario.findMany({
      where: whereClause,
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        email: true,
        ubicacion: true,
        coordenadas: true,
        redes_sociales: true,
        telefono: true,
        createdAt: true,
        biografia: true,
        calificacionesRecibidas: {
          select: {
            puntuacion: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transformar los datos para el frontend
    const ongsFormateadas = ongs.map((ong) => {
      // Calcular rating promedio
      const calificaciones = ong.calificacionesRecibidas;
      const rating =
        calificaciones.length > 0
          ? calificaciones.reduce((sum, cal) => sum + cal.puntuacion, 0) /
          calificaciones.length
          : 0;

      // Parsear coordenadas si existen
      let coordinates = null;
      if (ong.coordenadas) {
        try {
          coordinates = JSON.parse(ong.coordenadas);
        } catch (e) {
          console.error("Error al parsear coordenadas:", e);
        }
      }

      // Parsear redes sociales si existen
      let socialMedia = [];
      if (ong.redes_sociales) {
        try {
          socialMedia = JSON.parse(ong.redes_sociales);
        } catch (e) {
          console.error("Error al parsear redes sociales:", e);
        }
      }

      return {
        id: ong.id_usuario,
        name: ong.nombre || "ONG",
        description: ong.biografia || "Sin descripción disponible",
        location: ong.ubicacion || "Ubicación no especificada",
        coordinates,
        socialMedia,
        email: ong.email,
        type: "public",
        rating: parseFloat(rating.toFixed(1)),
        volunteers_count: 0,
        projects_count: 0,
        website: "",
        phone: ong.telefono || "",
        totalRatings: calificaciones.length,
      };
    });

    // Aplicar filtro de tipo si se especifica
    let ongsFiltradas = ongsFormateadas;
    if (type && type !== "all") {
      ongsFiltradas = ongsFormateadas.filter((ong) => ong.type === type);
    }

    res.json({ ongs: ongsFiltradas });
  } catch (error) {
    console.error("Error al obtener ONGs:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener una ONG específica por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const ong = await prisma.Usuario.findFirst({
      where: {
        id_usuario: parseInt(id),
        id_tipo_usuario: 2,
      },
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        email: true,
        ubicacion: true,
        createdAt: true,
        biografia: true,
      },
    });

    if (!ong) {
      return res.status(404).json({ error: "ONG no encontrada" });
    }

    const ongFormateada = {
      id: ong.id_usuario,
      name: ong.nombre || "ONG",
      description: ong.biografia || "Sin descripción disponible",
      location: ong.ubicacion || "Ubicación no especificada",
      email: ong.email,
      type: "public",
      rating: 0,
      volunteers_count: 0,
      projects_count: 0,
      website: "",
      phone: "",
    };

    res.json({ ong: ongFormateada });
  } catch (error) {
    console.error("Error al obtener ONG:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "tu-secreto-jwt",
    );
    req.user = { id_usuario: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

// Ver estado de pagos (público) de una ONG
router.get("/:id/mp-status", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const detalle = await prisma.DetalleUsuario.findFirst({
      where: { id_usuario: id },
      select: { mp_enabled: true },
    });

    res.json({ enabled: !!detalle?.mp_enabled });
  } catch (error) {
    console.error("Error mp-status:", error);
    res.status(500).json({ error: "Error al obtener estado de pagos" });
  }
});

// Configurar token de MP (solo ONG autenticada)
router.post("/mp-token", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    // Confirmar que es ONG
    const user = await prisma.Usuario.findUnique({
      where: { id_usuario: userId },
      select: { id_tipo_usuario: true },
    });
    if (!user || user.id_tipo_usuario !== 2) {
      return res
        .status(403)
        .json({ error: "Solo ONGs pueden configurar pagos" });
    }

    const { accessToken, enable } = req.body || {};
    if (!accessToken || typeof accessToken !== "string") {
      return res.status(400).json({ error: "accessToken es requerido" });
    }

    // Validación de MP: solo se aceptan tokens de producción APP_USR-
    if (typeof accessToken !== "string" || !accessToken.startsWith("APP_USR-")) {
      return res.status(400).json({
        error: "Se requiere Access Token de producción de Mercado Pago (APP_USR-...)",
      });
    }

    // Validar ENCRYPTION_KEY configurada
    if (!process.env.ENCRYPTION_KEY) {
      return res
        .status(500)
        .json({ error: "Falta configurar ENCRYPTION_KEY en el servidor" });
    }

    const enc = encryptSecret(accessToken);

    const existingDetalle = await prisma.DetalleUsuario.findFirst({
      where: { id_usuario: userId },
      select: { id_detalle_usuario: true },
    });

    let detalle;
    const data = {
      mp_token_cipher: enc.cipher,
      mp_token_iv: enc.iv,
      mp_token_tag: enc.tag,
      mp_enabled: enable === false ? false : true,
      mp_onboarded_at: new Date(),
    };

    if (existingDetalle) {
      detalle = await prisma.DetalleUsuario.update({
        where: { id_detalle_usuario: existingDetalle.id_detalle_usuario },
        data,
      });
    } else {
      detalle = await prisma.DetalleUsuario.create({
        data: {
          id_usuario: userId,
          ...data,
        },
      });
    }

    res.json({ message: "Token configurado", enabled: detalle.mp_enabled });
  } catch (error) {
    console.error("Error al configurar mp-token:", error);
    const message = error?.message || "Error al configurar token";
    res
      .status(500)
      .json({ error: "Error al configurar token", details: message });
  }
});

// Eliminar token de MP (deshabilitar)
router.delete("/mp-token", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const user = await prisma.Usuario.findUnique({
      where: { id_usuario: userId },
      select: { id_tipo_usuario: true },
    });
    if (!user || user.id_tipo_usuario !== 2) {
      return res
        .status(403)
        .json({ error: "Solo ONGs pueden modificar pagos" });
    }

    const existingDetalle = await prisma.DetalleUsuario.findFirst({
      where: { id_usuario: userId },
      select: { id_detalle_usuario: true },
    });

    if (existingDetalle) {
      await prisma.DetalleUsuario.update({
        where: { id_detalle_usuario: existingDetalle.id_detalle_usuario },
        data: {
          mp_token_cipher: null,
          mp_token_iv: null,
          mp_token_tag: null,
          mp_enabled: false,
        },
      });
    } else {
      await prisma.DetalleUsuario.create({
        data: { id_usuario: userId, mp_enabled: false },
      });
    }

    res.json({ message: "Pagos deshabilitados", enabled: false });
  } catch (error) {
    console.error("Error al eliminar mp-token:", error);
    res.status(500).json({ error: "Error al eliminar token" });
  }
});

// Calificar una ONG
router.post("/:id/calificar", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { puntuacion, comentario } = req.body;
    const userId = req.user.id_usuario;

    // Validar puntuación
    if (!puntuacion || puntuacion < 1 || puntuacion > 5) {
      return res
        .status(400)
        .json({ error: "La puntuación debe estar entre 1 y 5" });
    }

    // Verificar que la ONG existe
    const ong = await prisma.Usuario.findUnique({
      where: {
        id_usuario: parseInt(id),
        id_tipo_usuario: 2,
      },
    });

    if (!ong) {
      return res.status(404).json({ error: "ONG no encontrada" });
    }

    // Verificar que el usuario no esté calificando su propia ONG
    if (parseInt(id) === userId) {
      return res
        .status(400)
        .json({ error: "No puedes calificar tu propia organización" });
    }

    // Intentar crear o actualizar la calificación
    const calificacion = await prisma.CalificacionONG.upsert({
      where: {
        id_ong_id_usuario: {
          id_ong: parseInt(id),
          id_usuario: userId,
        },
      },
      update: {
        puntuacion: parseFloat(puntuacion),
        comentario: comentario || null,
        fecha_calificacion: new Date(),
      },
      create: {
        id_ong: parseInt(id),
        id_usuario: userId,
        puntuacion: parseFloat(puntuacion),
        comentario: comentario || null,
      },
    });

    // Calcular nuevo promedio
    const todasCalificaciones = await prisma.CalificacionONG.findMany({
      where: { id_ong: parseInt(id) },
      select: { puntuacion: true },
    });

    const nuevoPromedio =
      todasCalificaciones.reduce((sum, cal) => sum + cal.puntuacion, 0) /
      todasCalificaciones.length;

    res.json({
      message: "Calificación guardada exitosamente",
      calificacion,
      nuevoPromedio: parseFloat(nuevoPromedio.toFixed(1)),
      totalCalificaciones: todasCalificaciones.length,
    });
  } catch (error) {
    console.error("Error al calificar ONG:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Verificar si el usuario ya calificó una ONG
router.get("/:id/mi-calificacion", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_usuario;

    const calificacion = await prisma.CalificacionONG.findUnique({
      where: {
        id_ong_id_usuario: {
          id_ong: parseInt(id),
          id_usuario: userId,
        },
      },
    });

    if (!calificacion) {
      return res.json({ hasRated: false });
    }

    res.json({
      hasRated: true,
      puntuacion: calificacion.puntuacion,
      comentario: calificacion.comentario,
      fecha: calificacion.fecha_calificacion,
    });
  } catch (error) {
    console.error("Error al obtener calificación:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Subir imagen de perfil (solo ONG autenticada)
router.post(
  "/profile-image",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const userId = req.user.id_usuario;

      // Confirmar que es ONG
      const user = await prisma.Usuario.findUnique({
        where: { id_usuario: userId },
        select: { id_tipo_usuario: true },
      });

      if (!user || user.id_tipo_usuario !== 2) {
        return res
          .status(403)
          .json({ error: "Solo ONGs pueden subir imágenes de perfil" });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ error: "No se proporcionó ninguna imagen" });
      }

      // Construir la URL de la imagen
      const imageUrl = `/uploads/profiles/${req.file.filename}`;

      // Obtener la imagen anterior si existe para eliminarla
      const detalleUsuario = await prisma.DetalleUsuario.findFirst({
        where: { id_usuario: userId },
        select: { profile_picture: true },
      });

      // Eliminar imagen anterior del sistema de archivos si existe
      if (detalleUsuario?.profile_picture) {
        const oldImagePath = path.join(
          __dirname,
          "../../public",
          detalleUsuario.profile_picture,
        );
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
            console.log("🗑️ Imagen anterior eliminada:", oldImagePath);
          } catch (error) {
            console.error("Error al eliminar imagen anterior:", error);
          }
        }
      }

      // Actualizar o crear registro en DetalleUsuario con la nueva URL
      const existingDetalle = await prisma.DetalleUsuario.findFirst({
        where: { id_usuario: userId },
        select: { id_detalle_usuario: true },
      });

      const updatedDetalle = existingDetalle
        ? await prisma.DetalleUsuario.update({
          where: { id_detalle_usuario: existingDetalle.id_detalle_usuario },
          data: { profile_picture: imageUrl },
        })
        : await prisma.DetalleUsuario.create({
          data: {
            id_usuario: userId,
            profile_picture: imageUrl,
          },
        });

      console.log("✅ Imagen de perfil guardada:", imageUrl);

      res.json({
        message: "Imagen de perfil subida exitosamente",
        imageUrl: imageUrl,
        fileName: req.file.filename,
      });
    } catch (error) {
      console.error("Error al subir imagen de perfil:", error);

      // Si hubo error, intentar eliminar el archivo subido
      if (req.file) {
        const filePath = path.join(
          __dirname,
          "../../public/uploads/profiles",
          req.file.filename,
        );
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.error("Error al eliminar archivo después de fallo:", err);
          }
        }
      }

      res.status(500).json({
        error: "Error al subir imagen de perfil",
        details: error.message,
      });
    }
  },
);

// Obtener imagen de perfil de una ONG
router.get("/:id/profile-image", async (req, res) => {
  try {
    const { id } = req.params;

    const detalleUsuario = await prisma.DetalleUsuario.findUnique({
      where: { id_usuario: parseInt(id) },
      select: { profile_picture: true },
    });

    if (!detalleUsuario || !detalleUsuario.profile_picture) {
      return res.json({ imageUrl: null });
    }

    res.json({ imageUrl: detalleUsuario.profile_picture });
  } catch (error) {
    console.error("Error al obtener imagen de perfil:", error);
    res.status(500).json({ error: "Error al obtener imagen de perfil" });
  }
});

// Eliminar imagen de perfil (solo ONG autenticada)
router.delete("/profile-image", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id_usuario;

    // Confirmar que es ONG
    const user = await prisma.Usuario.findUnique({
      where: { id_usuario: userId },
      select: { id_tipo_usuario: true },
    });

    if (!user || user.id_tipo_usuario !== 2) {
      return res
        .status(403)
        .json({ error: "Solo ONGs pueden eliminar su imagen de perfil" });
    }

    // Obtener la imagen actual
    const detalleUsuario = await prisma.DetalleUsuario.findFirst({
      where: { id_usuario: userId },
      select: { profile_picture: true },
    });

    if (!detalleUsuario?.profile_picture) {
      return res
        .status(404)
        .json({ error: "No hay imagen de perfil para eliminar" });
    }

    // Eliminar archivo del sistema
    const imagePath = path.join(
      __dirname,
      "../../public",
      detalleUsuario.profile_picture,
    );
    if (fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
        console.log("🗑️ Imagen eliminada del servidor:", imagePath);
      } catch (error) {
        console.error("Error al eliminar archivo:", error);
      }
    }

    // Actualizar base de datos
    const existingDetalle = await prisma.DetalleUsuario.findFirst({
      where: { id_usuario: userId },
      select: { id_detalle_usuario: true },
    });

    if (existingDetalle) {
      await prisma.DetalleUsuario.update({
        where: { id_detalle_usuario: existingDetalle.id_detalle_usuario },
        data: { profile_picture: null },
      });
    }

    res.json({ message: "Imagen de perfil eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar imagen de perfil:", error);
    res.status(500).json({
      error: "Error al eliminar imagen de perfil",
      details: error.message,
    });
  }
});

export default router;
