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
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role ) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    try {
        // 1. Verificar se o usuário já está cadastrado
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'E-mail já registrado em nosso sistema.' });
        }

        // 2. Criar novo usuário (Senha hasheada pelo middleware)
        const user = await User.create({
            name,
            email,
            password,
            // Apenas admin pode definir role.
            role: role ? role : 'seller',
        });

        // 3. Responde com sucesso e token
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id.toString(), user.role),
        });
    } catch (error) {
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
        // 1. Pesquisar usuário
        const user = await User.findOne({ email }).select('+password');

        // 2. Verificar se o usuário existe e se a senha está correta
        if (user && (await user.comparePassword(password))) {
            // 3. Sucesso (resposta com dados e token)
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id.toString(), user.role),
            });
        } else {
            // 4. Falha 
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};