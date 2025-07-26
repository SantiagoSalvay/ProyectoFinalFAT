const express = require('express');
const router = express.Router();


const prisma = require('../prismaClient');


router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.password === password) {
      res.json({ success: true, user: { email: user.email, name: user.name } });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});


router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ success: false, message: 'El usuario ya existe' });
    }
    const user = await prisma.user.create({ data: { email, password, name } });
    res.json({ success: true, user: { email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

module.exports = router;
