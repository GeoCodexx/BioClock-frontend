import { useState, useEffect, useCallback } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  Button,
  Divider,
  Stack,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format, parse, parseISO } from "date-fns";

// ─── Constants ────────────────────────────────────────────────────────────────

const DRAWER_WIDTH = 480;
const ACCEPTED_FILE_TYPES = ".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx";
const MAX_FILE_SIZE_MB = 10;
const MAX_FILES = 5;

const MODE_META = {
  create: {
    title: "Nueva Justificación",
    subtitle: "Completa el formulario para registrar una justificación.",
    color: "primary",
    icon: null,
  },
  edit: {
    title: "Editar Justificación",
    subtitle: "Modifica los campos disponibles.",
    color: "warning",
    icon: null,
  },
  approve: {
    title: "Aprobar Justificación",
    subtitle: "Revisa los detalles antes de aprobar.",
    color: "success",
    icon: <CheckCircleOutlineIcon />,
  },
  reject: {
    title: "Rechazar Justificación",
    subtitle: "Confirma el rechazo de esta justificación.",
    color: "error",
    icon: <CancelOutlinedIcon />,
  },
  preview: {
    title: "Archivos Adjuntos",
    subtitle: "Visualización de archivos de la justificación.",
    color: "info",
    icon: <VisibilityOutlinedIcon />,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getFileIcon = (filename = "") => {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext))
    return <ImageOutlinedIcon fontSize="small" />;
  if (ext === "pdf") return <PictureAsPdfOutlinedIcon fontSize="small" />;
  return <InsertDriveFileOutlinedIcon fontSize="small" />;
};

const isImage = (filename = "") =>
  ["png", "jpg", "jpeg", "webp", "gif"].includes(
    filename.split(".").pop()?.toLowerCase(),
  );

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * File Upload Zone — drag & drop + click to upload
 */
