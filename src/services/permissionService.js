import api from './api';


export const getPaginatedPermissions = async ({ search = '', page = 1, limit = 10 } = {}) => {
  const response = await api.get('/permissions/paginated', { params: { search, page, limit } });
  return response.data;
};

export const getPermissionById = async (id) => {
  const response = await api.get(`/permissions/${id}`);
  return response.data;
};

export const createPermission = async (data) => {
  const response = await api.post('/permissions', data);
  return response.data;
};

export const updatePermission = async (id, data) => {
  const response = await api.put(`/permissions/${id}`, data);
  return response.data;
};

export const deletePermission = async (id) => {
  const response = await api.delete(`/permissions/${id}`);
  return response.data;
};

export const getPermissions = async () => {
  const res = await api.get('/permissions');
  return res.data;
};
