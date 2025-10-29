import toast from 'react-hot-toast';

// Cache para evitar mostrar el mismo mensaje múltiples veces
const toastCache = new Map<string, number>();
const TOAST_COOLDOWN = 3000; // 3 segundos de cooldown entre mensajes idénticos

/**
 * Muestra un toast success solo si no se ha mostrado recientemente
 */
export const showSuccessToast = (message: string, options?: any) => {
  const now = Date.now();
  const lastShown = toastCache.get(message);
  
  if (!lastShown || now - lastShown > TOAST_COOLDOWN) {
    toastCache.set(message, now);
    toast.success(message, options);
    
    // Limpiar del cache después del cooldown
    setTimeout(() => {
      toastCache.delete(message);
    }, TOAST_COOLDOWN);
  }
};

/**
 * Muestra un toast error solo si no se ha mostrado recientemente
 */
export const showErrorToast = (message: string, options?: any) => {
  const now = Date.now();
  const lastShown = toastCache.get(message);
  
  if (!lastShown || now - lastShown > TOAST_COOLDOWN) {
    toastCache.set(message, now);
    toast.error(message, options);
    
    // Limpiar del cache después del cooldown
    setTimeout(() => {
      toastCache.delete(message);
    }, TOAST_COOLDOWN);
  }
};

/**
 * Muestra un toast info solo si no se ha mostrado recientemente
 */
export const showInfoToast = (message: string, options?: any) => {
  const now = Date.now();
  const lastShown = toastCache.get(message);
  
  if (!lastShown || now - lastShown > TOAST_COOLDOWN) {
    toastCache.set(message, now);
    toast(message, options);
    
    // Limpiar del cache después del cooldown
    setTimeout(() => {
      toastCache.delete(message);
    }, TOAST_COOLDOWN);
  }
};

/**
 * Limpia el cache de toasts (útil al hacer logout)
 */
export const clearToastCache = () => {
  toastCache.clear();
};

