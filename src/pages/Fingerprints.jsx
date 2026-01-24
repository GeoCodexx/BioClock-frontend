import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Typography,
  CircularProgress,
  Alert,
  Box,
  Breadcrumbs,
  Card,
  Link,
  Stack,
  useTheme,
  useMediaQuery,
  Divider,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  deleteFingerprintTemplate,
  getFingerprintTemplates,
  updateFingerprintStatus,
} from "../services/fingerprintService";
import FingerprintTable from "../components/Fingerprint/FingerprintTable";
import FingerprintSearchBar from "../components/Fingerprint/FingerprintSearchBar";
import FingerprintExportButtons from "../components/Fingerprint/FingerprintExportButtons";
import StatusFilter from "../components/Fingerprint/StatusFilter";
//import StatusConfirmDialog from "../components/Fingerprint/StatusConfirmDialog";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";
import { Link as RouterLink } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import useSnackbarStore from "../store/useSnackbarStore";
import LoadingOverlay from "../components/common/LoadingOverlay";
import { SafeTablePagination } from "../components/common/SafeTablePagination";
import { useThemeMode } from "../contexts/ThemeContext";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import { usePermission } from "../utils/permissions";
import useAuthStore from "../store/useAuthStore";
import BiometricValidationDialog from "../components/Fingerprint/BiometricValidationDialog";

