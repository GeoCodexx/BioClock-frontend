import { create } from "zustand";
import {
  login as loginApi,
  logout as logoutApi,
} from "../services/authService";

const getStoredUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
};

const useAuthStore = create((set) => {
  const storedUser = getStoredUser();

  return {
    user: storedUser,
    permissions: storedUser?.permissions || [],
    isAuthenticated: !!localStorage.getItem("token"),

    login: async (email, password) => {
      const data = await loginApi(email, password);
      localStorage.setItem("user", JSON.stringify(data.user));
      set({
        user: data?.user || null,
        permissions: data?.user?.permissions || [],
        isAuthenticated: true,
      });
    },

    logout: () => {
      logoutApi();
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      set({ user: null, permissions: [], isAuthenticated: false });
    },
  };
});

export default useAuthStore;
