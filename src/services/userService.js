import api from './api';

export const getPaginatedUsers = async ({ search = '', page = 1, limit = 10 } = {}) => {
  const res = await api.get('/users/paginated', { params: { search, page, limit } });
  return res.data;
};

export const createUser = async (userData) => {
  const res = await api.post('/users', userData);
  return res.data;
};

export const updateUser = async (id, userData) => {
  const res = await api.put(`/users/${id}`, userData);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};

export const getUserById = async (id) => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

export const getUsers = async () => {
  const res = await api.get('/users');
  return res.data;
};