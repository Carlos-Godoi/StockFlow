import React, { createContext, useContext, useState, useEffect, useMemo} from 'react';
import api from '../api/api';
import { AuthUser, AuthContextType, UserRole } from '../types/auth';

// Criação Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Criação Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Carregar o usuário e o token do localStorage na inicialização
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            const parsedUser: AuthUser = JSON.parse(storedUser);
            // Garante que o token é anexado ao objeto de usuário
            parsedUser.token = storedToken;
            setUser(parsedUser);
        }
        setIsLoading(false);
    }, []);

    // Login
    const login = async (Credentials: any): Promise<boolean> => {
        try {
            setIsLoading(true);
            // Chama a rota de login do backend
            const response = api.post('/auth/login', Credentials);

            const loggedUser: AuthUser = (await response).data;

            // Armazena dados no localStorage e no estado
            localStorage.setItem('user', JSON.stringify(loggedUser));
            localStorage.setItem('token', loggedUser.token);
            setUser(loggedUser);
            setIsLoading(false);
            return true; // Sucesso! 
        } catch (error) {
            console.error('Login falhou:', error);
            setIsLoading(false);
            return false;            
        }
    };

    // Lógica de Logout
    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    // Lógica de Autorização (RBAC no frontend)
    const hasRole = (roles: UserRole[]): boolean => {
        return user ? roles.includes(user.role) : false;
    };

    const isAuthenticated = useMemo(() => !!user, [user]);

    // Valores passados para o contexto
    const contextValue = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        hasRole,
    };


    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Hook customizado para usar o contexto facilmente
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};