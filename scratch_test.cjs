const StellarSdk = require('@stellar/stellar-sdk');

async function testFrontendLogic() {
  const rpcServer = new StellarSdk.rpc.Server("https://soroban-testnet.stellar.org");
  const contractId = "CANKOB2VLLLRDXYBDRMCUM754QIDGW2Y27FUHC26PLKJQ5PYTZSFIE3P";
  
  // Create a random account and fund it for the test
  const kp = StellarSdk.Keypair.random();
  console.log("Funding keypair...", kp.publicKey());
  await fetch(`https://friendbot.stellar.org?addr=${kp.publicKey()}`);
  
  const contract = new StellarSdk.Contract(contractId);
  const sourceAccount = await rpcServer.getAccount(kp.publicKey());

  let tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: "10000",
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(contract.call("increment"))
    .setTimeout(300)
    .build();

  console.log("Simulating...");
  const simulatedTx = await rpcServer.simulateTransaction(tx);
  
  if (StellarSdk.rpc.Api.isSimulationSuccess(simulatedTx)) {
    tx = StellarSdk.rpc.assembleTransaction(tx, simulatedTx).build();
  } else {
    throw new Error(simulatedTx.error || "Simulation failed");
  }

  console.log("Signing...");
  tx.sign(kp);

  console.log("Submitting...");
  const submitResult = await rpcServer.sendTransaction(tx);

  if (submitResult.status === "ERROR") {
    throw new Error(submitResult.errorResultXdr || "Transaction submission failed.");
  }

  console.log("Polling...");
  let txResult = submitResult;
  let attempts = 0;
  while ((txResult.status === "PENDING" || txResult.status === "NOT_FOUND") && attempts < 25) {
    await new Promise(r => setTimeout(r, 1000));
    txResult = await rpcServer.getTransaction(submitResult.hash);
    attempts++;
  }

  if (txResult.status === "SUCCESS") {
    console.log("SUCCESS!");
  } else {
    console.log("FAILED!", txResult);
    if (txResult.resultXdr) {
      const parsed = StellarSdk.xdr.TransactionResult.fromXDR(txResult.resultXdr, "base64");
      console.log("Parsed Error:", JSON.stringify(parsed, null, 2));
    }
  }
}

testFrontendLogic().catch(console.error);
