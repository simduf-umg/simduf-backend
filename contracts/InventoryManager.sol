// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract InventoryManager is Ownable {
    enum StockStatus { Green, Yellow, Red }

    struct MedicineBatch {
        string batchId;
        string medicineType;
        uint256 quantity;
        uint256 date; // Unix timestamp
    }

    struct MedicineInfo {
        uint256 totalQuantity;
        uint256 minThreshold;
        uint256 maxThreshold;
    }

    mapping(string => mapping(string => MedicineInfo)) public inventory; // location => medicineType => info
    mapping(string => mapping(string => MedicineBatch[])) public history; // location => medicineType => batches

    mapping(address => bool) public managers;

    event StockAdded(string location, string medicineType, string batchId, uint256 quantity, uint256 date);
    event StockRemoved(string location, string medicineType, uint256 quantity, uint256 date);
    event ManagerSet(address manager, bool enabled);

    modifier onlyManager() {
        require(managers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    // ✅ Constructor actualizado para versiones recientes de OpenZeppelin
    constructor() Ownable(msg.sender) {}

    function setManager(address _manager, bool _enabled) external onlyOwner {
        managers[_manager] = _enabled;
        emit ManagerSet(_manager, _enabled);
    }

    function configureThresholds(string memory location, string memory medicineType, uint256 minT, uint256 maxT) external onlyManager {
        inventory[location][medicineType].minThreshold = minT;
        inventory[location][medicineType].maxThreshold = maxT;
    }

    function addStock(string memory location, string memory medicineType, string memory batchId, uint256 quantity, uint256 date) external onlyManager {
        require(quantity > 0, "Invalid quantity");

        inventory[location][medicineType].totalQuantity += quantity;
        history[location][medicineType].push(MedicineBatch(batchId, medicineType, quantity, date));

        emit StockAdded(location, medicineType, batchId, quantity, date);
    }

    function removeStock(string memory location, string memory medicineType, uint256 quantity, uint256 date) external onlyManager {
        require(quantity > 0, "Invalid quantity");
        require(inventory[location][medicineType].totalQuantity >= quantity, "Insufficient stock");

        inventory[location][medicineType].totalQuantity -= quantity;

        emit StockRemoved(location, medicineType, quantity, date);
    }

    function getStock(string memory location, string memory medicineType) public view returns (uint256) {
        return inventory[location][medicineType].totalQuantity;
    }

    function getStockStatus(string memory location, string memory medicineType) public view returns (StockStatus) {
        MedicineInfo memory info = inventory[location][medicineType];
        if (info.totalQuantity <= info.minThreshold) {
            return StockStatus.Red;
        } else if (info.totalQuantity <= info.maxThreshold) {
            return StockStatus.Yellow;
        } else {
            return StockStatus.Green;
        }
    }

    function getBatchHistory(string memory location, string memory medicineType) public view returns (MedicineBatch[] memory) {
        return history[location][medicineType];
    }
}
