// scripts/deploy/01_deploy_inventory_manager.js
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying InventoryManager...");
  
  const InventoryManager = await ethers.getContractFactory("InventoryManager");
  const inventoryManager = await InventoryManager.deploy();
  await inventoryManager.waitForDeployment();
  
  const address = await inventoryManager.getAddress();
  console.log("InventoryManager deployed to:", address);
  
  // Configurar algunos managers de ejemplo
  const [owner, manager1, manager2] = await ethers.getSigners();
  
  console.log("Setting up initial managers...");
  await inventoryManager.setManager(manager1.address, true);
  await inventoryManager.setManager(manager2.address, true);
  
  console.log("Manager 1:", manager1.address);
  console.log("Manager 2:", manager2.address);
  
  // Guardar la dirección para otros scripts
  const fs = require("fs");
  const deployedAddresses = {
    InventoryManager: address
  };
  
  if (!fs.existsSync("./deployed-addresses.json")) {
    fs.writeFileSync("./deployed-addresses.json", JSON.stringify({}));
  }
  
  const existing = JSON.parse(fs.readFileSync("./deployed-addresses.json"));
  fs.writeFileSync(
    "./deployed-addresses.json", 
    JSON.stringify({ ...existing, ...deployedAddresses }, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });