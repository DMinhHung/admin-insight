import axios from './axiosInstance';

export const getProducts = async () => {
  const response = await axios.get('/products');
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await axios.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await axios.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axios.delete(`/products/${id}`);
  return response.data;
};
