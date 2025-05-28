// scripts/interact/interact-order-registry.js
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  // Cargar direcciones desplegadas
  const addresses = JSON.parse(fs.readFileSync("./deployed-addresses.json"));
  const orderRegistryAddress = addresses.OrderRegistry;
  
  if (!orderRegistryAddress) {
    console.error("OrderRegistry not deployed. Run deploy script first.");
    process.exit(1);
  }
  
  console.log("📋 Interacting with OrderRegistry at:", orderRegistryAddress);
  
  // Obtener el contrato
  const OrderRegistry = await ethers.getContractFactory("OrderRegistry");
  const orderRegistry = OrderRegistry.attach(orderRegistryAddress);
  
  const [owner, cliente1, cliente2, cliente3] = await ethers.getSigners();
  
  console.log("\n📦 Demo: Order Tracking System");
  console.log("===============================\n");
  
  // 1. Registrar nuevos pedidos
  console.log("1️⃣ Registrando pedidos de clientes...");
  
  // Generar IDs únicos para los pedidos
  const pedidos = [
    { 
      id: ethers.keccak256(ethers.toUtf8Bytes("PEDIDO-2024-001")),
      cliente: cliente1,
      descripcion: "PEDIDO-2024-001: Paracetamol x100, Ibuprofeno x50"
    },
    { 
      id: ethers.keccak256(ethers.toUtf8Bytes("PEDIDO-2024-002")),
      cliente: cliente2,
      descripcion: "PEDIDO-2024-002: Amoxicilina x30, Vitamina C x200"
    },
    { 
      id: ethers.keccak256(ethers.toUtf8Bytes("PEDIDO-2024-003")),
      cliente: cliente3,
      descripcion: "PEDIDO-2024-003: Insulina x10, Jeringas x100"
    }
  ];
  
  for (const pedido of pedidos) {
    await orderRegistry.connect(pedido.cliente).registrarPedido(pedido.id);
    console.log(`   ✅ ${pedido.descripcion}`);
    console.log(`      Cliente: ${pedido.cliente.address}`);
    console.log(`      ID: ${pedido.id.slice(0, 10)}...`);
  }
  
  // 2. Actualizar estados de los pedidos
  console.log("\n2️⃣ Actualizando estados de pedidos...");
  
  // Estados: 0=Registrado, 1=Despachado, 2=EnTransito, 3=Entregado
  
  // Pedido 1: Completar todo el ciclo
  await orderRegistry.connect(owner).actualizarEstado(pedidos[0].id, 1); // Despachado
  console.log("   ✅ PEDIDO-2024-001: Despachado");
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await orderRegistry.connect(owner).actualizarEstado(pedidos[0].id, 2); // EnTransito
  console.log("   ✅ PEDIDO-2024-001: En Tránsito");
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await orderRegistry.connect(owner).actualizarEstado(pedidos[0].id, 3); // Entregado
  console.log("   ✅ PEDIDO-2024-001: Entregado");
  
  // Pedido 2: Solo despachar
  await orderRegistry.connect(owner).actualizarEstado(pedidos[1].id, 1); // Despachado
  console.log("   ✅ PEDIDO-2024-002: Despachado");
  
  // Pedido 3: Dejar en estado inicial (Registrado)
  console.log("   ℹ️  PEDIDO-2024-003: Mantenido en estado Registrado");
  
  // 3. Consultar estados actuales
  console.log("\n3️⃣ Estados actuales de todos los pedidos:");
  console.log("   Pedido          | Estado       | Actualizado");
  console.log("   ----------------|--------------|------------------");
  
  const estadoTextos = ["Registrado", "Despachado", "En Tránsito", "Entregado"];
  const estadoEmojis = ["📝", "📦", "🚚", "✅"];
  
  for (let i = 0; i < pedidos.length; i++) {
    const [estado, timestamp] = await orderRegistry.obtenerEstadoActual(pedidos[i].id);
    const fecha = new Date(Number(timestamp) * 1000).toLocaleString();
    const estadoTexto = estadoTextos[estado];
    const emoji = estadoEmojis[estado];
    
    console.log(`   PEDIDO-2024-00${i + 1} | ${emoji} ${estadoTexto.padEnd(10)} | ${fecha}`);
  }
  
  // 4. Ver historial completo de un pedido
  console.log("\n4️⃣ Historial completo del PEDIDO-2024-001:");
  
  const historial = await orderRegistry.obtenerHistorial(pedidos[0].id);
  
  for (let i = 0; i < historial.length; i++) {
    const estado = historial[i];
    const estadoTexto = estadoTextos[estado.estado];
    const emoji = estadoEmojis[estado.estado];
    const fecha = new Date(Number(estado.timestamp) * 1000).toLocaleString();
    
    console.log(`   ${i + 1}. ${emoji} ${estadoTexto} - ${fecha}`);
  }
  
  // 5. Información adicional del pedido
  console.log("\n5️⃣ Información detallada de pedidos:");
  
  for (let i = 0; i < pedidos.length; i++) {
    const pedidoInfo = await orderRegistry.pedidos(pedidos[i].id);
    const fechaRegistro = new Date(Number(pedidoInfo.fecha) * 1000).toLocaleString();
    
    console.log(`\n   📋 PEDIDO-2024-00${i + 1}:`);
    console.log(`      Cliente: ${pedidoInfo.cliente}`);
    console.log(`      Fecha de registro: ${fechaRegistro}`);
    console.log(`      Total de actualizaciones: ${historial.length}`);
  }
  
  // 6. Intentar operaciones no autorizadas
  console.log("\n6️⃣ Probando seguridad del sistema:");
  
  try {
    // Cliente intenta actualizar estado (solo owner puede)
    await orderRegistry.connect(cliente1).actualizarEstado(pedidos[0].id, 1);
    console.log("   ❌ Error: Cliente pudo actualizar estado");
  } catch (error) {
    console.log("   ✅ Sistema rechazó correctamente: Solo el owner puede actualizar estados");
  }
  
  try {
    // Intentar registrar pedido duplicado
    await orderRegistry.connect(cliente1).registrarPedido(pedidos[0].id);
    console.log("   ❌ Error: Se permitió pedido duplicado");
  } catch (error) {
    console.log("   ✅ Sistema rechazó correctamente: No se permiten pedidos duplicados");
  }
  
  try {
    // Intentar consultar pedido inexistente
    const fakeId = ethers.keccak256(ethers.toUtf8Bytes("FAKE-ORDER"));
    await orderRegistry.obtenerEstadoActual(fakeId);
    console.log("   ❌ Error: Se permitió consultar pedido inexistente");
  } catch (error) {
    console.log("   ✅ Sistema rechazó correctamente: Pedido no existe");
  }
  
  console.log("\n✅ Demo completada!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });