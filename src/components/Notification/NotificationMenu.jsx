// NotificationMenu.jsx
import { useEffect, useState } from "react";
import {
  Menu,
  Box,
  Typography,
  Divider,
  Button,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useNavigate } from "react-router-dom";

import NotificationItem from "./NotificationItem";
import {
  getNotifications,
  markAllAsRead,
} from "../../services/notificationService";

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={5}
      gap={1.5}
      sx={{ color: "text.disabled" }}
    >
      <NotificationsOffOutlinedIcon sx={{ fontSize: 44, opacity: 0.35 }} />
      <Typography variant="body2" fontWeight={500} color="text.secondary">
        Todo al día
      </Typography>
      <Typography variant="caption" color="text.disabled" textAlign="center">
        No tienes notificaciones pendientes
      </Typography>
    </Box>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function NotificationMenu({
  anchorEl,
  open,
  onClose,
  refreshCount,
  unreadCount = 0,
}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await getNotifications({ limit: 10 });
      setNotifications(data.notifications);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  const handleReadAll = async () => {
    if (markingAll || unreadCount === 0) return;
    try {
      setMarkingAll(true);
      await markAllAsRead();
      await Promise.all([fetchNotifications(), refreshCount()]);
    } catch (error) {
      console.error(error);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleSeeAll = () => {
    onClose();
    navigate("notifications");
  };

  const hasUnread = unreadCount > 0;

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      slotProps={{
        paper: {
          elevation: 4,
          sx: {
            width: 380,
            maxHeight: 480,
            //overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            borderRadius: "14px",
            mt: 1,
            border: "1px solid",
            borderColor: "divider",
          },
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        px={2}
        py={1.5}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography fontWeight={700} fontSize="0.95rem">
            Notificaciones
          </Typography>
          {hasUnread && (
            <Chip
              label={unreadCount}
              size="small"
              color="error"
              sx={{
                height: 20,
                fontSize: "0.7rem",
                fontWeight: 700,
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          )}
        </Box>

        <Tooltip
          title={hasUnread ? "Marcar todas como leídas" : "Todo leído"}
          placement="left"
        >
          <span>
            <IconButton
              size="small"
              onClick={handleReadAll}
              disabled={!hasUnread || markingAll}
              sx={{
                color: hasUnread ? "primary.main" : "text.disabled",
                "&:hover": { bgcolor: "primary.50" },
                transition: "all 0.2s",
              }}
            >
              {markingAll ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DoneAllIcon fontSize="small" />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* ── List ── */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          // Custom scrollbar
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "divider",
            borderRadius: 2,
          },
        }}
      >
        {loading && (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress size={24} thickness={4} />
          </Box>
        )}

        {!loading && notifications.length === 0 && <EmptyState />}

        {!loading &&
          notifications.map((n, index) => (
            <Box key={n._id}>
              <NotificationItem
                notification={n}
                refreshCount={refreshCount}
                reload={fetchNotifications}
              />
              {index < notifications.length - 1 && (
                <Divider sx={{ opacity: 0.5 }} />
              )}
            </Box>
          ))}
      </Box>

      {/* ── Footer ── */}
      {!loading && notifications.length > 0 && (
        <Box component="div">
          <Divider />
          <Box
            px={2}
            py={1.25}
            display="flex"
            justifyContent="center"
            sx={{ bgcolor: "background.paper" }}
          >
            <Button
              size="small"
              endIcon={<OpenInNewIcon sx={{ fontSize: "0.8rem !important" }} />}
              onClick={handleSeeAll}
              sx={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "primary.main",
                textTransform: "none",
                letterSpacing: 0,
                "&:hover": { bgcolor: "primary.50" },
              }}
            >
              Ver todas las notificaciones
            </Button>
          </Box>
        </Box>
      )}
    </Menu>
  );
}
