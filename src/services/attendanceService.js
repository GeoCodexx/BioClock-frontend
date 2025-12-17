import api from "./api";

/*export const getPaginatedAttendances = async ({
  search = "",
  page = 1,
  limit = 10,
} = {}) => {
  const res = await api.get("/attendances/paginated", {
    params: { search, page, limit },
  });
  return res.data;
};*/

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
    const response = await api.put(`/attendances/${attendanceId}/justify`,data);
    return response;
  } catch (error) {
    handleApiError(error, "Error al justificar asistencia");
  }
};

/*export const getPaginatedAttendances = async (params) => {
  const response = await api.get("/attendances/paginated", { params });
  return response.data;
};

export const createAttendance = async (attendanceData) => {
  try {
    const res = await api.post("/attendances/create", attendanceData);
    //console.log(res);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Error validando horario" };
  }
};

export const updateAttendance = async (id, attendanceData) => {
  const res = await api.put(`/attendances/${id}`, attendanceData);
  return res.data;
};

export const deleteAttendance = async (id) => {
  const res = await api.delete(`/attendances/${id}`);
  return res.data;
};

export const getAttendanceById = async (id) => {
  const res = await api.get(`/attendances/${id}`);
  return res.data;
};

export const getAttendances = async () => {
  const res = await api.get("/attendances");
  return res.data;
};*/
