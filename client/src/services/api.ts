import axios from 'axios';

// Add this at the top of the file, before the API_BASE_URL line
console.log('Building API client with:');
console.log('REACT_APP_API_URL from env:', process.env.REACT_APP_API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
console.log('Final API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Product {
  id: number;
  name: string;
  category: string;
  stock: number;
  price: number;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export const getProducts = async (search = '', category = '') => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category) params.append('category', category);
  
  const response = await api.get(`/products?${params.toString()}`);
  return response.data;
};

export const updateProductStock = async (productId: number, stock: number) => {
  const response = await api.patch(`/products/${productId}/stock`, { stock });
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export default api;