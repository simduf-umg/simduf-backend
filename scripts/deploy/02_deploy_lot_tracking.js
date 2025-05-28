// scripts/deploy/02_deploy_lot_tracking.js
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Deploying LotTracking...");
  
  const LotTracking = await ethers.getContractFactory("LotTracking");
  const lotTracking = await LotTracking.deploy();
  await lotTracking.waitForDeployment();
  
  const address = await lotTracking.getAddress();
  console.log("LotTracking deployed to:", address);
  
  // Guardar la dirección
  if (!fs.existsSync("./deployed-addresses.json")) {
    fs.writeFileSync("./deployed-addresses.json", JSON.stringify({}));
  }
  
  const existing = JSON.parse(fs.readFileSync("./deployed-addresses.json"));
  fs.writeFileSync(
    "./deployed-addresses.json", 
    JSON.stringify({ ...existing, LotTracking: address }, null, 2)
  );
  
  console.log("✅ LotTracking deployment completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });