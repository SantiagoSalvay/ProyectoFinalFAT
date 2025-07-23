const express = require('express');
const router = express.Router();


const prisma = require('../prismaClient');

router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({ select: { email: true, name: true } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

module.exports = router;
