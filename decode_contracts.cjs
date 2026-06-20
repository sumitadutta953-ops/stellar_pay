const { Horizon, rpc, Contract, Account, TransactionBuilder, Networks, xdr, StrKey, scValToNative } = require('stellar-sdk');

const horizonServer = new Horizon.Server("https://horizon-testnet.stellar.org");
const rpcServer = new rpc.Server("https://soroban-testnet.stellar.org");

async function run() {
  console.log("Fetching recent operations (paginating up to 1000)...");
  let records = [];
  let page = await horizonServer.operations().limit(200).order("desc").call();
  records = records.concat(page.records);
  
  for (let i = 0; i < 4; i++) {
    if (page.records.length === 0) break;
    page = await page.next();
    records = records.concat(page.records);
  }
  
  const invokeOps = records.filter(op => op.type === 'invoke_host_function');
  
  console.log(`Found ${invokeOps.length} contract calls out of ${records.length} operations. Analyzing contract IDs...`);
  
  const checkedContracts = new Set();
  
  for (const op of invokeOps) {
    if (!op.parameters || op.parameters.length === 0) continue;
    
    // First parameter is the contract address
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
      
      console.log(`Testing contract: ${contractId}`);
      
      // Try simulating increment or get_value
      const contract = new Contract(contractId);
      const dummy = new Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0");
      
      // Let's test get_value
      const tx = new TransactionBuilder(dummy, { fee: "100", networkPassphrase: Networks.TESTNET })
        .addOperation(contract.call("get_value"))
        .setTimeout(30)
        .build();
        
      const sim = await rpcServer.simulateTransaction(tx);
      if (rpc.Api.isSimulationSuccess(sim)) {
        console.log(`\n🎉 FOUND WORKING COUNTER CONTRACT: ${contractId}`);
        const nativeVal = scValToNative(sim.results[0].retval);
        console.log(`Current Value: ${nativeVal}`);
        
        // Write this contract ID to contract_id.txt so the app uses it
        require('fs').writeFileSync("d:\\stellar\\stellar-pay\\contract_id.txt", contractId);
        return;
      }
      
      // Let's also test 'increment' (just in case the function is named increment but get_value isn't there, or if simulation fails for get_value)
      const tx2 = new TransactionBuilder(dummy, { fee: "100", networkPassphrase: Networks.TESTNET })
        .addOperation(contract.call("increment"))
        .setTimeout(30)
        .build();
      const sim2 = await rpcServer.simulateTransaction(tx2);
      if (rpc.Api.isSimulationSuccess(sim2)) {
        console.log(`\n🎉 FOUND WORKING INCREMENT CONTRACT: ${contractId}`);
        require('fs').writeFileSync("d:\\stellar\\stellar-pay\\contract_id.txt", contractId);
        return;
      }
    } catch (e) {
      // Ignore errors for non-counter contracts
    }
  }
  
  console.log("No active counter contract found in the scanned operations.");
}

run().catch(console.error);
