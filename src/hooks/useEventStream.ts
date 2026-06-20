import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchContractEvents, getLatestLedger } from '@/services/eventService';
import type { ContractEvent } from '@/types/event';
import { EVENT_POLL_INTERVAL_MS } from '@/utils/constants';
import { logger } from '@/utils/logger';

/** Poll Soroban contract events at a fixed interval */
export function useEventStream(contractId: string, enabled = true) {
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startLedgerRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    if (!contractId || !enabled) return;
    try {
      const newEvents = await fetchContractEvents(contractId, startLedgerRef.current);
      if (newEvents.length > 0) {
        setEvents(prev => {
          const ids = new Set(prev.map(e => e.id));
          const fresh = newEvents.filter(e => !ids.has(e.id));
          if (fresh.length === 0) return prev;
          // Update cursor to newest ledger
          const maxLedger = Math.max(...fresh.map(e => e.ledger));
          if (maxLedger > startLedgerRef.current) {
            startLedgerRef.current = maxLedger + 1;
          }
          return [...fresh, ...prev].slice(0, 50);
        });
      }
      setError(null);
    } catch (err) {
      logger.warn('Event poll error:', err);
      setError('Event stream temporarily unavailable');
    }
  }, [contractId, enabled]);

  useEffect(() => {
    if (!contractId || !enabled) return;

    // Get starting ledger, then start polling
    getLatestLedger().then(ledger => {
      startLedgerRef.current = Math.max(0, ledger - 5);
      setIsListening(true);
      poll();
      intervalRef.current = setInterval(poll, EVENT_POLL_INTERVAL_MS);
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsListening(false);
    };
  }, [contractId, enabled, poll]);

  return { events, isListening, error };
}
