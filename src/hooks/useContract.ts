import { useQuery } from '@tanstack/react-query';
import { readContractValue } from '@/services/contractService';
import { logger } from '@/utils/logger';

/**
 * Hook to query and monitor on-chain smart contract state via Soroban simulation.
 * Utilizes TanStack Query for cache invalidation and updates state automatically
 * every 10 seconds.
 * 
 * @param contractId - The contract ID address (C...)
 * @param functionName - The contract read method to call
 * @param enabled - Condition toggle to enable or disable querying
 */
export function useContractRead(contractId: string, functionName: string, enabled = true) {
  return useQuery({
    queryKey: ['contract', contractId, functionName],
    queryFn: async () => {
      if (!contractId) return null;
      try {
        const val = await readContractValue(contractId, functionName);
        return val;
      } catch (err) {
        logger.warn(`Contract read failed [${functionName}]:`, err);
        return null;
      }
    },
    enabled: enabled && !!contractId,
    staleTime: 1000 * 10, // 10 seconds
    refetchInterval: 1000 * 10,
  });
}
