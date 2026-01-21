import React, { useEffect, useState } from 'react';
import {
    SimpleGrid, Box, Stat, StatLabel, StatNumber,
    StatHelpText, Icon, Flex, Spinner
} from '@chakra-ui/react';
import { FiDollarSign, FiShoppingBag, FiTrendingUp } from 'react-icons/fi';
import api from '../api/api';




interface DashboardData {
    label: string;
    total: number;
    salesCount: number;
}

const DashboardStats: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<DashboardData>('/stats/summary')
            .then(res => setData(res.data))
            .catch(err => console.error('Erro ao buscar stats', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading || !data) return <Spinner />

    return (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
            {/* Card de Valor Total */}
            <Box p={5} shadow='md' border='1px' borderColor='gray.200' borderRadius='lg' bg='white'>
                <Flex align='center'>
                    <Box p={3} bg='blue.50' borderRadius='md' mr={4}>
                        <Icon as={FiDollarSign} color='blue.500' w={6} h={6} />
                    </Box>
                    <Stat>
                        <StatLabel color='gray.500'>{data.label}</StatLabel>
                        <StatNumber fontSize='2xl'>R$ {data.total.toFixed(2)}</StatNumber>
                        <StatHelpText>Desce o início</StatHelpText>
                    </Stat>
                </Flex>
            </Box>

            {/* Card de Quantidade de Vendas */}
            <Box p={5} shadow='md' border='1px' borderColor='gray.200' borderRadius='lg' bg='white'>
                <Flex align='center'>
                    <Box p={3} bg='green.50' borderRadius='md' mr={4}>
                        <Icon as={FiShoppingBag} color='green.500' w={6} h={6} />
                    </Box>
                    <Stat>
                        <StatLabel color='gray.500'>Total de Pedidos</StatLabel>
                        <StatNumber fontSize='2xl'>{data.salesCount}</StatNumber>
                        <StatHelpText>Compras finalizadas</StatHelpText>
                    </Stat>
                </Flex>
            </Box>

            {/* Card de Meta (Exemplo visual) */}
            <Box p={5} shadow='md' border='1px' borderColor='gray.200' borderRadius='lg' bg='white'>
                <Flex align='center'>
                    <Box p={3} bg='purple.50' borderRadius='md' mr={4}>
                        <Icon as={FiTrendingUp} color='purple.500' w={6} h={6} />
                    </Box>
                    <Stat>
                        <StatLabel color='gray.500'>Status da Conta</StatLabel>
                        <StatNumber fontSize='2xl'>Ativa</StatNumber>
                        <StatHelpText></StatHelpText>
                    </Stat>
                </Flex>
            </Box>
        </SimpleGrid>
    );
};

export default DashboardStats;