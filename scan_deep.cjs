const { Horizon, rpc, Contract, Account, TransactionBuilder, Networks, xdr, StrKey, scValToNative } = require('stellar-sdk');

const horizonServer = new Horizon.Server("https://horizon-testnet.stellar.org");
const rpcServer = new rpc.Server("https://soroban-testnet.stellar.org");

async function run() {
  console.log("Starting deep scan of Testnet operations (up to 5000 operations)...");
  
  let checkedContracts = new Set();
  let page = await horizonServer.operations().limit(200).order("desc").call();
  let pageCount = 0;
  
  while (page && pageCount < 25) {
    pageCount++;
    console.log(`Scanning page ${pageCount}/25 (${page.records.length} operations)...`);
    
    const invokeOps = page.records.filter(op => op.type === 'invoke_host_function');
    
    for (const op of invokeOps) {
      if (!op.parameters || op.parameters.length === 0) continue;
      
      const firstParam = op.parameters[0];
      if (firstParam.type !== 'Address') continue;
      
      try {
        const scVal = xdr.ScVal.fromXDR(firstParam.value, "base64");
        const scAddress = scVal.address();
        
        let contractIdBytes;
        if (scAddress.arm() === 'contractId') {
          contractIdBytes = scAddress.contractId();
        } else {
          continue;
        }
        
        const contractId = StrKey.encodeContractId(contractIdBytes);
        if (checkedContracts.has(contractId)) continue;
        checkedContracts.add(contractId);
        
        // Test if this contract is a working counter contract
        const contract = new Contract(contractId);
        const dummy = new Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0");
        
        const tx = new TransactionBuilder(dummy, { fee: "1000", networkPassphrase: Networks.TESTNET })
          .addOperation(contract.call("get_value"))
          .setTimeout(30)
          .build();
          
        const sim = await rpcServer.simulateTransaction(tx);
        if (rpc.Api.isSimulationSuccess(sim)) {
          console.log(`\n🎉 FOUND WORKING COUNTER CONTRACT: ${contractId}`);
          const nativeVal = scValToNative(sim.results[0].retval);
          console.log(`Current Value: ${nativeVal}`);
          
          // Save this contract ID
          require('fs').writeFileSync("d:\\stellar\\stellar-pay\\contract_id.txt", contractId);
          console.log("Successfully wrote contract ID to contract_id.txt");
          return;
        }
        
        // Test increment simulation too
        const tx2 = new TransactionBuilder(dummy, { fee: "1000", networkPassphrase: Networks.TESTNET })
          .addOperation(contract.call("increment"))
          .setTimeout(30)
          .build();
        const sim2 = await rpcServer.simulateTransaction(tx2);
        if (rpc.Api.isSimulationSuccess(sim2)) {
          console.log(`\n🎉 FOUND WORKING INCREMENT CONTRACT: ${contractId}`);
          require('fs').writeFileSync("d:\\stellar\\stellar-pay\\contract_id.txt", contractId);
          console.log("Successfully wrote contract ID to contract_id.txt");
          return;
        }
      } catch (e) {
        // Ignore errors for non-counter contracts
      }
    }
    
    // Fetch next page
    if (page.records.length === 0) break;
    page = await page.next();
  }
  
  console.log("Deep scan complete. No working counter contract found in the scanned range.");
}

run().catch(console.error);
