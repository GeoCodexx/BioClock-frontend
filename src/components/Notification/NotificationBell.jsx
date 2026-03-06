// NotificationBell.jsx
import { useState, useEffect } from "react";
import { IconButton, Badge, Tooltip } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationMenu from "./NotificationMenu";
import { getUnreadCount } from "../../services/notificationService";

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [count, setCount] = useState(0);
  const [prevCount, setPrevCount] = useState(0);
  const [ringing, setRinging] = useState(false);

  const open = Boolean(anchorEl);

  const fetchCount = async () => {
    try {
      const { data } = await getUnreadCount();
      const newCount = data.count;

      if (newCount > prevCount) {
        setRinging(true);
        setTimeout(() => setRinging(false), 700);
      }

      setPrevCount(newCount);
      setCount(newCount);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <style>{`
        @keyframes bellRing {
          0%   { transform: rotate(0deg); }
          15%  { transform: rotate(18deg); }
          30%  { transform: rotate(-16deg); }
          45%  { transform: rotate(12deg); }
          60%  { transform: rotate(-8deg); }
          75%  { transform: rotate(4deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes pulse {
          0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          70%  { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
        .bell-icon {
          transition: color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bell-ringing .bell-icon {
          animation: bellRing 0.7s ease-in-out;
        }
        .notification-btn {
          position: relative;
          border-radius: 12px !important;
          transition: background 0.2s, transform 0.15s !important;
        }
        .notification-btn:hover {
          transform: translateY(-1px);
        }
        .notification-btn:active {
          transform: translateY(0px);
        }
      `}</style>

      <Tooltip
        title={count > 0 ? `${count} notificación${count !== 1 ? "es" : ""} sin leer` : "Notificaciones"}
        placement="bottom"
        arrow
      >
        <IconButton
          color="inherit"
          onClick={handleOpen}
          className={`notification-btn ${ringing ? "bell-ringing" : ""}`}
          sx={{
            borderRadius: "12px",
            p: 1,
            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
          }}
        >
          <Badge
            badgeContent={count}
            color="error"
            max={99}
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.65rem",
                fontWeight: 700,
                minWidth: 18,
                height: 18,
                padding: "0 4px",
                animation: count > 0 ? "pulse 2s infinite" : "none",
                border: "2px solid",
                borderColor: "primary.main",
              },
            }}
          >
            <span className="bell-icon">
              <NotificationsIcon
                sx={{
                  fontSize: 22,
                  color: open ? "primary.light" : "inherit",
                  transition: "color 0.2s",
                }}
              />
            </span>
          </Badge>
        </IconButton>
      </Tooltip>

      <NotificationMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        refreshCount={fetchCount}
        unreadCount={count}
      />
    </>
  );
}