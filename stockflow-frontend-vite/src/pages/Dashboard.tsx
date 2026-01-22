import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
// 1. IMPORTAÇÃO: Importe o componente que você exportou do outro arquivo.
import { Sidebar } from 'flowbite-react';
import DashboardStats from '../components/DashboardStats';
import SalesChart from '../components/SalesChart';

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
            {/* 3. RENDERIZAÇÃO: Renderize a barra de navegação no topo. */}

            <Box p={8}>
                <VStack spacing={6} align='start' mb={6}>
                    <Heading size='lg'>Bem-vindo(a), {user?.name}!</Heading>
                    <Text fontSize='xl'>Você está logado como: {friendLyRole}</Text>
                    <Text color="gray.600">Aqui está o resumo da sua conta hoje.</Text>

                    {/* Renderiza os cartões dinâmicos */}
                    <DashboardStats />


                    


                </VStack>
            </Box>
            <Box p={8}>
                <VStack spacing={6} align='start' mb={6}>
                    <SalesChart />
                </VStack>
            </Box>


            <Sidebar />

        </>
    );
};

export default DashboardPage;