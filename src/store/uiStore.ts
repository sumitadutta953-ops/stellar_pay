import { create } from 'zustand';
import type { ToastType } from '@/services/notificationService';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface UiState {
  toasts: Toast[];
  isSidebarOpen: boolean;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const useUiStore = create<UiState>(set => ({
  toasts: [],
  isSidebarOpen: false,

  addToast: toast => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    set(state => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, toast.duration);
  },

  removeToast: id =>
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),

  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
}));
