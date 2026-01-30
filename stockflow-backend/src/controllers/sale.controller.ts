import { Request, Response } from 'express';
import * as saleService from '../services/sale.service';
import Sale from '../models/Sale';
import axios from 'axios';
import Product from '../models/Product';
import { Query } from 'mongoose';


/**
 * @desc    Registrar uma nova venda (e deduzir o estoque)
 * @route   POST /api/sales
 * @access  Private/Admin, Seller
 */
export const createSale = async (req: Request, res: Response) => {
    const { items, paymentMethod } = req.body;
    const userId = req.user!.id; // ID do usuário autenticado

    // console.log("BODY COMPLETO NO BACKEND:", req.body);

    const saleProducts: { 
    productId: any; 
    name: string; 
    quantity: number; 
    priceAtSale: number; 
    subtotal: number }[] = [];

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'A venda deve conter pelo menos um item.' });
    }

    try {
        let totalAmount = 0;        

        // 1. Validar produtos e calcular total (sem transação formal)
        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product || product.stockQuantity < item.quantity) {
                return res.status(400).json({ message: `Estoque insuficiente ou produto não encontrado: ${product?.name || item.productId}` });
            }


            const subtotal = product.salePrice * item.quantity;
            totalAmount += subtotal;

            saleProducts.push({
                productId: product._id,
                name: product.name,
                quantity: item.quantity,
                priceAtSale: product.salePrice,
                subtotal                
            });

            // 2. Atualizar o estoque manualmente
            product.stockQuantity -= item.quantity;
            await product.save();
        }

        // 3. Criar o registro da venda
        const newSale = new Sale({
            user: userId,
            products: saleProducts,
            totalAmount,
            status: 'Paid',
            saleDate: new Date(),
            paymentMethod,
        });

        await newSale.save();

        res.status(201).json(newSale);

    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            message: 'Erro ao registrar a venda.', error: error.message
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
        let query = {};

        if (req.user?.role === 'customer') {
            query = { user: req.user.id };
        }

        const sales = await Sale.find(query).populate('user', 'name');
        return res.status(200).json(sales);
    } catch (error) {
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

export const getSalesReport = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;

        const query: any = {};

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string + 'T23:59:59.999Z')
            };
        }

        const sales = await Sale.find(query)
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        // Calcular o total do período
        const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);

        res.json({
            sales, 
            totalRevenue, 
            count: sales.length
        });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao gerar relatório.' });
    }
};
