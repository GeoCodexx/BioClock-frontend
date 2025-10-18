// stores/useSnackbarStore.js
import { create } from 'zustand';

const useSnackbarStore = create((set) => ({
  open: false,
  message: '',
  severity: 'success', // 'success' | 'error' | 'warning' | 'info'
  
  showSnackbar: (message, severity = 'success') => {
    set({
      open: true,
      message,
      severity,
    });
  },
  
  hideSnackbar: () => {
    set({ open: false });
  },
  
  // Métodos de atajo para cada tipo
  showSuccess: (message) => {
    set({
      open: true,
      message,
      severity: 'success',
    });
  },
  
  showError: (message) => {
    set({
      open: true,
      message,
      severity: 'error',
    });
  },
  
  showWarning: (message) => {
    set({
      open: true,
      message,
      severity: 'warning',
    });
  },
  
  showInfo: (message) => {
    set({
      open: true,
      message,
      severity: 'info',
    });
  },
}));

export default useSnackbarStore;