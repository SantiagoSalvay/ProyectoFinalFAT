import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);

    const { nombre, apellido, correo, contrasena, usuario, telefono, ubicacion } = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (!nombre || !apellido || !correo || !contrasena) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos' 
      });
    }

    // Verificar si el usuario ya existe por correo
    const existingUser = await prisma.usuario.findFirst({
      where: { 
        OR: [
          { correo },
          { usuario }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.correo === correo 
          ? 'El correo ya está registrado' 
          : 'El nombre de usuario ya está registrado'
      });
    }

    // Obtener o crear el tipo de usuario normal
    let tipoUsuario = await prisma.tipoUsuario.findFirst({
      where: { nombre_tipo_usuario: 'normal' }
    });

    if (!tipoUsuario) {
      tipoUsuario = await prisma.tipoUsuario.create({
        data: {
          nombre_tipo_usuario: 'normal'
        }
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    console.log('Creando usuario con datos:', {
      nombre,
      apellido,
      usuario,
      telefono,
      correo,
      ubicacion,
      tipo_usuario: tipoUsuario.tipo_usuario
    });

    // Crear usuario
    const newUser = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        usuario,
        telefono: telefono || "",
        correo,
        contrasena: hashedPassword,
        tipo_usuario: tipoUsuario.tipo_usuario,
        ubicacion: ubicacion || ""
      }
    });

    console.log('Usuario creado:', {
      id: newUser.id_usuario,
      usuario: newUser.usuario,
      correo: newUser.correo
    });

    // Generar token JWT
    const token = jwt.sign(
      { userId: newUser.id_usuario, email: newUser.correo },
      process.env.JWT_SECRET || 'tu-secreto-jwt',
      { expiresIn: '7d' }
    );

    // Omitir contraseña de la respuesta
    const { contrasena: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por correo
    const user = await prisma.usuario.findFirst({
      where: { correo: email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.contrasena);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id_usuario, email: user.correo },
      process.env.JWT_SECRET || 'tu-secreto-jwt',
      { expiresIn: '7d' }
    );

    // Omitir contraseña de la respuesta
    const { contrasena: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login exitoso',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener perfil del usuario
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-jwt');
    
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: decoded.userId },
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        usuario: true,
        telefono: true,
        correo: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 