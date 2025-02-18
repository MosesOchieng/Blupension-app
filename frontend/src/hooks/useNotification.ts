import { create } from 'zustand';

interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
  showNotification: (message: string, type: 'success' | 'error') => void;
  hideNotification: () => void;
}

export const useNotification = create<NotificationState>((set) => ({
  show: false,
  message: '',
  type: 'success',
  showNotification: (message, type) => {
    set({ show: true, message, type });
    setTimeout(() => {
      set({ show: false });
    }, 5000);
  },
  hideNotification: () => set({ show: false }),
})); 