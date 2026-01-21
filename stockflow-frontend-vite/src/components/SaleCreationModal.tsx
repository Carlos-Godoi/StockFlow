import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Select,
    Input,
    VStack,
    HStack,
    Box,
    Text,
    useToast,
    IconButton
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import api from '../api/api';
import { AxiosError } from 'axios';

interface SaleCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// Definir interface para o produto que vem da API
interface ApiProduct {
    _id: string;
    name: string;
    salePrice: number;
    stockQuantity: number;
}

// Tipagem simplificada do produto para o formulário
interface ProductOption {
    _id: string;
    name: string;
    salePrice: number;
    stockQuantity: number;
}

// Estado local de um item na venda
export interface SaleItem {
    productId: string;
    quantity: number;
    priceAtSale: number;
    name: string;
}

const SaleCreationModal: React.FC<SaleCreationModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [productsCatalog, setProductsCatalog] = useState<ProductOption[]>([]);
    const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    // Buscar catálogo de produtos disponíveis para venda
    useEffect(() => {
        if (isOpen) {
            api.get<ApiProduct[]>('/products')
                .then(response => {
                    const availableProducts: ProductOption[] = response.data.map(p => ({
                        _id: p._id,
                        name: p.name,
                        salePrice: p.salePrice,
                        stockQuantity: p.stockQuantity
                    }));
                    setProductsCatalog(availableProducts);
                    setSelectedItems([]); // Reseta o carrinho
                })
                .catch(error => {
                    console.error('Erro ao buscar catálogo de produtos', error);
                    toast({ title: 'Erro ao carregar catálogo.', status: 'error' });
                });
        }
    }, [isOpen, toast]);

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const productId = form.productSelect.value;
        const quantity = parseInt(form.quantityInput.value);

        if (!productId || quantity <= 0) return;

        const product = productsCatalog.find(p => p._id === productId);
        if (!product) return;


        // Validação de Estoque
        if (quantity > product.stockQuantity) {
            return toast({
                title: 'Estoque insuficiente.',
                description: `Apenas ${product.stockQuantity} unidades disponíveis para ${product.name}.`,
                status: 'warning',
            });
        }

        const newItem: SaleItem = {
            productId,
            name: product.name,
            quantity,
            priceAtSale: product.salePrice
        };

        setSelectedItems([...selectedItems, newItem]);

        // Limpa o formulário de adição de item
        form.quantityInput.value = '1';
        form.productSelect.value = '';
    };

    const handleRemoveItem = (index: number) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    // Calcular o total da venda
    const totalAmount = useMemo(() => {
        return selectedItems.reduce((sum, item) => sum + (item.quantity * item.priceAtSale), 0);
    }, [selectedItems]);

    const handleSubmitSale = useCallback(async () => {
        if (selectedItems.length === 0) {
            return toast({
                title: 'Adicione pelo menos um item à venda.',
                status: 'warning',
            })
        }

        setIsSubmitting(true);

        const itemsToSubmit = selectedItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }));

        try {
            await api.post('/sales', { items: itemsToSubmit }); // Envio para o Service com Transação

            toast({
                title: 'Venda registrada com sucesso!',
                description: 'O estoque foi deduzido.',
                status: 'success',
            });
            onSuccess(); // Recarrega a lista de vendas e produtos
            onClose();

        } catch (error: unknown) {

            if (error instanceof AxiosError) {
               // console.error('Estoque insuficiente', error);
                toast({
                    title: 'Falha na Transação.',
                    description: error.response?.data?.error || 'Estoque insuficiente ou erro no servidor.',
                    status: 'error',
                    duration: 8000
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedItems, toast, onSuccess, onClose]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='3xl'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Registrar Nova Venda</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={6} align='start'>
                        {/* 1. Formulário de Adição Item */}
                        <Box w='full' p={4} borderWidth={1} borderRadius='lg'>
                            <Text fontWeight='bold' mb={2}>Adicionar Produto</Text>
                            <form onSubmit={handleAddItem}>
                                <HStack spacing={3}>
                                    <Select name='productSelect' placeholder='Selecione o Produto' flex={2}>
                                        {productsCatalog.map(p => (
                                            <option key={p._id} value={p._id}>
                                                {p.name} (Estoque: {p.stockQuantity} | R$ {p.salePrice.toFixed(2)})
                                            </option>
                                        ))}
                                    </Select>
                                    <Input
                                        name='quantityInput'
                                        type='number'
                                        placeholder='Qtd'
                                        min='1'
                                        defaultValue='1'
                                        flex={1}
                                    />
                                    <Button type='submit' leftIcon={<AddIcon />} colorScheme='green'>
                                        Adicionar
                                    </Button>
                                </HStack>
                            </form>
                        </Box>

                        {/* 2. Resumo da Venda (Carrinho) */}
                        <Box w='full' p={4} borderWidth={1} borderRadius='lg'>
                            <Text fontWeight='bold' mb={2}>Items da Venda ({selectedItems.length})</Text>
                            {selectedItems.length === 0 ? (
                                <Text color='gray.500'>Nenhum item adicionado.</Text>
                            ) : (
                                <VStack spacing={2} align='start'>
                                    {selectedItems.map((item, index) => (
                                        <HStack key={index} justify='space-between' w='full' p={2} bg='gray.50' borderRadius='md'>
                                            <Text flex={3}>{item.name}</Text>
                                            <Text flex={1}>Qtd: **{item.quantity}**</Text>
                                            <Text flex={2} fontWeight='medium'>Subtotal: R$ {(item.quantity * item.priceAtSale).toFixed(2)}</Text>
                                            <IconButton
                                                aria-label='Remover item'
                                                icon={<DeleteIcon />}
                                                size='xs'
                                                colorScheme='red'
                                                onClick={() => handleRemoveItem(index)}
                                            />
                                        </HStack>
                                    ))}
                                    <Text fontWeight='bold' fontSize='xl' w='full' textAlign='right' pt={2}>
                                        Total: R$ {totalAmount.toFixed(2)}
                                    </Text>
                                </VStack>
                            )}
                        </Box>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant='ghost' mr={3} onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        colorScheme='blue'
                        onClick={handleSubmitSale}
                        isDisabled={selectedItems.length === 0 || isSubmitting}
                        isLoading={isSubmitting}
                    >
                        Finalizar Venda
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default SaleCreationModal;