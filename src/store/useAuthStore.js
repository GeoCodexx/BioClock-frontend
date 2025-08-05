import { create } from 'zustand';
import { login as loginApi, logout as logoutApi } from '../services/authService';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  login: async (email, password) => {
    const data = await loginApi(email, password);
    set({ user: data.user, isAuthenticated: true });
  },
  logout: () => {
    logoutApi();
    set({ user: null, isAuthenticated: false });
  },
}));

export default useAuthStore; 