// pages/NotificationsPage.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Skeleton,
  Pagination,
  Button,
  IconButton,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
  Fade,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import {
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "../services/notificationService";

// ─── Constants ───────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 15;

const MODULE_META = {
  justifications: { label: "Justificaciones", color: "#0ea5e9" },
  usuarios: { label: "Usuarios", color: "#3b82f6" },
  //attendances: { label: "Usuarios", color: "#10b981" },
  schedules: { label: "Horarios", color: "#f59e0b" },
  attendances: { label: "Asistencias", color: "#8b5cf6" },
  devices: { label: "Dispositivos", color: "#ef4444" },
};

const notificationRoutes = {
  justifications: "/justifications",
  attendances: "/myattendance",
  schedules: "/profile",
  USER_CREATED: "/users",
  USER_UPDATED: "/profile",
};

function getModuleMeta(module = "") {
  return (
    MODULE_META[module.toLowerCase()] ?? { label: module, color: "#6366f1" }
  );
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date)) return "";
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Justo ahora";
  if (diffMins < 60) return `Hace ${diffMins} min${diffMins !== 1 ? "s" : ""}`;
  if (diffHours < 24)
    return `Hace ${diffHours} hr${diffHours !== 1 ? "s" : ""}`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: diffDays > 365 ? "numeric" : undefined,
  });
}

function formatAbsoluteDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date)) return "";
  return date.toLocaleString("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ value, label, color, icon, theme }) {
  return (
    <Box
      sx={{
        flex: "1 1 120px",
        minWidth: 110,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.5,
        borderRadius: "12px",
        bgcolor: alpha(color, 0.08),
        border: `1px solid ${alpha(color, 0.18)}`,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "9px",
          bgcolor: alpha(color, 0.14),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          fontWeight={700}
          fontSize="1.2rem"
          lineHeight={1}
          color={color}
        >
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

function NotificationRow({ notification, onRead, index }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const meta = getModuleMeta(notification.module);
  const isUnread = !notification.read;

  const handleClick = async () => {
    try {
      if (isUnread) await onRead(notification._id);
      //navigate(`/${notification.module}`);
      const route =
        notificationRoutes[notification.type] ||
        notificationRoutes[notification.module] ||
        `/${notification.module}`;

      navigate(route);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkRead = async (e) => {
    e.stopPropagation();
    if (isUnread) await onRead(notification._id);
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        px: { xs: 2, sm: 3 },
        py: 2,
        cursor: "pointer",
        position: "relative",
        bgcolor: isUnread
          ? alpha(meta.color, theme.palette.mode === "dark" ? 0.06 : 0.04)
          : "transparent",
        borderLeft: `3px solid ${isUnread ? meta.color : "transparent"}`,
        transition: "background 0.15s, border-color 0.15s",
        animation: `slideIn 0.25s ease both`,
        animationDelay: `${index * 30}ms`,
        "@keyframes slideIn": {
          from: { opacity: 0, transform: "translateY(6px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "&:hover": {
          bgcolor: alpha(meta.color, 0.07),
          "& .row-actions": { opacity: 1 },
        },
      }}
    >
      {/* Module color dot */}
      <Box
        sx={{
          mt: "3px",
          width: 10,
          height: 10,
          borderRadius: "50%",
          bgcolor: meta.color,
          flexShrink: 0,
          boxShadow: isUnread ? `0 0 0 3px ${alpha(meta.color, 0.2)}` : "none",
          transition: "box-shadow 0.2s",
        }}
      />

      {/* Content */}
      <Box flex={1} minWidth={0}>
        <Box
          display="flex"
          alignItems={{ xs: "flex-start", sm: "center" }}
          flexDirection={{ xs: "column", sm: "row" }}
          gap={{ xs: 0.5, sm: 1.5 }}
          mb={0.4}
        >
          <Typography
            variant="body2"
            fontWeight={isUnread ? 700 : 500}
            sx={{
              color: isUnread ? "text.primary" : "text.secondary",
              lineHeight: 1.35,
              flex: 1,
            }}
          >
            {notification.title}
          </Typography>

          <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
            <Chip
              label={meta.label}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.03em",
                bgcolor: alpha(meta.color, 0.12),
                color: meta.color,
                border: `1px solid ${alpha(meta.color, 0.25)}`,
                "& .MuiChip-label": { px: 0.9 },
              }}
            />
            <Typography
              component="time"
              dateTime={notification.createdAt}
              title={formatAbsoluteDate(notification.createdAt)}
              variant="caption"
              sx={{
                color: "text.disabled",
                fontSize: "0.7rem",
                whiteSpace: "nowrap",
                cursor: "help",
                userSelect: "none",
              }}
            >
              {formatRelativeTime(notification.createdAt)}
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", lineHeight: 1.5 }}
        >
          {notification.message}
        </Typography>
      </Box>

      {/* Row actions */}
      <Box
        className="row-actions"
        sx={{
          opacity: { xs: 1, sm: 0 },
          transition: "opacity 0.15s",
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          flexShrink: 0,
        }}
      >
        {isUnread && (
          <Tooltip title="Marcar como leída" placement="left">
            <IconButton
              size="small"
              onClick={handleMarkRead}
              sx={{ color: meta.color }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={`Ir a ${meta.label}`} placement="left">
          <IconButton size="small" sx={{ color: "text.disabled" }}>
            <OpenInNewIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

function SkeletonRow() {
  return (
    <Box display="flex" alignItems="flex-start" gap={2} px={3} py={2}>
      <Skeleton
        variant="circular"
        width={10}
        height={10}
        sx={{ mt: "5px", flexShrink: 0 }}
      />
      <Box flex={1}>
        <Box display="flex" justifyContent="space-between" mb={0.75}>
          <Skeleton variant="text" width="45%" height={16} />
          <Skeleton
            variant="rounded"
            width={80}
            height={20}
            sx={{ borderRadius: "10px" }}
          />
        </Box>
        <Skeleton variant="text" width="75%" height={14} />
      </Box>
    </Box>
  );
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={10}
      gap={2}
    >
      <NotificationsOffOutlinedIcon
        sx={{ fontSize: 56, color: "text.disabled", opacity: 0.4 }}
      />
      <Typography variant="h6" fontWeight={600} color="text.secondary">
        {hasFilters ? "Sin resultados" : "Todo al día"}
      </Typography>
      <Typography
        variant="body2"
        color="text.disabled"
        textAlign="center"
        maxWidth={280}
      >
        {hasFilters
          ? "Ninguna notificación coincide con los filtros actuales."
          : "No tienes notificaciones en este momento."}
      </Typography>
      {hasFilters && (
        <Button
          size="small"
          variant="outlined"
          onClick={onClear}
          sx={{ mt: 1, borderRadius: "8px" }}
        >
          Limpiar filtros
        </Button>
      )}
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // ── Filters state ──
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "unread" | "read"
  const [moduleFilter, setModuleFilter] = useState("all");
  const [page, setPage] = useState(1);

  // ── Data state ──
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [stats, setStats] = useState({ total: 0, unread: 0 });
  const [availableModules, setAvailableModules] = useState([]);

  const searchRef = useRef(null);

  // ── Debounce search ──
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // ── Fetch ──
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        limit: ITEMS_PER_PAGE,
        page,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter !== "all" && { read: statusFilter === "read" }),
        ...(moduleFilter !== "all" && { module: moduleFilter }),
      };

      const { data } = await getNotifications(params);

      setNotifications(data.notifications);
      setPagination(data.pagination);

      // Build stats from full response (assuming backend returns total unread in meta)
      // Fallback: count from current page
      if (data.stats) {
        setStats(data.stats);
      } else {
        const unread = data.notifications.filter((n) => !n.read).length;
        setStats((prev) => ({
          total: data.pagination.total,
          unread:
            data.stats?.unread ??
            (statusFilter === "all" ? prev.unread : unread),
        }));
      }

      // Collect unique modules for filter chips
      if (availableModules.length === 0 && data.notifications.length > 0) {
        const mods = [
          ...new Set(data.notifications.map((n) => n.module).filter(Boolean)),
        ];
        setAvailableModules(mods);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, moduleFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ── Actions ──
  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );
    setStats((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
  };

  const handleMarkAll = async () => {
    if (markingAll) return;
    try {
      setMarkingAll(true);
      await markAllAsRead();
      await fetchNotifications();
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setModuleFilter("all");
    setPage(1);
  };

  const hasFilters = search || statusFilter !== "all" || moduleFilter !== "all";

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.background.default, 1)
            : alpha(theme.palette.grey[50], 1),
        pb: 8,
      }}
    >
      {/* ── Page header ── */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: "sticky",
          top: 57,
          zIndex: 10,
          backdropFilter: "blur(12px)",
          backgroundColor: alpha(theme.palette.background.paper, 0.92),
        }}
      >
        <Container maxWidth="lg">
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            py={2}
            gap={2}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Tooltip title="Volver">
                <IconButton
                  size="small"
                  onClick={() => navigate(-1)}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                    },
                  }}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Box display="flex" alignItems="center" gap={1}>
                <NotificationsNoneIcon
                  sx={{ color: "primary.main", fontSize: 22 }}
                />
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  fontWeight={700}
                >
                  Notificaciones
                </Typography>
                {stats.unread > 0 && (
                  <Chip
                    label={stats.unread}
                    size="small"
                    color="error"
                    sx={{
                      height: 22,
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      "& .MuiChip-label": { px: 0.9 },
                    }}
                  />
                )}
              </Box>
            </Box>

            {stats.unread > 0 && (
              <Tooltip title="Marcar todas como leídas">
                <Button
                  size="small"
                  startIcon={
                    markingAll ? null : (
                      <DoneAllIcon sx={{ fontSize: "1rem !important" }} />
                    )
                  }
                  onClick={handleMarkAll}
                  disabled={markingAll}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    borderRadius: "8px",
                    color: "primary.main",
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                    },
                    whiteSpace: "nowrap",
                    px: 1.5,
                  }}
                >
                  {isMobile ? "Leer todo" : "Marcar todas como leídas"}
                </Button>
              </Tooltip>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: 3 }}>
        {/* ── Stats row ── */}
        <Box display="flex" flexWrap="wrap" gap={1.5} mb={3}>
          <StatCard
            value={pagination.total}
            label="Total"
            color={theme.palette.primary.main}
            icon={<NotificationsNoneIcon fontSize="small" />}
            theme={theme}
          />
          <StatCard
            value={stats.unread}
            label="Sin leer"
            color={theme.palette.error.main}
            icon={<RadioButtonUncheckedIcon fontSize="small" />}
            theme={theme}
          />
          <StatCard
            value={pagination.total - stats.unread}
            label="Leídas"
            color={theme.palette.success.main}
            icon={<CheckCircleOutlineIcon fontSize="small" />}
            theme={theme}
          />
        </Box>

        {/* ── Filters card ── */}
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: "14px",
            border: `1px solid ${theme.palette.divider}`,
            mb: 2,
            overflow: "hidden",
          }}
        >
          {/* Search row */}
          <Box
            px={{ xs: 2, sm: 3 }}
            pt={2}
            pb={1.5}
            display="flex"
            gap={2}
            alignItems="center"
            flexDirection={{ xs: "column", sm: "row" }}
          >
            <TextField
              inputRef={searchRef}
              placeholder="Buscar en notificaciones…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      fontSize="small"
                      sx={{ color: "text.disabled" }}
                    />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearch("");
                        searchRef.current?.focus();
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  fontSize: "0.875rem",
                  bgcolor: alpha(theme.palette.grey[500], 0.06),
                  "& fieldset": { borderColor: "transparent" },
                  "&:hover fieldset": { borderColor: theme.palette.divider },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />

            {/* Status toggle */}
            <ToggleButtonGroup
              value={statusFilter}
              exclusive
              onChange={(_, val) => {
                if (val) {
                  setStatusFilter(val);
                  setPage(1);
                }
              }}
              size="small"
              sx={{
                flexShrink: 0,
                "& .MuiToggleButton-root": {
                  textTransform: "none",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  px: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: "9px !important",
                  mx: 0.25,
                  "&.Mui-selected": {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  },
                },
              }}
            >
              <ToggleButton value="all">Todas</ToggleButton>
              <ToggleButton value="unread">Sin leer</ToggleButton>
              <ToggleButton value="read">Leídas</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Module filter chips */}
          {availableModules.length > 0 && (
            <>
              <Divider />
              <Box
                px={{ xs: 2, sm: 3 }}
                py={1.25}
                display="flex"
                alignItems="center"
                gap={1}
                flexWrap="wrap"
              >
                <Typography
                  variant="caption"
                  color="text.disabled"
                  fontWeight={600}
                  letterSpacing="0.04em"
                  textTransform="uppercase"
                  mr={0.5}
                >
                  Módulo:
                </Typography>

                <Chip
                  label="Todos"
                  size="small"
                  onClick={() => {
                    setModuleFilter("all");
                    setPage(1);
                  }}
                  sx={{
                    height: 24,
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    bgcolor:
                      moduleFilter === "all"
                        ? alpha(theme.palette.primary.main, 0.12)
                        : alpha(theme.palette.grey[500], 0.1),
                    color:
                      moduleFilter === "all"
                        ? "primary.main"
                        : "text.secondary",
                    border: `1px solid ${
                      moduleFilter === "all"
                        ? alpha(theme.palette.primary.main, 0.3)
                        : "transparent"
                    }`,
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    },
                    "& .MuiChip-label": { px: 1 },
                  }}
                />

                {availableModules.map((mod) => {
                  const meta = getModuleMeta(mod);
                  const active = moduleFilter === mod;
                  return (
                    <Chip
                      key={mod}
                      label={meta.label}
                      size="small"
                      onClick={() => {
                        setModuleFilter(mod);
                        setPage(1);
                      }}
                      sx={{
                        height: 24,
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        bgcolor: active
                          ? alpha(meta.color, 0.14)
                          : alpha(theme.palette.grey[500], 0.08),
                        color: active ? meta.color : "text.secondary",
                        border: `1px solid ${active ? alpha(meta.color, 0.3) : "transparent"}`,
                        "&:hover": { bgcolor: alpha(meta.color, 0.1) },
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  );
                })}

                {hasFilters && (
                  <Button
                    size="small"
                    onClick={handleClearFilters}
                    sx={{
                      ml: "auto",
                      fontSize: "0.7rem",
                      textTransform: "none",
                      color: "text.disabled",
                      minWidth: 0,
                      p: 0,
                      "&:hover": {
                        color: "text.secondary",
                        bgcolor: "transparent",
                      },
                    }}
                  >
                    Limpiar filtros
                  </Button>
                )}
              </Box>
            </>
          )}
        </Box>

        {/* ── Notification list ── */}
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: "14px",
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
          }}
        >
          {loading ? (
            <>
              {[...Array(6)].map((_, i) => (
                <Box key={i}>
                  <SkeletonRow />
                  {i < 5 && <Divider />}
                </Box>
              ))}
            </>
          ) : notifications.length === 0 ? (
            <EmptyState
              hasFilters={!!hasFilters}
              onClear={handleClearFilters}
            />
          ) : (
            <>
              {notifications.map((n, i) => (
                <Box key={n._id}>
                  <NotificationRow
                    notification={n}
                    onRead={handleMarkAsRead}
                    index={i}
                  />
                  {i < notifications.length - 1 && (
                    <Divider
                      sx={{
                        opacity: 0.5,
                        ml: { xs: 2, sm: 3 },
                        mr: { xs: 2, sm: 3 },
                      }}
                    />
                  )}
                </Box>
              ))}
            </>
          )}
        </Box>

        {/* ── Pagination ── */}
        {!loading && pagination.pages > 1 && (
          <Fade in>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexDirection={{ xs: "column", sm: "row" }}
              gap={2}
              mt={3}
            >
              <Typography variant="caption" color="text.disabled">
                Mostrando{" "}
                <strong>
                  {(page - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(page * ITEMS_PER_PAGE, pagination.total)}
                </strong>{" "}
                de <strong>{pagination.total}</strong> notificaciones
              </Typography>

              <Pagination
                count={pagination.pages}
                page={page}
                onChange={(_, val) => {
                  setPage(val);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                size={isMobile ? "small" : "medium"}
                shape="rounded"
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root": {
                    borderRadius: "8px",
                    fontWeight: 600,
                  },
                }}
              />
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
}
