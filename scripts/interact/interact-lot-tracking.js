// scripts/interact/interact-lot-tracking.js
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  // Cargar direcciones desplegadas
  const addresses = JSON.parse(fs.readFileSync("./deployed-addresses.json"));
  const lotTrackingAddress = addresses.LotTracking;
  
  if (!lotTrackingAddress) {
    console.error("LotTracking not deployed. Run deploy script first.");
    process.exit(1);
  }
  
  console.log("📦 Interacting with LotTracking at:", lotTrackingAddress);
  
  // Obtener el contrato
  const LotTracking = await ethers.getContractFactory("LotTracking");
  const lotTracking = LotTracking.attach(lotTrackingAddress);
  
  const [manufacturer, distributor, pharmacy] = await ethers.getSigners();
  
  console.log("\n🔍 Demo: Medicine Lot Tracking");
  console.log("================================\n");
  
  // 1. Registrar nuevos lotes
  console.log("1️⃣ Registrando lotes de medicamentos...");
  
  const currentTime = Math.floor(Date.now() / 1000);
  const oneDay = 24 * 60 * 60;
  const oneYear = 365 * oneDay;
  
  const lots = [
    {
      id: 1001,
      manufactureDate: currentTime - (30 * oneDay), // hace 30 días
      expiryDate: currentTime + (335 * oneDay), // expira en 11 meses
      origin: "Laboratorio PharmaCorp"
    },
    {
      id: 1002,
      manufactureDate: currentTime - (60 * oneDay), // hace 60 días
      expiryDate: currentTime + (5 * oneDay), // expira en 5 días (near expiry)
      origin: "Laboratorio MediLab"
    },
    {
      id: 1003,
      manufactureDate: currentTime - (90 * oneDay), // hace 90 días
      expiryDate: currentTime + (275 * oneDay), // expira en 9 meses
      origin: "Laboratorio BioHealth"
    }
  ];
  
  for (const lot of lots) {
    await lotTracking.connect(manufacturer).registerLot(
      lot.id,
      lot.manufactureDate,
      lot.expiryDate,
      lot.origin
    );
    
    const mfgDate = new Date(lot.manufactureDate * 1000).toLocaleDateString();
    const expDate = new Date(lot.expiryDate * 1000).toLocaleDateString();
    console.log(`   ✅ Lote ${lot.id} registrado`);
    console.log(`      Fabricación: ${mfgDate} | Vencimiento: ${expDate}`);
  }
  
  // 2. Transferir lotes a través de la cadena de suministro
  console.log("\n2️⃣ Moviendo lotes a través de la cadena de suministro...");
  
  // Lote 1001: Fabricante -> Distribuidor -> Farmacia
  await lotTracking.connect(manufacturer).transferLot(1001, "Centro de Distribución Regional");
  console.log("   ✅ Lote 1001: Laboratorio → Centro de Distribución");
  
  await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
  
  await lotTracking.connect(distributor).transferLot(1001, "Farmacia Central");
  console.log("   ✅ Lote 1001: Centro de Distribución → Farmacia Central");
  
  // Lote 1002: Fabricante -> Farmacia (directo, cerca de vencimiento)
  await lotTracking.connect(manufacturer).transferLot(1002, "Farmacia Norte - Urgente");
  console.log("   ✅ Lote 1002: Laboratorio → Farmacia Norte (Envío urgente - próximo a vencer)");
  
  // Lote 1003: Solo al distribuidor por ahora
  await lotTracking.connect(manufacturer).transferLot(1003, "Almacén Central");
  console.log("   ✅ Lote 1003: Laboratorio → Almacén Central");
  
  // 3. Consultar ubicaciones actuales
  console.log("\n3️⃣ Ubicaciones actuales de los lotes:");
  
  for (const lot of lots) {
    try {
      const location = await lotTracking.getCurrentLocation(lot.id);
      console.log(`   📍 Lote ${lot.id}: ${location}`);
    } catch (error) {
      console.log(`   ❌ Lote ${lot.id}: No encontrado`);
    }
  }
  
  // 4. Ver historial completo de movimientos
  console.log("\n4️⃣ Historial de movimientos del Lote 1001:");
  
  const movements = await lotTracking.getMovementHistory(1001);
  console.log(`   Total de movimientos: ${movements.length}`);
  
  for (let i = 0; i < movements.length; i++) {
    const move = movements[i];
    const date = new Date(Number(move.timestamp) * 1000).toLocaleString();
    console.log(`   ${i + 1}. ${move.from} → ${move.to}`);
    console.log(`      Fecha: ${date}`);
  }
  
  // 5. Verificar alertas de vencimiento
  console.log("\n5️⃣ Estado de vencimiento de lotes:");
  
  for (const lot of lots) {
    const daysUntilExpiry = Math.floor((lot.expiryDate - currentTime) / oneDay);
    let status = "✅ OK";
    
    if (daysUntilExpiry <= 0) {
      status = "❌ VENCIDO";
    } else if (daysUntilExpiry <= 7) {
      status = "⚠️  PRÓXIMO A VENCER";
    }
    
    console.log(`   Lote ${lot.id}: ${status} (${daysUntilExpiry} días restantes)`);
  }
  
  // 6. Intentar transferir un lote vencido (para demostrar validación)
  console.log("\n6️⃣ Probando validaciones del sistema:");
  
  // Crear un lote que ya esté vencido
  const expiredLotId = 9999;
  await lotTracking.connect(manufacturer).registerLot(
    expiredLotId,
    currentTime - (400 * oneDay), // hace 400 días
    currentTime - (35 * oneDay), // venció hace 35 días
    "Laboratorio Test"
  );
  
  try {
    await lotTracking.connect(manufacturer).transferLot(expiredLotId, "Farmacia Test");
    console.log("   ❌ Error: Se permitió transferir un lote vencido");
  } catch (error) {
    console.log("   ✅ Sistema rechazó correctamente la transferencia de lote vencido");
  }
  
  console.log("\n✅ Demo completada!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });