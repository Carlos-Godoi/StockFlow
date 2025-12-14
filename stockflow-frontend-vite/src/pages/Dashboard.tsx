import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
// 1. IMPORTAÇÃO: Importe o componente que você exportou do outro arquivo.
import { MyNavBarComponent } from '../components/MyNavBarComponent'; // Ajuste o caminho conforme necessário

const DashboardPage: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user) {
        return <Text>Carregando ou acesso negado...</Text>
    }

    return (
        // 2. FRAGMENTO: Use um Fragmento (<>...</>) para retornar múltiplos elementos.
        <>
            {/* 3. RENDERIZAÇÃO: Renderize a barra de navegação no topo. */}
            <MyNavBarComponent /> 

            <Box p={8}>
                <VStack spacing={4} align='start'>
                    <Heading>Bem-vindo(a) ao StockFlow, {user.name}!</Heading>
                    <Text fontSize='xl'>Você está logado como: **{user.role}**</Text>
                    <Text>Aqui você verá os principais indicadores e atalhos da sua função.</Text>

                    <Box pt={4}>
                        <Button colorScheme='red' onClick={logout}>
                            Sair
                        </Button>
                    </Box>

                    {/* Exemplo de RBAC no Frontend */}
                    {user.role === 'admin' && (
                        <Box mt={8} p={4} bg='red.50' borderRadius='md'>
                            <Text fontWeight='bold'>Painel de Admin</Text>
                            <Text fontSize='sm'>Acesso a relatórios de lucro e gerenciamento de usuários.</Text>
                        </Box>
                    )}
                </VStack>
            </Box>
        </>
    );
};

export default DashboardPage;