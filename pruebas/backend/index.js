const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');

const app = express();
app.use(cors());
app.use(bodyParser.json());


app.use('/auth', authRoutes);
app.use('/users', usersRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API de pruebas funcionando' });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor de pruebas corriendo en http://localhost:${PORT}`);
});
