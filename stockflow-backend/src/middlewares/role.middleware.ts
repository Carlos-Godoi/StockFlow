import { Request, Response, NextFunction } from 'express';

type Role = 'admin' | 'seller' | 'stocker' | 'customer';

/**
 * Middleware de Autorização (Role-Based Access Control).
 * @param allowedRoles Array de strings contendo as roles permitidas para acessar a rota.
 */
export const authorize = (allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // 1. Verificar se o usuário foi anexado pelo Middleware 'protect'
        if (!req.user) {
            return res.status(403).json({ message: 'Acesso negado: Usuário não autenticado.' });
        }

        const { role } = req.user;

        // 2. Verificar se a role do usuário está na lista de roles permitidas
        if (allowedRoles.includes(role)) {
            next(); // Permissão concedida
        } else {
            // 3. Permissão negada
            return res.status(403).json({ message: 'Acesso negado: Você não tem permissão para realizar esta ação.' });
        }
    };
};