import mongoose from 'mongoose';

const connectDB = async () => {
    // A variável MONGODB_URI não precisa de verificação de tipo "strict", pois o || fallback a torna segura.
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/StockFlowDB';

    if (!MONGODB_URI) {
        console.error('ERRO: A variável de ambiente MONGODB_URI não está definida.');
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(MONGODB_URI);

        // 

        console.log(`MongoDB Conectado: ${conn.connection.host}`);
    } catch (error) { // Tipo 'error' é implicitamente 'unknown' ou 'any' dependendo da config.
        
        // CORREÇÃO: Usamos o 'instanceof Error' ou 'type assertion' para acessar a mensagem com segurança.
        let errorMessage = 'Erro de conexão desconhecido com MongoDB';

        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            // Caso raro onde o objeto não é uma instância de Error, mas tem a propriedade message
            errorMessage = (error as { message: string }).message; 
        }

        console.error(`ERRO de Conexão com MongoDB: ${errorMessage}`);

        // Encerrar a aplicação em caso de falha na conexão
        process.exit(1);
    }
};

export default connectDB;