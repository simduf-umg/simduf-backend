const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("InventoryManager", function () {
  let inventory;
  let owner, manager, user;

  beforeEach(async () => {
    [owner, manager, user] = await ethers.getSigners();
    const InventoryManager = await ethers.getContractFactory("InventoryManager");
    inventory = await InventoryManager.deploy();
    

    await inventory.setManager(manager.address, true);
  });

  it("debería permitir agregar stock", async () => {
    const tx = await inventory.connect(manager).addStock(
      "Distrito1",
      "Paracetamol",
      "Lote001",
      100,
      Math.floor(Date.now() / 1000)
    );
    await tx.wait();

    const stock = await inventory.getStock("Distrito1", "Paracetamol");
    expect(stock).to.equal(100);
  });

  it("no debería permitir remover más stock del disponible", async () => {
    await inventory.connect(manager).addStock("Distrito1", "Ibuprofeno", "Lote002", 50, Math.floor(Date.now() / 1000));
    await expect(
      inventory.connect(manager).removeStock("Distrito1", "Ibuprofeno", 100, Math.floor(Date.now() / 1000))
    ).to.be.revertedWith("Insufficient stock");
  });

  it("debería devolver correctamente el estado semafórico", async () => {
    await inventory.connect(manager).configureThresholds("Distrito2", "Amoxicilina", 50, 100);

    await inventory.connect(manager).addStock("Distrito2", "Amoxicilina", "Lote003", 30, Math.floor(Date.now() / 1000));
    expect(await inventory.getStockStatus("Distrito2", "Amoxicilina")).to.equal(2); // Red

    await inventory.connect(manager).addStock("Distrito2", "Amoxicilina", "Lote004", 30, Math.floor(Date.now() / 1000));
    expect(await inventory.getStockStatus("Distrito2", "Amoxicilina")).to.equal(1); // Yellow

    await inventory.connect(manager).addStock("Distrito2", "Amoxicilina", "Lote005", 100, Math.floor(Date.now() / 1000));
    expect(await inventory.getStockStatus("Distrito2", "Amoxicilina")).to.equal(0); // Green
  });

  it("no debería permitir operaciones a cuentas no autorizadas", async () => {
    await expect(
      inventory.connect(user).addStock("D1", "Med1", "LoteX", 10, Math.floor(Date.now() / 1000))
    ).to.be.revertedWith("Not authorized");

    await expect(
      inventory.connect(user).removeStock("D1", "Med1", 5, Math.floor(Date.now() / 1000))
    ).to.be.revertedWith("Not authorized");
  });

  it("debería emitir eventos correctamente", async () => {
    await expect(
      inventory.connect(manager).addStock("Distrito3", "VitaminaC", "LoteX", 200, Math.floor(Date.now() / 1000))
    ).to.emit(inventory, "StockAdded");

    await inventory.connect(manager).removeStock("Distrito3", "VitaminaC", 100, Math.floor(Date.now() / 1000));
    await expect(
      inventory.connect(manager).removeStock("Distrito3", "VitaminaC", 50, Math.floor(Date.now() / 1000))
    ).to.emit(inventory, "StockRemoved");
  });
});
