// scripts/deploy/03_deploy_order_registry.js
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Deploying OrderRegistry...");
  
  const OrderRegistry = await ethers.getContractFactory("OrderRegistry");
  const orderRegistry = await OrderRegistry.deploy();
  await orderRegistry.waitForDeployment();
  
  const address = await orderRegistry.getAddress();
  console.log("OrderRegistry deployed to:", address);
  
  const [owner] = await ethers.getSigners();
  console.log("Contract owner:", owner.address);
  
  // Guardar la dirección
  if (!fs.existsSync("./deployed-addresses.json")) {
    fs.writeFileSync("./deployed-addresses.json", JSON.stringify({}));
  }
  
  const existing = JSON.parse(fs.readFileSync("./deployed-addresses.json"));
  fs.writeFileSync(
    "./deployed-addresses.json", 
    JSON.stringify({ ...existing, OrderRegistry: address }, null, 2)
  );
  
  console.log("✅ OrderRegistry deployment completed!");
  
  // Si es el último contrato, mostrar resumen
  if (existing.InventoryManager && existing.LotTracking) {
    console.log("\n✅ All contracts deployed successfully!");
    console.log("\n📋 Deployment Summary:");
    console.log("====================");
    console.log(`InventoryManager: ${existing.InventoryManager}`);
    console.log(`LotTracking: ${existing.LotTracking}`);
    console.log(`OrderRegistry: ${address}`);
    console.log("\nDeployed addresses saved to deployed-addresses.json");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });