const { rpc, xdr, StrKey, Address } = require('stellar-sdk');
const fs = require('fs');

const rpcServer = new rpc.Server("https://soroban-testnet.stellar.org");
const contractId = "CBEOJUP5FU6KKOEZ7RMTSKZ7YLBS5D6LVATIGCESOGXSZEQ2UWQFKZW6";

async function run() {
  console.log(`Recovering WASM for contract: ${contractId}...`);
  
  // 1. Build the ledger key for the contract instance
  const contractAddressScAddress = new Address(contractId).toScAddress();
  
  const ledgerKey = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: contractAddressScAddress,
      key: xdr.ScVal.scvLedgerKeyContractInstance(),
      durability: xdr.ContractDataDurability.persistent()
    })
  );
  
  // 2. Fetch the contract instance from the ledger
  const response = await rpcServer.getLedgerEntries(ledgerKey);
  if (!response.entries || response.entries.length === 0) {
    throw new Error("Contract instance ledger entry not found.");
  }
  
  const entry = response.entries[0];
  const ledgerEntryData = xdr.LedgerEntryData.fromXDR(entry.xdr, "base64");
  const contractData = ledgerEntryData.contractData();
  const val = contractData.val();
  
  // Parse the contract instance to extract the WASM hash
  const instance = val.instance();
  const executable = instance.executable();
  if (executable.arm() !== 'wasm') {
    throw new Error("Contract executable is not WebAssembly.");
  }
  
  const wasmHash = executable.wasm();
  const wasmHashHex = wasmHash.toString("hex");
  console.log(`Found WASM Hash: ${wasmHashHex}`);
  
  // 3. Build the ledger key for the WASM code entry
  const wasmLedgerKey = xdr.LedgerKey.contractCode(
    new xdr.LedgerKeyContractCode({
      hash: wasmHash
    })
  );
  
  // 4. Fetch the WASM bytecode from the ledger
  const wasmResponse = await rpcServer.getLedgerEntries(wasmLedgerKey);
  if (!wasmResponse.entries || wasmResponse.entries.length === 0) {
    throw new Error("WASM bytecode ledger entry not found.");
  }
  
  const wasmEntry = wasmResponse.entries[0];
  const wasmEntryData = xdr.LedgerEntryData.fromXDR(wasmEntry.xdr, "base64");
  const contractCode = wasmEntryData.contractCode();
  const code = contractCode.code();
  
  console.log(`Recovered WASM Bytecode: ${code.length} bytes.`);
  
  // 5. Save the bytecode as a local WASM file
  const outPath = "d:\\stellar\\stellar-pay\\counter.wasm";
  fs.writeFileSync(outPath, code);
  console.log(`Saved WASM bytecode to: ${outPath}`);
}

run().catch(console.error);
