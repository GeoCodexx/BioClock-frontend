import api from "./api";
/*
export const getFingerprintsPaginated = async (page = 1, pageSize = 10) => {
    const response = await api.get(`/fingerprints?page=${page}&pageSize=${pageSize}`);
    return response.data;
};

export const updateFingerprintStatus = async (fingerprintId, status) => {
    const response = await api.patch(`/fingerprints/${fingerprintId}/status`, { status });
    return response.data;
};

export const filterFingerprintsByStatus = async (status, page = 1, pageSize = 10) => {
    const response = await api.get(`/fingerprints?status=${status}&page=${page}&pageSize=${pageSize}`);
    return response.data;
};*/
//const API_URL = `${import.meta.env.VITE_API_URL}/biometric-templates`;

export const getFingerprintTemplates = async (params) => {
  const response = await api.get("/biometric-templates", { params });
  return response.data;
};

export const updateFingerprintStatus = async (id, status) => {
  const response = await api.put(`/biometric-templates/${id}/status`, { status });
  return response.data;
};
