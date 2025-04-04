import { toast } from 'react-toastify';

/**
 * Custom hook for toast notifications with consistent configuration
 * 
 * This hook provides methods for different types of toast notifications
 * with standardized configuration to prevent duplicate toasts.
 */
const useToastConfig = () => {
  // Default configuration to prevent duplicate toasts
  const defaultConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  };
  
  // Helper to check if a toast is currently active and dismiss it
  const dismissDuplicateToasts = (id) => {
    // Check if a toast with this ID is active and dismiss it
    if (toast.isActive(id)) {
      toast.dismiss(id);
    }
  };

  // Success toast
  const success = (message) => {
    if (!message) return;
    // Generate a unique ID based on the message to prevent duplicates
    const id = `success-${message.replace(/\s+/g, '-').toLowerCase()}`;
    dismissDuplicateToasts(id);
    return toast.success(message, {
      ...defaultConfig,
      toastId: id,
    });
  };

  // Error toast
  const error = (message) => {
    if (!message) return;
    const id = `error-${message.replace(/\s+/g, '-').toLowerCase()}`;
    dismissDuplicateToasts(id);
    return toast.error(message, {
      ...defaultConfig,
      toastId: id,
    });
  };

  // Warning toast
  const warning = (message) => {
    if (!message) return;
    const id = `warning-${message.replace(/\s+/g, '-').toLowerCase()}`;
    dismissDuplicateToasts(id);
    return toast.warning(message, {
      ...defaultConfig,
      toastId: id,
    });
  };

  // Info toast
  const info = (message) => {
    if (!message) return;
    const id = `info-${message.replace(/\s+/g, '-').toLowerCase()}`;
    dismissDuplicateToasts(id);
    return toast.info(message, {
      ...defaultConfig,
      toastId: id,
    });
  };

  // Clear all toasts
  const clearAll = () => {
    toast.dismiss();
  };

  return {
    success,
    error,
    warning,
    info,
    clearAll
  };
};

export default useToastConfig; 