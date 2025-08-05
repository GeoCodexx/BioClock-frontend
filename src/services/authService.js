import api from './api';

export const login = async (email, password) => {
  const res = await api.post('auth/login', { username: email, password });
  localStorage.setItem('token', res.data.token);
  return res.data;
};

export const logout = () => {
  localStorage.removeItem('token');
}; 