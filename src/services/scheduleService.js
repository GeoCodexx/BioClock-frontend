import api from "./api";

// Función auxiliar para manejar errores consistentemente
const handleApiError = (error, defaultMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    defaultMessage;
  throw new Error(message);
};

export const createSchedule = async (scheduleData) => {
  try {
    const { data } = await api.post("/schedules", scheduleData);
    return data;
  } catch (error) {
    handleApiError(error, "Error al crear el horario");
  }
};

export const updateSchedule = async (id, scheduleData) => {
  try {
    const { data } = await api.put(`/schedules/${id}`, scheduleData);
    return data;
  } catch (error) {
    handleApiError(error, "Error al actualizar el horario");
  }
};

export const getSchedules = async () => {
  try {
    const { data } = await api.get("/schedules");
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener los horarios");
  }
};

export const deleteSchedule = async (id) => {
  try {
    const { data } = await api.delete(`/schedules/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, "Error al eliminar el horario");
  }
};

export const getScheduleById = async (id) => {
  try {
    const { data } = await api.get(`/schedules/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener el horario");
  }
};

export const getPaginatedSchedules = async ({
  search = "",
  page = 1,
  limit = 10,
} = {}) => {
  try {
    const { data } = await api.get("/schedules/paginated", {
      params: { search, page, limit },
    });
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener los horarios paginados");
  }
};

/*export const createSchedule = async (scheduleData) => {
  const res = await api.post("/schedules", scheduleData);
  return res.data;
};

export const updateSchedule = async (id, scheduleData) => {
  const res = await api.put(`/schedules/${id}`, scheduleData);
  return res.data;
};

export const deleteSchedule = async (id) => {
  const res = await api.delete(`/schedules/${id}`);
  return res.data;
};

export const getScheduleById = async (id) => {
  const res = await api.get(`/schedules/${id}`);
  return res.data;
};

export const getSchedules = async () => {
  const res = await api.get("/schedules");
  return res.data;
};*/
