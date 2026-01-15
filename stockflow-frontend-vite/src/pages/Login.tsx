// src/pages/Login.tsx

import React, { useState } from 'react';
import { useNavigate, Link as ReactRouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link as ChakraLink, Text, Box, Button, FormLabel, Input, Heading, VStack, FormControl, useToast } from '@chakra-ui/react';



const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simples validação para garantir que não está enviando vazio
    if (!email || !password) {
      return toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha e-mail e senha.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }

    const success = await login({ email, password });

    if (success) {
      toast({
        title: "Login realizado com sucesso!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      navigate('/dashboard'); // Redireciona para o Dashboard
    } else {
      toast({
        title: "Falha na Autenticação",
        description: "Verifique seu e-mail e senha.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="lg" boxShadow="lg">
      <Heading mb={6} textAlign="center" size="lg">Acesso ao StockFlow</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl id="email">
            <FormLabel>E-mail</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormControl>

          <FormControl id="password">
            <FormLabel>Senha</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            width="full"
            isLoading={isLoading}
          >
            Entrar
          </Button>

          <Text mt={4}>
             Ainda não tem conta?{' '}
            <ChakraLink as={ReactRouterLink} to="/register" color='blue.500' fontWeight='bold'> 
              Cadastre-se aqui
            </ChakraLink>
          </Text>
        </VStack>
      </form>
    </Box>
  );
};

export default LoginPage;