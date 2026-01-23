import React, { useState, useEffect } from 'react';
import { Box, Alert, AlertIcon, AlertTitle, AlertDescription, VStack, Text, Badge, Flex, Link } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import api from '../api/api';

interface LowStockProduct {
    _id: string;
    name: string;
    stockQuantity: number;
    minimumStock: number;
}

const LowStockAlert: React.FC = () => {
    // const [alerts, setAlerts] = useState<LowStockProduct[]>([]);
    const [alerts, setAlerts] = useState<LowStockProduct[]>([])
    
    useEffect(() => {
        api.get('/stats/low-stock')
        .then(res => {
            console.log('Dados que chegaram:', res.data);
            setAlerts(res.data);
        })
        .catch(err => console.error('Erro na Api de stock:', err));
    }, []);

    if (alerts.length === 0) return null;

    return (
        <VStack align='stretch' spacing={3} mb={6}>
            <Alert status='warning' variant='left-accent' borderRadius='md' boxShadow='sm'>
                <AlertIcon />
                <Box>
                    <AlertTitle>Atenção: Stock Crítico!</AlertTitle>
                    <AlertDescription>
                        Existem {alerts.length} produtos que atingiram o limite mínimo definido.
                    </AlertDescription>
                </Box>
            </Alert>

            <Box bg='orange.50' p={4} borderRadius='md' border='1px' borderColor='orange.200'>
                <VStack align='stretch' spacing={2}>
                    {alerts.map(product => (
                        <Flex key={product._id} justify='space-between' align='center' p={2} bg='white' borderRadius='sm' shadow='xs'>
                            <Text fontWeight='bold' fontSize='sm'>{product.name}</Text>
                            <Flex gap={2} align='center'>
                                <Badge colorScheme='red'>Atual: {product.stockQuantity}</Badge>
                                <Text fontSize='xs' color='gray.500'>Mín: {product.minimumStock}</Text>
                                <Link as={RouterLink} to='/products' color='blue.500' fontSize='xs' fontWeight='bold'>
                                    Repor
                                </Link>
                            </Flex>
                        </Flex>
                    ))}
                </VStack>
            </Box>
        </VStack>
    );
};

export default LowStockAlert;