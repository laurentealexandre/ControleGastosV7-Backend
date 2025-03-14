// src/controllers/saldoController.js
const pool = require('../config/database');

const saldoController = {
    // Obter saldo atual de todas as categorias
    getSaldoGeral: async (req, res) => {
        try {
            const { ano, mes, dataInicio, dataFim } = req.query;
            
            // Define valores padrão se não forem fornecidos
            const anoAtual = ano || new Date().getFullYear();
            const mesAtual = mes || new Date().getMonth() + 1;
            
            // Constrói a parte de filtro das consultas SQL com base nos parâmetros
            let filtroData = '';
            
            // Se dataInicio e dataFim forem fornecidos, usa intervalo de datas
            if (dataInicio && dataFim) {
                filtroData = `WHERE data BETWEEN '${dataInicio}' AND '${dataFim}'`;
            } 
            // Se só dataInicio for fornecido
            else if (dataInicio) {
                filtroData = `WHERE data >= '${dataInicio}'`;
            }
            // Se só dataFim for fornecido
            else if (dataFim) {
                filtroData = `WHERE data <= '${dataFim}'`;
            }
            // Caso contrário, usa ano e mês
            else {
                filtroData = `WHERE YEAR(data) = ${anoAtual}`;
                
                // Adiciona mês ao filtro se for fornecido
                if (mes) {
                    filtroData += ` AND MONTH(data) = ${mesAtual}`;
                }
            }
            
            // Caso especial para tabela de parque gráfico que usa campo 'mes' em vez de 'data'
            let filtroPG = '';
            if (dataInicio && dataFim) {
                filtroPG = `WHERE mes BETWEEN '${dataInicio}' AND '${dataFim}'`;
            } else if (dataInicio) {
                filtroPG = `WHERE mes >= '${dataInicio}'`;
            } else if (dataFim) {
                filtroPG = `WHERE mes <= '${dataFim}'`;
            } else {
                filtroPG = `WHERE YEAR(mes) = ${anoAtual}`;
                if (mes) {
                    filtroPG += ` AND MONTH(mes) = ${mesAtual}`;
                }
            }

            const [saldos] = await pool.query(`
                SELECT 
                    c.id as categoria_id,
                    c.nome as categoria,
                    v.valor_total as verba_total,
                    COALESCE(
                        CASE c.nome
                            WHEN 'Abastecimento' THEN (SELECT SUM(valor) FROM lancamentos_abastecimento ${filtroData})
                            WHEN 'Correios' THEN (SELECT SUM(valor) FROM lancamentos_correios ${filtroData})
                            WHEN 'Diárias' THEN (SELECT SUM(valor) FROM lancamentos_diarias ${filtroData})
                            WHEN 'Material Permanente' THEN (SELECT SUM(valor) FROM lancamentos_material_permanente ${filtroData})
                            WHEN 'Manutenção de Veículos' THEN (SELECT SUM(valor) FROM lancamentos_manutencao_veiculos ${filtroData})
                            WHEN 'Material de Consumo' THEN (SELECT SUM(valor) FROM lancamentos_material_consumo ${filtroData})
                            WHEN 'Almoxarifado' THEN (SELECT SUM(valor) FROM lancamentos_almoxarifado ${filtroData})
                            WHEN 'Parque Gráfico' THEN (SELECT SUM(valor) FROM lancamentos_parque_grafico ${filtroPG})
                            WHEN 'Passagens' THEN (SELECT SUM(valor) FROM lancamentos_passagens ${filtroData})
                            WHEN 'Manutenção Predial' THEN (SELECT SUM(valor) FROM lancamentos_manutencao_predial ${filtroData})
                            WHEN 'Transportes' THEN (SELECT SUM(valor) FROM lancamentos_transportes ${filtroData})
                        END, 0
                    ) as total_gasto
                FROM verbas v
                JOIN categorias c ON v.categoria_id = c.id
                WHERE v.ano = ${anoAtual} ${mes ? `AND v.mes = ${mesAtual}` : ''}
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
            const { ano, mes, dataInicio, dataFim } = req.query;
            
            // Define valores padrão se não forem fornecidos
            const anoConsulta = ano || new Date().getFullYear();
            const mesConsulta = mes || new Date().getMonth() + 1;
            
            // Parâmetros para a consulta
            const params = [categoria_id, anoConsulta];
            if (mes) params.push(mesConsulta);
            
            // Constrói a parte de filtro das consultas SQL
            let filtroData = '';
            
            // Se dataInicio e dataFim forem fornecidos, usa intervalo de datas
            if (dataInicio && dataFim) {
                filtroData = `WHERE data BETWEEN '${dataInicio}' AND '${dataFim}'`;
            } 
            // Se só dataInicio for fornecido
            else if (dataInicio) {
                filtroData = `WHERE data >= '${dataInicio}'`;
            }
            // Se só dataFim for fornecido
            else if (dataFim) {
                filtroData = `WHERE data <= '${dataFim}'`;
            }
            // Caso contrário, usa ano e mês
            else {
                filtroData = `WHERE YEAR(data) = ${anoConsulta}`;
                
                // Adiciona mês ao filtro se for fornecido
                if (mes) {
                    filtroData += ` AND MONTH(data) = ${mesConsulta}`;
                }
            }
            
            // Caso especial para tabela de parque gráfico que usa campo 'mes' em vez de 'data'
            let filtroPG = '';
            if (dataInicio && dataFim) {
                filtroPG = `WHERE mes BETWEEN '${dataInicio}' AND '${dataFim}'`;
            } else if (dataInicio) {
                filtroPG = `WHERE mes >= '${dataInicio}'`;
            } else if (dataFim) {
                filtroPG = `WHERE mes <= '${dataFim}'`;
            } else {
                filtroPG = `WHERE YEAR(mes) = ${anoConsulta}`;
                if (mes) {
                    filtroPG += ` AND MONTH(mes) = ${mesConsulta}`;
                }
            }

            const [saldos] = await pool.query(`
                SELECT 
                    c.nome as categoria,
                    CASE
                        WHEN ${!mes} THEN (SELECT SUM(valor_total) FROM verbas WHERE categoria_id = ? AND ano = ?)
                        ELSE (SELECT valor_total FROM verbas WHERE categoria_id = ? AND ano = ? AND mes = ?)
                    END as verba_total,
                    COALESCE(
                        CASE c.nome
                            WHEN 'Abastecimento' THEN (SELECT SUM(valor) FROM lancamentos_abastecimento ${filtroData})
                            WHEN 'Correios' THEN (SELECT SUM(valor) FROM lancamentos_correios ${filtroData})
                            WHEN 'Diárias' THEN (SELECT SUM(valor) FROM lancamentos_diarias ${filtroData})
                            WHEN 'Material Permanente' THEN (SELECT SUM(valor) FROM lancamentos_material_permanente ${filtroData})
                            WHEN 'Manutenção de Veículos' THEN (SELECT SUM(valor) FROM lancamentos_manutencao_veiculos ${filtroData})
                            WHEN 'Material de Consumo' THEN (SELECT SUM(valor) FROM lancamentos_material_consumo ${filtroData})
                            WHEN 'Almoxarifado' THEN (SELECT SUM(valor) FROM lancamentos_almoxarifado ${filtroData})
                            WHEN 'Parque Gráfico' THEN (SELECT SUM(valor) FROM lancamentos_parque_grafico ${filtroPG})
                            WHEN 'Passagens' THEN (SELECT SUM(valor) FROM lancamentos_passagens ${filtroData})
                            WHEN 'Manutenção Predial' THEN (SELECT SUM(valor) FROM lancamentos_manutencao_predial ${filtroData})
                            WHEN 'Transportes' THEN (SELECT SUM(valor) FROM lancamentos_transportes ${filtroData})
                        END, 0
                    ) as total_gasto
                FROM categorias c
                WHERE c.id = ?
            `, mes ? [categoria_id, anoConsulta, categoria_id, anoConsulta, mesConsulta, categoria_id] : [categoria_id, anoConsulta, categoria_id]);

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