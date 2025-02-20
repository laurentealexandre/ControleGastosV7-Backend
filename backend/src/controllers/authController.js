const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authController = {
    // Registro de usuário
    register: async (req, res) => {
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

            // Gera token
            const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, {
                expiresIn: '1d'
            });

            res.status(201).json({
                message: 'Usuário criado com sucesso',
                token,
                user: {
                    id: result.insertId,
                    nome,
                    email
                }
            });
        } catch (error) {
            console.error('Erro no registro:', error);
            res.status(500).json({ message: 'Erro ao registrar usuário' });
        }
    },

    // Login de usuário
    login: async (req, res) => {
        try {
            const { email, senha } = req.body;

            // Busca usuário
            const [users] = await pool.query(
                'SELECT * FROM usuarios WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                return res.status(401).json({ message: 'Credenciais inválidas' });
            }

            const user = users[0];

            // Verifica senha
            const validPassword = await bcrypt.compare(senha, user.senha);
            if (!validPassword) {
                return res.status(401).json({ message: 'Credenciais inválidas' });
            }

            // Gera token
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                expiresIn: '1d'
            });

            res.json({
                token,
                user: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ message: 'Erro ao fazer login' });
        }
    },

    // Verificar token/obter usuário atual
    getMe: async (req, res) => {
        try {
            const [users] = await pool.query(
                'SELECT id, nome, email FROM usuarios WHERE id = ?',
                [req.userId]
            );

            if (users.length === 0) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            res.json(users[0]);
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            res.status(500).json({ message: 'Erro ao buscar usuário' });
        }
    }
};

module.exports = authController;