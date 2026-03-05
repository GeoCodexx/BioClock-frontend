import { useState, useEffect } from "react";
import {
  IconButton,
  Badge
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

import NotificationMenu from "./NotificationMenu";

import { getUnreadCount } from "../../services/notificationService";

export default function NotificationBell() {

  const [anchorEl, setAnchorEl] = useState(null);
  const [count, setCount] = useState(0);

  const open = Boolean(anchorEl);

  const fetchCount = async () => {
    try {
      const { data } = await getUnreadCount();
      setCount(data.count);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {

    fetchCount();

    const interval = setInterval(fetchCount, 30000);

    return () => clearInterval(interval);

  }, []);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleOpen}
      >
        <Badge
          badgeContent={count}
          color="error"
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <NotificationMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        refreshCount={fetchCount}
      />
    </>
  );
}