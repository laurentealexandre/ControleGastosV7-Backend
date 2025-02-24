// src/routes/saldoRoutes.js
const express = require('express');
const router = express.Router();
const saldoController = require('../controllers/saldoController');
const authMiddleware = require('../middleware/auth');

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// Rotas de saldo
router.get('/', saldoController.getSaldoGeral);
router.get('/categoria/:categoria_id', saldoController.getSaldoCategoria);

module.exports = router;