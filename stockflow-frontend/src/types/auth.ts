export type UserRole = 'admin' | 'seller' | 'stocker';

/**
 * Dados do usuário armazenados no estado (State)
 */
export interface AuthUser {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    token: string;
}