export default function Fingerprints() {
  const user = useAuthStore((state) => state.user);
  const { can } = usePermission();
  const { showSuccess, showError } = useSnackbarStore();

  const theme = useTheme();
  const { mode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [fingerprints, setFingerprints] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");

  //Estado para mostrar u ocultar filtros mobile
  const [openFilters, setOpenFilters] = useState(false);

  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    search: "",
    status: "", // Filtro por estado
  });

  const [statusDialog, setStatusDialog] = useState({
    open: false,
    fingerprintId: null,
    currentStatus: null,
    action: null, // 'approve' o 'reject'
    note: "",
    error: "",
  });

  const [deleteState, setDeleteState] = useState({
    id: null,
    error: "",
  });

  // Variable para abrir el Dialog de validación
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const fetchFingerprints = useCallback(async () => {
    const data = await getFingerprintTemplates({
      search: pagination.search,
      page: pagination.page + 1,
      limit: pagination.rowsPerPage,
      status: pagination.status || undefined,
    });
    setFingerprints(data.fingerprints || data.templates || []);
    setTotal(data.total || 0);
  }, [
    pagination.search,
    pagination.page,
    pagination.rowsPerPage,
    pagination.status,
  ]);

  // Cargar fingerprints
  useEffect(() => {
    setLoading(true);
    setError("");
    fetchFingerprints()
      .catch((err) => {
        setError(
          err.response?.data?.message || "Error al cargar huellas dactilares",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [fetchFingerprints]);

  // Debounce para búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== pagination.search) {
        setPagination((prev) => ({
          ...prev,
          search: searchInput,
          page: 0,
        }));
      }
    }, 600);

    return () => clearTimeout(handler);
  }, [searchInput, pagination.search]);

  // Luego úsala en useEffect y refreshFingerprints
  const refreshFingerprints = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await fetchFingerprints();
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al cargar huellas dactilares",
      );
    } finally {
      setLoading(false);
    }
  }, [fetchFingerprints]);

  // Handler para aprobar
  /*const handleApprove = useCallback((fingerprint) => {
    setStatusDialog({
      open: true,
      fingerprintId: fingerprint._id || fingerprint.id,
      currentStatus: fingerprint.status,
      action: "approve",
      note: "",
      error: "",
    });
  }, []);

  // Handler para rechazar
  const handleReject = useCallback((fingerprint) => {
    console.log(fingerprint);
    setStatusDialog({
      open: true,
      fingerprintId: fingerprint._id || fingerprint.id,
      currentStatus: fingerprint.status,
      action: "reject",
      note: "",
      error: "",
    });
  }, []);*/

  const handleOpenDialog = (templateId) => {
    setSelectedTemplateId(templateId);
    setDialogOpen(true);
  };

  //handler para aprobar registro de huellas
  const handleApprove = async (templateId) => {
    console.log("Aprobando plantilla:", templateId);
    try {
      await updateFingerprintStatus(
        templateId,
        "approved",
        undefined,
        user ? user.id : null,
      );
      showSuccess("Datos actualizados correctamente");
      await refreshFingerprints();
    } catch (error) {
      console.log(error);
      showError("Error interno en el servidor. Por favor intente nuevamente");
    }
  };

  // handler para rechazar registro de huellas
  const handleReject = async (templateId, note) => {
    console.log("Rechazando plantilla:", templateId, "Nota:", note);
    try {
      await updateFingerprintStatus(
        templateId,
        "rejected",
        note,
        user ? user.id : null,
      );
      showSuccess("Datos actualizados correctamente");

      await refreshFingerprints();
    } catch (error) {
      console.log(error);
      showError("Error interno en el servidor. Por favor intente nuevamente");
    }
  };

  // Confirmar cambio de estado
  const confirmStatusChange = useCallback(
    async (note) => {
      setStatusDialog((prev) => ({ ...prev, error: "" }));
      try {
        const newStatus =
          statusDialog.action === "approve" ? "approved" : "rejected";
        await updateFingerprintStatus(
          statusDialog.fingerprintId,
          newStatus,
          note,
          user ? user.id : null,
        );

        showSuccess(
          `Huella dactilar ${
            statusDialog.action === "approve" ? "aprobada" : "rechazada"
          } correctamente`,
        );

        setStatusDialog({
          open: false,
          fingerprintId: null,
          currentStatus: null,
          action: null,
          note: "",
          error: "",
        });

        await refreshFingerprints();
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          `Error al ${
            statusDialog.action === "approve" ? "aprobar" : "rechazar"
          } la huella dactilar`;

        setStatusDialog((prev) => ({ ...prev, error: errorMessage }));
        showError(errorMessage);
        // NO cerrar el diálogo en caso de error para que el usuario vea el mensaje
        throw err; // Re-lanzar el error para que el diálogo detecte el fallo
      }
    },
    [
      statusDialog.action,
      statusDialog.fingerprintId,
      statusDialog.note,
      user,
      showSuccess,
      showError,
      refreshFingerprints,
    ],
  );

  // Handler para eliminar
  const handleDelete = useCallback((fingerprintId) => {
    setDeleteState({
      id: fingerprintId,
      error: "",
    });
  }, []);

  // Confirmar eliminación
  const confirmDelete = useCallback(async () => {
    setDeleteState((prev) => ({ ...prev, error: "" }));
    try {
      await deleteFingerprintTemplate(deleteState.id);
      showSuccess("Huella dactilar eliminada correctamente");
      setDeleteState({ id: null, error: "" });
      await refreshFingerprints();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error al eliminar huella dactilar";

      setDeleteState((prev) => ({ ...prev, error: errorMessage }));
      showError(errorMessage);
      console.error("Error en confirmDelete:", err);
    }
  }, [deleteState.id, showSuccess, showError, refreshFingerprints]);

  // Handlers de paginación
  const handleChangePage = useCallback((event, newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setPagination((prev) => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0,
    }));
  }, []);

  // Handler de búsqueda
  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      setPagination((prev) => ({
        ...prev,
        search: searchInput,
        page: 0,
      }));
    },
    [searchInput],
  );

  // Handler de filtro por estado
  const handleStatusFilterChange = useCallback((newStatus) => {
    setPagination((prev) => ({
      ...prev,
      status: newStatus,
      page: 0,
    }));
  }, []);

  // Close dialogs
  const handleCloseStatusDialog = useCallback(() => {
    setStatusDialog({
      open: false,
      fingerprintId: null,
      currentStatus: null,
      action: null,
      error: "",
    });
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteState({ id: null, error: "" });
  }, []);

  const handleCloseValidationDialog = useCallback(() => {
    setValidationDialog({
      open: false,
      fingerprintId: null,
      currentStatus: null,
      action: null,
      error: "",
    });
  }, []);

  // Aprobar huella desde el dialog de validacion
  const handleApproveFingerprint = useCallback((fingerprintId) => {
    console.log("Aprobado: ", fingerprintId);
    setValidationDialog({
      open: false,
      fingerprintId: null,
      currentStatus: null,
      action: null,
      error: "",
    });
  });

  // Memorizar breadcrumbs
  const breadcrumbItems = useMemo(
    () => (
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="small" />}
        sx={isMobile ? { fontSize: "0.875rem" } : undefined}
      >
        <Link
          component={RouterLink}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            color: "text.secondary",
            textDecoration: "none",
            transition: "color 0.2s",
            "&:hover": {
              color: "primary.main",
            },
          }}
        >
          <HomeIcon fontSize="small" />
          {!isMobile && <Typography variant="body2">Inicio</Typography>}
        </Link>
        <Typography variant="body2" color="text.primary">
          Huellas Dactilares
        </Typography>
      </Breadcrumbs>
    ),
    [isMobile],
  );

  // Memorizar tabla
  const fingerprintTableMemo = useMemo(
    () => (
      <FingerprintTable
        fingerprints={fingerprints}
        onDelete={handleDelete}
        onOpenValidationDialog={handleOpenDialog}
      />
    ),
    [fingerprints, handleApprove, handleReject, handleDelete],
  );

  // Estado de carga inicial
  if (loading && fingerprints.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary">
          Cargando huellas dactilares...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* HEADER CARD */}
      <Card
        sx={{
          borderRadius: isMobile ? 2 : 3,
          mb: 2,
          boxShadow: theme.shadows[1],
          borderLeft: mode === "dark" ? "none" : "4px solid",
          borderColor: "primary.main",
        }}
      >
        <Box
          sx={{
            px: isMobile ? 2 : 3,
            py: isMobile ? 2.5 : 3,
          }}
        >
          {isMobile ? (
            <Stack spacing={1.5}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Gestión de Huellas Dactilares
                  </Typography>
                </Box>
                <Tooltip
                  title={
                    !fingerprints || fingerprints.length === 0
                      ? "No hay asistencias para filtrar"
                      : openFilters
                        ? "Ocultar filtros"
                        : "Mostrar filtros"
                  }
                >
                  <span>
                    <IconButton
                      onClick={() => setOpenFilters((prev) => !prev)}
                      disabled={!fingerprints || fingerprints.length === 0}
                      sx={{
                        bgcolor: theme.palette.background.paper,
                        "&:hover": {
                          bgcolor: theme.palette.action.hover,
                        },
                        "&:disabled": {
                          bgcolor: theme.palette.action.disabledBackground,
                        },
                      }}
                    >
                      {openFilters ? <FilterListOffIcon /> : <FilterListIcon />}
                    </IconButton>
                  </span>
                </Tooltip>
                {can("fingerprints:export") && (
                  <FingerprintExportButtons fingerprints={fingerprints} />
                )}
              </Box>
            </Stack>
          ) : (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Gestión de Huellas Dactilares
              </Typography>
              {breadcrumbItems}
            </Stack>
          )}
        </Box>
      </Card>

      {/* TOOLBAR CARD */}
      <Card
        sx={{
          borderRadius: isMobile ? 2 : 3,
          mb: 2,
          boxShadow: theme.shadows[1],
        }}
      >
        <Box
          sx={{
            px: isMobile ? 2 : 3,
            pt: isMobile ? 2 : 4,
            pb: isMobile ? 1.5 : 4,
          }}
        >
          {isTablet ? (
            <Stack spacing={2}>
              <FingerprintSearchBar
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                onSearch={handleSearch}
              />
              {openFilters && (
                <StatusFilter
                  value={pagination.status}
                  onChange={handleStatusFilterChange}
                />
              )}
            </Stack>
          ) : (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Box sx={{ flex: 1, maxWidth: 400 }}>
                <FingerprintSearchBar
                  searchInput={searchInput}
                  setSearchInput={setSearchInput}
                  onSearch={handleSearch}
                />
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <StatusFilter
                  value={pagination.status}
                  onChange={handleStatusFilterChange}
                />
                {can("fingerprints:export") && (
                  <FingerprintExportButtons fingerprints={fingerprints} />
                )}
              </Stack>
            </Stack>
          )}
        </Box>
      </Card>

      {/* Mensaje de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: isMobile ? 2 : 3 }}>
          {error}
        </Alert>
      )}

      {/* TABLE CARD */}
      <Card
        sx={{
          borderRadius: isMobile ? 2 : 3,
          boxShadow: theme.shadows[1],
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "relative" }}>
          <LoadingOverlay show={loading && fingerprints.length > 0} />
          {fingerprintTableMemo}
        </Box>

        {fingerprints.length > 0 && <Divider />}

        <SafeTablePagination
          component="div"
          count={total}
          page={pagination.page}
          onPageChange={handleChangePage}
          rowsPerPage={pagination.rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={isMobile ? "Filas:" : "Filas por página:"}
          labelDisplayedRows={({ from, to, count }) =>
            isMobile
              ? `${from}-${to} de ${count}`
              : `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            ".MuiTablePagination-toolbar": {
              flexWrap: isMobile ? "wrap" : "nowrap",
              minHeight: isMobile ? "auto" : 64,
              px: isMobile ? 1 : 2,
            },
            ".MuiTablePagination-selectLabel": {
              fontSize: isMobile ? "0.8rem" : "0.875rem",
            },
            ".MuiTablePagination-displayedRows": {
              fontSize: isMobile ? "0.8rem" : "0.875rem",
            },
          }}
        />
      </Card>

      {/* DIÁLOGOS */}
      {/* <StatusConfirmDialog
        open={statusDialog.open}
        onClose={handleCloseStatusDialog}
        onConfirm={confirmStatusChange}
        action={statusDialog.action}
        error={statusDialog.error}
      /> */}

      <DeleteConfirmDialog
        open={!!deleteState.id}
        onClose={handleCloseDelete}
        onConfirm={confirmDelete}
        deleteError={deleteState.error}
        itemName="registro de huella dactilar"
      />

      <BiometricValidationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        templateId={selectedTemplateId}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </Box>
  );
}
