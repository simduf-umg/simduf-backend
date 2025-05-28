// scripts/interact/interact-inventory-manager.js
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  // Cargar direcciones desplegadas
  const addresses = JSON.parse(fs.readFileSync("./deployed-addresses.json"));
  const inventoryAddress = addresses.InventoryManager;
  
  if (!inventoryAddress) {
    console.error("InventoryManager not deployed. Run deploy script first.");
    process.exit(1);
  }
  
  console.log("🏥 Interacting with InventoryManager at:", inventoryAddress);
  
  // Obtener el contrato
  const InventoryManager = await ethers.getContractFactory("InventoryManager");
  const inventory = InventoryManager.attach(inventoryAddress);
  
  const [owner, manager1, manager2] = await ethers.getSigners();
  
  console.log("\n📋 Demo: Pharmacy Inventory Management");
  console.log("=====================================\n");
  
  // 1. Configurar umbrales para medicamentos
  console.log("1️⃣ Configurando umbrales de inventario...");
  
  const medicines = [
    { location: "Farmacia Central", type: "Paracetamol 500mg", min: 100, max: 500 },
    { location: "Farmacia Central", type: "Ibuprofeno 400mg", min: 50, max: 300 },
    { location: "Farmacia Norte", type: "Amoxicilina 500mg", min: 30, max: 200 }
  ];
  
  for (const med of medicines) {
    await inventory.connect(manager1).configureThresholds(
      med.location, 
      med.type, 
      med.min, 
      med.max
    );
    console.log(`   ✅ ${med.type} en ${med.location}: Min=${med.min}, Max=${med.max}`);
  }
  
  // 2. Agregar stock inicial
  console.log("\n2️⃣ Agregando stock inicial...");
  
  const stockEntries = [
    { 
      location: "Farmacia Central", 
      type: "Paracetamol 500mg", 
      batchId: "BATCH-2024-001", 
      quantity: 250,
      date: Math.floor(Date.now() / 1000)
    },
    { 
      location: "Farmacia Central", 
      type: "Ibuprofeno 400mg", 
      batchId: "BATCH-2024-002", 
      quantity: 150,
      date: Math.floor(Date.now() / 1000)
    },
    { 
      location: "Farmacia Norte", 
      type: "Amoxicilina 500mg", 
      batchId: "BATCH-2024-003", 
      quantity: 25,
      date: Math.floor(Date.now() / 1000)
    }
  ];
  
  for (const entry of stockEntries) {
    await inventory.connect(manager1).addStock(
      entry.location,
      entry.type,
      entry.batchId,
      entry.quantity,
      entry.date
    );
    console.log(`   ✅ Agregado: ${entry.quantity} unidades de ${entry.type} (Lote: ${entry.batchId})`);
  }
  
  // 3. Verificar estados del inventario
  console.log("\n3️⃣ Estados actuales del inventario:");
  console.log("   Location              | Medicine           | Stock | Status");
  console.log("   ---------------------|-------------------|-------|--------");
  
  for (const med of medicines) {
    const stock = await inventory.getStock(med.location, med.type);
    const statusCode = await inventory.getStockStatus(med.location, med.type);
    const statusText = ["🟢 Green", "🟡 Yellow", "🔴 Red"][statusCode];
    
    console.log(`   ${med.location.padEnd(20)} | ${med.type.padEnd(17)} | ${stock.toString().padEnd(5)} | ${statusText}`);
  }
  
  // 4. Simular consumo de medicamentos
  console.log("\n4️⃣ Simulando consumo de medicamentos...");
  
  await inventory.connect(manager2).removeStock(
    "Farmacia Central",
    "Paracetamol 500mg",
    50,
    Math.floor(Date.now() / 1000)
  );
  console.log("   ✅ Consumidas 50 unidades de Paracetamol 500mg");
  
  await inventory.connect(manager2).removeStock(
    "Farmacia Norte",
    "Amoxicilina 500mg",
    10,
    Math.floor(Date.now() / 1000)
  );
  console.log("   ✅ Consumidas 10 unidades de Amoxicilina 500mg");
  
  // 5. Verificar estados después del consumo
  console.log("\n5️⃣ Estados después del consumo:");
  console.log("   Location              | Medicine           | Stock | Status");
  console.log("   ---------------------|-------------------|-------|--------");
  
  for (const med of medicines) {
    const stock = await inventory.getStock(med.location, med.type);
    const statusCode = await inventory.getStockStatus(med.location, med.type);
    const statusText = ["🟢 Green", "🟡 Yellow", "🔴 Red"][statusCode];
    
    console.log(`   ${med.location.padEnd(20)} | ${med.type.padEnd(17)} | ${stock.toString().padEnd(5)} | ${statusText}`);
  }
  
  // 6. Ver historial de lotes
  console.log("\n6️⃣ Historial de lotes (Farmacia Central - Paracetamol):");
  const history = await inventory.getBatchHistory("Farmacia Central", "Paracetamol 500mg");
  
  for (const batch of history) {
    const date = new Date(Number(batch.date) * 1000).toLocaleString();
    console.log(`   📦 Lote: ${batch.batchId} | Cantidad: ${batch.quantity} | Fecha: ${date}`);
  }
  
  console.log("\n✅ Demo completada!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });