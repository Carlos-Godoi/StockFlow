import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Heading, Table, Thead, Tbody, Tr, Th, Td,
    Badge, Switch, Select, useToast, TableContainer,
    Center
} from '@chakra-ui/react';
import api from '../api/api';
import { Spinner } from 'flowbite-react';

type UserRole = 'admin' | 'seller' | 'stocker' | 'customer';

interface Users {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    taxId: string;
    phone: string;
    address: string
}

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<Users[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    const fetchUsers = useCallback(async () => {
    try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error: unknown) {
            console.error('Erro ao carregar Utilizadores:', error);
            toast({
                title: 'Erro ao carregar Utilizadores',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);


    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleUpdate = async (_id: string, data: Partial<Users>) => {
        try {
            setUsers(prevUsers => 
                prevUsers.map(user =>
                    user._id === _id ? { ...user, ...data } : user
                )
            );
            
            await api.put(`/users/${_id}`, data);
            toast({
                title: 'Utilizador atualizado',
                status: 'success',                
            });
            fetchUsers();
        } catch (error) {
            console.error('Error ao atualizar Utilizador', error);
            toast({
                title: 'Erro ao atualizar',
                status: 'error'
            });
        }
    };

    if (loading && users.length === 0) {
        return <Center h='100vh'><Spinner size='xl' /></Center>
    }

    return (
        <Box p={8}>
            <Heading mb={6}>Gestão de Utilizadores</Heading>
            <TableContainer bg='white' shadow='md' borderRadius='lg' borderWidth='1px'>
                <Table variant='simple'>
                    <Thead bg='gray.50'>
                        <Tr>
                            <Th>Nome</Th>
                            <Th>Email</Th>
                            <Th>Cargo</Th>
                            <Th>Ações</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {users.map(user => (
                            <Tr key={user._id}>
                                <Td fontWeight='bold'>{user.name}</Td>
                                <Td>{user.email}</Td>
                                <Td>
                                    <Select
                                        size='sm'
                                        value={user.role}
                                        onChange={(e) => handleUpdate(user._id, { role: e.target.value as UserRole })}
                                        w='130px'
                                    >
                                        <option value='customer'>Cliente</option>
                                        <option value='seller'>Vendedor</option>
                                        <option value='stocker'>Estoquista</option>
                                        <option value='admin'>Administrador</option>
                                    </Select>
                                </Td>
                                <Td>
                                    <Badge colorScheme={user.isActive ? 'green' : 'red'}>
                                        {user.isActive ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                </Td>
                                <Td>
                                    <Switch
                                    colorScheme='green'
                                        isChecked={user.isActive}
                                        onChange={(e) => handleUpdate(user._id, { isActive: e.target.checked })}
                                        size='lg'
                                        cursor='pointer'
                                        zIndex={10}
                                    />
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default UsersPage;