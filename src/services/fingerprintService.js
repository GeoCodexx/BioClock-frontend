import api from "./api";

// Función auxiliar para manejar errores consistentemente
const handleApiError = (error, defaultMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    defaultMessage;
  throw new Error(message);
};

export const getFingerprintTemplates = async ({
  search = "",
  page = 1,
  limit = 10,
  status = ""
,} = {}) => {
  try {
    const { data } = await api.get("/biometric-templates", {
      params: { search, page, limit, status },
    });

    const formattedData = data.data.map((s, i) => ({
      ...s,
      index: (page - 1) * limit + i + 1,
    }));
    data.data = formattedData;
    
    return { fingerprints: data.data, total: data.pagination.total };
  } catch (error) {
    handleApiError(error, "Error al obtener las huellas dactilares paginadas");
  }
};

export const updateFingerprintStatus = async (id, status) => {
  const response = await api.put(`/biometric-templates/${id}/status`, {
    status,
  });
  return response.data;
};

export const deleteFingerprintTemplate = async (id) => {
  try {
    const { data } = await api.delete(`/biometric-templates/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, "Error al eliminar la plantilla de huella dactilar");
  }
};
