const { rpc, Contract, Account, TransactionBuilder, Networks, scValToNative } = require('stellar-sdk');

const rpcServer = new rpc.Server("https://soroban-testnet.stellar.org");

async function run() {
  console.log("Querying Stellar Expert for recently deployed contracts...");
  
  const response = await fetch("https://api.stellar.expert/api/v1/testnet/contracts?limit=100");
  if (!response.ok) {
    throw new Error(`Failed to fetch contracts: ${response.statusText}`);
  }
  
  const data = await response.json();
  const contracts = data._embedded.records;
  
  console.log(`Analyzing ${contracts.length} recently deployed contracts...`);
  
  const dummy = new Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0");
  
  for (const c of contracts) {
    const contractId = c.address;
    console.log(`Checking contract: ${contractId}`);
    
    try {
      const contract = new Contract(contractId);
      
      // Test get_value
      const tx = new TransactionBuilder(dummy, { fee: "1000", networkPassphrase: Networks.TESTNET })
        .addOperation(contract.call("get_value"))
        .setTimeout(30)
        .build();
        
      const sim = await rpcServer.simulateTransaction(tx);
      if (rpc.Api.isSimulationSuccess(sim)) {
        console.log(`\n🎉 FOUND ACTIVE COUNTER CONTRACT: ${contractId}`);
        const val = scValToNative(sim.results[0].retval);
        console.log(`Current Value: ${val}`);
        
        // Write it
        require('fs').writeFileSync("d:\\stellar\\stellar-pay\\contract_id.txt", contractId);
        return;
      }
      
      // Test increment
      const tx2 = new TransactionBuilder(dummy, { fee: "1000", networkPassphrase: Networks.TESTNET })
        .addOperation(contract.call("increment"))
        .setTimeout(30)
        .build();
        
      const sim2 = await rpcServer.simulateTransaction(tx2);
      if (rpc.Api.isSimulationSuccess(sim2)) {
        console.log(`\n🎉 FOUND ACTIVE INCREMENT CONTRACT: ${contractId}`);
        require('fs').writeFileSync("d:\\stellar\\stellar-pay\\contract_id.txt", contractId);
        return;
      }
    } catch (err) {
      // Not a counter contract
    }
  }
  
  console.log("Could not find any active counter contract from Stellar Expert list.");
}

run().catch(console.error);
