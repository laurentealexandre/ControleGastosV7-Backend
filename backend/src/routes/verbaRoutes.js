const express = require('express');
const router = express.Router();
const verbaController = require('../controllers/verbaController');
const authMiddleware = require('../middleware/auth');

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// Rotas CRUD
router.post('/', verbaController.create);
router.get('/', verbaController.getAll);
router.get('/periodo', verbaController.getByPeriodo);
router.get('/:id', verbaController.getById);
router.put('/:id', verbaController.update);
router.delete('/:id', verbaController.delete);

module.exports = router;