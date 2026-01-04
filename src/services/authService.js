// authService.js
import api from "./api";

// Nueva función mejorada para manejar errores de API
const handleApiError = (error, defaultMessage) => {
  // Si no hay respuesta del servidor (error de red, timeout, etc.)
  if (!error.response) {
    throw new Error(defaultMessage || "Error de conexión con el servidor");
  }

  const status = error.response.status;
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    defaultMessage;

  // Errores 4xx: errores del cliente (validación, autenticación, etc.)
  // Los retornamos con la información para mostrar como advertencia
  if (status >= 400 && status < 500) {
    const clientError = new Error(message);
    clientError.isClientError = true;
    clientError.status = status;
    clientError.data = error.response.data;
    throw clientError;
  }

  // Errores 5xx: errores del servidor
  // Estos sí son errores críticos
  throw new Error(message || "Error interno del servidor");
};

export const login = async (email, password) => {
  try {
    const res = await api.post("auth/login", { username: email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("refreshToken", res.data.refreshToken);
    return res.data;
  } catch (error) {
    handleApiError(error, "Error al autenticar usuario");
  }
};

export const logout = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    await api.post("auth/logout", { refreshToken });
    localStorage.clear();
  } catch (error) {
    handleApiError(error, "Error al cerrar sesion");
  }
};

export const reAuthenticate = async (password) => {
  try {
    const res = await api.post("/auth/re-authenticate", { password });
    return res.data; // Faltaba el return aquí
  } catch (error) {
    handleApiError(error, "Error al reautenticar usuario");
  }
};

export const changePassword = async (data) => {
  try {
    const res = await api.post("/auth/change-password", data);
    return res.data;
  } catch (error) {
    handleApiError(error, "Error al cambiar contraseña");
  }
};
