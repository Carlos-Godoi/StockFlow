import { useState, useEffect } from 'react';
import api from '../api/api';
import { useToast } from '@chakra-ui/react';

// Tipagem simplificada do fornecedor para uso no select
export interface SupplierOption {
    _id: string;
    name: string;
}

/**
 * Hook customizado para buscar e gerenciar a lista de fornecedores.
 */
export const useSuppliers = () => {
    const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(true);
    const toast = useToast();

    useEffect(() => {
        const fetchSuppliers = async () => {
             try {
                // Rota fornecedores também está protegida
                const response = await api.get('/suppliers');
                setSuppliers(response.data);
             } catch (error) {
                console.error('Erro ao buscar fornecedores:', error);
                toast({
                    title: 'Erro',
                    description: 'Não foi possível carregar a lista de fornecedores.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
             } finally {
                setLoadingSuppliers(false);
             }
        };

        fetchSuppliers();
    }, [toast]);

    return { suppliers, loadingSuppliers };
};
