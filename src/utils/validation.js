import * as StellarSdk from '@stellar/stellar-sdk';

export const validateDestinationAddress = (address) => {
  if (!address) {
    return "Destination address is required";
  }
  try {
    if (StellarSdk.StrKey.isValidEd25519PublicKey(address)) {
      return null;
    }
  } catch (e) {
    // Ignore error and fall through to return error message
  }
  return "Invalid destination address";
};

export const validateAmount = (amountStr, balance) => {
  if (!amountStr) {
    return "Amount is required";
  }
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return "Amount must be a positive number greater than 0";
  }
  if (balance !== null && balance !== undefined) {
    const currentBalance = parseFloat(balance);
    if (amount > currentBalance) {
      return `Insufficient balance. You have ${parseFloat(balance).toFixed(7)} XLM`;
    }
  }
  return null;
};

export const validateMemo = (memo) => {
  if (memo && memo.length > 28) {
    return "Memo cannot exceed 28 characters";
  }
  return null;
};
