import React from 'react';
import { usePaymentHistory } from '@/hooks/usePayments';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardHeader } from '@/components/Common/Card';
import { SkeletonLine } from '@/components/Common/Loading';
import { formatTimestamp, shortenAddress } from '@/utils/formatting';
import type { HorizonPayment } from '@/services/stellar';

function PaymentRow({ payment }: { payment: HorizonPayment }) {
  const isSent = payment.type === 'payment' && payment.source_account !== payment.to;
  const isCredit = payment.type === 'create_account';

  return (
    <tr className="border-b border-[rgba(123,97,255,0.06)] hover:bg-white/2 transition-colors">
      <td className="py-3 px-4">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isCredit
              ? 'bg-blue-500/10 text-blue-400'
              : isSent
              ? 'bg-[#E11D48]/10 text-[#E11D48]'
              : 'bg-[#10B981]/10 text-[#10B981]'
          }`}
        >
          {isCredit ? 'FUNDED' : isSent ? 'SENT' : 'RECV'}
        </span>
      </td>
      <td className="py-3 px-4 font-mono text-xs text-[#9CA3AF] hidden md:table-cell">
        {payment.to ? shortenAddress(payment.to) : '—'}
      </td>
      <td className="py-3 px-4 text-xs text-right font-mono font-semibold text-[#F9FAFB]">
        {payment.amount ? `${parseFloat(payment.amount).toFixed(4)} XLM` : '—'}
      </td>
      <td className="py-3 px-4 text-[10px] text-[#6B7280] text-right hidden sm:table-cell">
        {formatTimestamp(Math.floor(new Date(payment.created_at).getTime() / 1000))}
      </td>
      <td className="py-3 px-4 hidden lg:table-cell">
        <a
          href={`https://stellar.expert/explorer/testnet/tx/${payment.transaction_hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-[#7B61FF] hover:underline font-mono"
        >
          {payment.transaction_hash.slice(0, 12)}…
        </a>
      </td>
    </tr>
  );
}

export function PaymentHistory() {
  const { publicKey } = useWallet();
  const { data: payments, isLoading, error } = usePaymentHistory();

  return (
    <Card id="history">
      <CardHeader
        title="Recent Transactions"
        icon="◷"
        subtitle="Via Stellar Horizon"
        action={
          publicKey ? (
            <a
              href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-[#7B61FF] hover:underline"
            >
              View all ↗
            </a>
          ) : undefined
        }
      />

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map(i => (
              <SkeletonLine key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : !publicKey ? (
          <div className="p-8 text-center text-sm text-[#9CA3AF]">
            Connect wallet to see transactions
          </div>
        ) : error ? (
          <div className="p-5 text-xs text-[#E11D48] text-center">Failed to load transactions</div>
        ) : !payments?.length ? (
          <div className="p-8 text-center text-sm text-[#9CA3AF]">No transactions yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(123,97,255,0.08)]">
                <th className="text-left text-[10px] text-[#6B7280] uppercase tracking-wider px-4 py-2 font-semibold">
                  Type
                </th>
                <th className="text-left text-[10px] text-[#6B7280] uppercase tracking-wider px-4 py-2 font-semibold hidden md:table-cell">
                  To
                </th>
                <th className="text-right text-[10px] text-[#6B7280] uppercase tracking-wider px-4 py-2 font-semibold">
                  Amount
                </th>
                <th className="text-right text-[10px] text-[#6B7280] uppercase tracking-wider px-4 py-2 font-semibold hidden sm:table-cell">
                  Time
                </th>
                <th className="text-left text-[10px] text-[#6B7280] uppercase tracking-wider px-4 py-2 font-semibold hidden lg:table-cell">
                  TX Hash
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <PaymentRow key={p.id} payment={p} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}
