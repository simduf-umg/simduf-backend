// test/lotTracking.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LotTracking", function () {
  let LotTracking;
  let lotTracking;
  let owner;

  beforeEach(async function () {
    LotTracking = await ethers.getContractFactory("LotTracking");
    lotTracking = await LotTracking.deploy();
    
  });

  it("should register a new lot", async function () {
    const id = 1;
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + 30 * 24 * 3600; // 30 days

    await expect(lotTracking.registerLot(id, now, expiry, "Factory A"))
      .to.emit(lotTracking, "LotRegistered")
      .withArgs(id, now, expiry, "Factory A");

    expect(await lotTracking.getCurrentLocation(id)).to.equal("Factory A");
  });

  it("should transfer lot and emit movement", async function () {
    const id = 2;
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + 30 * 24 * 3600;

    await lotTracking.registerLot(id, now, expiry, "Factory B");
    await expect(lotTracking.transferLot(id, "Warehouse"))
      .to.emit(lotTracking, "MovementRecorded");

    expect(await lotTracking.getCurrentLocation(id)).to.equal("Warehouse");
  });

  it("should revert transfer if expired", async function () {
    const id = 3;
    const now = Math.floor(Date.now() / 1000);
    const expiry = now - 1; // already expired

    await lotTracking.registerLot(id, now - 100, expiry, "Factory C");
    await expect(lotTracking.transferLot(id, "Warehouse"))
      .to.be.revertedWith("Lot expired");
  });

  it("should emit NearExpiry when within threshold", async function () {
    const id = 4;
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + 3 * 24 * 3600; // 3 days

    await lotTracking.registerLot(id, now, expiry, "Factory D");
    await expect(lotTracking.transferLot(id, "Retailer"))
      .to.emit(lotTracking, "NearExpiry")
      .withArgs(id, expiry);
  });
});