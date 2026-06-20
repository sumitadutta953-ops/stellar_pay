export interface ContractEvent {
  id: string;
  type: string;
  contractId: string;
  topic: string[];
  value: string;
  ledger: number;
  timestamp: number;
}
