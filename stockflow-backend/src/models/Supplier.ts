import mongoose, { Schema, Document} from 'mongoose';

export interface ISupplier extends Document {
    name: string;
    contact: string;
    address?: string;
}

const SupplierSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true, unique: true },
    contact: { type: String, required: true },
    address: { type: String },
}, {
    timestamps: true
});

export default mongoose.model<ISupplier>('Supplier', SupplierSchema);