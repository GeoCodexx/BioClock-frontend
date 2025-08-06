import api from './api';

export const getPaginatedDepartments = async ({ search = '', page = 1, limit = 10 } = {}) => {
  const res = await api.get('/departments/paginated', { params: { search, page, limit } });
  return res.data;
};

export const createDepartment = async (departmentData) => {
  const res = await api.post('/departments', departmentData);
  return res.data;
};

export const updateDepartment = async (id, departmentData) => {
  const res = await api.put(`/departments/${id}`, departmentData);
  return res.data;
};

export const deleteDepartment = async (id) => {
  const res = await api.delete(`/departments/${id}`);
  return res.data;
};

export const getDepartmentById = async (id) => {
  const res = await api.get(`/departments/${id}`);
  return res.data;
};

export const getDepartments = async () => {
  const res = await api.get('/departments');
  return res.data;
};