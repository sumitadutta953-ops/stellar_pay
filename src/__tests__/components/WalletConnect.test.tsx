import { describe, it, expect } from 'vitest';
import { formatXlm, shortenAddress, stroopsToXlm, xlmToStroops } from '@/utils/formatting';

describe('Formatting Utils', () => {
  describe('formatXlm', () => {
    it('formats a number to 7 decimal places', () => {
      expect(formatXlm(9799.9999900)).toContain('9,799');
    });

    it('handles zero', () => {
      expect(formatXlm(0)).toBe('0.0000000');
    });

    it('handles string input', () => {
      expect(formatXlm('100')).toContain('100');
    });
  });

  describe('shortenAddress', () => {
    const addr = 'GBLFQYMLXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX7Q';

    it('shortens address with default chars', () => {
      const shortened = shortenAddress(addr);
      expect(shortened).toContain('...');
      expect(shortened.length).toBeLessThan(addr.length);
    });

    it('returns original if short', () => {
      expect(shortenAddress('GABC', 5)).toBe('GABC');
    });
  });

  describe('stroopsToXlm', () => {
    it('converts 10000000 stroops to 1 XLM', () => {
      expect(parseFloat(stroopsToXlm(10_000_000))).toBeCloseTo(1, 5);
    });

    it('handles bigint input', () => {
      expect(parseFloat(stroopsToXlm(BigInt(10_000_000)))).toBeCloseTo(1, 5);
    });
  });

  describe('xlmToStroops', () => {
    it('converts 1 XLM to 10000000 stroops', () => {
      expect(xlmToStroops('1')).toBe('10000000');
    });

    it('handles invalid input', () => {
      expect(xlmToStroops('abc')).toBe('0');
    });
  });
});
