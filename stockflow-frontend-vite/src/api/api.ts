import axios from 'axios';

// URL base da API Node.js/Express
const API_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


/**
 * Interceptor para adicionar o token de autenticação JWT a todas as requisições
 */
api.interceptors.request.use((config) => {
    // Puxa o token do localStorage
    const token = localStorage.getItem('token');

    if (token) {
        // Anexa o token no cabeçalho Authorization no formato Bearer
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});


/**
 * Função auxiliar para fazer upload de imagem.
 * Retorna a string com a URL da imagem salva no backend.
 */
export const uploadImageService = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/products/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',  //Sobrescreve o header padrão de JSON
        }
    });

    return response.data.imageUrl;
};

export default api;