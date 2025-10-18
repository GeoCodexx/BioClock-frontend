// components/GlobalSnackbar.jsx
import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import useSnackbarStore from '../store/useSnackbarStore';

const GlobalSnackbar = () => {
  const { open, message, severity, hideSnackbar } = useSnackbarStore();

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    hideSnackbar();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="standard"
        sx={{ width: '100%' }}
        elevation={6}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar;