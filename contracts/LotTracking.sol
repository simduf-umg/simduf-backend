// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LotTracking {
    struct Lot {
        uint256 id;
        uint256 manufactureDate;
        uint256 expiryDate;
        string origin;
        string currentLocation;
        bool exists;
    }

    struct Movement {
        uint256 timestamp;
        string from;
        string to;
    }

    mapping(uint256 => Lot) private lots;
    mapping(uint256 => Movement[]) private history;

    // Events
    event LotRegistered(uint256 indexed id, uint256 manufactureDate, uint256 expiryDate, string origin);
    event MovementRecorded(uint256 indexed id, string from, string to, uint256 timestamp);
    event NearExpiry(uint256 indexed id, uint256 expiryDate);
    event Expired(uint256 indexed id, uint256 expiryDate);

    uint256 public constant NEAR_EXPIRY_THRESHOLD = 7 days;

    /**
     * @dev Register a new lot.
     */
    function registerLot(
        uint256 _id,
        uint256 _manufactureDate,
        uint256 _expiryDate,
        string calldata _origin
    ) external {
        require(!lots[_id].exists, "Lot already registered");
        require(_expiryDate > _manufactureDate, "Expiry must be after manufacture");

        lots[_id] = Lot({
            id: _id,
            manufactureDate: _manufactureDate,
            expiryDate: _expiryDate,
            origin: _origin,
            currentLocation: _origin,
            exists: true
        });

        emit LotRegistered(_id, _manufactureDate, _expiryDate, _origin);
    }

    /**
     * @dev Transfer a lot to a new location.
     */
    function transferLot(uint256 _id, string calldata _to) external {
        Lot storage lot = lots[_id];
        require(lot.exists, "Lot not found");
        require(block.timestamp <= lot.expiryDate, "Lot expired");

        string memory _from = lot.currentLocation;
        lot.currentLocation = _to;

        history[_id].push(Movement({
            timestamp: block.timestamp,
            from: _from,
            to: _to
        }));

        emit MovementRecorded(_id, _from, _to, block.timestamp);

        // Alert if near expiry or expired
        if (lot.expiryDate <= block.timestamp) {
            emit Expired(_id, lot.expiryDate);
        } else if (lot.expiryDate - block.timestamp <= NEAR_EXPIRY_THRESHOLD) {
            emit NearExpiry(_id, lot.expiryDate);
        }
    }

    /**
     * @dev Get current location of a lot.
     */
    function getCurrentLocation(uint256 _id) external view returns (string memory) {
        require(lots[_id].exists, "Lot not found");
        return lots[_id].currentLocation;
    }

    /**
     * @dev Get full movement history of a lot.
     */
    function getMovementHistory(uint256 _id) external view returns (Movement[] memory) {
        require(lots[_id].exists, "Lot not found");
        return history[_id];
    }
}