import { Request, Response } from 'express';
import Product from '../models/Product';

// Criação Produto
export const createProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ message: 'Produto cadastrado com sucesso!' });
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Já existe um produto com este nome.' });
        }
        console.error('Erro ao cadastrar produto:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Listagem de Produtos
export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await Product.find({}).populate('supplier', 'name contact');
        res.json(products);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Atualizar Produtos
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('supplier', 'name contact');

        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }
        res.json({ message: 'Produto atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Deletar Produto
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }
        res.json({ message: 'Produto deletado com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar produto.', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};
