import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProduct extends Document {
    name: string;
    description: string;
    purchasePrice: number;
    salePrice: number;
    stockQuantity: number;
    supplier: Types.ObjectId;
    minimumStock: number;
}

const ProductSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true },
    purchasePrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, default: 0, min: 0 },
    minimumStock: { type: Number, required: true, default: 10, min: 0 },
    supplier: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier', // Referencia o modelo de Fornecedor
        required: true,
    },
}, {
    timestamps: true
});

export default mongoose.model<IProduct>('Product', ProductSchema);