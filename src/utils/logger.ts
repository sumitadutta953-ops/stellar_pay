const isDev = import.meta.env.DEV;

export const logger = {
  info: (...args: unknown[]) => isDev && console.info('[StellarPay]', ...args),
  warn: (...args: unknown[]) => isDev && console.warn('[StellarPay]', ...args),
  error: (...args: unknown[]) => console.error('[StellarPay]', ...args),
  debug: (...args: unknown[]) => isDev && console.debug('[StellarPay]', ...args),
};
