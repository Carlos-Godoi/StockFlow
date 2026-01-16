import React, { useState } from 'react';
import { 
    Box, Button, FormControl, FormLabel, FormHelperText, 
    Input, VStack, Heading, Text, useToast, Link, Textarea 
} from '@chakra-ui/react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../api/api';
import { AxiosError } from 'axios';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', taxId: '', phone: '', address: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const toast = useToast();
    const navigate = useNavigate();

    // Função genérica para lidar com mudanças em qualquer input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/auth/register', formData);
            toast({
                title: 'Conta criada!',
                description: 'Agora pode fazer login.',
                status: 'success',
                duration: 4000,
                isClosable: true
            });
            navigate('/login');
        } catch (error: unknown) {
            let message = 'Ocorreu um erro inesperado.';
            if (error instanceof AxiosError) {
                message = error.response?.data?.message || 'Erro ao conectar com o servidor.';
            }
            toast({
                title: 'Erro no registro',
                description: message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const addressLength = formData.address.length;
    const addressLimitWarning = addressLength > 300;

    return (
        <Box maxW='md' mx='auto' mt={10} p={8} borderWidth={1} borderRadius='lg' boxShadow='lg' bg='white'>
            <Heading size='lg' mb={6} textAlign='center'>Criar Conta Cliente</Heading>
            <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                    <FormControl isRequired>
                        <FormLabel>Nome Completo</FormLabel>
                        <Input 
                            name="name"
                            value={formData.name}
                            onChange={handleChange} 
                            placeholder="Seu nome completo"
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>E-mail</FormLabel>
                        <Input 
                            name="email"
                            type='email' 
                            value={formData.email}
                            onChange={handleChange} 
                            placeholder="seu@email.com"
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Senha</FormLabel>
                        <Input 
                            name="password"
                            type='password' // CORREÇÃO: Esconde os caracteres
                            value={formData.password}
                            onChange={handleChange} 
                            placeholder="Mínimo 6 caracteres"
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>NIF / CPF</FormLabel>
                        <Input 
                            name="taxId"
                            value={formData.taxId}
                            onChange={handleChange} 
                            placeholder="Documento de identificação"
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Telefone</FormLabel>
                        <Input 
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange} 
                            placeholder="(xx) xxxxx-xxxx"
                        />
                    </FormControl>

                    <FormControl isInvalid={addressLimitWarning}>
                        <FormLabel>Endereço</FormLabel>
                        <Textarea 
                            name="address"
                            value={formData.address}
                            onChange={handleChange} 
                            placeholder='Digite seu endereço...' 
                        />
                        <FormHelperText display='flex' justifyContent='space-between' mt={2}>
                            <Text fontSize='sm' color={addressLimitWarning ? 'red.500' : 'gray.600'}>
                                {addressLength} caracteres
                            </Text>
                            {addressLimitWarning && (
                                <Text fontSize='sm' color='red.500'>Atenção: limite recomendado excedido</Text>
                            )}
                        </FormHelperText>
                    </FormControl>

                    <Button 
                        type='submit' 
                        colorScheme='blue' 
                        w='full' 
                        size='lg' 
                        isLoading={isLoading} // CORREÇÃO: Mostra o spinner ao enviar
                    >
                        Registrar
                    </Button>
                    
                    <Text>
                        Já tem conta? <Link as={RouterLink} to='/login' color='blue.500'>Faça Login</Link>
                    </Text>
                </VStack>
            </form>
        </Box>
    );
};

export default RegisterPage;