import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import {
    Box,
    Heading,
    Button,
    Spinner,
    Text,
    Table,
    Thead,
    Tr,
    Th,
    Td,
    TableContainer,
    Flex,
    useToast,
    Tag,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
    VStack,
    HStack,
    Tbody
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { AxiosError } from 'axios';
import { ModalFooter } from 'flowbite-react';
import SaleCreationModal from '../components/SaleCreationModal';



// import SaleCreationModal from '../components/SaleCreationModal';

// Tipagem baseada no backend
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

const getStatusColor = (status: ISale['status']) => {
    switch (status) {
        case 'Paid': return 'green';
        case 'Pending': return 'yellow';
        case 'Canceled': return 'red';
        default: return 'gray';
    }
};

const SalesPage: React.FC = () => {
    const { hasRole } = useAuth();
    const [sales, setSales] = useState<ISale[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState<ISale | null>(null);
    const toast = useToast();

    // Permissões
    const canViewAll = hasRole(['admin']);
    const canCreate = hasRole(['admin', 'seller']);

    // Função para buscar as vendas (apenas admin pode ver todas as vendas)
    const fetchSales = useCallback(async () => {
        if (!canViewAll) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/sales');
            setSales(response.data);
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                toast({
                    title: 'Erro ao carregar vendas.',
                    description: error.response?.data?.message || 'Falha de comunicação com a API. ',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        } finally {
            setLoading(false);
        }
    }, [canViewAll, toast]);

    useEffect(() => {
        fetchSales();
    }, [fetchSales]);

    if (!canViewAll) {
        // Redireciona ou mostra uma mensagem para quem não é Admin
        return (
            <Flex direction='column' align='center' justify='center' p={8}>
                <Text fontSize='xl' mb={4}>Funcionalidade de Listagem de Vendas restrita a Administradores.</Text>
                {canCreate && (
                    <Button leftIcon={<AddIcon />} colorScheme='blue' onClick={() => setIsCreationModalOpen(true)}>
                        Registrar Nova Venda
                    </Button>
                )}
            </Flex>
        );
    }

    if (loading) {
        return <Flex justify='center' align='center' h='50vh'><Spinner size='xl' /></Flex>;
    }

    return (
        <Box p={8}>
            <Flex justify='space-between' align='center' mb={6}>
                <Heading size='xl'>Registro de Vendas e Faturas</Heading>
                {canCreate && (
                    <Button leftIcon={<AddIcon />} colorScheme='blue' onClick={() => setIsCreationModalOpen(true)}>
                        Registrar Nova Venda
                    </Button>
                )}
            </Flex>

            {sales.length === 0 ? (
                <Text>Nenhuma venda registrada.</Text>
            ) : (
                <TableContainer borderWidth={1} borderRadius='lg'>
                    <Table variant='simple'>
                        <Thead>
                            <Tr bg='gray.50'>
                                <Th>ID Fatura</Th>
                                <Th>Vendedor</Th>
                                <Th isNumeric>Total</Th>
                                <Th>Status</Th>
                                <Th>Data</Th>
                                <Th>Detalhes</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {sales.map((sale) => (
                                <Tr key={sale._id}>
                                    <Td>{sale._id.substring(0, 8)}...</Td>
                                    <Td>{sale.user.name}</Td>
                                    <Td isNumeric fontWeight='bold'>R$ {sale.totalAmount.toFixed(2)}</Td>
                                    <Td>
                                        <Tag size='sm' colorScheme={getStatusColor(sale.status)}>
                                            {sale.status}
                                        </Tag>
                                    </Td>
                                    <Td>{new Date(sale.saleDate).toLocaleDateString()}</Td>
                                    <Td>
                                        <Button size='sm' onClick={() => setSelectedSale(sale)}>
                                            Ver Itens
                                        </Button>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>
            )}

            {/* Modal de Criação de Venda */}
            <SaleCreationModal
                isOpen={isCreationModalOpen}
                onClose={() => setIsCreationModalOpen(false)}
                onSuccess={fetchSales}
            />

            {/* Modal de Detalhes da Venda (Visualização de Itens) */}
            <Modal isOpen={!!selectedSale} onClose={() => setSelectedSale(null)} size='xl'>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Detalhes da Fatura #{selectedSale?._id.substring(0, 8)}...</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedSale && (
                            <VStack spacing={4} align='start'>
                                <HStack spacing={10}>
                                    <Text>Vendedor: **{selectedSale.user.name}**</Text>
                                    <Tag colorScheme={getStatusColor(selectedSale.status)}>{selectedSale.status}</Tag>
                                </HStack>
                                <Table variant='striped' size='sm' w='full'>
                                    <Thead>
                                        <Tr>
                                            <Th>Produto</Th>
                                            <Th isNumeric>Preço Unit.</Th>
                                            <Th isNumeric>Qtd</Th>
                                            <Th isNumeric>Subtotal</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {selectedSale.products.map((item, index) => (
                                            <Tr key={index}>
                                                <Td>{item.name}</Td>
                                                <Td isNumeric>R$ {item.priceAtSale.toFixed(2)}</Td>
                                                <Td isNumeric>{item.quantity}</Td>
                                                <Td isNumeric>R$ {item.subtotal.toFixed(2)}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                                <Text fontWeight='bold' fontSize='xl' alignSelf='end' mt={4}>
                                    Total: R$ {selectedSale.totalAmount.toFixed(2)}
                                </Text>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        {/* Aqui seria o ponto de geração de PDF, chamando a rota do backend */}
                        <Button colorScheme='teal' mr={3} onClick={() => alert('Funcionalidade de Geração de PDF ()próxima etapa!')}>
                            Gerar Fatura em PDF
                        </Button>
                        <Button variant='ghost' onClick={() => setSelectedSale(null)}>Fechar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default SalesPage;
