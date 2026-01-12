import { Request, Response } from 'express';
import Supplier from '../models/Supplier';

// Criar fornecedor
export const createSupplier = async (req: Request, res: Response) => {
    try {
        const supplier = await Supplier.create(req.body);
        res.status(201).json(supplier);
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Já existe um fornecedor com este nome.' });
        }
        console.error('Erro ao criar fornecedor:', error)
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Listar fornecedores
export const getSuppliers = async (req: Request, res: Response) => {
    try {
        const suppliers = await Supplier.find({}).sort({ name: 1 });
        res.json(suppliers);
    } catch (error) {
        console.error('Erro ao buscar fornecedores:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Atualizar fornecedor
export const updateSupplier = async (req: Request, res: Response) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!supplier) {
            return res.status(404).json({ message: 'Fornecedor não encontrado.' });
        }
        res.json(supplier);
    } catch (error) {
        console.error('Erro ao atualizar fornecedor.', error);
        res.status(500).json({ messsage: 'Erro interno do servidor.' });
    }
};

// Deletar fornecedor
export const deleteSupplier = async (req: Request, res: Response) => {

        const { id } = req.params;
    try {
        // Lógica de Negócio Crucial: Antes de deletar, verificar se há produtos relacionados
        const productsCount = await Supplier.countDocuments({ suppllier: id });

        if (productsCount > 0) {
            return res.status(400).json({ message: `Não é possível deletar este fornecedor. Ele está vinculado a ${productsCount} produtos.` });
        }

        const supplier = await Supplier.findByIdAndDelete(req.params.id);

        if (!supplier) {
            return res.status(404).json({ message: 'Fornecedor não encontrado.' });
        }
        res.json({ message: 'Fornecedor deletado com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar fornecedor:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

