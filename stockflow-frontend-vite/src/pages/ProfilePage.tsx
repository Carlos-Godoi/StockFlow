import React, { useState, useEffect } from 'react';
import {
    Box, Button, FormControl, FormLabel, Input, VStack,
    Heading, useToast, Container, SimpleGrid
} from '@chakra-ui/react';
import api from '../api/api';

const ProfilePage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', taxId: '', phone: '', address: ''
    });
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        api.get('/users/me') // Verifique se a barra inicial existe na sua config da API
            .then(res => {
                // Filtramos apenas os campos que o formulário utiliza
                const { name, email, taxId, phone, address } = res.data;
                setFormData({ 
                    name: name || '', 
                    email: email || '', 
                    taxId: taxId || '', 
                    phone: phone || '', 
                    address: address || '' 
                });
                setLoading(false);
            })
            .catch(() => {
                toast({ title: 'Erro ao carregar perfil', status: 'error' });
                setLoading(false);
            });
    }, [toast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put('/users/me', formData);
            toast({
                title: 'Perfil atualizado com sucesso!',
                status: 'success'
            });
        } catch (error) {
            console.error('Erro ao atualizar perfil', error);
            toast({
                title: 'Erro ao atualizar perfil',
                status: 'error'
            });
        }
    };

    if (loading) return null;

    return (
        <Container maxW='container.md' py={10}>
            <Box bg='white' p={8} borderRadius='lg' shadow='md' borderWidth='1px'>
                <Heading size='lg' mb={6}>Meus Dados</Heading>
                <form onSubmit={handleSubmit}>
                    <VStack spacing={4}>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w='full'>
                            <FormControl isRequired>
                                <FormLabel>Nome Completo</FormLabel>
                                <Input name='name' value={formData.name} onChange={handleChange} />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Email</FormLabel>
                                <Input name='email' value={formData.email} onChange={handleChange} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>NIF / CPF</FormLabel>
                                <Input name='taxId' value={formData.taxId} onChange={handleChange} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Telefone</FormLabel>
                                <Input name='phone' value={formData.phone} onChange={handleChange} />
                            </FormControl>
                        </SimpleGrid>
                        <FormControl>
                            <FormLabel>Endeço Completo</FormLabel>
                            <Input name='address' value={formData.address} onChange={handleChange} />
                        </FormControl>
                        <Button type='submit' colorScheme='blue' size='lg' w='full' mt={4}>
                            Salvar Alterações
                        </Button>
                    </VStack>
                </form>
            </Box>
        </Container>
    );
};

export default ProfilePage;