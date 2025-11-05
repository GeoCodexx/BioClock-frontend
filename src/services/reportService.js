import api from "./api";

const handleApiError = (error, defaultMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    defaultMessage;
  throw new Error(message);
};

export const getDailyReport = async (params) => {
  try {
    const { data } = await api.get("/reports/daily", { params });
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener reporte de asistencias paginadas");
  }
};

export const getUserHistoryReport = async (params) => {
  const res = await api.get(`/reports/user-report`, { params });
  return res.data;
};

/*export const getUserHistoryReport = async (userId, startDate, endDate) => {
  const res = await api.get(`/reports/daily/${userId}`, {
    params: { startDate, endDate },
  });
  return res.data;
};*/

export const getMonthlyReport = async (month, year) => {
  const res = await api.get("reports/monthly", { params: { month, year } });
  return res.data;
};
