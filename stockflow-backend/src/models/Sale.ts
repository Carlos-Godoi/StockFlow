import mongoose, { Schema, Document, Types } from 'mongoose';



// Interface para um item dentro da lista de produtos vendidos
export interface ISaleProduct {
    productId: Types.ObjectId;
    name: string;
    quantity: number;
    priceAtSale: number; // Preço unitário no momento exato da venda
    subtotal: number;
}

export interface ISale extends Document {
    user: Types.ObjectId; // Referece ao vendedor (User)
    products: ISaleProduct[];
    totalAmount: number;
    status: 'Pending' | 'Paid' | 'Canceled';
    saleDate: Date;
    paymentMethod: 'Dinheiro' | 'Cartão' | 'Pix';
}


const SaleProductSchema: Schema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceAtSale: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
});

const SaleSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    products: { type: [SaleProductSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['Pending','Paid', 'Canceled'], default: 'Paid' },
    
    saleDate: { 
        type: Date, 
        default: Date.now,
    },

    paymentMethod: {
        type: String,
        enum: ['Dinheiro', 'Cartão', 'Pix'],
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model<ISale>('Sale', SaleSchema);

