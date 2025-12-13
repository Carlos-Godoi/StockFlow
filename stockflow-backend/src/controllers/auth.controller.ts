import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

// Função auxiliar para gerar o JWT
const generateToken = (id: string, role: string): string => {
    const JWT_SECRET = process.env.JWT_SECRET || 'OyTuKBeJMg16INIiC+1YApEn/yoJnTXGRepG6Yjiz1UVTG9jmaRQs7s4tWE8gkPnjL3Uri9EHqupMq4MW+vSKQ==';
    return jwt.sign(
        { id, role }, 
        JWT_SECRET, 
        { expiresIn: '1d'}
    );
};

/**
 * @desc    Registrar novo usuário
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req: Request, res: Response) => {
    // Pegue apenas os dados que o usuário pode inserir
    const { name, email, password } = req.body; 

    // O campo 'role' não é desestruturado do req.body para garantir que
    // o usuário não possa se auto-atribuir uma role privilegiada.

    if (!name || !email || !password) {
        // Removido '|| !role' da validação, pois a role será definida internamente.
        return res.status(400).json({ message: 'Nome, E-mail e Senha são obrigatórios.' });
    }
    
    try {
        // ... (1. Verificar se o usuário já está cadastrado - Código mantido)
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'E-mail já registrado em nosso sistema.' });
        }

        // 2. Criar novo usuário
        const user = await User.create({
            name,
            email,
            password,
            // 🔒 SEGURANÇA: A role é definida como 'seller' (ou 'user') por padrão, 
            // IGNORE qualquer 'role' que tenha vindo no req.body.
            role: 'seller', 
        });

        // 3. Responde com sucesso e token (Código mantido)
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id.toString(), user.role),
        });
        
    } catch (error) {
        // ... (catch block mantido)
        return res.status(500).json({ message: 'Erro ao registrar usuário.', error });
    }
};

/**
 * @desc    Autenticar usuário e obter token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // Pesquisar usuário
        const user = await User.findOne({ email }).select('+password');

        // Verificar se o usuário existe e se a senha está correta
        if (!user || !user.password) {
            // Se não existir ou o hash da senha não foi retornado, falhar explicitamente
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        // Verificar a senha (se o comparePassword for chamado, a senha DEVE existir)
        if (await user.comparePassword(password)) {
            // Sucesso (resposta com dados e token)
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id.toString(), user.role),
            });
        } else {
            // Falha na comparação
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};