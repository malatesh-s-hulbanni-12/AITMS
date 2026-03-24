// AITMS/admin/src/utils/toastConfig.js
import { toast } from 'react-toastify';

export const toastConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
};

// Custom toast styles
export const showSuccess = (message) => {
  toast.success(message, {
    ...toastConfig,
    theme: "colored",
    icon: '🎉',
  });
};

export const showError = (message) => {
  toast.error(message, {
    ...toastConfig,
    theme: "colored",
  });
};

export const showInfo = (message) => {
  toast.info(message, {
    ...toastConfig,
    theme: "light",
  });
};

export const showWarning = (message) => {
  toast.warning(message, {
    ...toastConfig,
    theme: "colored",
  });
};

export const showLoading = (message) => {
  return toast.loading(message, {
    ...toastConfig,
  });
};