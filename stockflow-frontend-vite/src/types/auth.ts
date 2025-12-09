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

/**
 * Estrutura do Contexto de Autenticação
 */
export interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (Credentials: any) => Promise<boolean>;
    logout: () => void;
    // Função auxiliar para verificar permissão (RBAC no Frontend)
    hasRole: (roles: UserRole[]) => boolean;

}

