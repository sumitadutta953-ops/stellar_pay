const { Horizon } = require('stellar-sdk');

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

server.operations()
  .limit(200)
  .order("desc")
  .call()
  .then(res => {
    const invokeOps = res.records.filter(op => op.type === 'invoke_host_function');
    console.log(`Found ${invokeOps.length} contract operations.`);
    
    invokeOps.forEach((op, index) => {
      console.log(`\n--- Operation #${index + 1} ---`);
      console.log(`Hash: ${op.transaction_hash}`);
      // Horizon returns the footprint or details
      if (op.function) {
        console.log(`Function: ${op.function}`);
      }
      // Print entire op fields that might contain contract code
      console.log(JSON.stringify(op, null, 2));
    });
  })
  .catch(err => {
    console.error("ERROR:", err);
  });
