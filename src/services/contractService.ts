import * as StellarSdk from '@stellar/stellar-sdk';
import { SOROBAN_RPC_URL, NETWORK_PASSPHRASE } from '@/utils/constants';
import { logger } from '@/utils/logger';

export function getRpcServer(): StellarSdk.rpc.Server {
  return new StellarSdk.rpc.Server(SOROBAN_RPC_URL);
}

/** Simulate + assemble + sign + submit a Soroban contract call */
export async function invokeContractFunction(
  senderPublicKey: string,
  contractId: string,
  functionName: string,
  args: StellarSdk.xdr.ScVal[],
  signTxFn: (xdr: string) => Promise<string>
): Promise<string> {
  const rpc = getRpcServer();
  const contract = new StellarSdk.Contract(contractId);

  // Load account
  const account = await rpc.getAccount(senderPublicKey);

  // Build transaction
  let tx = new StellarSdk.TransactionBuilder(account, {
    fee: '10000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(functionName, ...args))
    .setTimeout(300)
    .build();

  // Simulate
  const simResult = await rpc.simulateTransaction(tx);
  if (!StellarSdk.rpc.Api.isSimulationSuccess(simResult)) {
    const simError =
      (simResult as StellarSdk.rpc.Api.SimulateTransactionErrorResponse).error ??
      'Simulation failed';
    throw new Error(simError);
  }

  tx = StellarSdk.rpc.assembleTransaction(tx, simResult).build();

  // Sign
  const signedXdr = await signTxFn(tx.toXDR());
  if (!signedXdr) throw new Error('User rejected: signing cancelled');

  // Submit
  const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const submitResult = await rpc.sendTransaction(signedTx);

  if (submitResult.status === 'ERROR') {
    throw new Error(submitResult.errorResultXdr ?? 'Submission failed');
  }

  // Poll
  let txResult = submitResult;
  let attempts = 0;
  while (
    (txResult.status === 'PENDING' || txResult.status === 'NOT_FOUND') &&
    attempts < 30
  ) {
    await new Promise(r => setTimeout(r, 1000));
    txResult = await rpc.getTransaction(submitResult.hash);
    attempts++;
  }

  if (txResult.status !== 'SUCCESS') {
    throw new Error((txResult as { errorResultXdr?: string }).errorResultXdr ?? 'TX failed');
  }

  logger.info('Contract call succeeded:', submitResult.hash);
  return submitResult.hash;
}

/** Read contract state via simulation (no signature needed) */
export async function readContractValue(
  contractId: string,
  functionName: string,
  args: StellarSdk.xdr.ScVal[] = []
): Promise<StellarSdk.xdr.ScVal | null> {
  const rpc = getRpcServer();
  const contract = new StellarSdk.Contract(contractId);
  const dummyAccount = new StellarSdk.Account(
    'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
    '0'
  );

  const tx = new StellarSdk.TransactionBuilder(dummyAccount, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(functionName, ...args))
    .setTimeout(30)
    .build();

  const simResult = await rpc.simulateTransaction(tx);

  if (StellarSdk.rpc.Api.isSimulationSuccess(simResult)) {
    return simResult.result?.retval ?? null;
  }

  const simError =
    (simResult as StellarSdk.rpc.Api.SimulateTransactionErrorResponse).error ?? '';
  if (simError.includes('MissingValue') || simError.includes('Storage')) {
    return null;
  }

  throw new Error(simError || 'Simulation failed');
}
