import api from "./api";

export const getPaginatedAttendances = async ({
  search = "",
  page = 1,
  limit = 10,
} = {}) => {
  const res = await api.get("/attendances/paginated", {
    params: { search, page, limit },
  });
  return res.data;
};

export const createAttendance = async (attendanceData) => {
  const res = await api.post("/attendances", attendanceData);
  return res.data;
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
};
