// scripts/interact/interact-all.js
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

async function interactAll() {
  console.log("🚀 Starting complete pharmacy system demo...\n");
  
  const scripts = [
    {
      name: "interact-inventory-manager.js",
      description: "Inventory Management Demo"
    },
    {
      name: "interact-lot-tracking.js", 
      description: "Lot Tracking Demo"
    },
    {
      name: "interact-order-registry.js",
      description: "Order Registry Demo"
    }
  ];
  
  for (const script of scripts) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📄 Running ${script.description}...`);
    console.log(`${"=".repeat(60)}\n`);
    
    try {
      const { stdout, stderr } = await execPromise(
        `npx hardhat run scripts/interact/${script.name} --network localhost`
      );
      console.log(stdout);
      if (stderr) console.error(stderr);
      
      // Pausa entre demos
      console.log("\n⏳ Waiting before next demo...\n");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`Error running ${script.name}:`, error);
      process.exit(1);
    }
  }
  
  console.log("\n🎉 All demos completed successfully!");
  console.log("\n📊 Summary of deployed contracts:");
  
  const fs = require("fs");
  const addresses = JSON.parse(fs.readFileSync("./deployed-addresses.json"));
  
  console.log("\n   Contract         | Address");
  console.log("   -----------------|------------------------------------------");
  for (const [contract, address] of Object.entries(addresses)) {
    console.log(`   ${contract.padEnd(16)} | ${address}`);
  }
  
  console.log("\n💡 Next steps:");
  console.log("   - Run individual interact scripts to explore specific features");
  console.log("   - Modify the contracts and redeploy to test changes");
  console.log("   - Write unit tests for edge cases");
  console.log("   - Integrate with a frontend application");
}

interactAll();