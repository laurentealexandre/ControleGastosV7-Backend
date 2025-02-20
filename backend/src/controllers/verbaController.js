const pool = require('../config/database');

const verbaController = {
    // Criar nova verba
    create: async (req, res) => {
        try {
            const { categoria_id, valor_total, ano, mes } = req.body;
            const usuario_atualizacao = req.userId; // Vem do middleware de auth

            const [result] = await pool.query(
                'INSERT INTO verbas (categoria_id, valor_total, ano, mes, usuario_atualizacao) VALUES (?, ?, ?, ?, ?)',
                [categoria_id, valor_total, ano, mes, usuario_atualizacao]
            );

            res.status(201).json({
                message: 'Verba criada com sucesso',
                id: result.insertId
            });
        } catch (error) {
            console.error('Erro ao criar verba:', error);
            res.status(500).json({ message: 'Erro ao criar verba' });
        }
    },

    // Listar todas as verbas
    getAll: async (req, res) => {
        try {
            const [verbas] = await pool.query(`
                SELECT v.*, c.nome as categoria_nome 
                FROM verbas v 
                JOIN categorias c ON v.categoria_id = c.id
                ORDER BY v.ano DESC, v.mes DESC
            `);

            res.json(verbas);
        } catch (error) {
            console.error('Erro ao listar verbas:', error);
            res.status(500).json({ message: 'Erro ao listar verbas' });
        }
    },

    // Buscar uma verba específica
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const [verbas] = await pool.query(`
                SELECT v.*, c.nome as categoria_nome 
                FROM verbas v 
                JOIN categorias c ON v.categoria_id = c.id 
                WHERE v.id = ?
            `, [id]);

            if (verbas.length === 0) {
                return res.status(404).json({ message: 'Verba não encontrada' });
            }

            res.json(verbas[0]);
        } catch (error) {
            console.error('Erro ao buscar verba:', error);
            res.status(500).json({ message: 'Erro ao buscar verba' });
        }
    },

    // Atualizar verba
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { valor_total } = req.body;
            const usuario_atualizacao = req.userId;

            const [result] = await pool.query(
                'UPDATE verbas SET valor_total = ?, usuario_atualizacao = ? WHERE id = ?',
                [valor_total, usuario_atualizacao, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Verba não encontrada' });
            }

            res.json({ message: 'Verba atualizada com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar verba:', error);
            res.status(500).json({ message: 'Erro ao atualizar verba' });
        }
    },

    // Deletar verba
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const [result] = await pool.query('DELETE FROM verbas WHERE id = ?', [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Verba não encontrada' });
            }

            res.json({ message: 'Verba deletada com sucesso' });
        } catch (error) {
            console.error('Erro ao deletar verba:', error);
            res.status(500).json({ message: 'Erro ao deletar verba' });
        }
    },

    // Buscar verbas por ano/mês
    getByPeriodo: async (req, res) => {
        try {
            const { ano, mes } = req.query;
            const [verbas] = await pool.query(`
                SELECT v.*, c.nome as categoria_nome 
                FROM verbas v 
                JOIN categorias c ON v.categoria_id = c.id 
                WHERE v.ano = ? AND v.mes = ?
            `, [ano, mes]);

            res.json(verbas);
        } catch (error) {
            console.error('Erro ao buscar verbas por período:', error);
            res.status(500).json({ message: 'Erro ao buscar verbas por período' });
        }
    }
};

module.exports = verbaController;