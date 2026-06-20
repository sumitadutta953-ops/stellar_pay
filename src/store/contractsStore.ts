import { create } from 'zustand';
import type { ContractEvent } from '@/types/event';
import {
  COUNTER_CONTRACT_ID,
  PAYMENT_HUB_CONTRACT_ID,
  PAYMENT_VALIDATOR_CONTRACT_ID,
} from '@/utils/constants';
import { storageService, STORAGE_KEYS } from '@/services/storageService';

interface ContractsState {
  hubContractId: string;
  validatorContractId: string;
  counterContractId: string;
  events: ContractEvent[];
  counterValue: number | null;
  txState: 'idle' | 'loading' | 'success' | 'failure';
  txHash: string | null;
  txError: string | null;
  setHubContractId: (id: string) => void;
  setValidatorContractId: (id: string) => void;
  addEvent: (event: ContractEvent) => void;
  setEvents: (events: ContractEvent[]) => void;
  setCounterValue: (val: number | null) => void;
  setTxState: (state: 'idle' | 'loading' | 'success' | 'failure') => void;
  setTxHash: (hash: string | null) => void;
  setTxError: (err: string | null) => void;
  resetTx: () => void;
}

export const useContractsStore = create<ContractsState>(set => ({
  hubContractId: storageService.get(STORAGE_KEYS.CONTRACT_HUB_ID, PAYMENT_HUB_CONTRACT_ID),
  validatorContractId: storageService.get(
    STORAGE_KEYS.CONTRACT_VALIDATOR_ID,
    PAYMENT_VALIDATOR_CONTRACT_ID
  ),
  counterContractId: COUNTER_CONTRACT_ID,
  events: [],
  counterValue: null,
  txState: 'idle',
  txHash: null,
  txError: null,

  setHubContractId: id => {
    storageService.set(STORAGE_KEYS.CONTRACT_HUB_ID, id);
    set({ hubContractId: id });
  },

  setValidatorContractId: id => {
    storageService.set(STORAGE_KEYS.CONTRACT_VALIDATOR_ID, id);
    set({ validatorContractId: id });
  },

  addEvent: event =>
    set(state => ({ events: [event, ...state.events].slice(0, 50) })),

  setEvents: events => set({ events }),
  setCounterValue: counterValue => set({ counterValue }),
  setTxState: txState => set({ txState }),
  setTxHash: txHash => set({ txHash }),
  setTxError: txError => set({ txError }),
  resetTx: () => set({ txState: 'idle', txHash: null, txError: null }),
}));
