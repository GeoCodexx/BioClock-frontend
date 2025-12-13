import api from "./api";

// Función auxiliar para manejar errores consistentemente
const handleApiError = (error, defaultMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    defaultMessage;
  throw new Error(message);
};

export const createDevice = async (deviceData) => {
  try {
    const { data } = await api.post("/devices", deviceData);
    return data;
  } catch (error) {
    handleApiError(error, "Error al crear el dispositivo");
  }
};

export const updateDevice = async (id, deviceData) => {
  try {
    const { data } = await api.put(`/devices/${id}`, deviceData);
    return data;
  } catch (error) {
    handleApiError(error, "Error al actualizar el dispositivo");
  }
};

export const getDevices = async () => {
  try {
    const { data } = await api.get("/devices");
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener los dispositivos");
  }
};

export const deleteDevice = async (id) => {
  try {
    const { data } = await api.delete(`/devices/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, "Error al eliminar el dispositivo");
  }
};

export const getDeviceById = async (id) => {
  try {
    const { data } = await api.get(`/devices/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener el dispositivo");
  }
};

export const getPaginatedDevices = async ({
  search = "",
  page = 1,
  limit = 10,
} = {}) => {
  try {
    const { data } = await api.get("/devices/paginated", {
      params: { search, page, limit },
    });
    const formattedData = data.devices.map((s, i) => ({
      ...s,
      index: (page - 1) * limit + i + 1,
    }));
    data.devices = formattedData;
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener dispositivos paginados");
  }
};
