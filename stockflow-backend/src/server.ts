// dotenv para carregar as variáveis de ambiente do .env
import * as dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import supplierRoutes from './routes/supplier.routes';
import productRoutes from './routes/product.routes';
import saleRoutes from './routes/sale.routes';
import reportRoutes from './routes/report.routes';

// Conecta ao MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: Permitem que o Express receba JSON e dados de formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas para Teste Simples
app.get('/', (req: Request, res: Response) => {
    res.send('API StockFlow: Servidor Rodando!');
});

// Rotas de autenticação
app.use('/api/auth', authRoutes);

// Rotas de Usuários (Protegidas)
app.use('/api/users', userRoutes);

// Rotas Fornecedores
app.use('/api/suppliers', supplierRoutes);

// Rotas Produtos
app.use('/api/products', productRoutes);

// Rotas Vendas
app.use('/api/sales', saleRoutes);

// Rotas de Relatórios
app.use('/api/reports', reportRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

