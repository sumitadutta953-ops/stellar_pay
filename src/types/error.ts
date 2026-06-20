export interface AppError {
  message: string;
  code?: string;
  type: 'network' | 'wallet' | 'contract' | 'validation' | 'unknown';
}

export class StellarPayError extends Error {
  public readonly code?: string;
  public readonly type: AppError['type'];

  constructor(message: string, type: AppError['type'] = 'unknown', code?: string) {
    super(message);
    this.name = 'StellarPayError';
    this.type = type;
    this.code = code;
  }
}
