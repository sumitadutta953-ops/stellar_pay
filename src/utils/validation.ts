import { MAX_MEMO_LENGTH, MAX_PAYMENT_XLM } from './constants';

/** Validate a Stellar public key (G..., 56 chars) */
export function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z0-9]{55}$/.test(address.trim());
}

/** Validate a payment amount string */
export function validateAmount(amount: string): string | null {
  const n = parseFloat(amount);
  if (!amount || isNaN(n)) return 'Amount is required';
  if (n <= 0) return 'Amount must be greater than 0';
  if (n > MAX_PAYMENT_XLM) return `Amount cannot exceed ${MAX_PAYMENT_XLM.toLocaleString()} XLM`;
  return null;
}

/** Validate a memo string */
export function validateMemo(memo: string): string | null {
  if (memo && memo.length > MAX_MEMO_LENGTH)
    return `Memo cannot exceed ${MAX_MEMO_LENGTH} characters`;
  return null;
}

/** Validate a destination address */
export function validateDestination(address: string): string | null {
  if (!address) return 'Recipient address is required';
  if (!isValidStellarAddress(address)) return 'Invalid Stellar address (must start with G)';
  return null;
}

/** Validate full payment form — returns map of field → error */
export function validatePaymentForm(
  destination: string,
  amount: string,
  memo: string
): Record<string, string> {
  const errors: Record<string, string> = {};
  const destErr = validateDestination(destination);
  const amtErr = validateAmount(amount);
  const memoErr = validateMemo(memo);
  if (destErr) errors.destination = destErr;
  if (amtErr) errors.amount = amtErr;
  if (memoErr) errors.memo = memoErr;
  return errors;
}
