import axios from 'axios';

// IP del host cuando se ejecuta desde un emulador de Android
const API_BASE = 'http://10.0.2.2:4000';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getClientes = () => {
  return apiClient.get('/api/clientes');
};

export const generarPlan = (clienteId, clienteData) => {
  return apiClient.post(`/api/planes/${clienteId}`, { cliente: clienteData });
};

export const updateCliente = (id, data) => {
  return apiClient.put(`/api/clientes/${id}`, data);
};

export const deleteCliente = (id) => {
  return apiClient.delete(`/api/clientes/${id}`);
};

export const getProgress = (clienteId) => {
  return apiClient.get(`/api/progreso/${clienteId}`);
};

export const addProgress = (progressData) => {
  return apiClient.post('/api/progreso', progressData);
};

// Aquí se añadirán más funciones de API (getPlanes, postCliente, etc.)
