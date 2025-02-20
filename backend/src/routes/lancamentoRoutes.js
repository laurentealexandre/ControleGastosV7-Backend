const express = require('express');
const router = express.Router();
const lancamentoController = require('../controllers/lancamentoController');
const authMiddleware = require('../middleware/auth');

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// Rotas para Abastecimento
router.post('/abastecimento', lancamentoController.createAbastecimento);
router.get('/abastecimento', lancamentoController.getAbastecimento);
router.get('/abastecimento/:id', lancamentoController.getAbastecimentoById);
router.put('/abastecimento/:id', lancamentoController.updateAbastecimento);
router.delete('/abastecimento/:id', lancamentoController.deleteAbastecimento);

module.exports = router;