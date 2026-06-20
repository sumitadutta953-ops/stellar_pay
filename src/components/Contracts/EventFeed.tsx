import React from 'react';
import { useContractsStore } from '@/store/contractsStore';
import { useEventStream } from '@/hooks/useEventStream';
import { Card, CardHeader } from '@/components/Common/Card';
import { formatTimestamp } from '@/utils/formatting';

export function EventFeed() {
  const { counterContractId } = useContractsStore();
  const { events, isListening, error } = useEventStream(counterContractId, !!counterContractId);

  return (
    <Card id="events">
      <CardHeader
        title="Live Contract Events"
        icon="◉"
        subtitle={`Polling every 5s`}
        action={
          <div className="flex items-center gap-1.5">
            {isListening ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-[10px] text-[#10B981] font-bold">LIVE</span>
              </>
            ) : (
              <span className="text-[10px] text-[#9CA3AF]">IDLE</span>
            )}
          </div>
        }
      />

      <div className="p-4">
        {error && (
          <div className="mb-3 p-2.5 rounded-lg bg-amber-500/8 border border-amber-500/20 text-xs text-amber-400">
            {error}
          </div>
        )}

        {!counterContractId ? (
          <div className="text-center py-6 text-sm text-[#9CA3AF]">
            No contract ID configured
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <div className="w-8 h-8 rounded-full border-2 border-[#7B61FF]/30 border-t-[#7B61FF] animate-spin mx-auto" />
            <p className="text-xs text-[#9CA3AF]">Waiting for contract events…</p>
            <p className="text-[10px] text-[#6B7280]">
              Trigger an increment or decrement to see events appear
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {events.map(ev => (
              <div
                key={ev.id}
                className="rounded-xl border border-[rgba(123,97,255,0.1)] bg-black/20 p-3 space-y-1.5 animate-fadeIn"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#7B61FF] uppercase tracking-wider">
                    {ev.type}
                  </span>
                  <span className="text-[10px] text-[#6B7280]">{formatTimestamp(ev.timestamp)}</span>
                </div>
                {ev.topic.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {ev.topic.map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono bg-[#7B61FF]/10 text-[#7B61FF] px-1.5 py-0.5 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-[10px] font-mono text-[#9CA3AF] break-all">
                  {ev.value}
                </p>
                <p className="text-[9px] text-[#4B5563]">Ledger #{ev.ledger}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