function FileUploadZone({ files, onAdd, onRemove, disabled }) {
  const theme = useTheme();
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const validateAndAdd = useCallback(
    (incoming) => {
      setError("");
      const valid = [];
      for (const file of incoming) {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          setError(
            `"${file.name}" supera el límite de ${MAX_FILE_SIZE_MB} MB.`,
          );
          continue;
        }
        valid.push(file);
      }
      if (files.length + valid.length > MAX_FILES) {
        setError(`Máximo ${MAX_FILES} archivos permitidos.`);
        return;
      }
      onAdd(valid);
    },
    [files, onAdd],
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    validateAndAdd(Array.from(e.dataTransfer.files));
  };

  const onInputChange = (e) => {
    validateAndAdd(Array.from(e.target.files));
    e.target.value = "";
  };

  const accent = theme.palette[dragging ? "primary" : "divider"];

  return (
    <Box>
      {/* Drop Zone */}
      <Box
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        sx={{
          border: `2px dashed`,
          borderColor: dragging
            ? "primary.main"
            : alpha(theme.palette.text.secondary, 0.25),
          borderRadius: 2,
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
          bgcolor: dragging
            ? alpha(theme.palette.primary.main, 0.06)
            : alpha(theme.palette.background.default, 0.4),
          "&:hover": !disabled && {
            borderColor: "primary.main",
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          },
        }}
        component="label"
      >
        <input
          hidden
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPES}
          disabled={disabled}
          onChange={onInputChange}
        />
        <UploadFileIcon
          sx={{
            fontSize: 36,
            color: dragging ? "primary.main" : "text.disabled",
            transition: "color 0.2s",
          }}
        />
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Arrastra archivos aquí o{" "}
          <Typography
            component="span"
            variant="body2"
            color="primary.main"
            fontWeight={600}
          >
            haz clic para seleccionar
          </Typography>
        </Typography>
        <Typography variant="caption" color="text.disabled">
          PDF, imágenes, Word · Máx. {MAX_FILE_SIZE_MB} MB · {MAX_FILES}{" "}
          archivos
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mt: 1, py: 0.5 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Stack spacing={0.75} mt={1.5}>
          {files.map((file, i) => (
            <FileChip
              key={i}
              file={file}
              onRemove={disabled ? null : () => onRemove(i)}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

function FileChip({ file, onRemove }) {
  const theme = useTheme();
  const name = file.name || file;
  const size = file.size ? formatBytes(file.size) : null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.5,
        py: 0.75,
        borderRadius: 1.5,
        bgcolor: alpha(theme.palette.primary.main, 0.07),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
      }}
    >
      <Box
        sx={{ color: "primary.main", display: "flex", alignItems: "center" }}
      >
        {getFileIcon(name)}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" noWrap fontWeight={500}>
          {name}
        </Typography>
        {size && (
          <Typography variant="caption" color="text.disabled">
            {size}
          </Typography>
        )}
      </Box>
      {onRemove && (
        <Tooltip title="Quitar">
          <IconButton
            size="small"
            onClick={onRemove}
            sx={{ color: "text.disabled" }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

/**
 * Status Badge
 */
function StatusBadge({ status }) {
  const map = {
    pending: { label: "Pendiente", color: "warning" },
    approved: { label: "Aprobado", color: "success" },
    rejected: { label: "Rechazado", color: "error" },
  };
  const { label, color } = map[status] || { label: status, color: "default" };
  return <Chip label={label} color={color} size="small" variant="outlined" />;
}

/**
 * File Preview Grid — for "preview" mode
 */
function FilePreviewGrid({ files }) {
  const theme = useTheme();

  if (!files || files.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 6,
          color: "text.disabled",
        }}
      >
        <InsertDriveFileOutlinedIcon sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="body2">Sin archivos adjuntos</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5}>
      {files.map((filePath, i) => {
        const filename = filePath.split("/").pop();
        const img = isImage(filename);
        const fileUrl = `${import.meta.env.VITE_REACT_APP_API_URL}${filePath}`;

        return (
          <Box
            key={i}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.background.default, 0.5),
            }}
          >
            {img && (
              <Box
                component="img"
                src={fileUrl}
                alt={filename}
                sx={{
                  width: "100%",
                  maxHeight: 260,
                  objectFit: "contain",
                  bgcolor: alpha(theme.palette.common.black, 0.04),
                  display: "block",
                }}
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
            <Box
              sx={{
                px: 1.5,
                py: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box sx={{ color: "primary.main", display: "flex" }}>
                {getFileIcon(filename)}
              </Box>
              <Typography
                variant="body2"
                noWrap
                sx={{ flex: 1 }}
                fontWeight={500}
              >
                {filename}
              </Typography>
              <Tooltip title="Abrir en nueva pestaña">
                <IconButton
                  size="small"
                  component="a"
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DownloadOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * JustificationDrawer
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - mode: "create" | "edit" | "approve" | "reject" | "preview"
 *  - justification: object | null  (required for edit/approve/reject/preview)
 *  - schedules: [{ _id, name }]    (list for select)
 *  - users: [{ _id, name }]        (list for select, create mode)
 *  - onSubmit: async (payload, files) => void
 */
export default function JustificationDrawer({
  open,
  onClose,
  mode = "create",
  justification = null,
  schedules = [],
  users = [],
  onSubmit,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const meta = MODE_META[mode];

  // ── Form state ──
  const [form, setForm] = useState({
    userId: "",
    scheduleId: "",
    date: null,
    reason: "",
  });
  const [newFiles, setNewFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const isValid = form.userId && form.scheduleId && form.date && form.reason;

  // Populate form when editing
  useEffect(() => {
    if (!open) {
      setFeedback({ type: "", message: "" });
      setNewFiles([]);
    }

    if (open && justification && ["edit", "approve", "reject"].includes(mode)) {
      setForm({
        userId: justification.userId?._id || justification.userId || "",
        scheduleId:
          justification.scheduleId?._id || justification.scheduleId || "",
        date: justification.date
          ? parse(justification.date, "yyyy-MM-dd", new Date())
          : null,
        reason: justification.reason || "",
      });
    } else if (open && mode === "create") {
      setForm({ userId: "", scheduleId: "", date: null, reason: "" });
    }
  }, [open, mode, justification]);

  // ── Handlers ──
  const handleChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddFiles = (incoming) =>
    setNewFiles((prev) => [...prev, ...incoming]);

  const handleRemoveFile = (idx) =>
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    setFeedback({ type: "", message: "" });
    setLoading(true);
    try {
      const payload =
        mode === "approve"
          ? { status: "approved" }
          : mode === "reject"
            ? { status: "rejected" }
            : {
                ...form,
                date: form.date ? format(form.date, "yyyy-MM-dd") : null,
              };

      await onSubmit?.(payload, newFiles);
      setFeedback({
        type: "success",
        message: "Acción realizada correctamente.",
      });
      setTimeout(onClose, 900);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err?.response?.data?.message || "Ocurrió un error inesperado.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Readonly check ──
  const isReadonly = mode === "preview";
  const isAction = mode === "approve" || mode === "reject";
  const accentColor =
    theme.palette[meta.color]?.main || theme.palette.primary.main;

  // ── Drawer content ──
  const drawerContent = (
    <Box
      sx={{
        width: isMobile ? "100vw" : DRAWER_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(accentColor, 0.05),
          position: "relative",
        }}
      >
        {/* Accent bar */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            bgcolor: accentColor,
            borderRadius: "0 0 2px 2px",
          }}
        />

        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
          {meta.icon && (
            <Avatar
              sx={{
                bgcolor: alpha(accentColor, 0.15),
                color: accentColor,
                width: 38,
                height: 38,
                mt: 0.25,
              }}
            >
              {meta.icon}
            </Avatar>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
              {meta.title}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              mt={0.25}
              display="block"
            >
              {meta.subtitle}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ mt: -0.5, mr: -1 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Status badge — visible when reviewing existing record */}
        {justification?.status &&
          (mode === "edit" || isAction || isReadonly) && (
            <Box mt={1.5}>
              <StatusBadge status={justification.status} />
            </Box>
          )}
      </Box>

      {/* ── Body ── */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2.5 }}>
        {feedback.message && (
          <Alert
            severity={feedback.type}
            sx={{ mb: 2, borderRadius: 1.5 }}
            onClose={() => setFeedback({ type: "", message: "" })}
          >
            {feedback.message}
          </Alert>
        )}

        {/* PREVIEW MODE */}
        {mode === "preview" && (
          <>
            {/* Details summary */}
            <JustificationDetails justification={justification} theme={theme} />
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
              Archivos adjuntos
            </Typography>
            <FilePreviewGrid files={justification?.files || []} />
          </>
        )}

        {/* CREATE / EDIT FORM */}
        {(mode === "create" || mode === "edit") && (
          <Stack spacing={2.5}>
            {/* User — only on create */}
            {mode === "create" && (
              <TextField
                select
                label="Usuario"
                name="userId"
                value={form.userId}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
                fullWidth
                size="small"
                required
              >
                {users.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    {u.name}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {/* Schedule */}
            <TextField
              select
              label="Turno"
              name="scheduleId"
              value={form.scheduleId}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              fullWidth
              size="small"
              required
              disabled={mode === "edit"}
            >
              {schedules.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Date */}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Fecha a justificar"
                name="date"
                format="dd/MM/yyyy"
                value={form.date}
                onChange={(newValue) => handleChange("date", newValue)}
                disableFuture
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    required: true,
                  },
                }}
                disabled={
                  mode === "edit" && justification?.status !== "pending"
                }
              />
            </LocalizationProvider>

            {/* Reason */}
            <TextField
              label="Motivo"
              name="reason"
              value={form.reason}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              fullWidth
              multiline
              minRows={3}
              maxRows={6}
              size="small"
              required
              inputProps={{ maxLength: 500 }}
              helperText={`${form.reason.length}/500`}
            />

            {/* File Upload */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Archivos adjuntos
              </Typography>
              <FileUploadZone
                files={newFiles}
                onAdd={handleAddFiles}
                onRemove={handleRemoveFile}
                disabled={false}
              />
            </Box>

            {/* Existing files (edit mode) */}
            {mode === "edit" && justification?.files?.length > 0 && (
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  mb={1}
                  color="text.secondary"
                >
                  Archivos existentes
                </Typography>
                <Stack spacing={0.75}>
                  {justification.files.map((f, i) => (
                    <FileChip key={i} file={{ name: f.split("/").pop() }} />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        )}

        {/* APPROVE / REJECT MODE */}
        {isAction && (
          <Stack spacing={2.5}>
            <JustificationDetails justification={justification} theme={theme} />

            {justification?.files?.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>
                    Archivos adjuntos
                  </Typography>
                  <FilePreviewGrid files={justification.files} />
                </Box>
              </>
            )}

            <Alert
              severity={mode === "approve" ? "success" : "error"}
              sx={{ borderRadius: 1.5 }}
              icon={
                mode === "approve" ? (
                  <CheckCircleOutlineIcon />
                ) : (
                  <CancelOutlinedIcon />
                )
              }
            >
              {mode === "approve"
                ? "¿Confirmas que deseas aprobar esta justificación?"
                : "¿Confirmas que deseas rechazar esta justificación?"}
            </Alert>
          </Stack>
        )}
      </Box>

      {/* ── Footer ── */}
      {!isReadonly && (
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.background.default, 0.6),
          }}
        >
          {feedback.message && feedback.type === "success" ? null : (
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button
                variant="outlined"
                color="inherit"
                onClick={onClose}
                disabled={loading}
                sx={{ minWidth: 100 }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color={meta.color}
                onClick={handleSubmit}
                disabled={loading || (mode === "create" && !isValid)}
                startIcon={
                  loading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    meta.icon
                  )
                }
                sx={{ minWidth: 130, fontWeight: 600 }}
              >
                {loading
                  ? "Procesando..."
                  : mode === "create"
                    ? "Registrar"
                    : mode === "edit"
                      ? "Guardar cambios"
                      : mode === "approve"
                        ? "Aprobar"
                        : "Rechazar"}
              </Button>
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? "100vw" : DRAWER_WIDTH,
          boxShadow: theme.shadows[16],
          backgroundImage: "none",
        },
      }}
      ModalProps={{ keepMounted: false }}
    >
      {drawerContent}
    </Drawer>
  );
}

// ─── JustificationDetails ─────────────────────────────────────────────────────

function JustificationDetails({ justification, theme }) {
  if (!justification) return null;

  const rows = [
    {
      label: "Usuario",
      value: justification.userId?.name || justification.userId || "—",
    },
    {
      label: "Turno",
      value: justification.scheduleId?.name || justification.scheduleId || "—",
    },
    {
      label: "Fecha",
      value: justification.date
        ? new Date(justification.date).toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        : "—",
    },
    { label: "Motivo", value: justification.reason || "—" },
    {
      label: "Aprobado por",
      value: justification.approvedBy?.name || justification.approvedBy || "—",
    },
    {
      label: "Estado",
      value: justification.status ? (
        <StatusBadge status={justification.status} />
      ) : (
        "—"
      ),
    },
  ];

  return (
    <Stack
      spacing={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {rows.map(({ label, value }, i) => (
        <Box
          key={label}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 2,
            px: 2,
            py: 1.25,
            bgcolor:
              i % 2 === 0
                ? alpha(theme.palette.background.default, 0.5)
                : "transparent",
            borderBottom:
              i < rows.length - 1
                ? `1px solid ${theme.palette.divider}`
                : "none",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{
              minWidth: 110,
              pt: 0.2,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {label}
          </Typography>
          {typeof value === "string" ? (
            <Typography
              variant="body2"
              sx={{ flex: 1, wordBreak: "break-word" }}
            >
              {value}
            </Typography>
          ) : (
            <Box sx={{ flex: 1 }}>{value}</Box>
          )}
        </Box>
      ))}
    </Stack>
  );
}
