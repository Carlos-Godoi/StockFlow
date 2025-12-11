// Importa o namespace express
import { Request } from 'express';

// Define a estrutura que queremos adicionar ao Request
interface UserPayload {
    id: string;
    role: 'admin' | 'seller' | 'stocker';
}

// Estende a interface Request do Express
declare global {
    namespace Express {
        interface Request {
            // Adiciona a propriedade 'user' opcionalmente ao objeto de Requisição
            user?: UserPayload; 
        }
    }
}