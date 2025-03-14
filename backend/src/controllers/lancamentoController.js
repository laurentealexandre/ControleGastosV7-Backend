const pool = require('../config/database');

const lancamentoController = {
    // Criar novo lançamento de abastecimento
    createAbastecimento: async (req, res) => {
        try {
            const {
                data,
                placa,
                km,
                patrimonio,
                solicitante,
                numero_chamado,
                valor
            } = req.body;

            const [result] = await pool.query(
                `INSERT INTO lancamentos_abastecimento 
                (data, placa, km, patrimonio, solicitante, numero_chamado, valor, usuario_criacao) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [data, placa, km, patrimonio, solicitante, numero_chamado, valor, req.userId]
            );

            res.status(201).json({
                message: 'Lançamento criado com sucesso',
                id: result.insertId
            });
        } catch (error) {
            console.error('Erro ao criar lançamento:', error);
            res.status(500).json({ message: 'Erro ao criar lançamento' });
        }
    },

    // Listar lançamentos de abastecimento
    getAbastecimento: async (req, res) => {
        try {
            const { ano, mes, dataInicio, dataFim } = req.query;
            let query = `
                SELECT 
                    l.*,
                    u.nome as usuario_nome
                FROM lancamentos_abastecimento l
                LEFT JOIN usuarios u ON l.usuario_criacao = u.id
            `;
            let params = [];
            let whereAdded = false;

            // Filtro por período (dataInicio e dataFim)
            if (dataInicio && dataFim) {
                query += ' WHERE l.data BETWEEN ? AND ?';
                params = [dataInicio, dataFim];
                whereAdded = true;
            } 
            // Filtro apenas por dataInicio
            else if (dataInicio) {
                query += ' WHERE l.data >= ?';
                params = [dataInicio];
                whereAdded = true;
            } 
            // Filtro apenas por dataFim
            else if (dataFim) {
                query += ' WHERE l.data <= ?';
                params = [dataFim];
                whereAdded = true;
            } 
            // Manter compatibilidade com o filtro existente por ano e mês
            else if (ano && mes) {
                query += ' WHERE YEAR(l.data) = ? AND MONTH(l.data) = ?';
                params = [ano, mes];
                whereAdded = true;
            }
            // Filtro apenas por ano (todos os meses do ano)
            else if (ano) {
                query += ' WHERE YEAR(l.data) = ?';
                params = [ano];
                whereAdded = true;
            }

            query += ' ORDER BY l.data DESC';

            const [lancamentos] = await pool.query(query, params);
            res.json(lancamentos);
        } catch (error) {
            console.error('Erro ao listar lançamentos:', error);
            res.status(500).json({ message: 'Erro ao listar lançamentos' });
        }
    },

    // Buscar um lançamento específico
    getAbastecimentoById: async (req, res) => {
        try {
            const { id } = req.params;
            const [lancamentos] = await pool.query(
                `SELECT 
                    l.*,
                    u.nome as usuario_nome
                FROM lancamentos_abastecimento l
                LEFT JOIN usuarios u ON l.usuario_criacao = u.id
                WHERE l.id = ?`,
                [id]
            );

            if (lancamentos.length === 0) {
                return res.status(404).json({ message: 'Lançamento não encontrado' });
            }

            res.json(lancamentos[0]);
        } catch (error) {
            console.error('Erro ao buscar lançamento:', error);
            res.status(500).json({ message: 'Erro ao buscar lançamento' });
        }
    },

    // Atualizar lançamento
    updateAbastecimento: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                data,
                placa,
                km,
                patrimonio,
                solicitante,
                numero_chamado,
                valor
            } = req.body;

            const [result] = await pool.query(
                `UPDATE lancamentos_abastecimento 
                SET data = ?, placa = ?, km = ?, patrimonio = ?, 
                    solicitante = ?, numero_chamado = ?, valor = ? 
                WHERE id = ?`,
                [data, placa, km, patrimonio, solicitante, numero_chamado, valor, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Lançamento não encontrado' });
            }

            res.json({ message: 'Lançamento atualizado com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar lançamento:', error);
            res.status(500).json({ message: 'Erro ao atualizar lançamento' });
        }
    },

    // Deletar lançamento
    deleteAbastecimento: async (req, res) => {
        try {
            const { id } = req.params;
            const [result] = await pool.query(
                'DELETE FROM lancamentos_abastecimento WHERE id = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Lançamento não encontrado' });
            }

            res.json({ message: 'Lançamento deletado com sucesso' });
        } catch (error) {
            console.error('Erro ao deletar lançamento:', error);
            res.status(500).json({ message: 'Erro ao deletar lançamento' });
        }
    }
};

module.exports = lancamentoController;