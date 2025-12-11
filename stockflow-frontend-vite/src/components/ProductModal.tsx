/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    VStack,
    useToast,
    InputGroup,
    InputLeftElement,
    Flex
} from '@chakra-ui/react';
import api from '../api/api';
import { useSuppliers } from '../hooks/useSuppliers';
import { AxiosError } from 'axios';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Se for null, é modo de criação. Se for um produto, modo de edição.
    initialData: any | null;
    onSuccess: () => void; // Função para recarregar a lista
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, initialData, onSuccess }) => {
    const { suppliers, loadingSuppliers } = useSuppliers();
    const [formData, setFormData] = useState(initialData || {});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    // Atualiza o estado do formulário quando os dados iniciais mudam (modo edição)
    useEffect(() => {
        setFormData(initialData || {
            name: '',
            description: '',
            purchasePrice: 0,
            salePrice: 0,
            stockQuanttity: 0,
            minimumStock: 10,
            supplier: '', // O ID do fornecedor
        });
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        //Converte valores numéricos
        setFormData({
            ...formData,
            [name]: ['purchasePrice', 'salePrice', 'stockQuantity', 'minimumStock'].includes(name) ? parseFloat(value) || 0 : value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Garantir que os preços não são string vazias
        const dataToSend = {
            ...formData,
            purchasePrice: parseFloat(formData.purchasePrice),
            salePrice: parseFloat(formData.salePrice),
            stockQuantity: parseInt(formData.stockQuantity),
            minimumStock: parseInt(formData.minimumStock),
        };

        try {
            const isEditing = !!initialData?._id;
            const endpoint = isEditing ? `/products/${initialData._id}` : '/products';

            if (isEditing) {
                await api.put(endpoint, dataToSend);
            } else {
                await api.post(endpoint, dataToSend);
            }

            toast({
                title: `Produto ${isEditing ? 'atualizado' : 'criado'} com sucesso!`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            onSuccess(); // Recarrega a lista
            onClose(); // Fecha o modal
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                console.error('Erro ao tentar salvar produto:', error);
                toast({
                    title: 'Erro ao salvar produto.',
                    description: error.response?.data?.message || 'Verifique se o fornecedor existe.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='xl'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{initialData ? 'Editar Produto' : 'Novo Produto'}</ModalHeader>
                <ModalCloseButton />
                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Nome</FormLabel>
                                <Input name='name' value={formData.name || ''} onChange={handleChange} />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Descrição</FormLabel>
                                <Input name='description' value={formData.description || ''} onChange={handleChange} />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Fornecedor</FormLabel>
                                <Select
                                    name='supplier'
                                    placeholder={loadingSuppliers ? 'Carregando Fornecedores...' : 'Selecione um Fornecedor'}
                                    value={formData.supplier || ''}
                                    onChange={handleChange}
                                    isDisabled={loadingSuppliers}
                                >
                                    {suppliers.map((s) => (
                                        <option key={s._id} value={s._id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <Flex w='full' gap={4}>
                                <FormControl isRequired>
                                    <FormLabel>Preço de Compra</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents='none'>R$</InputLeftElement>
                                        <Input
                                            type='number'
                                            name='purchasePrice'
                                            value={formData.purchasePrice || ''}
                                            onChange={handleChange}
                                            pl='2.5rem'
                                        />
                                    </InputGroup>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Preço de Venda</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents='none'>R$</InputLeftElement>
                                        <Input
                                            type='number'
                                            name='salePrice'
                                            value={formData.salePrice || ''}
                                            onChange={handleChange}
                                            pl='2.5rem'
                                        />
                                    </InputGroup>
                                </FormControl>
                            </Flex>

                            <Flex w='full' gap={4}>
                                <FormControl isRequired>
                                    <FormLabel>Estoque Atual</FormLabel>
                                    <Input
                                        type='number'
                                        name='stockQuantity'
                                        value={formData.stockQuantity || 0}
                                        onChange={handleChange}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Estoque Mínimo</FormLabel>
                                    <Input
                                        type='number'
                                        name='minimumStock'
                                        value={formData.minimumStock || 10}
                                        onChange={handleChange}
                                    />
                                </FormControl>
                            </Flex>

                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant='ghost' mr={3} onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button colorScheme='blue' type='submit' isLoading={isSubmitting}>
                            Salvar
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};

export default ProductModal;