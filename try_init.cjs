const { rpc, Contract, Account, TransactionBuilder, Networks, Keypair } = require('stellar-sdk');

const rpcServer = new rpc.Server("https://soroban-testnet.stellar.org");
const contract = new Contract("CBEOJUP5FU6KKOEZ7RMTSKZ7YLBS5D6LVATIGCESOGXSZEQ2UWQFKZW6");

// Create a new random keypair for signing and fund it
const kp = Keypair.random();

async function run() {
  console.log("Funding temporary keypair...");
  await fetch(`https://friendbot.stellar.org?addr=${kp.publicKey()}`);
  console.log(`Funded: ${kp.publicKey()}`);
  
  const sourceAccount = await rpcServer.getAccount(kp.publicKey());
  
  const methods = ["initialize", "init"];
  
  for (const method of methods) {
    console.log(`Testing simulation for method: ${method}...`);
    try {
      let tx = new TransactionBuilder(sourceAccount, {
        fee: "10000",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(contract.call(method))
        .setTimeout(300)
        .build();
        
      const sim = await rpcServer.simulateTransaction(tx);
      if (rpc.Api.isSimulationSuccess(sim)) {
        console.log(`\n🎉 Simulation SUCCESS for method: ${method}! Submitting transaction...`);
        tx = rpc.assembleTransaction(tx, sim).build();
        tx.sign(kp);
        const submitResult = await rpcServer.sendTransaction(tx);
        console.log("Submit result status:", submitResult.status);
        
        let txResult = submitResult;
        let attempts = 0;
        while (txResult.status === "PENDING" && attempts < 15) {
          await new Promise(r => setTimeout(r, 1000));
          txResult = await rpcServer.getTransaction(submitResult.hash);
          attempts++;
        }
        
        if (txResult.status === "SUCCESS") {
          console.log(`\n🎉 CONTRACT INITIALIZED SUCCESSFULLY VIA: ${method}`);
          return;
        } else {
          console.log("Transaction failed:", txResult);
        }
      } else {
        console.log(`Simulation failed for ${method}:`, sim.error || "Unknown simulation error");
      }
    } catch (err) {
      console.error(`Error during method ${method}:`, err.message);
    }
  }
  
  console.log("All common initialization methods failed.");
}

run().catch(console.error);
