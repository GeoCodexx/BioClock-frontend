import api from "./api";

// Servicio para el Dashboard
export const dashboardService = {
  /**
   * Obtener estadísticas generales
   */
  getGeneralStats: async () => {
    try {
      const response = await api.get("/dashboard/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching general stats:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Obtener asistencias por día de la semana
   */
  getWeeklyAttendances: async () => {
    try {
      const response = await api.get("/dashboard/weekly-attendances");
      return response.data;
    } catch (error) {
      console.error("Error fetching weekly attendances:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Obtener asistencias por estado
   */
  getAttendanceByStatus: async () => {
    try {
      const response = await api.get("/dashboard/attendance-by-status");
      return response.data;
    } catch (error) {
      console.error("Error fetching attendance by status:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Obtener top 3 usuarios
   */
  getTopUsers: async (period) => {
    try {
      const response = await api.get(`/dashboard/top-users?period=${period}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching top users:", error);
      throw error.response?.data || error.message;
    }
  },
};

export default dashboardService;
