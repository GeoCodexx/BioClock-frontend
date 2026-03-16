// NotificationItem.jsx
import { Box, Typography, Chip, alpha } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { markAsRead } from "../../services/notificationService";
//import { usePermission } from "../../utils/permissions";

// ─── Relative time (no external deps) ───────────────────────────────────────
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
    return `Hace ${diffHours} h${diffHours !== 1 ? "rs" : "r"}`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: diffDays > 365 ? "numeric" : undefined,
  });
}

// ─── Absolute date tooltip ───────────────────────────────────────────────────
function formatAbsoluteDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date)) return "";
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Module color accent ─────────────────────────────────────────────────────
const MODULE_COLORS = {
  users: "#3b82f6",
  "my-attendance": "#10b981",
  schedules: "#f59e0b",
  attendances: "#8b5cf6",
  devices: "#ef4444",
  justifications: "#0ea5e9",
  default: "#6366f1",
};

const MODULE_CHIP = {
  users: "Usuarios",
  "my-attendance": "Mi asistencia",
  schedules: "Horarios",
  attendances: "Asistencias",
  devices: "Dispositivos",
  justifications: "Justificaciones",
  default: "Desconocido",
};

function getModuleColor(module = "default") {
  return MODULE_COLORS[module.toLowerCase()] ?? MODULE_COLORS.default;
}

function getModulLabel(module = "default") {
  return MODULE_CHIP[module.toLowerCase()] ?? MODULE_COLORS.default;
}

const notificationRoutes = {
  justifications: "/justifications",
  attendances: "/myattendance",
  schedules: "/profile",
  USER_CREATED: "/users",
  USER_UPDATED: "/profile",
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function NotificationItem({
  notification,
  refreshCount,
  reload,
}) {
  const navigate = useNavigate();
  const accentColor = getModuleColor(notification.module);
  const relativeTime = formatRelativeTime(notification.createdAt);
  const absoluteDate = formatAbsoluteDate(notification.createdAt);

  const handleClick = async () => {
    try {
      if (!notification.read) await markAsRead(notification._id);

      refreshCount();
      reload();

      const route =
        notificationRoutes[notification.type] ||
        notificationRoutes[notification.module] ||
        `/${notification.module}`;

      navigate(route);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: "flex",
        alignItems: "stretch",
        cursor: "pointer",
        position: "relative",
        bgcolor: notification.read ? "transparent" : "primary.50",
        transition: "background 0.15s, transform 0.1s",
        "&:hover": {
          bgcolor: "action.hover",
          "& .notification-arrow": { opacity: 1, transform: "translateX(0)" },
        },
        "&:active": { transform: "scale(0.995)" },
      }}
    >
      {/* Left accent bar */}
      <Box
        sx={{
          width: 3,
          flexShrink: 0,
          bgcolor: notification.read ? "transparent" : accentColor,
          borderRadius: "0 2px 2px 0",
          transition: "background 0.2s",
        }}
      />

      {/* Unread dot */}
      {!notification.read && (
        <Box
          sx={{
            position: "absolute",
            top: 14,
            right: 12,
            width: 7,
            height: 7,
            borderRadius: "50%",
            bgcolor: accentColor,
            //border: `1px solid ${accentColor}`,
            //boxShadow: `0 0 0 2px white`,
          }}
        />
      )}

      {/* Content */}
      <Box sx={{ flex: 1, px: 2, py: 1.5 }}>
        {/* Title row */}
        <Box display="flex" alignItems="center" gap={1} mb={0.25}>
          <Typography
            variant="body2"
            fontWeight={notification.read ? 500 : 700}
            sx={{
              color: notification.read ? "text.primary" : "text.primary",
              lineHeight: 1.3,
              flex: 1,
              pr: notification.read ? 0 : 1.5,
            }}
          >
            {notification.title}
          </Typography>
        </Box>

        {/* Message */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.45,
            mb: 0.75,
          }}
        >
          {notification.message}
        </Typography>

        {/* Footer: module chip + date */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
        >
          {notification.module && (
            <Chip
              label={getModulLabel(notification.module)}
              size="small"
              sx={{
                height: 18,
                fontSize: "0.6rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                bgcolor: `${accentColor}18`,
                color: accentColor,
                border: `1px solid ${accentColor}30`,
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          )}

          <Typography
            component="time"
            dateTime={notification.createdAt}
            title={absoluteDate}
            variant="caption"
            sx={{
              color: "text.disabled",
              fontSize: "0.68rem",
              fontWeight: 500,
              ml: "auto",
              whiteSpace: "nowrap",
              cursor: "help",
            }}
          >
            {relativeTime}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
