import * as StellarSdk from '@stellar/stellar-sdk';
import { SOROBAN_RPC_URL } from '@/utils/constants';
import type { ContractEvent } from '@/types/event';
import { logger } from '@/utils/logger';

/** Poll Soroban RPC for the latest contract events */
export async function fetchContractEvents(
  contractId: string,
  startLedger: number
): Promise<ContractEvent[]> {
  if (!contractId) return [];

  try {
    const rpc = new StellarSdk.rpc.Server(SOROBAN_RPC_URL);

    const response = await rpc.getEvents({
      startLedger,
      filters: [
        {
          type: 'contract',
          contractIds: [contractId],
        },
      ],
      limit: 20,
    });

    return (response.events ?? []).map((ev, idx) => ({
      id: `${ev.ledger}-${idx}`,
      type: ev.type,
      contractId: ev.contractId,
      topic: ev.topic.map(t => {
        try {
          return JSON.stringify(StellarSdk.scValToNative(t));
        } catch {
          return t.toXDR('base64');
        }
      }),
      value: (() => {
        try {
          return JSON.stringify(StellarSdk.scValToNative(ev.value));
        } catch {
          return ev.value.toXDR('base64');
        }
      })(),
      ledger: ev.ledger,
      timestamp: ev.ledgerClosedAt ? new Date(ev.ledgerClosedAt).getTime() / 1000 : Date.now() / 1000,
    }));
  } catch (err) {
    logger.warn('Event polling error:', err);
    return [];
  }
}

/** Get the latest ledger number (for initial event poll cursor) */
export async function getLatestLedger(): Promise<number> {
  try {
    const rpc = new StellarSdk.rpc.Server(SOROBAN_RPC_URL);
    const info = await rpc.getLatestLedger();
    return info.sequence;
  } catch {
    return 0;
  }
}
