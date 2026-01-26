import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Estrutura do payload do JWT (Mantida)
interface JwtPayload {
    id: string;
    role: 'admin' | 'seller' | 'stocker' | 'customer';
}

interface UserPayload {
    id: string;
    role: "admin" | "seller" | "stocker" | "customer";
}

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}

/**
 * Middleware para proteger rotas. Verifica se o JWT é válido e anexa os dados do usuário
 */
export const protect = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Não autorizado, token Bearer não encontrado.' });
    }

    try {
        const token = authHeader.split(' ')[1];

        // ⚠️ CORREÇÃO DE SEGURANÇA: Garante que o segredo JWT exista
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET não definido no ambiente');
            return res.status(500).json({ message: 'Erro de configuração do servidor.' });
        }

        // Verificar e decodificar o token
        const decoded = jwt.verify(token, secret) as JwtPayload;

        // Anexa os dados do usuário (ID e Role)
        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        next();
    } catch (error) {
        console.error('Erro ao verificar JWT:', error);
        return res.status(401).json({ message: 'Não autorizado, token inválido ou expirado.' });
    }
};