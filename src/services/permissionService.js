import api from "./api";

// Función auxiliar para manejar errores consistentemente
const handleApiError = (error, defaultMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    defaultMessage;
  throw new Error(message);
};

export const createPermission = async (permissionData) => {
  try {
    const { data } = await api.post("/permissions", permissionData);
    return data;
  } catch (error) {
    handleApiError(error, "Error al crear el permiso");
  }
};

export const updatePermission = async (id, permissionData) => {
  try {
    const { data } = await api.put(`/permissions/${id}`, permissionData);
    return data;
  } catch (error) {
    handleApiError(error, "Error al actualizar el permiso");
  }
};

export const getPermissions = async () => {
  try {
    const { data } = await api.get("/permissions");
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener los permisos");
  }
};

export const deletePermission = async (id) => {
  try {
    const { data } = await api.delete(`/permissions/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, "Error al eliminar el permiso");
  }
};

export const getPermissionById = async (id) => {
  try {
    const { data } = await api.get(`/permissions/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener el permiso");
  }
};

export const getPaginatedPermissions = async ({
  search = "",
  page = 1,
  limit = 10,
} = {}) => {
  try {
    const { data } = await api.get("/permissions/paginated", {
      params: { search, page, limit },
    });
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener los permisos paginados");
  }
};
