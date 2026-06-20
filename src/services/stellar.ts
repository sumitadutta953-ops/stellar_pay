import * as StellarSdk from '@stellar/stellar-sdk';
import { HORIZON_URL, NETWORK_PASSPHRASE } from '@/utils/constants';
import { logger } from '@/utils/logger';

export function getServer(): StellarSdk.Horizon.Server {
  return new StellarSdk.Horizon.Server(HORIZON_URL);
}

export async function loadAccount(publicKey: string): Promise<StellarSdk.Horizon.AccountResponse> {
  const server = getServer();
  return server.loadAccount(publicKey);
}

export async function getXlmBalance(publicKey: string): Promise<string> {
  const account = await loadAccount(publicKey);
  const native = account.balances.find(b => b.asset_type === 'native');
  return native?.balance ?? '0';
}

export interface HorizonPayment {
  id: string;
  type: string;
  source_account: string;
  to?: string;
  from?: string;
  amount?: string;
  asset_type?: string;
  created_at: string;
  transaction_hash: string;
  memo?: string;
}

export async function getRecentPayments(publicKey: string, limit = 15): Promise<HorizonPayment[]> {
  try {
    const server = getServer();
    const payments = await server
      .payments()
      .forAccount(publicKey)
      .order('desc')
      .limit(limit)
      .call();
    return payments.records as unknown as HorizonPayment[];
  } catch (err) {
    logger.error('Failed to fetch payments', err);
    return [];
  }
}

export function buildPaymentTransaction(
  sourceAccount: StellarSdk.Horizon.AccountResponse,
  destination: string,
  amount: string,
  memo?: string
): StellarSdk.Transaction {
  const builder = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  }).addOperation(
    StellarSdk.Operation.payment({
      destination,
      asset: StellarSdk.Asset.native(),
      amount,
    })
  );

  if (memo && memo.trim()) {
    builder.addMemo(StellarSdk.Memo.text(memo.trim()));
  }

  return builder.setTimeout(300).build();
}

export async function submitSignedTransaction(
  signedXdr: string
): Promise<StellarSdk.Horizon.HorizonApi.SubmitTransactionResponse> {
  const server = getServer();
  const tx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  return server.submitTransaction(tx);
}
