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
    VStack,
    useToast
} from '@chakra-ui/react';
import api from '../api/api';

interface Supplier {
    _id: string;
    name: string;
    email: string;
    phone: string;
}

interface SupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: Supplier;
}

const SupplierModal: React.FC<SupplierModalProps> = ({ isOpen, onClose, initialData, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                email: initialData.email || '',
                phone: initialData.phone || ''
            });
        } else {
            setFormData({ name: '', email: '', phone: '' });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (initialData?._id) {
                await api.put(`/suppliers/${initialData._id}`, formData);
                toast({
                    title: 'Fornecedor atualizado!',
                    status: 'success'
                });
            } else {
                // Criar novo
                await api.post('/suppliers', formData);
                toast({ title: 'Fornecedor cadastrado!', status: 'success' });
            }
            onSuccess();    // Recarrega a lista
            onClose();      // Fecha o modal
        } catch {
            toast({
                title: 'Erro ao salvar fornecedor.',
                status: 'error'               
            });

        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <form onSubmit={handleSubmit}>
                    <ModalHeader>
                        {initialData ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                    </ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Nome da Empresa / Fornecedor</FormLabel>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder='Ex: Tech Distribuidora'
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Email de Contato</FormLabel>
                                <Input
                                    type='email'
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder='contato@empresa.com'
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Telefone</FormLabel>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder='+55 (xx) 9XXXX-XXXX'
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant='ghost' mr={3} onClick={onClose}>Cancelar</Button>
                        <Button colorScheme='blue' type='submit' isLoading={isSubmitting}>
                            Salvar
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};

export default SupplierModal;