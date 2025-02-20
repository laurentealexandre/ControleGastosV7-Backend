const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const verbaRoutes = require('./routes/verbaRoutes');
const saldoRoutes = require('./routes/saldoRoutes');
const lancamentoRoutes = require('./routes/lancamentoRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/verbas', verbaRoutes);
app.use('/api/saldos', saldoRoutes);
app.use('/api/lancamentos', lancamentoRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Controle de Gastos' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});