import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, Center } from '@chakra-ui/react';
import { Sidebar } from 'flowbite-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        // Exibe um spinner enquanto o estado de autenticação está sendo carregado
        return (
            <Center height='100vh'>
                <Spinner size='xl' color='blue.500' />
            </Center>
        );
    }

    if (!isAuthenticated) {
        // Se não estiver autenticado, redireciona para a página de login
        return <Navigate to='/login' replace />;
    }

    // Se estiver autenticado, renderiza o componente filho (a tela protegida)
    return <Sidebar>{children}</Sidebar>;
};

export default ProtectedRoute;