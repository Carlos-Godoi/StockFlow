import { Request, Response } from 'express';
import * as saleService from '../services/sale.service';
import Sale from '../models/Sale';

/**
 * @desc    Registrar uma nova venda (e deduzir o estoque)
 * @route   POST /api/sales
 * @access  Private/Admin, Seller
 */
export const createSale = async (req: Request, res: Response) => {
    const { items } = req.body;
    const userId = req.user!.id; // ID do usuário autenticado

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'A venda deve conter pelo menos um item.' });
    }

    try {
        // A lógica de negócio e transação está isolada no service
        const sale = await saleService.createSaleService({ userId, items });

        // Sucesso na transação e dedução de estoque
        res.status(201).json({ message: 'Venda concluída com sucesso.' });

    } catch (error: any) {
        res.status(400).json({
            message: 'Falha ao registrar a venda. Transação abortada.',
            error: error.message
        });
    }
};

/**
 * @desc    Obter todas as vendas
 * @route   GET /api/sales
 * @access  Private/Admin
 */
export const getSales = async (req: Request, res: Response) => {
    try {
        // Popula com o nome do vendedor e os nomes dos produtos
        const sales = await Sale.find({})
        .populate('user', 'name email role')
        .sort({ saleDate: -1 }); // Ordena pelos mais recentes

        res.json(sales);
    } catch (error) {
        console.error('Erro ao buscar vendas.', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};
