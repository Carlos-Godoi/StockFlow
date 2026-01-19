import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';
import {
    Box,
    VStack,
    Text,
    Divider,
    Flex,
    Button,
    useColorModeValue,
    Icon
} from '@chakra-ui/react';
import {
    FiHome,
    FiPackage,
    FiBarChart2,
    FiTruck,
    FiUsers,
    FiLogOut,
    FiShoppingCart,
    FiFileText
} from 'react-icons/fi';
import { IconType } from 'react-icons';


interface LinkItemProps {
    name: string;
    icon: IconType;
    to: string;
    roles: UserRole[];
}

interface NavItemProps {
    icon: IconType;
    to: string;
    children: React.ReactNode;
}



const NavItem: React.FC<NavItemProps> = ({ icon, children, to }) => {
    const activeBg = useColorModeValue('blue.500', 'blue.200');
    // const activeColor = useColorModeValue('white', 'gray.800');
    // const defaultColor = useColorModeValue('gray.600', 'gray.200');

    return (
        <NavLink to={to} style={{ width: '100%' }}>
            {({ isActive }) => (
                <Flex
                    align='center'
                    p='3'
                    mx='4'
                    borderRadius='lg'
                    role='group'
                    cursor='pointer'
                    bg={isActive ? activeBg : 'transparent'}
                    color={isActive ? 'white' : 'inherit'}
                    _hover={{ bg: 'blue.500', color: 'white' }}
                >
                    <Icon
                        mr='4'
                        fontSize='16'
                        _groupHover={{ color: 'white' }}
                        as={icon}
                    />
                    {children}
                </Flex>
            )}
        </NavLink>
    );
};

const SidebarContent: React.FC = () => {
    const { user, logout, hasRole } = useAuth();
    const bgColor = useColorModeValue('white', 'gray.900');


    const LinkItems: LinkItemProps[] = [
        { name: 'Dashboard', icon: FiHome, to: '/dashboard', roles: ['admin', 'seller', 'stocker', 'customer'] },
        { name: 'Produtos', icon: FiPackage, to: '/products', roles: ['admin', 'seller', 'stocker'] },
        { name: 'Vendas', icon: FiShoppingCart, to: '/sales', roles: ['admin', 'seller'] },
        { name: 'Relatórios', icon: FiBarChart2, to: '/reports', roles: ['admin'] },
        { name: 'Fornecedores', icon: FiTruck, to: '/suppliers', roles: ['admin'] },
        { name: 'Usuários', icon: FiUsers, to: '/users', roles: ['admin'] },
        { name: 'PDV (Vendas)', icon: FiShoppingCart, to: '/pos', roles: ['admin', 'seller', 'customer'] },      
        { name: 'Minhas Compras', icon: FiFileText, to: '/sales-history', roles: ['admin', 'seller', 'customer'] 
  },
    ];

    return (
        <Box
            bg={bgColor}
            borderRight='1px'
            borderRightColor={useColorModeValue('gray.200', 'gray.700')}
            w={{ base: 'full', md: 60 }}
            pos='fixed'
            h='full'
        >
            <Flex h='20' alignItems='center' mx='8' justifyContent='space-between'>
                <Text fontSize='2xl' fontWeight='bold' color='blue.500'>
                    StockFlow
                </Text>
            </Flex>
            <Divider />
            <VStack spacing='1' align='stretch' mt={4}>
                {LinkItems.map((link) =>
                    // Verifica se o usuário tem permissão para ver este item de menu
                    hasRole(link.roles) && (
                        <NavItem key={link.name} icon={link.icon} to={link.to}>
                            {link.name}
                        </NavItem>
                    )
                )}
            </VStack>

            <Box p={4} mt='auto' position='absolute' bottom='0' w='full'>
                <Divider mb={4} />
                <Text fontSize='sm' mb={2} color='gray.500'>
                    Logado como: **{user?.role.toUpperCase()}**
                </Text>
                <Button
                    leftIcon={<FiLogOut />}
                    colorScheme='red'
                    variant='outline'
                    w='full'
                    onClick={logout}
                >
                    Sair
                </Button>
            </Box>
        </Box>
    );
};

const Sidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Largura para compersar a barra lateral
    const sidebarWidth = 60;

    return (
        <Box minH='100vh' bg={useColorModeValue('gray.100', 'gray.900')}>
            {/* Barra Lateral */}
            <SidebarContent />

            {/* Área de Conteúdo (Deslocada) */}
            <Box ml={{ base: 0, md: sidebarWidth }} p='4'>
                {children}
            </Box>
        </Box>
    );
};

export default Sidebar;


