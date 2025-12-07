import { Request, Response } from 'express';
import Product from '../models/Product';
import Sale from '../models/Sale';
import mongoose from 'mongoose';

/**
 * @desc    Relatório de estoque crítico (Produtos abaixo da quantidade mínima)
 * @route   GET /api/reports/critical-stock
 * @access  Private/Admin, Stocker
 */
export const getCriticalStockReport = async (req: Request, res: Response) => {
    try {
        const criticalStock = await Product.find({
            $expr: { $lt: ["stockQuantity", "minimumStock"]}
        })
        .select('name stockQuantity minimumStock supplier')
        .populate('supplier', 'name');

        res.json(criticalStock);
    } catch (error) {
        console.error('Erro ao gerar relatório de estoque crítico.', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

/**
 * @desc    Relatório de lucro mensal (Usa o Pipeline de Agregação do MongoDB)
 * @route   GET /api/reports/monthly-profit
 * @access  Private/Admin
 */
export const getMonthlyProfitReport = async (req: Request, res: Response) => {
    try {
        const result = await Sale.aggregate([
            // 1. Desestrutura (unwind) o array 'product' para processar item por item
            { $unwind: '$products' },

            // 2. Lookup/Join: Junta os dados de venda com os dados do produto (para obter o preço de compra)
            {
                $lookup: {
                    from: 'products', // Coleção de origem (lowercase)
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'productDetails' 
                }
            },
            // Desestrutura os detalhes do produto (será um array de 1 item)
            { $unwind: '$productDetails' },

            // 3. Calcula o lucro por item
            {
                $addFields: {
                    costOfGoodsSold: {
                        $multiply: ['$products.quantity', '$productDetails.purchasePrice']
                    },
                    profit: {
                        $subtract: ['$products.subtotal', {
                            $multiply: ['$products.quantity', '$productDetails.purchasePrice']
                        }]
                    },
                    // Extrai o mês  e o ano para agrupamento
                    monthYear: { $dateToString: {format: '%Y-%m', date: '$saleDate' } }
                }
            },

            // 4. Agrupa pelo mês/ano
            {
                $group: {
                    _id: '$monthYear',
                    totalRevenue: { $sum: '$products.subtotal' }, // Receita total (preço de venda)
                    totalCost: { $sum: '$costOfGoodSold' }, // Custo total (preço de compra)
                    totalProfit: { $sum: '$profit' }, // Lucro total
                    totalSales: { $sum: 1 } // Contagem de vendas
                }
            },

            // 5. Ordena cronologicamente
            { $sort: { _id: 1 } }
        ]);

        res.json(result);
    } catch (error) {
        console.error('Erro de Agregação:', error);
        res.status(500).json({ message: 'Erro ao gerar relatório de lucro mensal.' });
    }
};