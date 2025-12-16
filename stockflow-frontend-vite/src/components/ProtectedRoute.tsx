// src/components/ProtectedRoute.tsx (Atualizado)

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, Center } from '@chakra-ui/react';
import Sidebar from './Sidebar'; // <-- Importa a Sidebar

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Center height="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se autenticado, renderiza a Sidebar envolvendo o conteúdo da página
  return <Sidebar>{children}</Sidebar>; 
};

export default ProtectedRoute;