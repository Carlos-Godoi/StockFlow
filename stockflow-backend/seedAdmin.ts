// seedAdmin.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User'; // ⚠️ usar .js mesmo em TS com ts-node

dotenv.config();

const seedAdminUser = async () => {
  const ADMIN_EMAIL = 'admin@stockflow.com';
  const ADMIN_PASSWORD = '123456';
  const SALT_ROUNDS = 10;

  try {
    // 1️⃣ Conectar ao MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/StockFlowDB';
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado ao MongoDB.');

    // 2️⃣ Deletar admin antigo, se existir
    await User.findOneAndDelete({ email: ADMIN_EMAIL });
    console.log(`🗑️ Admin antigo deletado (se existia).`);

    // 3️⃣ Criar hash da senha
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

    // 4️⃣ Criar novo usuário admin
    const newAdminUser = new User({
      name: 'Super Admin',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
    });

    await newAdminUser.save();
    console.log('✨ Usuário Admin criado com sucesso!');
    console.log('Hash (BD):', hashedPassword);

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Conexão com MongoDB fechada.');
  }
};

seedAdminUser();
