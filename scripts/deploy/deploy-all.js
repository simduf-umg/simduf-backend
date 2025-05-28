// scripts/deploy/deploy-all.js
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

async function deployAll() {
  console.log("🚀 Starting full deployment...\n");
  
  const scripts = [
    "01_deploy_inventory_manager.js",
    "02_deploy_lot_tracking.js",
    "03_deploy_order_registry.js"
  ];
  
  for (const script of scripts) {
    console.log(`\n📄 Running ${script}...`);
    try {
      const { stdout, stderr } = await execPromise(`npx hardhat run scripts/deploy/${script} --network localhost`);
      console.log(stdout);
      if (stderr) console.error(stderr);
    } catch (error) {
      console.error(`Error deploying ${script}:`, error);
      process.exit(1);
    }
  }
  
  console.log("\n🎉 All contracts deployed successfully!");
}

deployAll();