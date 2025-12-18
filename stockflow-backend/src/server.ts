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
import cors from 'cors';


// Conecta ao MongoDB
connectDB();

const app = express();

// Middleware: Permitem que o Express receba JSON e dados de formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração CORS (aplicada a todas as rotas)
const allowedOrigins = [

    // URL do FRONTEND (VITE)
    'http://localhost:4000',

    // URL do BACKEND
    'http://localhost:3000', 

    // Se for implantado em produção, adicione a URL HTTPS aqui!
    // 'https://sua-url-de-producao.com'
];

const corsOptions: cors.CorsOptions = { 
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Permitir requisições sem 'origin' (Postman, mobile, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Origem não permitida pela política CORS'), false);
        }
    },
    // CORREÇÃO TIPOGRÁFICA: 'methods' em minúsculo
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], 
    // CORREÇÃO TIPOGRÁFICA: 'credentials'
    credentials: true, 
};

app.use(cors(corsOptions));

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


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
