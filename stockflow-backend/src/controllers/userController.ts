import { Request, Response } from 'express';
import User from '../models/User';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar utilizadores. ' });
    }
};

export const updateUserRole = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const { role, isActive, name, email } = req.body;

        const user = await User.findByIdAndUpdate(req.params.id, { role, isActive, name, email }, { new: true }).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Utilizador não encontrado' });
            res.json(user);
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar utilizador.' });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<any> => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'Utilizador não encontrado' });
        res.json({ message: 'Utilizador removido' });
    }
};
