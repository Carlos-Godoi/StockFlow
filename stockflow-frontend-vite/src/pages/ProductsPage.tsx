/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { Image, Box, Heading, Button, Spinner, Text, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Flex, useToast, IconButton } from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { AxiosError } from 'axios';
import ProductModal from '../components/ProductModal';

// Tipagem backend
interface ISupplier {
    _id: string;
    name: string;
    contact: string;
}

interface IProduct {
    _id: string;
    name: string;
    description: string;
    purchasePrice: number;
    salePrice: number;
    stockQuantity: number;
    minimumStock: number;
    supplier: ISupplier; //Populado pelo backend
    imageUrl?: string;
}

const ProductsPage: React.FC = () => {
    const { hasRole } = useAuth();
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    // Estados para o Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);

    // URL base para imagens (idealmente viria de uma variável de ambiente)
    const API_BASE_URL = 'http://localhost:3000';

    const fetchProducts = useCallback(async () => {
        try {
            const response = await api.get('products');
            setProducts(response.data);
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                toast({
                    title: 'Erro ao carregar produtos.',
                    description: error.response?.data?.message || 'Falha de comunicação com a API.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDelete = async (id: string) => {
        // Apenas 'admin' pode deletar
        if (!hasRole(['admin'])) {
            return toast({
                title: 'Permissão Negada',
                description: 'Apenas usuário Administrador pode deletar produtos,',
                status: 'warning',
            });
        }

        if (window.confirm('Tem certeza que deseja deletar este produto?')) {
            try {
                await api.delete(`/products/${id}`);
                toast({
                    title: 'Produto deletado.',
                    status: 'success',
                });
                fetchProducts();
            } catch (error: unknown) {
                if (error instanceof AxiosError) {
                    toast({
                        title: 'Erro ao deletar.',
                        description: error.response?.data?.message || 'Falha na deleção.',
                        status: 'error',
                    });
                }
            }
        }
    };

    // Funções para abrir/fechar Modal
    const handleOpenCreate = () => {
        setEditingProduct(null); // Modo criação
        setIsModalOpen(true);
    };

    const handleOpenEdit = (product: IProduct) => {
        // Garantir que o Supplier ID (string) está no objeto, manipulamos
        const initialDataWithId = {
            ...product,
            supplier: product.supplier._id // Passa o ID, não o objeto inteiro, para o formulário    
        };
        setEditingProduct(initialDataWithId as any);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    if (loading) {
        return <Flex justify='center' align='center' h='50vh'><Spinner size='xl' /></Flex>;
    }

    // Permissões de manipulação
    const canCreate = hasRole(['admin', 'seller', 'stocker']);
    const canEdit = hasRole(['admin', 'stocker']);
    const canDelete = hasRole(['admin']);



    return (
        <Box p={8}>
            <Flex justify='space-between' align='center' mb={6}>
                <Heading size='xl'>Gestão de Produtos</Heading>
                {canCreate && (
                    <Button
                        leftIcon={<AddIcon />}
                        colorScheme='blue'
                        onClick={handleOpenCreate}
                    >
                        Novo Produto
                    </Button>
                )}
            </Flex>

            {products.length === 0 ? (
                <Text>Nenhum produto cadastrado.</Text>
            ) : (
                <TableContainer borderWidth={1} borderRadius='lg'>
                    <Table variant='simple' size='sm'> {/* size="sm" ajuda na visualização */}
                        <Thead>
                            <Tr bg='gray.50'>
                                <Th>Img</Th>
                                <Th>Nome</Th>
                                <Th>Fornecedor</Th>
                                <Th isNumeric>Preço Venda</Th>
                                <Th isNumeric>Estoque</Th>
                                <Th isNumeric>Estoque Mín.</Th>
                                <Th>Ações</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {products.map((product) => (
                                <Tr key={product._id}>
                                    <Td>
                                        {product.imageUrl ? (
                                            <Image
                                                src={`${API_BASE_URL}${product.imageUrl}`}
                                                alt={product.name}
                                                boxSize='50px'
                                                objectFit='cover'
                                                borderRadius='md'
                                            />
                                        ) : (
                                            // Placeholder se não houver imagem
                                            <Box boxSize='50px' bg='gray.100' borderRadius='md'></Box>
                                        )}
                                    </Td>

                                    <Td fontWeight='medium'>{product.name}</Td>
                                    <Td fontWeight='medium'>{product.name}</Td>
                                    <Td>{product.supplier.name}</Td>
                                    <Td isNumeric>R$ {product.salePrice.toFixed(2)}</Td>
                                    <Td isNumeric color={product.stockQuantity <= product.minimumStock ? 'red.500' : 'inherit'}>
                                        {product.stockQuantity}
                                    </Td>
                                    <Td isNumeric>{product.minimumStock}</Td>
                                    <Td>
                                        {canEdit && (
                                            <IconButton
                                                aria-label='Editar Produto'
                                                icon={<EditIcon />}
                                                size='sm'
                                                mr={2}
                                                colorScheme='yellow'
                                                onClick={() => handleOpenEdit(product)}
                                            />
                                        )}
                                        {canDelete && (
                                            <IconButton
                                                aria-label='Deletar Produto'
                                                icon={<DeleteIcon />}
                                                size='sm'
                                                colorScheme='red'
                                                onClick={() => handleDelete(product._id)}
                                            />
                                        )}
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>

            )}

            {/* Componente Modal de Criação/Edição */}
            <ProductModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                initialData={editingProduct}    // Passa o produto para edição ou null para criação
                onSuccess={fetchProducts}       // Recarrega a lista após o sucesso
            />
        </Box>
    );
};

export default ProductsPage;