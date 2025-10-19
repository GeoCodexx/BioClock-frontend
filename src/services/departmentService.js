import api from './api';

// Función auxiliar para manejar errores consistentemente
const handleApiError = (error, defaultMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    defaultMessage;
  throw new Error(message);
};

export const createDepartment = async (scheduleData) => {
  try {
    const { data } = await api.post("/departments", scheduleData);
    return data;
  } catch (error) {
    handleApiError(error, "Error al crear el horario");
  }
};

export const updateDepartment = async (id, scheduleData) => {
  try {
    const { data } = await api.put(`/departments/${id}`, scheduleData);
    return data;
  } catch (error) {
    handleApiError(error, "Error al actualizar el horario");
  }
};

export const getDepartments = async () => {
  try {
    const { data } = await api.get("/departments");
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener los horarios");
  }
};

export const deleteDepartment = async (id) => {
  try {
    const { data } = await api.delete(`/departments/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, "Error al eliminar el horario");
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
    handleApiError(error, "Error al obtener los horarios paginados");
  }
};