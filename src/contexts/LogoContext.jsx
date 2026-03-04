// src/contexts/LogoContext.jsx
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import api from "../services/api";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const buildFullLogoUrl = (path) => {
  if (!path) return null;

  // Si ya viene como URL absoluta, no la tocamos
  if (path.startsWith("http")) return path;

  return `${API_URL}${path}`;
};

/**
 * servicios de conexion a la API
 * Debe retornar { logoUrl: string } o lanzar un error.
 */
const fetchLogoFromAPI = async () => {
  const { data } = await api.get("/system/config");
  //const fileUrl = `${import.meta.env.VITE_REACT_APP_API_URL}${filePath}`;
  console.log(data);
  return data; // { logoUrl: "https://..." }
};

const uploadLogoToAPI = async (file) => {
  const formData = new FormData();
  formData.append("logo", file);
  const { data } = await api.post("/system/config/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data; // { logoUrl: "https://..." }
};

const deleteLogoFromAPI = async () => {
  await api.delete("/system/config/logo");
};

// ─────────────────────────────────────────────────────────────────────────────
const STORAGE_KEY = "app_logo_url";

const LogoContext = createContext(null);

export const useLogoContext = () => {
  const ctx = useContext(LogoContext);
  if (!ctx)
    throw new Error("useLogoContext debe usarse dentro de LogoProvider");
  return ctx;
};

// ─────────────────────────────────────────────────────────────────────────────
export const LogoProvider = ({ children }) => {
  // Logo confirmado y activo en toda la app
  const [logoUrl, setLogoUrl] = useState(
    () => localStorage.getItem(STORAGE_KEY) ?? null,
  );

  // Estado de la UI del uploader (preview temporal, antes de guardar)
  const [pendingLogo, setPendingLogo] = useState(null); // { base64, file } | null
  const [pendingRemove, setPendingRemove] = useState(false);

  // Estados de carga
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Al montar: sincronizar con el backend (la URL del backend tiene prioridad) ──
  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      try {
        //const { logoUrl: remote } = await fetchLogoFromAPI();
        const { data } = await fetchLogoFromAPI();
        if (cancelled) return;
        if (data?.logo && data.logo?.url) {
          setLogoUrl(buildFullLogoUrl(data.logo?.url));
          localStorage.setItem(STORAGE_KEY, data.logo?.url);
        } else {
          setLogoUrl(null);
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        // Si falla, la caché local ya está cargada desde useState — no se rompe la app
      }
    };
    sync();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Seleccionar un archivo nuevo (no guarda aún) ────────────────────────
  const selectLogo = useCallback((base64, file) => {
    setPendingLogo({ base64, file });
    setPendingRemove(false);
    setError(null);
  }, []);

  // ── Marcar para eliminación (no elimina aún) ────────────────────────────
  const markLogoForRemoval = useCallback(() => {
    setPendingRemove(true);
    setPendingLogo(null);
    setError(null);
  }, []);

  // ── Descartar cambios pendientes ────────────────────────────────────────
  const discardChanges = useCallback(() => {
    setPendingLogo(null);
    setPendingRemove(false);
    setError(null);
  }, []);

  // ── Guardar: sube/elimina en backend y actualiza caché + estado global ──
  const saveChanges = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (pendingRemove) {
        await deleteLogoFromAPI();
        setLogoUrl(null);
        localStorage.removeItem(STORAGE_KEY);
      } else if (pendingLogo) {
        //const { logoUrl: newUrl } = await uploadLogoToAPI(pendingLogo.file);
        const { data } = await uploadLogoToAPI(pendingLogo.file);
        setLogoUrl(buildFullLogoUrl(data.logoUrl));
        localStorage.setItem(STORAGE_KEY, data.logoUrl);
      }
      setPendingLogo(null);
      setPendingRemove(false);
    } catch (err) {
      setError(err.message ?? "Error al guardar el logo");
    } finally {
      setLoading(false);
    }
  }, [pendingLogo, pendingRemove]);

  // ── Valor derivado: lo que debe mostrarse en el preview del uploader ────
  const previewUrl = useMemo(() => {
    if (pendingRemove) return null;
    if (pendingLogo) return pendingLogo.base64;
    return logoUrl;
  }, [pendingLogo, pendingRemove, logoUrl]);

  const hasPendingChanges = pendingLogo !== null || pendingRemove;

  const value = useMemo(
    () => ({
      logoUrl, // URL activa en toda la app (ya guardada)
      previewUrl, // Lo que se ve en el uploader (puede ser temporal)
      hasPendingChanges,
      loading,
      error,
      selectLogo, // (base64, file) => void
      markLogoForRemoval,
      discardChanges,
      saveChanges,
    }),
    [
      logoUrl,
      previewUrl,
      hasPendingChanges,
      loading,
      error,
      selectLogo,
      markLogoForRemoval,
      discardChanges,
      saveChanges,
    ],
  );

  console.log(logoUrl);

  return <LogoContext.Provider value={value}>{children}</LogoContext.Provider>;
};
