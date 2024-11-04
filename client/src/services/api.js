import axios from 'axios';

const API_URL = '/api';

export const getCustomers = async () => {
  const response = await axios.get(`${API_URL}/customers`);
  return response.data;
};

export const createCustomer = async (customer) => {
  const response = await axios.post(`${API_URL}/customers`, customer);
  return response.data;
};

export const getCustomer = async (id) => {
  const response = await axios.get(`${API_URL}/customers/${id}`);
  return response.data;
};

export const getNotes = async (customerId) => {
  const response = await axios.get(`${API_URL}/customers/${customerId}/notes`);
  return response.data;
};

export const createNote = async (customerId, note) => {
  const response = await axios.post(`${API_URL}/customers/${customerId}/notes`, note);
  return response.data;
};

export const getOrders = async (customerId) => {
  const response = await axios.get(`${API_URL}/customers/${customerId}/orders`);
  return response.data;
};

export const createOrder = async (customerId, order) => {
  const response = await axios.post(`${API_URL}/customers/${customerId}/orders`, order);
  return response.data;
};