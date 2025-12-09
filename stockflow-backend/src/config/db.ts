import mongoose from 'mongoose';


const connectDB = async () => {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/StockFlowDB';

    if (!MONGODB_URI) {
        console.error('ERRO: A variável de ambiente MONGODB_URI não está definida.');
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(MONGODB_URI);

        console.log(`MongoDB Conectado: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`ERRO de Conexão com MongoDB: ${error.message}`);

        // Encerrar a aplicação em caso de falha na conexão
        process.exit(1);
    }
};

export default connectDB;