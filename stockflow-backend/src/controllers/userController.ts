import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';


export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        return res.json(users);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar utilizadores. ' });
    }
};

export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { role, isActive, name, email, taxId, phone, address } = req.body;

        const user = await User.findByIdAndUpdate(req.params.id,
            { role, isActive, name, email, taxId, phone, address },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Utilizador não encontrado.' });
        }
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'E-mail já está em uso.' });
        }

        console.error(error);
        return res.status(500).json({ message: 'Erro ao atualizar utilizador.' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Utilizador não encontrado.' });
        }

        return res.json({ message: 'Utilizador removido com sucesso.' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao remover utilizador.' });
    }
};

// Buscar dados do usuário logado
export const getMe = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user?.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        return res.json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao buscar dados do perfil.' });
    }
};

export const updateMe = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: 'Não autorizado.' });
        }

        const { name, email, taxId, phone, address } = req.body;

        // Monta o objeto apenas com campos enviados
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (taxId !== undefined) updateData.taxId = taxId;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        return res.json(updatedUser);
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'E-mail já está em uso.' });
        }

        console.error(error);
        return res.status(500).json({ message: 'Erro ao atualizar perfil.' });
    }
};

// Alterar senha
export const changePassword = async (req: Request, res: Response): Promise<any> => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user?.id).select('+password');

        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'A senha atual está incorreta.' });
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({ message: 'A nova senha deve ser diferente da atual.' });
        }

        user.password = newPassword;

        await user.save();

        res.json({ message: 'Senha alterada com sucesso!' });
    } catch (error: any) {
        console.error("ERRO DETALHADO:", error.message); // <--- ISSO VAI APARECER NO SEU TERMINAL
        res.status(500).json({
            message: 'Erro ao processar alteração de senha.',
            debug: error.message // Temporário para teste
        });
    }
};