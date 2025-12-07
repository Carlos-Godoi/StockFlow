// Define o módulo express
declare namespace Express {
    // Estender a interface Request
    export interface Request {
        user?: {
            id: string;
            role: 'admin' | 'seller' | 'stocker';
        };
    }
}