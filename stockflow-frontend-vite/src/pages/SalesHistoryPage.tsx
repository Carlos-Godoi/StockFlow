import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Box, Heading, Table, Thead, Tbody, Tr, Th, Td,
    Button, useToast, TableContainer, Spinner, Center, Flex
} from '@chakra-ui/react';
import { FiFileText, FiRefreshCw } from 'react-icons/fi';
import api from '../api/api';
import { generateReceipt, ItemsData } from '../utils/generateReceipt';
import { AxiosError } from 'axios';
import { UserRole } from '../types/auth';


interface Sale {
    _id: string;
    createdAt: string;
    items: ItemsData [],
    totalAmount: number;
    user?: {
        name: string;
    };     
}

const SalesHistoryPage: React.FC = () => {
    const { user } = useAuth();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    const fetchSales = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/sales');
            setSales(res.data);
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                toast({ title: 'Erro ao carregar vendas', status: 'error' });
            }
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        console.log('Usuário logado:', user);
        fetchSales();
    }, [fetchSales, user]);

    const handlePrint = (sale: Sale) => {
        const currentUserRole = (user?.role as UserRole) || 'customer';
        generateReceipt({
            saleId: sale._id,
            date: sale.createdAt,
            items: sale.items || [], 
            total: sale.totalAmount,
            sellerName: sale.user?.name || 'Sistema',
            userRole: currentUserRole
        });
    };

    if (loading) return <Center h='60vh'><Spinner size='xl' color='blue.500' /></Center>;

    return (
        <Box p={8}>
            <Flex justify='space-between' align='center' mb={6}>
                <Heading size='lg'>Histórico de Vendas</Heading>
                <Button leftIcon={<FiRefreshCw />} onClick={fetchSales} size='sm'>Atualizar</Button>
            </Flex>

            <TableContainer bg='white' boxShadow='md' borderRadius='lg' borderWidth='1px'>
                <Table variant='simple'>
                    <Thead bg='gray.50'>
                        <Tr>
                            <th>Data</th>
                            <Th>ID da Venda</Th>
                            {/* O Admin vê quem comprou, o cliente não precisa ver o próprio nome em todas as linhas */}
                            <Th>Cliente</Th>
                            <Th isNumeric>Total</Th>
                            <Th>Ações</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {sales.length === 0 ? (
                            <Tr><Td colSpan={5} textAlign='center'>Nenhuma venda encontrada.</Td></Tr>
                        ) : (
                            sales.map((sale) => (
                                <Tr key={sale._id}>
                                    <Td>{new Date(sale.createdAt).toLocaleDateString()}</Td>
                                    <Td fontSize='xs' color='gray.500'>{sale._id.substring(0, 8)}...</Td>
                                    <Td>{sale.user?.name || 'N/A'}</Td>
                                    <Td isNumeric fontWeight='bold'>R$ {sale.totalAmount.toFixed(2)}</Td>
                                    <Td>
                                        
                                        <Button
                                            leftIcon={<FiFileText />}
                                            size='sm'
                                            colorScheme='blue'
                                            variant='ghost'
                                            onClick={() => handlePrint(sale)}
                                        >
                                            Ver Recibo
                                        </Button>
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>       
    );
};

export default SalesHistoryPage;