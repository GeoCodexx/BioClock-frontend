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
    handleApiError(error, "Error al crear el departamento");
  }
};

export const updateDepartment = async (id, departmentData) => {
  try {
    const { data } = await api.put(`/departments/${id}`, departmentData);
    return data;
  } catch (error) {
    handleApiError(error, "Error al actualizar el departamento");
  }
};

export const updateDepartmentStatus = async (id, status) => {
  try {
    const { data } = await api.patch(`/departments/${id}/status`, status);
    return data;
  } catch (error) {
    handleApiError(error, "Error al actualizar estado de departamento");
  }
};

export const getDepartments = async () => {
  try {
    const { data } = await api.get("/departments");
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener los departamentos");
  }
};

export const deleteDepartment = async (id) => {
  try {
    const { data } = await api.delete(`/departments/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, "Error al eliminar el departamento");
  }
};

export const getDepartmentById = async (id) => {
  try {
    const { data } = await api.get(`/departments/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener el departamento");
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
    const formattedData = data.departments.map((s, i) => ({
      ...s,
      index: (page - 1) * limit + i + 1,
    }));
    data.departments = formattedData;
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener los departamentos paginados");
  }
};
