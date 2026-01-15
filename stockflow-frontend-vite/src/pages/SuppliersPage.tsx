import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import {
    Box,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td, Button,
    useToast,
    IconButton,
    Flex,
    AlertIcon,
    useDisclosure,
    TableContainer
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, AddIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner } from 'flowbite-react';
import SupplierModal from '../components/SupplierModal';

interface Supplier {
    _id: string;
    name: string;
    email: string;
    phone: string;
}

const SuppliersPage: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { hasRole } = useAuth();
    const toast = useToast();


    const fetchSuppliers = useCallback(async () => {
        try {
            const response = await api.get('/suppliers');
            setSuppliers(response.data);
        } catch (error) {
            console.error('Erro ao carregar fornecedores:', error);
            toast({
                title: 'Erro ao carregar fornecedores',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    if (!hasRole(['admin']) && !hasRole(['stocker'])) {
        return (
            <Box p={8}>
                <Alert>
                    <AlertIcon />
                    Acesso negado. Você não tem permissão para visualizar fornecedores.
                </Alert>
            </Box>
        );
    }

    if (loading) {
        return (
            <Flex justify='center' align='center' height='100vh'>
                <Spinner size='xl' /> {/* OU <p>Carregando...</p> */}
            </Flex>
        );
    }

    const handleEdit = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        onOpen();
    };

    const handleAdd = () => {
        setSelectedSupplier(undefined);
        onOpen();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja remover este fornecedor?')) {
            try {
                await api.delete(`/suppliers/${id}`);
                toast({
                    title: 'Fornecedor removido!',
                    status: 'success',
                    duration: 2000,
                    isClosable: true,
                })
                fetchSuppliers();
            } catch (error) {
                console.error('Erro ao remover fornecedor', error);
                toast({
                    title: 'Erro ao remover',
                    status: 'error',
                    duration: 2000,
                    isClosable: true,
                });
            }
        }
    };

    return (
        <Box p={8}>
            <Heading mb={6}>Gestão de Fornecedores</Heading>

            {hasRole(['admin']) && (
                <Button leftIcon={<AddIcon />} colorScheme='blue' mb={4} onClick={handleAdd}>
                    Novo Fornecedor
                </Button>
            )}

            <TableContainer bg='white' boxShadow='sm' borderRadius='lg' borderWidth='1px'>
                <Table variant='simple'>
                    <Thead bg='gray.50'>
                        <Tr>
                            <Th>Nome</Th>
                            <Th>E-mail</Th>
                            <Th>Telefone</Th>
                            {hasRole(['admin']) && <Th>Ações</Th>}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {suppliers.map(s => (
                            <Tr key={s._id}>
                                <Td fontWeight='medium'>{s.name}</Td>
                                <Td>{s.email}</Td>
                                <Td>{s.phone}</Td>
                                {hasRole(['admin']) && (
                                    <Td>
                                        <IconButton
                                            aria-label='Edit'
                                            icon={<EditIcon />}
                                            mr={2}
                                            size='sm'
                                            onClick={() => handleEdit(s)}
                                        />
                                        <IconButton
                                            aria-label='Delete'
                                            icon={<DeleteIcon />}
                                            colorScheme='red'
                                            size='sm'
                                            onClick={() => handleDelete(s._id)}
                                        />
                                    </Td>
                                )}
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>

            {/* Inclusão do Modal */}
            <SupplierModal
                isOpen={isOpen}
                onClose={onClose}
                onSuccess={fetchSuppliers}
                initialData={selectedSupplier}
            />
        </Box>
    );
};

export default SuppliersPage;