import api from "./api";

// Función auxiliar para manejar errores consistentemente
const handleApiError = (error, defaultMessage) => {
  console.log(error);
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    defaultMessage;
  throw new Error(message);
};

/**
 * Convierte un objeto plano en FormData adjuntando los archivos.
 * Solo incluye campos con valor definido (evita "undefined" como string).
 */
const toFormData = (fields = {}, files = []) => {
  const fd = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      fd.append(key, value);
    }
  });

  files.forEach((file) => {
    fd.append("files", file); // el backend espera el campo "files"
  });

  return fd;
};

/**
 * Devuelve los headers correctos según si se envían archivos o no.
 * Axios elimina Content-Type cuando se usa FormData para que el
 * navegador ponga el boundary correcto automáticamente.
 */
const resolveConfig = (files = []) =>
  files.length > 0
    ? {} // axios detecta FormData y pone multipart automáticamente
    : { headers: { "Content-Type": "application/json" } };

/**
 * Descarga un Blob como archivo en el navegador.
 *
 * @param {Blob}   blob      - datos del archivo
 * @param {string} filename  - nombre sugerido para la descarga
 */
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

/**
 * Genera un nombre de archivo con fecha para los exports.
 * Ejemplo: justificaciones_2024-05-01.xlsx
 */
const buildExportFilename = (ext) => {
  const date = new Date().toISOString().split("T")[0];
  return `justificaciones_${date}.${ext}`;
};

/**
 * Crear justificación.
 * @param {object} data  - { userId, scheduleId, date, reason }
 * @param {File[]} files - archivos adjuntos (opcional)
 */
export const createJustification = async (payload, files = []) => {
  const isMultipart = files.length > 0;
  const body = isMultipart ? toFormData(payload, files) : payload;

  try {
    const config = isMultipart
      ? {}
      : { headers: { "Content-Type": "application/json" } };

    const { data } = await api.post("/justifications", body, config);
    return data;
  } catch (error) {
    handleApiError(error, "Error al crear justificación");
  }
};

/**
 * Editar justificación (solo reason y/o date cuando está en pending).
 * @param {string} id
 * @param {object} data  - { reason?, date? }
 * @param {File[]} files - nuevos archivos a adjuntar (opcional)
 */
export const updateJustification = async (id, data, files = []) => {
  const body = files.length > 0 ? toFormData(data, files) : data;
  try {
    const { data } = await api.put(
      `/justifications/${id}`,
      body,
      resolveConfig(files),
    );
    return data;
  } catch (error) {
    handleApiError(error, "Error al actualizar justificación");
  }
};

export const updateJustificationStatus = async (id, status) => {
  try {
    const { data } = await api.patch(`/justifications/${id}/status`, status);
    return data;
  } catch (error) {
    handleApiError(error, "Error al actualizar estado de justificación");
  }
};

export const getJustifications = async () => {
  try {
    const { data } = await api.get("/justifications");
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener justificaciones");
  }
};

/**
 * Eliminar justificación (solo si está en pending).
 */
export const deleteJustification = async (id) => {
  try {
    const { data } = await api.delete(`/justifications/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, "Error al eliminar justificación");
  }
};

/**
 * Obtener una justificación por ID.
 */
export const getJustificationById = async (id) => {
  try {
    const { data } = await api.get(`/justifications/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener justificación");
  }
};

export const getPaginatedJustifications = async ({
  userName = "",
  scheduleId = "",
  startDate = "",
  endDate = "",
  status = "",
  page = 1,
  limit = 10,
} = {}) => {
  try {
    const { data } = await api.get("/justifications", {
      params: { userName, scheduleId, startDate, endDate, status, page, limit },
    });
    const formattedData = data.data.map((s, i) => ({
      ...s,
      index: (page - 1) * limit + i + 1,
    }));
    data.justifications = formattedData;
    return data;
  } catch (error) {
    console.log(error);
    handleApiError(error, "Error al obtener justificaciones");
  }
};

// ─── Exportación ─────────────────────────────────────────────────────────────

/**
 * Exportar a Excel.
 * Pasa los mismos filtros que usas en el listado (sin page ni limit).
 *
 * @param {object} filters - { status?, userId?, userName?, scheduleId?, startDate?, endDate? }
 *
 * @example
 *   await exportJustificationsExcel({ status: "pending", startDate: "2024-01-01", endDate: "2024-12-31" });
 */
export const exportJustificationsExcel = async (filters = {}) => {
  const response = await api.get("/justifications/export/excel", {
    params: filters,
    responseType: "blob", // ← crítico para recibir el buffer como Blob
  });

  downloadBlob(response.data, buildExportFilename("xlsx"));
};

/**
 * Exportar a PDF.
 *
 * @param {object} filters - mismos filtros que el listado
 *
 * @example
 *   await exportJustificationsPDF({ status: "approved" });
 */
export const exportJustificationsPDF = async (filters = {}) => {
  const response = await api.get("/justifications/export/pdf", {
    params: filters,
    responseType: "blob",
  });

  downloadBlob(response.data, buildExportFilename("pdf"));
};
