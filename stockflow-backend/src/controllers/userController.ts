import { Request, Response } from 'express';
import User from '../models/User';

export const getUsers = async (req: Request, res: Response) => {
    const users = await User.find().select('-password');
    res.json(users);
};

export const updateUserRole = async (req: Request, res: Response): Promise<any> => {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');

    if (!user) {
        return res.status(404).json({ message: 'Utilizador não encontrado' });
        res.json(user);
    }
};

export const  deleteUser = async (req: Request, res: Response): Promise<any> => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'Utilizador não encontrado' });
        res.json({ message: 'Utilizador removido' });
    }
};
