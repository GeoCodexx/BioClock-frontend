import api from './api';

const handleApiError = (error, defaultMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    defaultMessage;
  throw new Error(message);
};

export const createRole = async (roleData) => {
  try {
    const { data } = await api.post("/roles", roleData);
    return data;
  } catch (error) {
    handleApiError(error, "Error al crear el rol");
  }
};

export const updateRole = async (id, roleData) => {
  try {
    const { data } = await api.put(`/roles/${id}`, roleData);
    return data;
  } catch (error) {
    handleApiError(error, "Error al actualizar el rol");
  }
};

export const getRoles = async () => {
  try {
    const { data } = await api.get("/roles");
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener los roles");
  }
};

export const deleteRole = async (id) => {
  try {
    const { data } = await api.delete(`/roles/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, "Error al eliminar el rol");
  }
};

export const getRoleById = async (id) => {
  try {
    const { data } = await api.get(`/roles/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener el rol");
  }
};

export const getPaginatedRoles = async ({
  search = "",
  page = 1,
  limit = 10,
} = {}) => {
  try {
    const { data } = await api.get("/roles/paginated", {
      params: { search, page, limit },
    });
    const formattedData = data.roles.map((s, i) => ({
      ...s,
      index: (page - 1) * limit + i + 1,
    }));
    data.roles = formattedData;
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener los departamentos paginados");
  }
};
