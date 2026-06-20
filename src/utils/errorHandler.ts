import { StellarPayError } from '@/types/error';

interface HorizonError {
  response?: {
    status?: number;
    data?: {
      detail?: string;
      extras?: {
        result_codes?: {
          transaction?: string;
          operations?: string[];
        };
      };
    };
  };
  message?: string;
}

/** Parse a Horizon/Soroban error into a user-friendly message */
export function parseTransactionError(err: unknown): StellarPayError {
  const e = err as HorizonError;

  if (e?.response?.data) {
    const data = e.response.data;
    const codes = data.extras?.result_codes;

    if (codes) {
      const txCode = codes.transaction ?? '';
      const opCodes = codes.operations ?? [];
      const combined = [txCode, ...opCodes].join(' ');

      if (combined.includes('underfunded') || combined.includes('insufficient_balance')) {
        return new StellarPayError(
          'Insufficient balance: Not enough XLM to cover this transaction and fees.',
          'wallet',
          txCode
        );
      }
      if (combined.includes('no_destination')) {
        return new StellarPayError(
          'Destination account does not exist. Please fund it first.',
          'network',
          txCode
        );
      }
    }

    if (data.detail) {
      return new StellarPayError(data.detail, 'network');
    }
  }

  const msg = e?.message ?? String(err);

  if (/user rejected|cancel|decline/i.test(msg)) {
    return new StellarPayError(
      'Transaction cancelled: You rejected the signing request.',
      'wallet'
    );
  }
  if (/account.*not.*exist|404/i.test(msg)) {
    return new StellarPayError(
      'Account not found on testnet. Please fund it via Friendbot.',
      'network'
    );
  }
  if (/MissingValue|Storage/i.test(msg)) {
    return new StellarPayError(
      'Contract state not initialised. Please ensure the contract is deployed.',
      'contract'
    );
  }

  return new StellarPayError(msg || 'An unexpected error occurred.', 'unknown');
}
