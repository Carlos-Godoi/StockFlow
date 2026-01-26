import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Função auxiliar para gerar o JWT
const generateToken = (id: string, role: 'admin' | 'seller' | 'stocker' | 'customer'): string => {
    const JWT_SECRET = process.env.JWT_SECRET || 'OyTuKBeJMg16INIiC+1YApEn/yoJnTXGRepG6Yjiz1UVTG9jmaRQs7s4tWE8gkPnjL3Uri9EHqupMq4MW+vSKQ==';
    return jwt.sign(
        { id, role },
        JWT_SECRET,
        { expiresIn: '1d' }
    );
};

/**
 * @desc    Registrar novo usuário
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, taxId, phone, address } = req.body;

        // Validação obrigatoriedade de campo
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Nome, E-mail e Senha são obrigatórios.' });
        }

        // Verificar se email já existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'E-mail já registrado em nosso sistema.' });
        }

        // Criar novo usuário
        const user = await User.create({
            name,
            email,
            password,
            taxId,
            phone,
            address,
            role: 'customer',
        });

        // Resposta sucesso com token (o)
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
        // Pesquisar usuário
        const user = await User.findOne({ email }).select('+password');

        // Verificar se o usuário existe e se a senha está correta
        if (!user || !user.password) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        // Verificar a senha 
        if (await user.comparePassword(password)) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id.toString(), user.role),
            });
        } else {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};