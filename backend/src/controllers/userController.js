const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const userController = {
    // Listar todos os usuários
    getAll: async (req, res) => {
        try {
            const [users] = await pool.query(
                'SELECT id, nome, email, data_criacao FROM usuarios ORDER BY nome'
            );
            
            res.json(users);
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            res.status(500).json({ message: 'Erro ao listar usuários' });
        }
    },

    // Buscar usuário por ID
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const [users] = await pool.query(
                'SELECT id, nome, email, data_criacao FROM usuarios WHERE id = ?',
                [id]
            );

            if (users.length === 0) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            res.json(users[0]);
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            res.status(500).json({ message: 'Erro ao buscar usuário' });
        }
    },

    // Criar usuário (por administrador)
    create: async (req, res) => {
        try {
            const { nome, email, senha } = req.body;

            // Verifica se usuário já existe
            const [existingUser] = await pool.query(
                'SELECT * FROM usuarios WHERE email = ?',
                [email]
            );

            if (existingUser.length > 0) {
                return res.status(400).json({ message: 'Email já cadastrado' });
            }

            // Criptografa a senha
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(senha, salt);

            // Insere novo usuário
            const [result] = await pool.query(
                'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
                [nome, email, hashedPassword]
            );

            res.status(201).json({
                message: 'Usuário criado com sucesso',
                id: result.insertId
            });
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            res.status(500).json({ message: 'Erro ao criar usuário' });
        }
    },

    // Atualizar usuário
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { nome, email } = req.body;

            // Verifica se email já está em uso por outro usuário
            if (email) {
                const [existingUser] = await pool.query(
                    'SELECT * FROM usuarios WHERE email = ? AND id != ?',
                    [email, id]
                );

                if (existingUser.length > 0) {
                    return res.status(400).json({ message: 'Email já está em uso' });
                }
            }

            const [result] = await pool.query(
                'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?',
                [nome, email, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            res.json({ message: 'Usuário atualizado com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            res.status(500).json({ message: 'Erro ao atualizar usuário' });
        }
    },

    // Alterar senha do usuário
    changePassword: async (req, res) => {
        try {
            const { id } = req.params;
            const { senhaAtual, novaSenha } = req.body;

            // Busca usuário
            const [users] = await pool.query(
                'SELECT * FROM usuarios WHERE id = ?',
                [id]
            );

            if (users.length === 0) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            const user = users[0];

            // Verifica senha atual
            const validPassword = await bcrypt.compare(senhaAtual, user.senha);
            if (!validPassword) {
                return res.status(400).json({ message: 'Senha atual incorreta' });
            }

            // Criptografa a nova senha
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(novaSenha, salt);

            // Atualiza a senha
            await pool.query(
                'UPDATE usuarios SET senha = ? WHERE id = ?',
                [hashedPassword, id]
            );

            res.json({ message: 'Senha alterada com sucesso' });
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            res.status(500).json({ message: 'Erro ao alterar senha' });
        }
    },

    // Deletar usuário (ou desativar)
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            res.json({ message: 'Usuário removido com sucesso' });
        } catch (error) {
            console.error('Erro ao remover usuário:', error);
            res.status(500).json({ message: 'Erro ao remover usuário' });
        }
    }
};

module.exports = userController;