import api from './api';

export const getRoles = async ({ search = '', page = 1, limit = 10 } = {}) => {
  const res = await api.get('/roles', { params: { search, page, limit } });
  return res.data;
};

export const createRole = async (roleData) => {
  const res = await api.post('/roles', roleData);
  return res.data;
};


export const updateRole = async (id, roleData) => {
  const res = await api.put(`/roles/${id}`, roleData);
  return res.data;
};

export const deleteRole = async (id) => {
  const res = await api.delete(`/roles/${id}`);
  return res.data;
};

export const getRoleById = async (id) => {
  const res = await api.get(`/roles/${id}`);
  return res.data;
};