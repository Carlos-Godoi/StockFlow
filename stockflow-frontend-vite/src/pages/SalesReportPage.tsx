import React, { useState } from 'react';
import {
    Box, Heading, Input, Button, Table, Thead, Tbody, Tr, Th, Td, Text,
    Stack, Stat, StatLabel, StatNumber, SimpleGrid, useToast, TableContainer
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import api from '../api/api';


interface ISaleItem {
    name: string;
    quantity: number;
    priceAtSale: number;
    subtotal: number;
}

interface ISale {
    _id: string;
    user: { name: string, email: string };
    products: ISaleItem[];
    totalAmount: number;
    status: 'Pending' | 'Paid' | 'Canceled';
    saleDate: string;
    createdAt: string;
}

const SalesReportPage: React.FC = () => {
    const [dates, setDates] = useState({ start: '', end: '' });
    const [reportData, setReportData] = useState<{ sales: ISale[], totalRevenue: number, count: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const toast = useToast();


    const handleGenerateReport = async () => {
        if (!dates.start || !dates.end) {
            return toast({
                title: 'Atenção',
                description: 'Selecione ambas as datas',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
        }

        // Comparar datas início e fim
        if (new Date(dates.start) > new Date(dates.end)) {
            return toast({
                title: 'Intervalo inválido',
                description: 'A data inicial não pode ser maior que a data final.',
                status:'error',
                duration: 4000,
                isClosable: true,
            });
        }

        setLoading(true);
        try {
            const response = await api.get(`/sales/report`, {
                params: { startDate: dates.start, endDate: dates.end }
            });
            setReportData(response.data);
        } catch (error) {
            console.error('Erro ao buscar dados', error);
            toast({
                title: 'Erro ao buscar dados',
                description: 'Verifique sua conexão ou tente novamente.',
                status: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) =>
            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        
        <Box p={8}>
            <Heading mb={6}>Relatórios de Vendas</Heading>

            <Stack direction={{ base: 'column', md: 'row' }} spacing={4} mb={8} align='flex-end' bg='white' p={6} borderRadius='lg' shadow='sm'>
                <Box>
                    <Text fontWeight='bold' mb={2}>Data Inicial</Text>
                    <Input type='date' value={dates.start} onChange={e => setDates({ ...dates, start: e.target.value })} />
                </Box>
                <Box>
                    <Text fontWeight='bold' mb={2}>Data Final</Text>
                    <Input type='date' value={dates.end} onChange={e => setDates({ ...dates, end: e.target.value })} />
                </Box>
                <Button leftIcon={<FiSearch />} colorScheme='blue' onClick={handleGenerateReport} isLoading={loading}>
                    Gerar Relatório
                </Button>
            </Stack>

            {reportData && (
                <>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
                        <Stat p={5} shadow='md' border='1px' borderColor='gray.200' borderRadius='lg' bg='white'>
                            <StatLabel>Fatoramento no Período</StatLabel>
                            <StatNumber color='green.500'>{formatCurrency(reportData.totalRevenue)}</StatNumber>
                        </Stat>
                        <Stat p={5} shadow='md' border='1px' borderColor='gray.200' borderRadius='lg' bg='white'>
                            <StatLabel>Total de Pedidos</StatLabel>
                            <StatNumber>{reportData.count}</StatNumber>
                        </Stat>
                    </SimpleGrid>

                    <TableContainer bg='white' shadow='md' borderRadius='lg' borderWidth='1px'>
                        <Table variant='simple'>
                            <Thead bg='gray.50'>
                                <Tr>
                                    <Th>Data</Th>
                                    <Th>Vendedor/Cliente</Th>
                                    <Th isNumeric>Valor</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {reportData.sales.map((sale: ISale) => (
                                    <Tr key={sale._id}>
                                        <Td>{new Date(sale.createdAt).toLocaleDateString()}</Td>
                                        <Td>{sale.user?.name}</Td>
                                        <Td isNumeric fontWeight='bold'>{formatCurrency(sale.totalAmount)}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Box>
    );
};

export default SalesReportPage;