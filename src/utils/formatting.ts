import { STROOP_PER_XLM } from './constants';

/** Format a stroop amount (i128 string) to XLM with 7 decimal places */
export function stroopsToXlm(stroops: string | number | bigint): string {
  const n = typeof stroops === 'bigint' ? Number(stroops) : Number(stroops);
  return (n / STROOP_PER_XLM).toFixed(7);
}

/** Format XLM balance for display (e.g. "9,799.9999900") */
export function formatXlm(xlm: string | number): string {
  const n = Number(xlm);
  if (isNaN(n)) return '0.0000000';
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 7,
    maximumFractionDigits: 7,
  });
}

/** Shorten a Stellar address for display (e.g. "GBLFQ...JZT70") */
export function shortenAddress(address: string, chars = 5): string {
  if (!address || address.length < chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/** Format a Unix timestamp to a readable date string */
export function formatTimestamp(ts: number): string {
  if (!ts) return '—';
  return new Date(ts * 1000).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Convert XLM string to stroops string (for contract calls) */
export function xlmToStroops(xlm: string): string {
  const n = parseFloat(xlm);
  if (isNaN(n)) return '0';
  return Math.round(n * STROOP_PER_XLM).toString();
}
