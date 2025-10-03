import { create } from "zustand";
import {
  login as loginApi,
  logout as logoutApi,
} from "../services/authService";

/*const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem("token"),
  login: async (email, password) => {
    const data = await loginApi(email, password);
    console.log("Respuesta loginApi:", data);
    set({ user: data.user, isAuthenticated: true });
  },
  logout: () => {
    logoutApi();
    set({ user: null, isAuthenticated: false });
  },
}));*/
const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  isAuthenticated: !!localStorage.getItem("token"),
  login: async (email, password) => {
    const data = await loginApi(email, password);
    localStorage.setItem("user", JSON.stringify(data.user));
    set({ user: data.user, isAuthenticated: true });
  },
  logout: () => {
    logoutApi();
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
