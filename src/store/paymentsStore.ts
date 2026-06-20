import { create } from 'zustand';
import type { PaymentRecord } from '@/types/payment';

interface PaymentsState {
  history: PaymentRecord[];
  isLoading: boolean;
  totalSent: string;
  paymentCount: number;
  setHistory: (history: PaymentRecord[]) => void;
  addPayment: (payment: PaymentRecord) => void;
  setTotalSent: (total: string) => void;
  setPaymentCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
}

export const usePaymentsStore = create<PaymentsState>(set => ({
  history: [],
  isLoading: false,
  totalSent: '0',
  paymentCount: 0,

  setHistory: history => set({ history }),
  addPayment: payment =>
    set(state => ({ history: [payment, ...state.history].slice(0, 50) })),
  setTotalSent: totalSent => set({ totalSent }),
  setPaymentCount: paymentCount => set({ paymentCount }),
  setLoading: isLoading => set({ isLoading }),
}));
