import { useState, useEffect, memo } from "react";
import { Fab, useTheme, useMediaQuery, Zoom } from "@mui/material";
import { KeyboardArrowUp as KeyboardArrowUpIcon } from "@mui/icons-material";

const ScrollToTopButton = memo(({ showAfter = 300 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > showAfter) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, [showAfter]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Solo mostrar en dispositivos móviles/tablet
  if (!isMobile) return null;

  return (
    <Zoom in={isVisible}>
      <Fab
        onClick={scrollToTop}
        size="medium"
        aria-label="scroll back to top"
        sx={{
          position: "fixed",
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: 1000,
          bgcolor: theme.palette.mode === "dark" 
            ? "background.paper" 
            : "primary.main",
          color: theme.palette.mode === "dark" 
            ? "primary.main" 
            : "primary.contrastText",
          boxShadow: theme.palette.mode === "dark"
            ? "0 4px 12px rgba(0, 0, 0, 0.4)"
            : "0 4px 12px rgba(0, 0, 0, 0.15)",
          border: theme.palette.mode === "dark" 
            ? `1px solid ${theme.palette.divider}` 
            : "none",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            bgcolor: theme.palette.mode === "dark"
              ? "background.default"
              : "primary.dark",
            transform: "translateY(-4px)",
            boxShadow: theme.palette.mode === "dark"
              ? "0 8px 20px rgba(0, 0, 0, 0.5)"
              : "0 8px 20px rgba(0, 0, 0, 0.25)",
          },
          "&:active": {
            transform: "translateY(-2px)",
          },
        }}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Zoom>
  );
});

ScrollToTopButton.displayName = "ScrollToTopButton";

export default ScrollToTopButton;