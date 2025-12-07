import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Estrutura do payload do JWT
interface JwtPayload {
    id: string;
    role: 'admin' | 'seller' | 'stocker';
}

/**
 * Middleware para proteger rotas. Verifica se o JWT é válido e anexa os dados do usuário
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    // 1. Verifica se o token está no cabeçalho Authorization (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extrair o token (remove 'Bearer')
            token = req.headers.authorization.split(' ')[1];

            // 2. Verificar e decodificar o token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'OyTuKBeJMg16INIiC+1YApEn/yoJnTXGRepG6Yjiz1UVTG9jmaRQs7s4tWE8gkPnjL3Uri9EHqupMq4MW+vSKQ==') as JwtPayload;

            // 3. Anexa os dados do usuário (ID e Role)
            req.user = {
                id: decoded.id,
                role: decoded.role
            };

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Não autorizado, token falhou.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Não autorizado, nenhum token encontrado.' });
    }
};