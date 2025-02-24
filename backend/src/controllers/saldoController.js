// src/controllers/saldoController.js
const pool = require('../config/database');

const saldoController = {
    // Obter saldo atual de todas as categorias
    getSaldoGeral: async (req, res) => {
        try {
            const [saldos] = await pool.query(`
                SELECT 
                    c.id as categoria_id,
                    c.nome as categoria,
                    v.valor_total as verba_total,
                    COALESCE(
                        CASE c.nome
                            WHEN 'Abastecimento' THEN (SELECT SUM(valor) FROM lancamentos_abastecimento WHERE YEAR(data) = v.ano AND MONTH(data) = v.mes)
                            WHEN 'Correios' THEN (SELECT SUM(valor) FROM lancamentos_correios WHERE YEAR(data) = v.ano AND MONTH(data) = v.mes)
                            WHEN 'Diárias' THEN (SELECT SUM(valor) FROM lancamentos_diarias WHERE YEAR(data) = v.ano AND MONTH(data) = v.mes)
                            WHEN 'Material Permanente' THEN (SELECT SUM(valor) FROM lancamentos_material_permanente WHERE YEAR(data) = v.ano AND MONTH(data) = v.mes)
                            WHEN 'Manutenção de Veículos' THEN (SELECT SUM(valor) FROM lancamentos_manutencao_veiculos WHERE YEAR(data) = v.ano AND MONTH(data) = v.mes)
                            WHEN 'Material de Consumo' THEN (SELECT SUM(valor) FROM lancamentos_material_consumo WHERE YEAR(data) = v.ano AND MONTH(data) = v.mes)
                            WHEN 'Almoxarifado' THEN (SELECT SUM(valor) FROM lancamentos_almoxarifado WHERE YEAR(data) = v.ano AND MONTH(data) = v.mes)
                            WHEN 'Parque Gráfico' THEN (SELECT SUM(valor) FROM lancamentos_parque_grafico WHERE YEAR(mes) = v.ano AND MONTH(mes) = v.mes)
                            WHEN 'Passagens' THEN (SELECT SUM(valor) FROM lancamentos_passagens WHERE YEAR(data) = v.ano AND MONTH(data) = v.mes)
                            WHEN 'Manutenção Predial' THEN (SELECT SUM(valor) FROM lancamentos_manutencao_predial WHERE YEAR(data) = v.ano AND MONTH(data) = v.mes)
                            WHEN 'Transportes' THEN (SELECT SUM(valor) FROM lancamentos_transportes WHERE YEAR(data) = v.ano AND MONTH(data) = v.mes)
                        END, 0
                    ) as total_gasto
                FROM verbas v
                JOIN categorias c ON v.categoria_id = c.id
                WHERE v.ano = YEAR(CURRENT_DATE()) AND v.mes = MONTH(CURRENT_DATE())
            `);

            const saldosProcessados = saldos.map(saldo => ({
                ...saldo,
                saldo_atual: saldo.verba_total - saldo.total_gasto,
                percentual_usado: ((saldo.total_gasto / saldo.verba_total) * 100).toFixed(2)
            }));

            res.json(saldosProcessados);
        } catch (error) {
            console.error('Erro ao buscar saldos:', error);
            res.status(500).json({ message: 'Erro ao buscar saldos' });
        }
    },

    // Obter saldo por categoria
    getSaldoCategoria: async (req, res) => {
        try {
            const { categoria_id } = req.params;
            const { ano, mes } = req.query;

            const [saldos] = await pool.query(`
                SELECT 
                    c.nome as categoria,
                    v.valor_total as verba_total,
                    COALESCE(
                        CASE c.nome
                            WHEN 'Abastecimento' THEN (SELECT SUM(valor) FROM lancamentos_abastecimento WHERE YEAR(data) = ? AND MONTH(data) = ?)
                            WHEN 'Correios' THEN (SELECT SUM(valor) FROM lancamentos_correios WHERE YEAR(data) = ? AND MONTH(data) = ?)
                            WHEN 'Diárias' THEN (SELECT SUM(valor) FROM lancamentos_diarias WHERE YEAR(data) = ? AND MONTH(data) = ?)
                            WHEN 'Material Permanente' THEN (SELECT SUM(valor) FROM lancamentos_material_permanente WHERE YEAR(data) = ? AND MONTH(data) = ?)
                            WHEN 'Manutenção de Veículos' THEN (SELECT SUM(valor) FROM lancamentos_manutencao_veiculos WHERE YEAR(data) = ? AND MONTH(data) = ?)
                            WHEN 'Material de Consumo' THEN (SELECT SUM(valor) FROM lancamentos_material_consumo WHERE YEAR(data) = ? AND MONTH(data) = ?)
                            WHEN 'Almoxarifado' THEN (SELECT SUM(valor) FROM lancamentos_almoxarifado WHERE YEAR(data) = ? AND MONTH(data) = ?)
                            WHEN 'Parque Gráfico' THEN (SELECT SUM(valor) FROM lancamentos_parque_grafico WHERE YEAR(mes) = ? AND MONTH(mes) = ?)
                            WHEN 'Passagens' THEN (SELECT SUM(valor) FROM lancamentos_passagens WHERE YEAR(data) = ? AND MONTH(data) = ?)
                            WHEN 'Manutenção Predial' THEN (SELECT SUM(valor) FROM lancamentos_manutencao_predial WHERE YEAR(data) = ? AND MONTH(data) = ?)
                            WHEN 'Transportes' THEN (SELECT SUM(valor) FROM lancamentos_transportes WHERE YEAR(data) = ? AND MONTH(data) = ?)
                        END, 0
                    ) as total_gasto
                FROM verbas v
                JOIN categorias c ON v.categoria_id = c.id
                WHERE v.categoria_id = ? AND v.ano = ? AND v.mes = ?
            `, [ano, mes, ano, mes, ano, mes, ano, mes, ano, mes, ano, mes, ano, mes, ano, mes, ano, mes, ano, mes, ano, mes, categoria_id, ano, mes]);

            if (saldos.length === 0) {
                return res.status(404).json({ message: 'Saldo não encontrado para esta categoria/período' });
            }

            const saldo = saldos[0];
            res.json({
                ...saldo,
                saldo_atual: saldo.verba_total - saldo.total_gasto,
                percentual_usado: ((saldo.total_gasto / saldo.verba_total) * 100).toFixed(2)
            });
        } catch (error) {
            console.error('Erro ao buscar saldo da categoria:', error);
            res.status(500).json({ message: 'Erro ao buscar saldo da categoria' });
        }
    }
};

module.exports = saldoController;