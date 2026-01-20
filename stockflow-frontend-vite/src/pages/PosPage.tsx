import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Flex, Heading, Input, SimpleGrid, Text, Image, Button,
    VStack, HStack, Divider, IconButton, useToast, Badge, Icon,
    InputGroup, InputLeftElement, Center, Spinner
} from '@chakra-ui/react';
import {
    FiSearch, FiPlus, FiMinus, FiTrash2, FiShoppingCart
} from 'react-icons/fi';
import api from '../api/api';
import { AxiosError } from 'axios';
import { generateReceipt, ItemsData } from '../utils/generateReceipt';
import { useAuth } from '../context/AuthContext';

// --- INTERFACES ---

interface IProduct {
    _id: string;
    name: string;
    salePrice: number;
    stockQuantity: number;
    imageUrl?: string;
}

interface ICartItem extends IProduct {
    quantity: number;
}

const PosPage: React.FC = () => {
    // --- ESTADOS ---
    const [products, setProducts] = useState<IProduct[]>([]);
    const [cart, setCart] = useState<ICartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    const API_URL = 'http://localhost:3000';

    // --- BUSCA DE PRODUTOS ---
    const fetchProducts = useCallback(async () => {
        setLoading(true); // Garante que o loading apareça ao atualizar
        try {
            const response = await api.get('/products');
            setProducts(response.data);

        } catch (error: unknown) {
            const message = error instanceof AxiosError
                ? error.response?.data?.message
                : 'Falha de comunicação com a API.';
            toast({
                title: 'Erro ao carregar catálogo.',
                description: message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false); // DESLIGA o loading mesmo se der erro
        }
    }, [toast]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // --- LÓGICA DO CARRINHO ---
    const addToCart = (product: IProduct) => {
        if (product.stockQuantity <= 0) {
            return toast({ title: 'Produto sem estoque', status: 'warning' });
        }

        setCart(prevCart => {
            const existing = prevCart.find(item => item._id === product._id);
            if (existing) {
                if (existing.quantity >= product.stockQuantity) {
                    toast({ title: 'Limite de estoque atingido', status: 'warning' });
                    return prevCart;
                }
                return prevCart.map(item =>
                    item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prevCart => prevCart.map(item => {
            if (item._id === id) {
                const newQty = item.quantity + delta;
                const product = products.find(p => p._id === id);
                if (newQty > 0 && product && newQty <= product.stockQuantity) {
                    return { ...item, quantity: newQty };
                }
            }
            return item;
        }));
    };

    const removeFromCart = (id: string) => {
        setCart(prevCart => prevCart.filter(item => item._id !== id));
    };

    // --- CÁLCULOS E FILTROS ---
    const total = useMemo(() =>
        cart.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0),
        [cart]);

    const filteredProducts = useMemo(() =>
        products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [products, searchTerm]
    );

    const { user } = useAuth();

    // --- FINALIZAR VENDA ---
    const handleFinalizeSale = async () => {
        // 1. Abre a janela imediatamente para evitar bloqueio do Firefox
        const novaJanela = window.open('', '_blank');
    
        try {
            const items = cart.map(item => ({
                productId: item._id,
                quantity: item.quantity
            }));

            // 2. Chamada única à API
            const response = await api.post('/sales', { items });
            const saleData = response.data;

            toast({
                title: 'Venda Finalizada!',
                description: 'O recibo será gerado a seguir.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            const itemsForReceipt: ItemsData[] = cart.map(item => ({
                name: String(item.name),
                priceAtSale: Number(item.quantity),
                quantity: Number(item.quantity),
                subtotal: Number(item.salePrice * item.quantity)
            }));
            
            generateReceipt ({
                saleId: saleData._id || saleData.id,
                date: saleData.saleDate || saleData.createdAt || new Date().toISOString(),
                items: itemsForReceipt,
                total: Number(saleData.totalAmount || total),
                sellerName: user?.name || 'Vendedor'                
            }, novaJanela); 

            // 4. Limpa o carrinho e atualiza estoque
            setCart([]);
            fetchProducts();

        } catch (error: unknown) {
            // Se der erro, fecha a janela branca aberta
            novaJanela?.close();

            if (error instanceof AxiosError) {
                toast({
                    title: 'Erro ao concluir venda',
                    description: error.response?.data?.message || 'Falha na comunicação com servidor.',
                    status: 'error'
                });
            }
        }
    };

    // --- RENDERIZAÇÃO ---
    if (loading) {
        return (
            <Center h='80vh'>
                <VStack spacing={4}>
                    <Spinner size='xl' color="blue.500" />
                    <Text>Carregando catálogo...</Text>
                </VStack>
            </Center>
        );
    }

    return (
        <Flex h='calc(100vh - 100px)' gap={4} p={4}>
            {/* SEÇÃO DE PRODUTOS */}
            <Box flex={1} overflowY='auto' pr={2}>
                <Heading size='md' mb={4}>Catálogo de Produtos</Heading>
                <InputGroup mb={6}>
                    <InputLeftElement pointerEvents='none'>
                        <FiSearch color="gray.300" />
                    </InputLeftElement>
                    <Input
                        placeholder='Pesquisar produto pelo nome...'
                        bg='white'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {filteredProducts.map(product => (
                        <Box
                            key={product._id}
                            bg='white'
                            p={4}
                            borderRadius='lg'
                            boxShadow='sm'
                            borderWidth='1px'
                            _hover={{ boxShadow: 'md', transition: '0.2s' }}
                        >
                            <Center mb={3}>
                                <Image
                                    src={product.imageUrl ? `${API_URL}${product.imageUrl}` : 'https://via.placeholder.com/150'}
                                    fallbackSrc='https://via.placeholder.com/150'
                                    alt={product.name}
                                    boxSize='120px'
                                    objectFit='cover'
                                    borderRadius='md'
                                />
                            </Center>

                            <VStack align='start' spacing={1}>
                                <Text fontWeight='bold' noOfLines={1}>{product.name}</Text>
                                <Text color='blue.600' fontWeight='bold'>R$ {product.salePrice.toFixed(2)}</Text>
                                <Badge colorScheme={product.stockQuantity > 5 ? 'green' : 'red'}>
                                    Estoque: {product.stockQuantity}
                                </Badge>

                                <Button
                                    leftIcon={<FiPlus />}
                                    colorScheme='blue'
                                    size='sm'
                                    w='full'
                                    mt={2}
                                    onClick={() => addToCart(product)}
                                    isDisabled={product.stockQuantity <= 0}
                                >
                                    Adicionar
                                </Button>

                            </VStack>
                        </Box>
                    ))}
                </SimpleGrid>
            </Box>

            {/* SEÇÃO DO CARRINHO (CHECKOUT) */}
            <Box w='350px' bg='white' borderRadius='lg' boxShadow='lg' p={4} display='flex' flexDirection='column'>
                <HStack mb={4}>
                    <Icon as={FiShoppingCart} fontSize='20px' />
                    <Heading size='md'>Carrinho</Heading>
                </HStack>

                <VStack flex={1} overflowY='auto' align='stretch' spacing={3} mb={4}>
                    {cart.length === 0 ? (
                        <Center h='full' flexDirection='column'>
                            <Text color='gray.400'>Carrinho vazio</Text>
                        </Center>
                    ) : (
                        cart.map(item => (
                            <Box key={item._id} p={2} borderWidth='1px' borderRadius='md'>
                                <Flex justify='space-between' align='center'>
                                    <Text fontSize='sm' fontWeight='bold' noOfLines={1} w='60%'>{item.name}</Text>
                                    <IconButton
                                        aria-label='Remove'
                                        icon={<FiTrash2 />}
                                        size='xs'
                                        colorScheme='red'
                                        variant='ghost'
                                        onClick={() => removeFromCart(item._id)}
                                    />
                                </Flex>

                                <Flex justify='space-between' align='center' mt={2}>
                                    <HStack spacing={2}>
                                        <IconButton aria-label='dec' icon={<FiMinus />} size='xs' onClick={() => updateQuantity(item._id, -1)} />
                                        <Text fontWeight='bold'>{item.quantity}</Text>
                                        <IconButton aria-label='inc' icon={<FiPlus />} size='xs' onClick={() => updateQuantity(item._id, 1)} />
                                    </HStack>

                                    <Text fontSize='sm'>R$ {(item.salePrice * item.quantity).toFixed(2)}</Text>
                                </Flex>
                            </Box>
                        ))
                    )}
                </VStack>

                <Divider mb={4} />

                <VStack align='stretch' spacing={4}>
                    <Flex justify='space-between'>
                        <Text fontWeight='bold' fontSize='lg'>Total:</Text>
                        <Text fontWeight='bold' fontSize='lg' color='blue.600'>R$ {total.toFixed(2)}</Text>
                    </Flex>
                    <Button
                        colorScheme='green'
                        size='lg'
                        w='full'
                        h='60px'
                        onClick={handleFinalizeSale}
                        isDisabled={cart.length === 0}
                    >
                        Finalizar Venda (F8)
                    </Button>
                </VStack>
            </Box>
        </Flex>
    );
};

export default PosPage; 