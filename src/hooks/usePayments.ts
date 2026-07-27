import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRecentPayments } from '@/services/stellar';
import { useWalletStore } from '@/store/walletStore';
import { useTransaction } from './useTransaction';
import { useWallet } from './useWallet';
import type { PaymentFormData } from '@/types/payment';
import { validatePaymentForm } from '@/utils/validation';
import { showToast } from '@/services/notificationService';

/**
 * Hook to retrieve and cache recent Horizon payment operations for the active wallet address.
 * Integrates TanStack Query for cache synchronization.
 */
export function usePaymentHistory() {
  const { address } = useWalletStore();

  return useQuery({
    queryKey: ['payments', address],
    queryFn: () => getRecentPayments(address!, 20),
    enabled: !!address,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to handle submitting payments. 
 * Performs frontend validation, requests Freighter signature, submits to Horizon,
 * and invalidates payments cache upon success.
 */
export function useSendPayment() {
  const queryClient = useQueryClient();
  const { publicKey, signTx, refreshBalance } = useWallet();
  const { sendTransaction } = useTransaction();

  return useMutation({
    mutationFn: async (data: PaymentFormData) => {
      const errors = validatePaymentForm(data.destination, data.amount, data.memo);
      if (Object.keys(errors).length > 0) {
        throw new Error(Object.values(errors)[0]);
      }

      if (!publicKey) throw new Error('Wallet not connected');

      await sendTransaction(
        publicKey,
        data.destination,
        data.amount,
        data.memo,
        signTx,
        async () => {
          await refreshBalance(publicKey);
          await queryClient.invalidateQueries({ queryKey: ['payments'] });
        }
      );
    },
    onError: (err: Error) => {
      showToast(err.message, 'error');
    },
  });
}
