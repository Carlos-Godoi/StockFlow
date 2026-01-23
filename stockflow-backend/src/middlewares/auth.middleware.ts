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
export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined; // Tipagem explícita para o token

    // 1. Verifica se o token está no cabeçalho Authorization (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extrair o token (remove 'Bearer')
            token = req.headers.authorization.split(' ')[1];

            // ⚠️ CORREÇÃO DE SEGURANÇA: Garante que o segredo JWT exista
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                // Isso deve ser resolvido antes do deploy.
                console.error('ERRO FATAL: JWT_SECRET não está definido.');
                return res.status(500).json({ message: 'Erro de configuração do servidor.' });
            }

            // 2. Verificar e decodificar o token
            const decoded = jwt.verify(token, secret) as JwtPayload;

            // 3. Anexa os dados do usuário (ID e Role)
            req.user = { 
                id: decoded.id,
                role: decoded.role
            };

            next();
        } catch (error) {
            // Log do erro para depuração no servidor
            console.error('Erro de verificação de token:', error);
            return res.status(401).json({ message: 'Não autorizado, token inválido ou expirado.' });
        }
    } else {
        // Se o cabeçalho Bearer não estiver presente, ou a autorização estiver faltando
        return res.status(401).json({ message: 'Não autorizado, o token Bearer não foi encontrado.' });
    }  
};