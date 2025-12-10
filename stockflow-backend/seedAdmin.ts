// seedAdmin.js
import User from './src/models/User';
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// ⚠️ Mude o caminho abaixo para o seu arquivo de modelo de usuário!
// const User = require('./src/models/User'); 

// ⚠️ Se você usa o dotenv para variáveis de ambiente, garanta que ele está configurado
// require('dotenv').config(); 

const seedAdminUser = async () => {
  const ADMIN_EMAIL = 'admin@stockflow.com';
  const ADMIN_PASSWORD = '123456'; 
  const SALT_ROUNDS = 10; // Fator de segurança para criptografia

  try {
    // 1. Conexão com o MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/StockFlowDB';
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado ao MongoDB.');

    // 2. Checar se o Admin já existe
    const existingAdmin = await User.findOne({ email: 'admin@stockflow.com' });

    if (existingAdmin) {
      console.log(`⚠️ Usuário Admin (${ADMIN_EMAIL}) já existe. Pulando a criação.`);
      return;
    }

    // 3. Criptografar a Senha
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
    
    // 4. Criar e Salvar o novo Usuário Admin
    const newAdminUser = new User({
      name: 'Super Admin',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin', // 🔑 Este é o campo crucial para permissão
    });

    await newAdminUser.save();
    console.log('✨ Usuário Admin criado com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante o processo de seed:', error);
  } finally {
    // 5. Fechar a Conexão
    await mongoose.disconnect();
    console.log('🔌 Conexão com MongoDB fechada.');
  }
};

seedAdminUser();