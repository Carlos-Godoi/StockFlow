import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Box,
    Heading,
    Spinner,
    Text,
    useToast,
    VStack,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Alert,
    AlertIcon,
    SimpleGrid,
    Divider
} from '@chakra-ui/react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import api from '../api/api';

// Tipagem para o relatório de lucro mensal
interface MonthlyProfitData {
    _id: string;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    totalSales: number;
}

// Tipagem para o relatório de estoque crítico
interface CriticalStockItem {
    _id: string;
    name: string;
    stockQuantity: number;
    minimumStock: number;
    supplier: { name: string };
}

interface MyPayloadItem {
    name: string;
    value: number;
    color: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: MyPayloadItem[];
    label?: string;
}

// Formato de moeda para Tooltip do Recharts
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    // 2. Verificamos se o tooltip deve aparecer
    if (active && payload && payload.length) return null
    return (
        <Box p={3} bg='white' borderRadius='md' boxShadow='lg' border="1px solid" borderColor="gray.100">
            <Text fontWeight='bold' mb={1}>{label}</Text>

            {/* 3. O SEGREDO: Usamos 'as MyPayloadItem[]' para validar o payload */}
            {(payload as MyPayloadItem[]).map((p) => (
                <Text key={`${p.name}-${p.value}`} color={p.color} fontSize="sm">
                    {p.name}:{' '}
                    <Text as="span" fontWeight="bold">
                        R$ {Number(p.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Text>
                </Text>
            ))}
        </Box>
    );
};

const ReportsPage: React.FC = () => {
    const { hasRole } = useAuth();
    const toast = useToast();

    const canViewProfit = hasRole(['admin']);
    const canViewStock = hasRole(['admin', 'stocker']);


    // Estados de dados
    const [profitData, setProfitData] = useState<MonthlyProfitData[]>([]);
    const [criticalStock, setCriticalStock] = useState<CriticalStockItem[]>([]);

    // Estados de carregamento
    const [loadingProfit, setLoadingProfit] = useState(canViewProfit);
    const [loadingStock, setLoadingStock] = useState(canViewStock);

    // 1. Fetch de Lucro Mensal (Admin Only)
    useEffect(() => {
        if (!canViewProfit) return;

        api.get('/reports/monthly-profit')
            .then(Response => {
                setProfitData(Response.data);
            })
            .catch(error => {
                toast({
                    title: 'Erro de Lucro',
                    description: error.response?.data?.message || 'Falha ao carregar relatório de lucro mensal.',
                    status: 'error',
                    isClosable: true,
                });
            })
            .finally(() => {
                setLoadingProfit(false)
            });
    }, [canViewProfit, toast]);

    // 2. Fetch de Estoque Crítico (Admin/Stocker)
    useEffect(() => {
        if (!canViewStock) return;

        api.get('/reports/critical-stock')
            .then(response => {
                setCriticalStock(response.data);
            })
            .catch(error => {
                toast({
                    title: 'Erro de Estoque',
                    description: error.response?.data?.message || 'Falha ao carregar relatório de estoque crítico.',
                    status: 'error',
                    isClosable: true,
                });
            })
            .finally(() => {
                setLoadingStock(false)
            });
    }, [canViewStock, toast]);

    return (
        <Box p={8}>
            <Heading mb={4}>Relatórios e Análises</Heading>
            <VStack spacing={10} align='stretch'>

                {/* A) Relatório de Lucro Mensal (Apenas Admin) */}
                <Box>
                    <Heading size='lg' mb={4}>Lucro Líquido Mensal</Heading>

                    {loadingProfit && <Spinner />}

                    {!canViewProfit && !loadingProfit && (
                        <Alert status='warning'>
                            <AlertIcon />
                            Acesso negado: Este relatório está restrito a Administradores.
                        </Alert>
                    )}

                    {canViewProfit && !loadingProfit && profitData.length === 0 && (
                        <Alert status='info'>
                            <AlertIcon />
                            Nenhum dado de lucro encontrado para o período.
                        </Alert>
                    )}

                    {canViewProfit && !loadingProfit && profitData.length > 0 && (
                        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                            {/* Gráfico de Barras: Receita e Custo */}
                            <Box h='400px' p={4} bg='white' borderRadius='lg' boxShadow='md'>
                                <Text fontWeight='medium' mb={2}>Receita vs Custo</Text>
                                <ResponsiveContainer width='100%' height='100%'>
                                    <BarChart data={profitData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray='3 3' />
                                        <XAxis dataKey='_id' />
                                        <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey='totalRevenue' name='Receita Total' fill='#4299E1' />
                                        <Bar dataKey='totalCost' name='Custo Total' fill='#E53E3E' />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>

                            {/* Gráfico de Linha: Lucro Líquido */}
                            <Box h='400px' p={4} bg='white' borderRadius='lg' boxShadow='md'>
                                <Text fontWeight='medium' mb={2}>Evolução do Lucro Líquido</Text>
                                <ResponsiveContainer width='100%' height='100%'>
                                    <LineChart data={profitData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray='3 3' />
                                        <XAxis dataKey='_id' />
                                        <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Line
                                            type='monotone'
                                            dataKey='totalProfit'
                                            name='Lucro Líquido'
                                            stroke='#38A169'
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </SimpleGrid>
                    )}
                </Box>

                <Divider />

                {/* B) Relatório de Estoque Crítico (Admin/Stocker) */}
                <Box>
                    <Heading size='lg' mb={4}>Produtos em Estoque Crítico</Heading>
                    <Text mb={4} color='gray.600'>
                        Produtos onde a quantidade em estoque é **menor ou igual** ao estoque mínimo.
                    </Text>

                    {loadingStock && <Spinner />}

                    {!canViewStock && !loadingStock && (
                        <Alert status='warning'>
                            <AlertIcon />
                            Acesso negado: Este relatório está restrito a Administradores e Estoquistas.
                        </Alert>
                    )}

                    {canViewStock && !loadingStock && criticalStock.length === 0 && (
                        <Alert status='success'>
                            <AlertIcon />
                            Parabéns! Nenhum produto está em estoque crítico.
                        </Alert>
                    )}

                    {canViewStock && !loadingStock && criticalStock.length > 0 && (
                        <TableContainer borderWidth={1} borderRadius='lg'>
                            <Table variant='simple'>
                                <Thead>
                                    <Tr bg='red.50'>
                                        <Th>Produto</Th>
                                        <Th>Fornecedor</Th>
                                        <Th isNumeric>Estoque Atual</Th>
                                        <Th isNumeric>Estoque Mínimo</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {criticalStock.map((item) => (
                                        <Tr key={item._id} bg='red.100'>
                                            <Td fontWeight='bold'>{item.name}</Td>
                                            <Td>{item.supplier.name}</Td>
                                            <Td isNumeric>{item.stockQuantity}</Td>
                                            <Td isNumeric>{item.minimumStock}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            </VStack>
        </Box>
    );
};

export default ReportsPage;