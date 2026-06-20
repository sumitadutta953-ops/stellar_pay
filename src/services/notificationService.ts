import { useUiStore } from '@/store/uiStore';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export function showToast(message: string, type: ToastType = 'info', duration = 4000): void {
  // Access Zustand store outside React via getState()
  useUiStore.getState().addToast({ message, type, duration });
}
