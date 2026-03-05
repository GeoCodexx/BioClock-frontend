import {
  Box,
  Typography
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import { markAsRead } from "../../services/notificationService";

export default function NotificationItem({
  notification,
  refreshCount,
  reload
}) {

  const navigate = useNavigate();

  const handleClick = async () => {

    try {

      if (!notification.read) {
        await markAsRead(notification._id);
      }

      refreshCount();
      reload();

      navigate(`/${notification.module}`);

    } catch (error) {
      console.error(error);
    }

  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        p: 1.5,
        cursor: "pointer",
        bgcolor: notification.read
          ? "transparent"
          : "action.hover",
        "&:hover": {
          bgcolor: "action.selected"
        }
      }}
    >
      <Typography fontWeight={600} variant="body2">
        {notification.title}
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
      >
        {notification.message}
      </Typography>
    </Box>
  );
}