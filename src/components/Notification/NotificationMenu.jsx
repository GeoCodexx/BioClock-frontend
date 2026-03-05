import { useEffect, useState } from "react";
import {
  Menu,
  Box,
  Typography,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";

import NotificationItem from "./NotificationItem";

import {
  getNotifications,
  markAllAsRead,
} from "../../services/notificationService";

export default function NotificationMenu({
  anchorEl,
  open,
  onClose,
  refreshCount,
}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const { data } = await getNotifications({
        limit: 10,
      });

      setNotifications(data.notifications);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const handleReadAll = async () => {
    try {
      await markAllAsRead();

      fetchNotifications();
      refreshCount();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 360,
          maxHeight: 420,
        },
      }}
    >
      <Box
        px={2}
        py={1.5}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography fontWeight={600}>Notificaciones</Typography>

        <Button size="small" onClick={handleReadAll}>
          Marcar todas
        </Button>
      </Box>

      <Divider />

      <Box
        sx={{
          maxHeight: 320,
          overflowY: "auto",
        }}
      >
        {loading && (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!loading && notifications.length === 0 && (
          <Typography align="center" sx={{ p: 3 }} color="text.secondary">
            No tienes notificaciones
          </Typography>
        )}

        {notifications.map((n) => (
          <NotificationItem
            key={n._id}
            notification={n}
            refreshCount={refreshCount}
            reload={fetchNotifications}
          />
        ))}
      </Box>
    </Menu>
  );
}
