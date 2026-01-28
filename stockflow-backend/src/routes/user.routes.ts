import { Router, Request, Response } from 'express';
import { protect } from '../middlewares/auth.middleware'; 
import { authorize } from '../middlewares/role.middleware';
import User from '../models/User'; 
import { getUsers, getMe, updateMe, updateUserRole, changePassword } from '../controllers/userController';

const router = Router();


/**
 * @route   GET /api/users
 * @desc    Obter todos os usuários (Requer Login e Role: Admin)
 * @access  Private/Admin
 */

router.get(
    '/',
    protect, // Garante que o usuário está logado
    authorize(['admin']), // Garante que o usuário é 'admin'
    
    async (req: Request, res: Response) => {
        try {
            // Busca todos os usuários, excluindo o campo de senha
            const users = await User.find({}).select('-password');
            res.json(users);
        } catch (error) {
            // Melhoria: Logar o erro antes de responder 500
            console.error('Erro ao buscar usuários:', error); 
            // Você pode enviar uma mensagem mais detalhada se o erro for do Mongoose (opcional)
            return res.status(500).json({ 
                message: 'Erro do servidor ao buscar usuários.' 
            });
        }
    }
);

// Rotas estáticas/específicas primeiro
router.put('/me', protect, updateMe);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword); 

// Rotas com parâmetros dinâmicos por último
router.put('/:id', protect, authorize(['admin']), updateUserRole); 
router.get('/:id', protect, authorize(['admin']), getUsers);



export default router;
