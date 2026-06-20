import { describe, it, expect, beforeEach } from 'vitest';
import { useWalletStore } from '@/store/walletStore';

describe('useWalletStore', () => {
  beforeEach(() => {
    useWalletStore.setState({
      address: null,
      balance: '0',
      isConnected: false,
      isDemoMode: false,
      isLoading: false,
      error: null,
    });
  });

  it('starts with disconnected state', () => {
    const state = useWalletStore.getState();
    expect(state.isConnected).toBe(false);
    expect(state.address).toBeNull();
    expect(state.balance).toBe('0');
  });

  it('connects wallet with setWallet', () => {
    const { setWallet } = useWalletStore.getState();
    setWallet('GABC123...', '5000.0000000');

    const state = useWalletStore.getState();
    expect(state.isConnected).toBe(true);
    expect(state.address).toBe('GABC123...');
    expect(state.balance).toBe('5000.0000000');
    expect(state.isDemoMode).toBe(false);
  });

  it('connects in demo mode', () => {
    const { setWallet } = useWalletStore.getState();
    setWallet('GDEMO...', '10000.0000000', true);

    const state = useWalletStore.getState();
    expect(state.isDemoMode).toBe(true);
    expect(state.isConnected).toBe(true);
  });

  it('updates balance with setBalance', () => {
    const { setWallet, setBalance } = useWalletStore.getState();
    setWallet('GABC...', '100.0000000');
    setBalance('200.0000000');

    expect(useWalletStore.getState().balance).toBe('200.0000000');
  });

  it('disconnects wallet', () => {
    const { setWallet, disconnect } = useWalletStore.getState();
    setWallet('GABC...', '100.0000000');
    disconnect();

    const state = useWalletStore.getState();
    expect(state.isConnected).toBe(false);
    expect(state.address).toBeNull();
    expect(state.balance).toBe('0');
  });

  it('sets and clears error', () => {
    const { setError } = useWalletStore.getState();
    setError('Something went wrong');
    expect(useWalletStore.getState().error).toBe('Something went wrong');

    setError(null);
    expect(useWalletStore.getState().error).toBeNull();
  });

  it('sets loading state', () => {
    const { setLoading } = useWalletStore.getState();
    setLoading(true);
    expect(useWalletStore.getState().isLoading).toBe(true);
    setLoading(false);
    expect(useWalletStore.getState().isLoading).toBe(false);
  });
});
