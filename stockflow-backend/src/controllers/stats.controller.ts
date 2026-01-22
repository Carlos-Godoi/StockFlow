import { Request, Response } from 'express';
import Sale from '../models/Sale';
import mongoose from 'mongoose';

interface CustomRequest extends Request {
    user: {
        id: string;
        role: 'admin' | 'customer';
    };
}

export const getDashboardSummary = async (req: Request, res: Response) => {
    try {
        const { role, id } =(req as CustomRequest).user;

        const matchQuery = role === 'customer'
        ? { user: new mongoose.Types.ObjectId(id) }
        : {};

        const stats = await Sale.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalValue: { $sum: "$totalAmount" },
                    count: { $sum: 1 }  
                }
            }
        ]);

        const result  = stats[0] || { totalValue: 0, count: 0 };

        res.json({
            total: result.totalValue,
            salesCount: result.count,
            label: role === 'admin' ? 'Faturamento Total' : 'Total Gasto'
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao calcular estatísticas.' });
    }
};

export const getSalesChartData = async (req: Request, res: Response) => {
    try {
        const { role, id } =(req as CustomRequest).user;

        const matchQuery = role === 'customer'
        ? { user: new mongoose.Types.ObjectId(id) }
        : {};

        // Agregação para agrupar por dia
        const chartData = await Sale.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    // Formata a data para YYYY-MM-DD
                    _id: { $dateToString: { format: "%y-%m-%d", date: "$createdAt" } },
                    total: { $sum: "$totalAmount" } 
                }
            },
            { $sort: { "_id": 1 } }, // Ordena por data, da mais antiga para a mais nova
            { $limit: 7 } 
        ]);

        const formattedData = chartData.map(item => ({
            date: item._id,
            valor: item.total
        }));

        res.json(formattedData);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao gerar dados do gráfico.' });
    }
};