import mongoose, { Schema, Document} from 'mongoose';

export interface ISupplier extends Document {
    name: string;
    email: string;
    phone?: string;
}

const SupplierSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true },
    phone: { type: String },
}, {
    timestamps: true
});

export default mongoose.model<ISupplier>('Supplier', SupplierSchema);