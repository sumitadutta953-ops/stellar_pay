import { useQuery } from '@tanstack/react-query';
import { readContractValue } from '@/services/contractService';
import { logger } from '@/utils/logger';

/** Read a contract value via simulation. Auto-refetches every 10s. */
export function useContractRead(
  contractId: string,
  functionName: string,
  enabled = true
) {
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
