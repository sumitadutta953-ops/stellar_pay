import { describe, it, expect, beforeEach } from 'vitest';
import { useUiStore } from '@/store/uiStore';
import { parseTransactionError } from '@/utils/errorHandler';

// ── Integration: Toast + UI Store ─────────────────────────────────────────
describe('Toast integration (UiStore)', () => {
  beforeEach(() => {
    useUiStore.setState({ toasts: [], isSidebarOpen: false });
  });

  it('adds a toast via addToast', () => {
    const { addToast } = useUiStore.getState();
    addToast({ message: 'Payment sent!', type: 'success', duration: 4000 });

    const { toasts } = useUiStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Payment sent!');
    expect(toasts[0].type).toBe('success');
  });

  it('removes a toast via removeToast', () => {
    const { addToast, removeToast } = useUiStore.getState();
    addToast({ message: 'test', type: 'info', duration: 10000 });

    const { toasts } = useUiStore.getState();
    const id = toasts[0].id;
    removeToast(id);

    expect(useUiStore.getState().toasts).toHaveLength(0);
  });

  it('toggles sidebar open/closed', () => {
    const { toggleSidebar } = useUiStore.getState();
    expect(useUiStore.getState().isSidebarOpen).toBe(false);
    toggleSidebar();
    expect(useUiStore.getState().isSidebarOpen).toBe(true);
    toggleSidebar();
    expect(useUiStore.getState().isSidebarOpen).toBe(false);
  });

  it('closes sidebar with closeSidebar', () => {
    useUiStore.setState({ isSidebarOpen: true });
    useUiStore.getState().closeSidebar();
    expect(useUiStore.getState().isSidebarOpen).toBe(false);
  });
});

// ── Integration: Error Parser ──────────────────────────────────────────────
describe('Payment error parsing', () => {
  it('parses user rejected error', () => {
    const err = new Error('User rejected the request');
    const parsed = parseTransactionError(err);
    expect(parsed.message).toMatch(/cancelled/i);
    expect(parsed.type).toBe('wallet');
  });

  it('parses underfunded error from Horizon codes', () => {
    const err = {
      response: {
        data: {
          extras: {
            result_codes: {
              transaction: 'tx_failed',
              operations: ['op_underfunded'],
            },
          },
        },
      },
    };
    const parsed = parseTransactionError(err);
    expect(parsed.message).toMatch(/insufficient/i);
    expect(parsed.type).toBe('wallet');
  });

  it('parses no_destination error', () => {
    const err = {
      response: {
        data: {
          extras: {
            result_codes: {
              transaction: 'tx_failed',
              operations: ['op_no_destination'],
            },
          },
        },
      },
    };
    const parsed = parseTransactionError(err);
    expect(parsed.message).toMatch(/destination/i);
  });

  it('handles generic error', () => {
    const parsed = parseTransactionError(new Error('Something broke'));
    expect(parsed.message).toBe('Something broke');
    expect(parsed.type).toBe('unknown');
  });
});
