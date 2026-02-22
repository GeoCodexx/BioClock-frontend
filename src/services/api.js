import axios from "axios";

// Configuración base de axios
const API_BASE_URL =
  import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  /*headers: {
    "Content-Type": "application/json",
  },*/
});

// Interceptor para agregar el token a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar la expiración (Respuesta)
api.interceptors.response.use(
  (response) => response, // Si la respuesta es OK, no hacemos nada
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 403 y no hemos reintentado ya esta petición
    if (error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const currentRefreshToken = localStorage.getItem("refreshToken");
        // Llamada a tu endpoint de refresh
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken: currentRefreshToken }
        );

        const { token, refreshToken } = response.data;

        // 1. Guardar el nuevo token
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);

        // 2. Actualizar el header de la petición que falló
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // 3. Ejecutar de nuevo la petición original con el nuevo token
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresh token también falló o expiró...
        console.error("Sesión expirada. Redirigiendo al login...");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
