// components/SafeTablePagination.jsx
import React, { useState, useCallback } from 'react';
import { TablePagination } from '@mui/material';

export const SafeTablePagination = ({ SelectProps = {}, ...props }) => {
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

  const mergedSelectProps = {
    ...SelectProps,
    open: menuOpen,
    onOpen: handleOpen,
    onClose: handleClose,
    MenuProps: {
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
      ...SelectProps.MenuProps,
      PaperProps: {
        ...SelectProps.MenuProps?.PaperProps,
        style: {
          maxHeight: "min(300px, 40vh)",
          pointerEvents: allowHover ? 'auto' : 'none',
          ...SelectProps.MenuProps?.PaperProps?.style,
        },
      },
      MenuListProps: {
        ...SelectProps.MenuProps?.MenuListProps,
        sx: {
          "& .MuiMenuItem-root": {
            pointerEvents: allowHover ? 'auto' : 'none',
          },
          ...SelectProps.MenuProps?.MenuListProps?.sx,
        },
      },
    },
  };

  return <TablePagination {...props} SelectProps={mergedSelectProps} />;
};