import api from "./api";

const handleApiError = (error, defaultMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    defaultMessage;
  throw new Error(message);
};

export const getPaginatedUsers = async ({
  search = "",
  page = 1,
  limit = 10,
} = {}) => {
  try {
    const { data } = await api.get("/users/paginated", {
      params: { search, page, limit },
    });
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener los usuarios paginados");
  }
};

export const createUser = async (userData) => {
  try {
    const { data } = await api.post("/users", userData);
    return data;
  } catch (error) {
    handleApiError(error, "Error al crear usuario");
  }
};

export const updateUser = async (id, userData) => {
  try {
    const { data } = await api.put(`/users/${id}`, userData);
    return data;
  } catch (error) {
    handleApiError(error, "Error al actualizar usuario");
  }
};

export const deleteUser = async (id) => {
  try {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, "Error al eliminar usuario");
  }
};

export const getUserById = async (id) => {
  try {
    const { data } = await api.get(`/users/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener usuario");
  }
};

export const getUsers = async () => {
  try {
    const { data } = await api.get("/users");
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener usuarios");
  }
};
