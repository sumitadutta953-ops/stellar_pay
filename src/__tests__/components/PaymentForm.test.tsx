import { describe, it, expect } from 'vitest';
import {
  isValidStellarAddress,
  validateAmount,
  validateMemo,
  validatePaymentForm,
} from '@/utils/validation';

describe('Validation Utils', () => {
  describe('isValidStellarAddress', () => {
    it('accepts a valid G-address of 56 chars', () => {
      expect(isValidStellarAddress('G' + 'A'.repeat(55))).toBe(true);
    });

    it('rejects an address not starting with G', () => {
      expect(isValidStellarAddress('S' + 'A'.repeat(55))).toBe(false);
    });

    it('rejects a short address', () => {
      expect(isValidStellarAddress('GABC')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(isValidStellarAddress('')).toBe(false);
    });
  });

  describe('validateAmount', () => {
    it('returns null for valid amount', () => {
      expect(validateAmount('10')).toBeNull();
    });

    it('returns error for zero amount', () => {
      expect(validateAmount('0')).not.toBeNull();
    });

    it('returns error for negative amount', () => {
      expect(validateAmount('-5')).not.toBeNull();
    });

    it('returns error for empty amount', () => {
      expect(validateAmount('')).not.toBeNull();
    });

    it('returns error for amount exceeding limit (10001 XLM > 10000 max)', () => {
      expect(validateAmount('10001')).not.toBeNull();
    });
  });

  describe('validateMemo', () => {
    it('returns null for empty memo', () => {
      expect(validateMemo('')).toBeNull();
    });

    it('returns null for memo within limit', () => {
      expect(validateMemo('hello world')).toBeNull();
    });

    it('returns error for memo exceeding 28 chars', () => {
      expect(validateMemo('this memo is definitely too long to fit')).not.toBeNull();
    });
  });

  describe('validatePaymentForm', () => {
    it('returns no errors for valid form data', () => {
      const errors = validatePaymentForm(
        'G' + 'A'.repeat(55),
        '10',
        'test payment'
      );
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('returns errors for invalid form data', () => {
      const errors = validatePaymentForm('bad-address', '-1', 'x'.repeat(30));
      expect(errors.destination).toBeDefined();
      expect(errors.amount).toBeDefined();
      expect(errors.memo).toBeDefined();
    });
  });
});
