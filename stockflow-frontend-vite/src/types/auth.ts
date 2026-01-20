export type UserRole = 'admin' | 'seller' | 'stocker' | 'customer';


/**
 * Dados do usuário armazenados no estado (State)
 */
export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    token: string;
}

/**
 * Dados de entrada para o login
 */
export interface UserCredentials {
    email: string;
    password: string;
}

/**
 * Estrutura do Contexto de Autenticação
 */
export interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: UserCredentials) => Promise<boolean>;
    logout: () => void;
    // Função auxiliar para verificar permissão (RBAC no Frontend)
    hasRole: (roles: UserRole[]) => boolean;
}

