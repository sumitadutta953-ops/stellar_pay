export interface ContractConfig {
  hubContractId: string;
  validatorContractId: string;
  counterContractId: string;
}

export type TxState = 'idle' | 'loading' | 'success' | 'failure';

export interface ContractCallResult {
  hash: string;
  status: TxState;
}
