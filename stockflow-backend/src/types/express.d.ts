import { IUser } from '../models/User';

declare global {
    // Define o módulo express
    namespace Express {
        // Estender a interface Request
        export interface Request {
            user?: {
                id: string;
                role: 'admin' | 'seller' | 'stocker';
            };
        }
    }
}