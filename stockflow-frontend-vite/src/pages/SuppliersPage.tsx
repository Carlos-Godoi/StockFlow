import React from 'react';
import { Box, Heading, Text, Tag } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

const SuppliersPage: React.FC = () => {
    const { user } = useAuth();
    return (
        <Box p={8}>
            <Heading mb={4}>Gestão de Fornecedores</Heading>
            <Text mb={4}>
                Esta página será o CRUD completo de Fornecedores (apenas Admin pode criar/editar).
            </Text>
            <Tag colorScheme='yellow'>Em desenvolvimento</Tag>
            <Text mt={4}>Seu papel atual: **{user?.role.toUpperCase()}**</Text>
        </Box>
    );
};

export default SuppliersPage;