import api from "./api";

const handleApiError = (error, defaultMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    defaultMessage;
  throw new Error(message);
};

export const getPaginatedAttendances = async ({
  search = "",
  page = 1,
  limit = 10,
  startDate = null,
  endDate = null,
  type = null,
  status = null,
} = {}) => {
  try {
    const { data } = await api.get("/attendances/paginated", {
      params: { search, page, limit, startDate, endDate, type, status },
    });
    return { attendances: data.data, total: data.total };
  } catch (error) {
    handleApiError(error, "Error al obtener las asistencias paginadas");
  }
};

export const createAttendance = async (attendanceData) => {
  try {
    const { data } = await api.post("/attendances", attendanceData);
    return data;
  } catch (error) {
    handleApiError(error, "Error al crear asistencia");
  }
};

export const updateAttendance = async (id, attendanceData) => {
  try {
    const { data } = await api.put(`/attendances/${id}`, attendanceData);
    return data;
  } catch (error) {
    handleApiError(error, "Error al actualizar asistencia");
  }
};

export const deleteAttendance = async (id) => {
  try {
    const { data } = await api.delete(`/attendances/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, "Error al eliminar asistencia");
  }
};

export const getAttendanceById = async (id) => {
  try {
    const { data } = await api.get(`/attendances/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener asistencia");
  }
};

export const getAttendances = async () => {
  try {
    const { data } = await api.get("/attendances");
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener asistencias");
  }
};

export const justifyAttendance = async (attendanceId, data) => {
  try {
    const response = await api.put(
      `/attendances/${attendanceId}/justify`,
      data,
    );
    return response;
  } catch (error) {
    handleApiError(error, "Error al justificar asistencia");
  }
};

export const removeJustification = async (attendanceId) => {
  try {
    const response = await api.delete(
      `/attendances/${attendanceId}/justification`,
    );
    return response;
  } catch (error) {
    handleApiError(error, "Error al anular justificación");
  }
};

/**SERVICIOS PARA JUSTIFICACION EN MODULO GESTION DE ASISTENCIAS */
export const createJustification = async (userId, scheduleId, date, reason) => {
  try {
    const response = await api.post("/attendances/justification", {
      userId,
      scheduleId,
      date,
      reason,
    });
    return response;
  } catch (error) {
    handleApiError(error, "Error al crear justificación para asistencia");
  }
};
