import api from './api';

export const getDepartments = async () => {
  const res = await api.get('/departments');
  return res.data;
}; 