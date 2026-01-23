import { useEffect, useRef, useState } from "react";

const useSecureBiometricImage = (url, token, options = {}) => {
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const objectUrlRef = useRef(null);
  const hasAttemptedFetch = useRef(false); // ✅ NUEVO: Evita múltiples fetches

  const {
    autoRevoke = true,
    revokeDelay = 30000,
    onAccessLog = null,
    enabled = true,
  } = options;

  useEffect(() => {
    // ✅ Reset cuando cambia la URL o el enabled
    if (!enabled) {
      hasAttemptedFetch.current = false;
      return;
    }

    // ✅ Validación temprana
    if (!url || !token) {
      console.warn("useSecureBiometricImage: url o token faltante", { url, hasToken: !!token });
      return;
    }

    // ✅ CRÍTICO: Evitar fetches duplicados
    if (hasAttemptedFetch.current) {
      console.log("useSecureBiometricImage: fetch ya ejecutado, skipping");
      return;
    }

    hasAttemptedFetch.current = true;
    let timeoutId = null;
    let isMounted = true;

    const fetchBiometricImage = async () => {
      try {
        console.log("🔵 Iniciando fetch:", url);
        setLoading(true);
        setError(null);
        setProgress(0);

        onAccessLog?.({
          timestamp: new Date().toISOString(),
          action: "BIOMETRIC_IMAGE_REQUEST",
          url: url,
        });

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Request-Type": "biometric-data",
          },
          credentials: "omit",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        console.log("✅ Respuesta recibida:", response.status);

        // Streaming binario con progreso
        const reader = response.body.getReader();
        const contentLength = +response.headers.get("Content-Length");

        let receivedLength = 0;
        const chunks = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          receivedLength += value.length;

          if (contentLength && isMounted) {
            const newProgress = Math.round((receivedLength / contentLength) * 100);
            setProgress(newProgress);
            console.log(`📊 Progreso: ${newProgress}%`);
          }
        }

        // Crear blob en memoria
        const blob = new Blob(chunks, {
          type: response.headers.get("Content-Type") || "image/bmp",
        });

        console.log("📦 Blob creado:", blob.size, "bytes");

        // Limpiar URL anterior
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
        }

        // Crear Object URL temporal
        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;

        if (isMounted) {
          setImageData(objectUrl);
          setLoading(false);
          setProgress(100);
          console.log("🖼️ Imagen lista:", objectUrl);

          onAccessLog?.({
            timestamp: new Date().toISOString(),
            action: "BIOMETRIC_IMAGE_LOADED",
            size: receivedLength,
          });
        }

        // Auto-revocación
        if (autoRevoke) {
          timeoutId = setTimeout(() => {
            if (objectUrlRef.current) {
              URL.revokeObjectURL(objectUrlRef.current);
              objectUrlRef.current = null;
              if (isMounted) {
                setImageData(null);
                console.log("🗑️ Imagen auto-revocada");
                onAccessLog?.({
                  timestamp: new Date().toISOString(),
                  action: "BIOMETRIC_IMAGE_AUTO_REVOKED",
                });
              }
            }
          }, revokeDelay);
        }
      } catch (err) {
        console.error("❌ Error cargando imagen biométrica:", err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }

        onAccessLog?.({
          timestamp: new Date().toISOString(),
          action: "BIOMETRIC_IMAGE_ERROR",
          error: err.message,
        });
      }
    };

    fetchBiometricImage();

    // Cleanup
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [url, token, enabled]); // ✅ Removido autoRevoke, revokeDelay, onAccessLog de deps

  const manualRevoke = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
      setImageData(null);
      hasAttemptedFetch.current = false; // ✅ Permite nuevo fetch

      onAccessLog?.({
        timestamp: new Date().toISOString(),
        action: "BIOMETRIC_IMAGE_MANUAL_REVOKED",
      });
    }
  };

  return { imageData, loading, error, progress, manualRevoke };
};

export default useSecureBiometricImage;