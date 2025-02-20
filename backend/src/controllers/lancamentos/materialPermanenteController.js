const pool = require('../../config/database');

const materialPermanenteController = {
    create: async (req, res) => {
        try {
            const {
                data,
                numero_requisicao,
                valor,
                solicitante,
                material
            } = req.body;

            const [result] = await pool.query(
                `INSERT INTO lancamentos_material_permanente 
                (data, numero_requisicao, valor, solicitante, material, usuario_criacao) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [data, numero_requisicao, valor, solicitante, material, req.userId]
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

    getAll: async (req, res) => {
        try {
            const { ano, mes } = req.query;
            let query = `
                SELECT 
                    l.*,
                    u.nome as usuario_nome
                FROM lancamentos_material_permanente l
                LEFT JOIN usuarios u ON l.usuario_criacao = u.id
            `;
            let params = [];

            if (ano && mes) {
                query += ' WHERE YEAR(l.data) = ? AND MONTH(l.data) = ?';
                params = [ano, mes];
            }

            query += ' ORDER BY l.data DESC';

            const [lancamentos] = await pool.query(query, params);
            res.json(lancamentos);
        } catch (error) {
            console.error('Erro ao listar lançamentos:', error);
            res.status(500).json({ message: 'Erro ao listar lançamentos' });
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const [lancamentos] = await pool.query(
                `SELECT 
                    l.*,
                    u.nome as usuario_nome
                FROM lancamentos_material_permanente l
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

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                data,
                numero_requisicao,
                valor,
                solicitante,
                material
            } = req.body;

            const [result] = await pool.query(
                `UPDATE lancamentos_material_permanente 
                SET data = ?, numero_requisicao = ?, valor = ?, solicitante = ?, material = ? 
                WHERE id = ?`,
                [data, numero_requisicao, valor, solicitante, material, id]
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

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const [result] = await pool.query(
                'DELETE FROM lancamentos_material_permanente WHERE id = ?',
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

module.exports = materialPermanenteController;