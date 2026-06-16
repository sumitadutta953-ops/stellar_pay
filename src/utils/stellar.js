import * as StellarSdk from '@stellar/stellar-sdk';

export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

export const getHorizonServer = () => {
  return new StellarSdk.Horizon.Server(HORIZON_URL);
};

export const fetchXlmBalance = async (publicKey) => {
  const server = getHorizonServer();
  try {
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find(b => b.asset_type === "native");
    return nativeBalance ? nativeBalance.balance : "0";
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error("Account not funded yet — use Friendbot");
    }
    throw error;
  }
};

export const fundWithFriendbot = async (publicKey) => {
  try {
    const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
    if (!response.ok) {
      throw new Error("Friendbot funding failed");
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Network error while calling Friendbot");
  }
};
