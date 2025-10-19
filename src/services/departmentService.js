import api from "./api";

// Función auxiliar para manejar errores consistentemente
const handleApiError = (error, defaultMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    defaultMessage;
  throw new Error(message);
};

export const createDepartment = async (departmentData) => {
  try {
    const { data } = await api.post("/departments", departmentData);
    return data;
  } catch (error) {
    handleApiError(error, "Error al crear el deparamento");
  }
};

export const updateDepartment = async (id, departmentData) => {
  try {
    const { data } = await api.put(`/departments/${id}`, departmentData);
    return data;
  } catch (error) {
    handleApiError(error, "Error al actualizar el deparamento");
  }
};

export const getDepartments = async () => {
  try {
    const { data } = await api.get("/departments");
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener los deparamentos");
  }
};

export const deleteDepartment = async (id) => {
  try {
    const { data } = await api.delete(`/departments/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, "Error al eliminar el deparamento");
  }
};

export const getDepartmentById = async (id) => {
  try {
    const { data } = await api.get(`/departments/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener el deparamento");
  }
};

export const getPaginatedDepartments = async ({
  search = "",
  page = 1,
  limit = 10,
} = {}) => {
  try {
    const { data } = await api.get("/departments/paginated", {
      params: { search, page, limit },
    });
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener los departamentos paginados");
  }
};
