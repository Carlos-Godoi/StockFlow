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
import { AxiosError } from 'axios';

interface SupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: any | null;
    onSuccess: () => void; // Função carregar lista
}

const SupplierModal: React.FC<SupplierModalProps> = ({ isOpen, onClose, initialData, onSuccess }) => {
    const [formData, setFormData] = useState(initialData || {});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    useEffect(() => {
        setFormData(initialData || {
            name: '',
            contact: '',
            address: '',
        });
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // // Converter valores numéricos
        // setFormData({
        //     ...formData,
        // })
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const isEditing = !!initialData?._id;
            const endpoint = isEditing ? `/suppliers/${initialData._id}` : '/suppliers';

            // if (isEditing) {
            //     await api.put(endpoint, dataToSend);
            // } else {
            //     await api.post(endpoint, dataToSend);
            // }

            toast({
                title: `Fornecedor ${isEditing ? 'atualizado' : 'criado'} com sucesso!`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            onSuccess();    // Recarrega a lista
            onClose();      // Fecha o modal
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                console.error('Erro ao tentar salvar fornecedor:', error);
                toast({
                    title: 'Erro ao salvar fornecedor.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    }






}