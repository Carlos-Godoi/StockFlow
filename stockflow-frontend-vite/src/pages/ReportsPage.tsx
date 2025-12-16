// src/pages/ReportsPage.tsx

import React from 'react';
import { Box, Heading, Text, Tag } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

const ReportsPage: React.FC = () => {
    const { user } = useAuth();
    return (
        <Box p={8}>
            <Heading mb={4}>Relatórios e Análises</Heading>
            <Text mb={4}>
                Aqui serão exibidos os Relatórios de Lucro Mensal (Agregação MongoDB) e Estoque Crítico em formato de gráfico.
            </Text>
            <Tag colorScheme="blue">Próxima Etapa</Tag>
            <Text mt={4}>Acesso liberado apenas para: **{user?.role.toUpperCase()}**</Text>
        </Box>
    );
};
export default ReportsPage;