const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const {
    abastecimentoController,
    correiosController,
    diariasController,
    materialPermanenteController,
    manutencaoVeiculosController,
    materialConsumoController,
    almoxarifadoController,
    parqueGraficoController,
    passagensController,
    manutencaoPredialController,
    transportesController
} = require('../controllers/lancamentos');

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// Rotas para Abastecimento
router.post('/abastecimento', abastecimentoController.create);
router.get('/abastecimento', abastecimentoController.getAll);
router.get('/abastecimento/:id', abastecimentoController.getById);
router.put('/abastecimento/:id', abastecimentoController.update);
router.delete('/abastecimento/:id', abastecimentoController.delete);

// Rotas para Correios
router.post('/correios', correiosController.create);
router.get('/correios', correiosController.getAll);
router.get('/correios/:id', correiosController.getById);
router.put('/correios/:id', correiosController.update);
router.delete('/correios/:id', correiosController.delete);

// Rotas para Diárias
router.post('/diarias', diariasController.create);
router.get('/diarias', diariasController.getAll);
router.get('/diarias/:id', diariasController.getById);
router.put('/diarias/:id', diariasController.update);
router.delete('/diarias/:id', diariasController.delete);

// Rotas para Material Permanente
router.post('/material-permanente', materialPermanenteController.create);
router.get('/material-permanente', materialPermanenteController.getAll);
router.get('/material-permanente/:id', materialPermanenteController.getById);
router.put('/material-permanente/:id', materialPermanenteController.update);
router.delete('/material-permanente/:id', materialPermanenteController.delete);

// Rotas para Manutenção de Veículos
router.post('/manutencao-veiculos', manutencaoVeiculosController.create);
router.get('/manutencao-veiculos', manutencaoVeiculosController.getAll);
router.get('/manutencao-veiculos/:id', manutencaoVeiculosController.getById);
router.put('/manutencao-veiculos/:id', manutencaoVeiculosController.update);
router.delete('/manutencao-veiculos/:id', manutencaoVeiculosController.delete);

// Rotas para Material de Consumo
router.post('/material-consumo', materialConsumoController.create);
router.get('/material-consumo', materialConsumoController.getAll);
router.get('/material-consumo/:id', materialConsumoController.getById);
router.put('/material-consumo/:id', materialConsumoController.update);
router.delete('/material-consumo/:id', materialConsumoController.delete);

// Rotas para Almoxarifado
router.post('/almoxarifado', almoxarifadoController.create);
router.get('/almoxarifado', almoxarifadoController.getAll);
router.get('/almoxarifado/:id', almoxarifadoController.getById);
router.put('/almoxarifado/:id', almoxarifadoController.update);
router.delete('/almoxarifado/:id', almoxarifadoController.delete);

// Rotas para Parque Gráfico
router.post('/parque-grafico', parqueGraficoController.create);
router.get('/parque-grafico', parqueGraficoController.getAll);
router.get('/parque-grafico/:id', parqueGraficoController.getById);
router.put('/parque-grafico/:id', parqueGraficoController.update);
router.delete('/parque-grafico/:id', parqueGraficoController.delete);

// Rotas para Passagens
router.post('/passagens', passagensController.create);
router.get('/passagens', passagensController.getAll);
router.get('/passagens/:id', passagensController.getById);
router.put('/passagens/:id', passagensController.update);
router.delete('/passagens/:id', passagensController.delete);

// Rotas para Manutenção Predial
router.post('/manutencao-predial', manutencaoPredialController.create);
router.get('/manutencao-predial', manutencaoPredialController.getAll);
router.get('/manutencao-predial/:id', manutencaoPredialController.getById);
router.put('/manutencao-predial/:id', manutencaoPredialController.update);
router.delete('/manutencao-predial/:id', manutencaoPredialController.delete);

// Rotas para Transportes
router.post('/transportes', transportesController.create);
router.get('/transportes', transportesController.getAll);
router.get('/transportes/:id', transportesController.getById);
router.put('/transportes/:id', transportesController.update);
router.delete('/transportes/:id', transportesController.delete);

module.exports = router;