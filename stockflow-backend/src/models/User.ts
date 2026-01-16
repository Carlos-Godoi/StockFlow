import mongoose, { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Definição da interface TypeScript para o documento do Usuário
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'seller' | 'stocker' | 'customer';
  taxId: string;
  phone: string;
  address: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false }, 
  role: {
    type: String,
    enum: ['admin', 'seller', 'stocker', 'customer'],
    default: 'customer'  
}, 
  taxId: { type: String },
  phone: { type: String },
  address: { type: String },
}, { 
  timestamps: true 
});

// Middleware Mongoose: Hashing da senha antes de salvar (pré-save)
UserSchema.pre('save', async function (this: IUser) {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método customizado para comparar a senha fornecida com a senha hasheada
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  // 'this.password' precisa ser manualmente selecionado na consulta para funcionar
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
//export default model('User', UserSchema);