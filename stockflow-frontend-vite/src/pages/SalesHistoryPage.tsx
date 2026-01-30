import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Text,
    Button, useToast, TableContainer, Spinner, Center, Flex, Badge,
} from '@chakra-ui/react';
import { FiFileText, FiRefreshCw } from 'react-icons/fi';
import api from '../api/api';
import { generateReceipt, ItemsData } from '../utils/generateReceipt';
import { AxiosError } from 'axios';
import { UserRole } from '../types/auth';


interface Sale {
    _id: string;
    createdAt: string;
    products?: ItemsData[];
    items?: ItemsData[];
    totalAmount: number;
    user?: {
        name: string;
        role: string;
    };
    paymentMethod: string;
}

const SalesHistoryPage: React.FC = () => {
    const { user, hasRole } = useAuth();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    const canView = !!user && hasRole(['admin', 'customer', 'seller', 'stocker']);

    const fetchSales = useCallback(async () => {
        if (!canView) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await api.get('/sales');
            setSales(Array.isArray(response.data) ? response.data : []);
        } catch (error: unknown) {
            const message = error instanceof AxiosError
                ? error.response?.data?.message
                : 'Falha de comunicação com a API.';

            toast({
                title: 'Erro ao carregar vendas',
                description: message,
                status: 'error',
                duration: 5000,
                isClosable: true
            });
        } finally {
            setLoading(false);
        }
    }, [canView, toast]);

    useEffect(() => {
        fetchSales();
    }, [fetchSales]);

    const handlePrint = (sale: Sale) => {
        const currentUserRole = (user?.role as UserRole) || 'customer';

        const finalItems = sale.products || sale.items || [];

console.log(sale);
        generateReceipt({
            saleId: sale._id,
            date: sale.createdAt,
            items: finalItems,
            total: sale.totalAmount,
            sellerName: sale.user?.name || 'Sistema',
            paymentMethod: sale.paymentMethod,
            userRole: currentUserRole,
            role: currentUserRole
        });

        
    };

    if (loading) return <Center h='60vh'><Spinner size='xl' color='blue.500' thickness='4px' /></Center>;

    if (!canView) {
        return (
            <Center h='60vh'>
                <Text color='gray.500'>Você não tem permissão para ver este histórico.</Text>
            </Center>
        );
    }

    return (
        <Box p={8}>
            <Flex justify='space-between' align='center' mb={6}>
                <Heading size='lg'>Histórico de Compras</Heading>
                <Button leftIcon={<FiRefreshCw />} onClick={fetchSales} size='sm'>Atualizar</Button>
            </Flex>

            <TableContainer bg='white' boxShadow='md' borderRadius='lg' borderWidth='1px'>
                <Table variant='simple'>
                    <Thead bg='gray.50'>
                        <Tr>
                            <Th>Data</Th>
                            <Th>ID da Venda</Th>
                            {/* O Admin vê quem comprou, o cliente não precisa ver o próprio nome em todas as linhas */}
                            <Th>Cliente</Th>
                            <Th isNumeric>Total</Th>
                            <Th>Pagamento</Th>
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
                                        <Badge colorScheme={
                                            sale.paymentMethod === 'Dinheiro' ? 'green' :
                                            sale.paymentMethod === 'Pix' ? 'cyan' : 'purple'
                                        }>
                                            {sale.paymentMethod}
                                        </Badge>
                                    </Td>
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