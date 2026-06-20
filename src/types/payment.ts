export interface PaymentRecord {
  sender: string;
  recipient: string;
  amount: string; // in XLM (formatted)
  amountRaw: string; // in stroops
  timestamp: number;
  memo: string;
}

export interface PaymentFormData {
  destination: string;
  amount: string;
  memo: string;
}

export interface PaymentStats {
  totalSent: string;
  paymentCount: number;
}
