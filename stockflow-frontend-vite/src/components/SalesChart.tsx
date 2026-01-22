import React, { useEffect, useState } from 'react';
import { Box, Heading, Spinner, Center } from '@chakra-ui/react';
import { Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart } from 'recharts';
import api from '../api/api';

const SalesChart: React.FC = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/stats/chart')
            .then(res => setData(res.data))
            .catch(err => console.error('Erro ao buscar stats', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading || !data) return <Center h='300px'><Spinner /></Center>

    return (
        <Box bg='white' p={6} borderRadius='lg' shadow='md' borderWidth='1px' h='400px'>
            <Heading size='md' mb={6}>Desempenho de Vendas (Últimos dias)</Heading>

            <ResponsiveContainer width='100%' height='85%'>
                {/* OBRIGATÓRIO: O AreaChart deve envolver todos os elementos do gráfico */}
                <AreaChart data={data}> 
                    <defs>
                        <linearGradient id='colorValor' x1='0' y1='0' x2='0' y2='1'>
                            <stop offset='5%' stopColor='#3182ce' stopOpacity={0.8} />
                            <stop offset='95%' stopColor='#3182ce' stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' vertical={false} />
                    <XAxis
                        dataKey='date'
                        tickFormatter={(value) => new Date(value).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                    />
                    <YAxis />
                    <Tooltip
                        formatter={(value: number | string | Array<string | number> | undefined) => {
                            const numericValue = Number(Array.isArray(value) ? value[0] : value);
                            const formattedValue = isNaN(numericValue) ? '0.00' : numericValue.toFixed(2);
                            return [`R$ ${formattedValue}`, 'Vendas'];
                        }}
                        labelFormatter={(label) => `Data: ${new Date(label).toLocaleDateString()}`}
                    />
                    <Area
                        type='monotone'
                        dataKey='valor'
                        stroke='#3182ce'
                        fillOpacity={1}
                        fill='url(#colorValor)'
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default SalesChart;