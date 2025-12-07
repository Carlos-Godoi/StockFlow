import Sale, { ISale, ISaleProduct } from '../models/Sale';
import Product, { IProduct } from '../models/Product';
import mongoose, { Types } from 'mongoose';

interface CreateSaleData {
    userId: string;
    items: Array<{ productId: string; quantity: number }>;
}

/**
 * Lógica central para registrar uma venda e deduzir o estoque
 * Utiliza transações para garantir atomicidade
 */
export const createSaleService = async (data: CreateSaleData): Promise<ISale> => {
    // Sessão para a transação
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { userId, items } = data;
        let totalAmount = 0;
        const saleProducts: ISaleProduct[] = [];
        const productIds = items.map(item => new Types.ObjectId(item.productId));

        // 1. Busca todos os produtos necessários
        // O select('+salePrice') garante que o preço atual de venda seja capturada
        const productsInStock = await Product.find({ _id: { $in: productIds } }).session(session)

        const productMap = new Map<string, IProduct>();
        productsInStock.forEach(p => productMap.set(p._id.toString(), p));

        // 2. Valida estoque e prepara os dados de venda
        for (const item of items) {
            const productIdStr = item.productId.toString();
            const product = productMap.get(productIdStr);

            // A. Validação de Existência
            if (!product) {
                throw new Error(`Produto com ID ${item.productId} não encontrado.`);
            }

            // B. Validação do Estoque
            if (product.stockQuantity < item.quantity) {
                throw new Error(`Estoque insuficiente para o produto: ${product.name}. Necessário: ${item.quantity}, Disponível: ${product.stockQuantity}`);
            }

            const subtotal = product.salePrice * item.quantity;
            totalAmount += subtotal;

            // Adiciona o item formatado à lista de venda
            saleProducts.push({
                productId: product._id,
                name: product.name,
                quantity: item.quantity,
                priceAtSale: product.salePrice,
                subtotal: subtotal,
            } as ISaleProduct); // Asserção de tipo

            // 3. Deduz o estoque (Atualização manual na sessão)
            await Product.updateOne(
                { _id: product._id },
                { $inc: {stockQuantity: -item.quantity } }
            ).session(session);
        }

        // 4. Criar o registro da venda
        const newSale = await Sale.create([{
            user: new Types.ObjectId(userId),
            products: saleProducts,
            totalAmount: totalAmount,
            status: 'Paid', 
        }], { session });

        // 5. Confirma a transação
        await session.commitTransaction();
        session.endSession();

        return newSale[0];
    } catch (error) {
        // 6. Aborta a transação em caso de erro (Reverte qualquer alteração, incluindo dedução de estoque)
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
