import axios from 'axios';

const API_URL = 'http://7websites.com/api'
// const API_URL = axios.create({
//   baseURL: 'http://134.209.246.121:5000/api', // Use your server's IP
// });

export const getCustomers = async () => {
  const response = await axios.get(`${API_URL}/customers`);
  return response.data;
};

export const createCustomer = async (customer) => {
  const response = await axios.post(`${API_URL}/customers`, customer);
  return response.data;
};

export const getCustomer = async (id) => {
  console.log("check id", id)
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