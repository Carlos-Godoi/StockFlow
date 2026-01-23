import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { Sidebar } from 'flowbite-react';
import DashboardStats from '../components/DashboardStats';
import SalesChart from '../components/SalesChart';
import LowStockAlert from '../components/LowStockAlert';

const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    seller: 'Vendedor',
    stocker: 'Estoquista',
    customer: 'Cliente'
};

const DashboardPage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();

      
    if (!isAuthenticated || !user) {
        return <Text>Carregando ou acesso negado...</Text>
    }

    const friendLyRole = roleLabels[user.role] || user.role;

    return (


        <>

            <Box p={8}>
                <VStack spacing={6} align='start' mb={6}>
                    <Heading size='lg'>Bem-vindo(a), {user?.name}!</Heading>
                    <Text fontSize='xl'>Você está logado como: {friendLyRole}</Text>
                    <Text color="gray.600">Aqui está o resumo da sua conta hoje.</Text>
                </VStack>

                {/* 1. Alertas de Stock (Apenas para Admin e Stocker) */}
                <DashboardStats />

                {/* 2. Alertas de Stock (Apenas para Admin e Stocker) */}
                {(user.role === 'admin' || user.role === 'stocker') && <LowStockAlert />}

                {/* 3. Gráfico de Vendas */}
                <Box p={8}>
                    <VStack spacing={6} align='start' mb={6}>
                        <SalesChart />
                    </VStack>
                </Box>
            </Box>



            <Sidebar />

        </>
    );
};

export default DashboardPage;