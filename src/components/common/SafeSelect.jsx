import { useState, useCallback } from "react";
import { Select } from "@mui/material";

export const SafeSelect = ({ MenuProps = {}, ...props }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [allowHover, setAllowHover] = useState(false);

  const handleOpen = useCallback(() => {
    setMenuOpen(true);
    setAllowHover(false);
    setTimeout(() => setAllowHover(true), 150);
  }, []);

  const handleClose = useCallback(() => {
    setMenuOpen(false);
    setAllowHover(false);
  }, []);

  const mergedMenuProps = {
    disableScrollLock: true,
    disableAutoFocusItem: true,
    autoFocus: false,
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "left",
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "left",
    },
    ...MenuProps,
    PaperProps: {
      ...MenuProps.PaperProps,
      style: {
        maxHeight: "min(300px, 40vh)",
        pointerEvents: allowHover ? "auto" : "none",
        ...MenuProps.PaperProps?.style,
      },
    },
    MenuListProps: {
      ...MenuProps.MenuListProps,
      sx: {
        "& .MuiMenuItem-root": {
          pointerEvents: allowHover ? "auto" : "none",
        },
        ...MenuProps.MenuListProps?.sx,
      },
    },
  };

  return (
    <Select
      {...props}
      open={menuOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      MenuProps={mergedMenuProps}
    />
  );
};
