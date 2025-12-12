import React, { createContext, useContext, useState, useMemo } from 'react';
import api from '../api/api';
import { AuthUser, AuthContextType, UserRole, UserCredentials } from '../types/auth';


// Criação Contexto
const AuthContext = createContext<AuthContextType | null>(null);

// Criação Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                // Ao analisar a string JSON, fazemos um Type Assertion para AuthUser 
                // para garantir que o TypeScript saiba a estrutura do objeto
                const parsedUser = JSON.parse(storedUser) as AuthUser; 
                
                // Garante que o token é anexado ao objeto do usuário
                parsedUser.token = storedToken;
                return parsedUser; // Retorna o estado inicial do usuário
            } catch (e) {
                console.error('Erro ao fazer parse do usuário do localStorage', e);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        return null;
    });

    // A lógica isLoading simplificada, pois o user já está pronto
    const [isLoading, setIsLoading] = useState(false);

    // Login
    const login = async (credentials: UserCredentials): Promise<boolean> => { // CORREÇÃO 1: 'Credentials' com 'c' minúsculo
        try {
            setIsLoading(true);
            // CORREÇÃO 2: É necessário usar 'await' na chamada API
            const response = await api.post('/auth/login', credentials); 
            
            // Aqui já estava correto (Type Assertion implícita pela tipagem da constante)
            const loggedUser: AuthUser = response.data; 

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
    if (context === null) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};