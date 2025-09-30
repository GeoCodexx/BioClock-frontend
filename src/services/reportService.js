import api from "./api";

export const getDailyReport = async (params) => {
  const res = await api.get("/reports/daily", { params });
  return res.data;
};

export const getUserHistoryReport = async (userId, startDate, endDate) => {
  const res = await api.get(`/reports/daily/${userId}`, {
    params: { startDate, endDate },
  });
  return res.data;
};

export const getMonthlyReport = async (month, year) => {
  const res = await api.get("reports/monthly", { params: { month, year } });
  return res.data;
};
